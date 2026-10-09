# -*- coding: utf-8 -*-
"""
=====================================================================
 DIAMONDS LEAGUE - Carga el museo y los logos de redes sociales
   * Museo: usa las imagenes de static/assets/museo
   * Redes: agrega los logos de TikTok y Discord
 Uso:  python cargar_museo.py --dry   (solo muestra lo que haria)
       python cargar_museo.py         (escribe en la base de datos)
 (c) 2026 Neptunzinho. Todos los derechos reservados.
=====================================================================
"""
import os
import sys

import db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SEP = "=" * 70

# (categoria, titulo, subtitulo, texto, dato_extra, imagen, orden)
MUSEO = [
    # --- Premios Division 1 ---
    ("PREMIOS D1", "Balón de Oro D1", "Muñoz", "Lexington", "Temporada 2",
     "assets/museo/d1-balon-de-oro.webp", 1),
    ("PREMIOS D1", "Bota de Oro D1", "Muñoz", "Lexington", "Temporada 2",
     "assets/museo/d1-bota-de-oro.webp", 2),
    ("PREMIOS D1", "Guante de Oro D1", "Oblea Gatona", "Lexington", "Temporada 2",
     "assets/museo/d1-guante-de-oro.webp", 3),
    # --- Premios Division 2 ---
    ("PREMIOS D2", "Balón de Oro D2", "Gabinho", "Deportivo Pereira", "Temporada 2",
     "assets/museo/d2-balon-de-oro.webp", 4),
    ("PREMIOS D2", "Bota de Oro D2", "Gabinho", "Deportivo Pereira", "Temporada 2",
     "assets/museo/d2-bota-de-oro.webp", 5),
    ("PREMIOS D2", "Guante de Oro D2", "Sxra", "Kiosko FC", "Temporada 2",
     "assets/museo/d2-guante-de-oro.webp", 6),
    # --- Rankings Division 1 ---
    ("RANKINGS D1", "Ranking Balón D1", "Top 5", "Balón de Oro", "Temporada 2",
     "assets/museo/d1-ranking-balon.webp", 7),
    ("RANKINGS D1", "Ranking Bota D1", "Top 5", "Bota de Oro", "Temporada 2",
     "assets/museo/d1-ranking-bota.webp", 8),
    ("RANKINGS D1", "Ranking Guante D1", "Top 5", "Guante de Oro", "Temporada 2",
     "assets/museo/d1-ranking-guante.webp", 9),
    # --- Rankings Division 2 ---
    ("RANKINGS D2", "Ranking Balón D2", "Top 5", "Balón de Oro", "Temporada 2",
     "assets/museo/d2-ranking-balon.webp", 10),
    ("RANKINGS D2", "Ranking Bota D2", "Top 5", "Bota de Oro", "Temporada 2",
     "assets/museo/d2-ranking-bota.webp", 11),
    ("RANKINGS D2", "Ranking Guante D2", "Top 5", "Guante de Oro", "Temporada 2",
     "assets/museo/d2-ranking-guante.webp", 12),
    # --- Campeones / Mejor club ---
    ("CAMPEONES", "Mejor Club D1", "Lexington", "DT Santiago", "Temporada 2",
     "assets/museo/d1-mejor-club.webp", 13),
    ("CAMPEONES", "Mejor Club D2", "Deportivo Pereira", "DT Inuv", "Temporada 2",
     "assets/museo/d2-mejor-club.webp", 14),
]

# Redes: se actualiza la imagen del logo segun el titulo
REDES_LOGOS = [
    ("%tiktok%", "assets/tiktok.png"),
    ("%discord%", "assets/discord.png"),
]


def cargar_museo():
    """Reemplaza el museo por los 14 premios con su imagen y descripcion."""
    borradas = db.ejecutar("DELETE FROM contenidos WHERE modulo = 'museo'")
    db.ejecutar_varios(
        "INSERT INTO contenidos (modulo, categoria, titulo, subtitulo, texto,"
        " dato_extra, imagen, orden, visible)"
        " VALUES ('museo', %s, %s, %s, %s, %s, %s, %s, 1)",
        MUSEO,
    )
    print("  [ok] museo: %d premios (antes %d)" % (len(MUSEO), borradas))


def cargar_redes():
    """Asigna el logo (TikTok / Discord) a las redes ya existentes."""
    for patron, imagen in REDES_LOGOS:
        filas = db.ejecutar(
            "UPDATE contenidos SET imagen = %s"
            " WHERE modulo = 'redes' AND titulo LIKE %s",
            (imagen, patron),
        )
        print("  [ok] redes %-14s -> %s (%d)" % (imagen.split("/")[-1], patron, filas))


def main():
    seco = "--dry" in sys.argv

    print(SEP)
    print(" DIAMONDS LEAGUE - Museo y redes (c) Neptunzinho")
    print(SEP)

    ok, msg = db.probar()
    if not ok:
        print("[ERROR] %s" % msg)
        return 1

    if seco:
        print("\nMUSEO (modo seco):")
        for c in MUSEO:
            print("  %-11s %-20s %-16s %-20s %s" % (c[0], c[1], c[2], c[4], c[5]))
        print("\nREDES (modo seco): %s" % ", ".join(r[1] for r in REDES_LOGOS))
        print("\nMODO: SECO (no se escribio nada)")
        return 0

    print("\n1) Cargando museo...")
    cargar_museo()

    print("\n2) Cargando logos de redes...")
    cargar_redes()

    total = db.consultar_uno(
        "SELECT (SELECT COUNT(*) FROM contenidos WHERE modulo='museo') AS m,"
        " (SELECT COUNT(*) FROM contenidos WHERE modulo='redes' AND imagen<>'') AS r"
    )
    print("\nListo. Museo: %(m)s | Redes con logo: %(r)s" % total)
    print(SEP)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
