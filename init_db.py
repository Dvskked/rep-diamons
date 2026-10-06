# -*- coding: utf-8 -*-
"""
=====================================================================
 DIAMONDS LEAGUE - Crea la base de datos y carga los datos semilla
 Uso:  python init_db.py
 (c) 2026 Neptunzinho. Todos los derechos reservados.
=====================================================================
"""
import os
import sys

import db
from config import BASE_DIR, DB

SEP = "=" * 70


def _leer_sql(nombre):
    ruta = os.path.join(BASE_DIR, "db", nombre)
    with open(ruta, "r", encoding="utf-8") as f:
        return f.read()


def _ejecutar_script(sql):
    """Ejecuta un script respetando los separadores ';'."""
    conexion = db.conexion(sin_db=True)
    try:
        with conexion.cursor() as cur:
            for sentencia in _separar(sql):
                cur.execute(sentencia)
        print("  [ok] %d sentencias ejecutadas" % len(_separar(sql)))
    finally:
        conexion.close()


def _separar(sql):
    """Divide por ';' ignorando los que estan dentro de cadenas o comentarios."""
    partes, actual, en_cadena, comentario = [], [], False, False
    i = 0
    while i < len(sql):
        ch = sql[i]
        nxt = sql[i + 1] if i + 1 < len(sql) else ""
        if comentario:
            if ch == "\n":
                comentario = False
                actual.append(ch)
        elif en_cadena:
            actual.append(ch)
            if ch == "\\":
                if nxt:
                    actual.append(nxt)
                    i += 1
            elif ch == "'":
                en_cadena = False
        elif ch == "-" and nxt == "-":
            comentario = True
        elif ch == "'":
            en_cadena = True
            actual.append(ch)
        elif ch == ";":
            texto = "".join(actual).strip()
            if texto:
                partes.append(texto)
            actual = []
        else:
            actual.append(ch)
        i += 1
    ultimo = "".join(actual).strip()
    if ultimo:
        partes.append(ultimo)
    return partes


def _vaciar():
    """Limpia las tablas de contenido para que el script sea re-ejecutable."""
    tablas = ["resultados", "fechas", "jugadores", "equipos",
              "contenidos", "modulos", "foro", "usuarios"]
    conexion = db.conexion()
    try:
        with conexion.cursor() as cur:
            cur.execute("SET FOREIGN_KEY_CHECKS = 0")
            for t in tablas:
                cur.execute("TRUNCATE TABLE `%s`" % t)
            cur.execute("SET FOREIGN_KEY_CHECKS = 1")
        print("  [ok] %d tablas limpiadas" % len(tablas))
    finally:
        conexion.close()


def main():
    print(SEP)
    print(" DIAMONDS LEAGUE - Instalador de base de datos (c) Neptunzinho")
    print(SEP)
    print(" Servidor : %s:%s" % (DB["host"], DB["port"]))
    print(" Base     : %s" % DB["database"])
    print(SEP)

    try:
        db.consultar_uno("SELECT 1")
    except Exception as exc:  # noqa: BLE001
        print("\n[ERROR] No se pudo conectar: %s" % exc)
        print("Revisa tu archivo .env con los datos de Clever Cloud.\n")
        sys.exit(1)

    print("\n1) Creando tablas...")
    _ejecutar_script(_leer_sql("schema.sql"))

    print("\n2) Limpiando datos anteriores (para no duplicar)...")
    _vaciar()

    print("\n3) Cargando datos iniciales...")
    _ejecutar_script(_leer_sql("seed.sql"))

    ok, msg = db.probar()
    print("\n4) Verificacion: %s - %s" % ("OK" if ok else "FALLO", msg))

    total = db.consultar_uno(
        "SELECT (SELECT COUNT(*) FROM equipos) AS e,"
        " (SELECT COUNT(*) FROM jugadores) AS j,"
        " (SELECT COUNT(*) FROM fechas) AS f,"
        " (SELECT COUNT(*) FROM modulos) AS m"
    )
    print("\nEquipos: %(e)s | Jugadores: %(j)s | Fechas: %(f)s | Modulos: %(m)s" % total)
    print("\nListo. Admin: usuario 'admin' / clave 'mascapito'\n")
    print("Ejecuta:  python app.py")
    print(SEP)


if __name__ == "__main__":
    main()