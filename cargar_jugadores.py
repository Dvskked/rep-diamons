# -*- coding: utf-8 -*-
"""
Carga los jugadores de jugadores.txt en la base de datos.

- Lee las secciones por equipo (terminan en ":") y respeta el corte de "D2:".
- Ignora la sigla de 3 caracteres y el numero de lista: solo usa el nombre.
- Todos los jugadores quedan con posicion "Mid" (por ahora).
- Es idempotente: no duplica jugadores que ya existen en su equipo.

Uso:
    python cargar_jugadores.py --dry   # solo muestra lo que haria
    python cargar_jugadores.py         # escribe en la base de datos
"""
import os
import re
import sys
import unicodedata

import db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARCHIVO = os.path.join(BASE_DIR, "jugadores.txt")


def normalizar(texto):
    """minusculas, sin acentos y con espacios simples (para comparar)."""
    texto = unicodedata.normalize("NFKD", texto or "")
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", texto).strip().lower()


def parsear(ruta):
    """Devuelve [(nombre_equipo, division, [nombres...]), ...]."""
    equipos = []
    actual = None
    division = "D1"

    with open(ruta, encoding="utf-8") as f:
        for linea in f:
            cruda = linea.rstrip("\n").strip()
            if not cruda:
                continue
            if cruda.lower().startswith("aqui tienes") or "por favor no lo tomes" in cruda.lower():
                continue
            if cruda.upper() == "D2:":
                division = "D2"
                continue
            if cruda.startswith("["):
                continue

            # Cabecera de equipo: termina en ":" y no es un jugador (sin "|")
            if cruda.endswith(":") and "|" not in cruda:
                actual = {"nombre": cruda[:-1].strip(), "division": division, "jugadores": []}
                equipos.append(actual)
                continue

            if actual is None:
                continue

            nombre = parsear_jugador(cruda)
            if nombre:
                actual["jugadores"].append(nombre)

    return equipos


def parsear_jugador(linea):
    """Extrae el nombre limpio, ignorando numero de lista y sigla."""
    izquierda, sep, derecha = linea.partition("|")
    if sep:
        return derecha.strip() or None
    # sin "|": puede venir "3 bryan reyna"
    m = re.match(r"^(\d+)\s+(.+)$", linea)
    return (m.group(2).strip() if m else linea.strip()) or None


def main():
    seco = "--dry" in sys.argv

    if not os.path.exists(ARCHIVO):
        print("No se encontro jugadores.txt")
        return 1

    equipos_db = db.consultar("SELECT id, nombre, sigla, division FROM equipos")
    por_nombre = {normalizar(e["nombre"]): e for e in equipos_db}

    existentes = {}
    for fila in db.consultar("SELECT equipo_id, nombre FROM jugadores"):
        existentes.setdefault(fila["equipo_id"], set()).add(normalizar(fila["nombre"]))

    total_nuevos = 0
    total_equipos = 0
    desconocidos = []

    for equipo in parsear(ARCHIVO):
        clave = normalizar(equipo["nombre"])
        fila = por_nombre.get(clave)
        if not fila:
            desconocidos.append(equipo["nombre"])
            continue

        ya = existentes.get(fila["id"], set())
        nuevos = [n for n in equipo["jugadores"] if normalizar(n) not in ya]
        total_equipos += 1
        total_nuevos += len(nuevos)
        print("%-4s %-28s %2d jugadores (%d nuevos)" % (
            fila["sigla"], fila["nombre"], len(equipo["jugadores"]), len(nuevos)))

        if seco or not nuevos:
            for n in nuevos:
                existentes.setdefault(fila["id"], set()).add(normalizar(n))
            continue

        db.ejecutar_varios(
            "INSERT INTO jugadores (equipo_id, nombre, dorsal, posicion)"
            " VALUES (%s, %s, NULL, 'Mid')",
            [(fila["id"], n) for n in nuevos],
        )
        existentes.setdefault(fila["id"], set()).update(normalizar(n) for n in nuevos)

    print("-" * 56)
    print("Equipos del archivo: %d | jugadores nuevos: %d" % (total_equipos, total_nuevos))
    if desconocidos:
        print("Equipos no encontrados en la base:", ", ".join(desconocidos))
    print("MODO:", "SECO (no se escribio nada)" if seco else "ESCRITURA")
    return 0


if __name__ == "__main__":
    sys.exit(main())
