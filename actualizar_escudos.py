# -*- coding: utf-8 -*-
"""
=====================================================================
 DIAMONDS LEAGUE - Actualiza el escudo de los equipos con las
 imagenes locales de static/assets/d1 y static/assets/d2.

 Sirve para equipos que quedaron sin imagen en la base de datos
 (por ejemplo, 'Distrito Evolutions' de la D2).

 Uso:  python actualizar_escudos.py --dry   (solo muestra lo que haria)
       python actualizar_escudos.py         (escribe en la base de datos)
 (c) 2026 Neptunzinho. Todos los derechos reservados.
=====================================================================
"""
import re
import sys
import unicodedata

import db

SEP = "=" * 70

# nombre normalizado del equipo -> ruta publica de la imagen
ESCUDOS = {
    # --- Division 1 ---
    "alajuense": "assets/d1/Alajuense.png",
    "dominion": "assets/d1/dominion.png",
    "klokan": "assets/d1/Klokan.png",
    "lexington": "assets/d1/Lexington.png",
    "littlepony": "assets/d1/littlepony.png",
    "mafia": "assets/d1/mafia.png",
    "melgar": "assets/d1/melgar.png",
    "mysticstorm": "assets/d1/mysticstorm.png",
    "novasquad": "assets/d1/Novasquad.png",
    "orense": "assets/d1/ORENSE.png",
    "parceros": "assets/d1/parceros.png",
    "pereira": "assets/d1/PEREIRA.png",
    # --- Division 2 ---
    "blueknight": "assets/d2/blueKnight.png",
    "deportivopasto": "assets/d2/deportivopasto.png",
    "distritoevolutions": "assets/d2/distritoevolutions.png",
    "fenix": "assets/d2/fenix.png",
    "platanera": "assets/d2/platanera.png",
    "pollolandia": "assets/d2/pollolandia.png",
    "spider": "assets/d2/spider.png",
    "visajosos": "assets/d2/visajosos.png",
}


def normalizar(texto):
    """minusculas, sin acentos ni espacios (para comparar nombres)."""
    texto = unicodedata.normalize("NFKD", texto or "")
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", texto.lower())


def main():
    seco = "--dry" in sys.argv
    print(SEP)
    print(" DIAMONDS LEAGUE - Escudos de equipos (c) Neptunzinho")
    print(SEP)

    ok, msg = db.probar()
    if not ok:
        print("[ERROR] %s" % msg)
        return 1

    equipos = db.consultar("SELECT id, nombre, division, escudo FROM equipos")
    cambios = []
    for eq in equipos:
        imagen = ESCUDOS.get(normalizar(eq["nombre"]))
        if not imagen:
            continue
        if eq["escudo"] == imagen:
            print("  [=] %-24s ya tiene %s" % (eq["nombre"], imagen))
            continue
        cambios.append((imagen, eq["id"]))
        print("  [>] %-24s %s -> %s" % (eq["nombre"], eq["escudo"] or "(vacio)", imagen))

    if not cambios:
        print("\nNada por actualizar.")
        print(SEP)
        return 0

    if seco:
        print("\nMODO: SECO (no se escribio nada). %d equipos por actualizar." % len(cambios))
        print(SEP)
        return 0

    for imagen, equipo_id in cambios:
        db.ejecutar("UPDATE equipos SET escudo = %s WHERE id = %s", (imagen, equipo_id))
    print("\nListo. %d escudos actualizados." % len(cambios))
    print(SEP)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
