# -*- coding: utf-8 -*-
"""
=====================================================================
 DIAMONDS LEAGUE - Migracion de base de datos (versiones anteriores)
   * equipos.color        -> color del equipo en las tarjetas
   * jugadores.numero     -> jugadores.dorsal (VARCHAR(2))
   * jugadores.posicion   -> GK / Mid / Dfwd / Fwd
   * tabla nueva `ideales` -> X5 ideal de cada jornada
   * staff del modulo `equipo` segun info.txt

 Uso:  python migrar.py
 (c) 2026 Neptunzinho. Todos los derechos reservados.
=====================================================================
"""
import db

SEP = "=" * 70


def columnas(tabla):
    filas = db.consultar("SHOW COLUMNS FROM `%s`" % tabla)
    return {f["Field"] for f in filas}


def ejecutar(sql, args=None):
    db.ejecutar(sql, args)
    print("  [ok] %s" % sql.split("\n")[0][:80])


def migrar():
    cols_eq = columnas("equipos")
    if "color" not in cols_eq:
        ejecutar("ALTER TABLE equipos ADD COLUMN color VARCHAR(20)"
                 " NOT NULL DEFAULT '#0AFFD6' AFTER division")
        print("      + equipos.color")

    cols_jug = columnas("jugadores")
    if "numero" in cols_jug and "dorsal" not in cols_jug:
        ejecutar("ALTER TABLE jugadores CHANGE numero dorsal VARCHAR(2) DEFAULT NULL")
        print("      ~ jugadores.numero -> dorsal VARCHAR(2)")
    elif "dorsal" not in cols_jug:
        ejecutar("ALTER TABLE jugadores ADD COLUMN dorsal VARCHAR(2) DEFAULT NULL"
                 " AFTER nombre")
        print("      + jugadores.dorsal")

    if "posicion" in cols_jug:
        ejecutar("UPDATE jugadores SET posicion = CASE"
                 " WHEN posicion IN ('Portero','GK') THEN 'GK'"
                 " WHEN posicion IN ('Titular','Mediocampo','Mid') THEN 'Mid'"
                 " WHEN posicion IN ('Defensa','Defensor','Dfwd') THEN 'Dfwd'"
                 " ELSE 'Fwd' END"
                 " WHERE posicion NOT IN ('GK','Mid','Dfwd','Fwd')")

    db.ejecutar(
        "CREATE TABLE IF NOT EXISTS `ideales` ("
        "  `id` INT AUTO_INCREMENT PRIMARY KEY,"
        "  `jornada` VARCHAR(40) NOT NULL DEFAULT 'JORNADA 1',"
        "  `division` VARCHAR(10) NOT NULL DEFAULT 'D1',"
        "  `jugador_id` INT NOT NULL,"
        "  `posicion` VARCHAR(10) NOT NULL DEFAULT 'Mid',"
        "  `orden` TINYINT NOT NULL DEFAULT 1,"
        "  `creado` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
        "  UNIQUE KEY uq_ideal (`jornada`, `division`, `jugador_id`),"
        "  CONSTRAINT fk_ideal_jug FOREIGN KEY (`jugador_id`)"
        "    REFERENCES `jugadores`(`id`) ON DELETE CASCADE"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    )
    print("  [ok] tabla `ideales` verificada")


def personalizar_equipos():
    """Colores claros por defecto para los equipos existentes."""
    db.ejecutar(
        "UPDATE equipos SET color = CASE"
        " WHEN id MOD 6 = 1 THEN '#7CF5FF'"
        " WHEN id MOD 6 = 2 THEN '#9CFF9C'"
        " WHEN id MOD 6 = 3 THEN '#FFD98E'"
        " WHEN id MOD 6 = 4 THEN '#FFA8E0'"
        " WHEN id MOD 6 = 5 THEN '#C6B4FF'"
        " ELSE '#FFB38A' END"
        " WHERE color IN ('', '#0AFFD6') OR color IS NULL"
    )
    print("  [ok] colores claros asignados a los equipos")


def staff_info():
    """Carga el equipo de administracion descrito en info.txt."""
    db.ejecutar("DELETE FROM contenidos WHERE modulo = 'equipo'")
    filas = [
        ("SAMI", "samantha_89._.", "Fundadora de The Diamonds League.",
         "FUNDADORA", "assets/sami.png", 1),
        ("SANTIAGO", "sdstutaksvyksc", "Fundador de The Diamonds League.",
         "FUNDADOR", "assets/santiago.png", 2),
        ("NYX", "nx0972", "Master de la liga y encargado de las jornadas.",
         "MASTER", "assets/nyx.png", 3),
        ("RAPATUMADRE", "kairuhz.singa_tuvida", "Master de la liga y encargado de los resultados.",
         "MASTER", "assets/rapatumadre.png", 4),
        ("NEPTUNZINHO", "andresneptunzinho",
         "Desarrollador de esta pagina y administrador del panel.",
         "DESARROLLADOR", "assets/neptun.png", 5),
    ]
    db.ejecutar_varios(
        "INSERT INTO contenidos (modulo, titulo, subtitulo, texto, dato_extra,"
        " imagen, orden, visible) VALUES (%s, %s, %s, %s, %s, %s, %s, 1)",
        [("equipo",) + f for f in filas],
    )
    print("  [ok] equipo de administracion actualizado (%d perfiles)" % len(filas))


def main():
    print(SEP)
    print(" DIAMONDS LEAGUE - Migrador de base de datos (c) Neptunzinho")
    print(SEP)
    ok, msg = db.probar()
    if not ok:
        print("[ERROR] %s" % msg)
        return 1

    print("\n1) Columnas y tabla `ideales`...")
    migrar()

    print("\n2) Colores de los equipos...")
    personalizar_equipos()

    print("\n3) Equipo de administracion (info.txt)...")
    staff_info()

    total = db.consultar_uno(
        "SELECT (SELECT COUNT(*) FROM equipos) AS e,"
        " (SELECT COUNT(*) FROM jugadores) AS j,"
        " (SELECT COUNT(*) FROM contenidos WHERE modulo='equipo') AS s"
    )
    print("\nListo. Equipos: %(e)s | Jugadores: %(j)s | Staff: %(s)s" % total)
    print(SEP)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
