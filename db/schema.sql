-- =====================================================================
--  DIAMONDS LEAGUE - Esquema de base de datos
--  (c) 2026 Neptunzinho. Todos los derechos reservados.
--  Licensed for neptunzinho. Uso y redistribucion prohibidos sin permiso.
--  MySQL / Clever Cloud
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `bb5x50igan7rlrgmjbln`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `bb5x50igan7rlrgmjbln`;

-- ---------------------------------------------------------------------
-- 1. USUARIOS  (acceso al panel administrativo)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id`       INT AUTO_INCREMENT PRIMARY KEY,
  `usuario`  VARCHAR(50)  NOT NULL UNIQUE,
  `clave`    VARCHAR(255) NOT NULL,
  `nombre`   VARCHAR(100) NOT NULL,
  `rol`      VARCHAR(50)  NOT NULL DEFAULT 'ADMIN',
  `creado`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 2. MODULOS  (lo que aparece en el header y su contenido editable)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `modulos` (
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `clave`     VARCHAR(40) NOT NULL UNIQUE,   -- liga, pubs, museo, noticias...
  `nombre`    VARCHAR(60) NOT NULL,          -- texto del boton del header
  `titulo`    VARCHAR(160) NOT NULL,         -- H2 de la seccion
  `subtitulo` VARCHAR(300) DEFAULT '',       -- texto introductorio
  `orden`     INT NOT NULL DEFAULT 0,
  `activo`    TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 3. EQUIPOS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `equipos` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `nombre`      VARCHAR(100) NOT NULL,
  `sigla`       VARCHAR(10)  NOT NULL,
  `division`    VARCHAR(30)  NOT NULL DEFAULT 'D1',
  `color`       VARCHAR(20)  NOT NULL DEFAULT '#0AFFD6', -- color del equipo (claro)
  `escudo`      VARCHAR(255) DEFAULT '',    -- ruta en /static/uploads
  `entrenador`  VARCHAR(100) DEFAULT '',
  `fundado`     YEAR DEFAULT NULL,
  `ciudad`      VARCHAR(80)  DEFAULT '',
  `creado`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 4. JUGADORES   (dorsal: 2 caracteres, posicion: GK / Mid / Dfwd / Fwd)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jugadores` (
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `equipo_id` INT NOT NULL,
  `nombre`    VARCHAR(80) NOT NULL,
  `dorsal`    VARCHAR(2)  DEFAULT NULL,
  `posicion`  VARCHAR(20) DEFAULT 'Mid',
  `goles`     INT NOT NULL DEFAULT 0,
  `asistencias` INT NOT NULL DEFAULT 0,
  `cs`        INT NOT NULL DEFAULT 0,      -- clean sheets
  `minutos_cs` INT NOT NULL DEFAULT 0,
  `creado`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jug_equipo FOREIGN KEY (`equipo_id`)
    REFERENCES `equipos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 5. FECHAS  (calendario de partidos)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fechas` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `equipo_a_id` INT NOT NULL,
  `equipo_b_id` INT NOT NULL,
  `fecha`       DATE NOT NULL,
  `hora`        TIME DEFAULT NULL,
  `jornada`     VARCHAR(40) DEFAULT 'JORNADA 1',
  `fase`        VARCHAR(40) DEFAULT 'LIGA REGULAR',
  `sala`        VARCHAR(255) DEFAULT '',    -- link de la sala de HaxBall
  `creado`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_fecha_fecha (`fecha`),
  CONSTRAINT fk_fecha_a FOREIGN KEY (`equipo_a_id`)
    REFERENCES `equipos`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_fecha_b FOREIGN KEY (`equipo_b_id`)
    REFERENCES `equipos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 6. RESULTADOS  (marcador + estadisticas del partido)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `resultados` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `fecha_id`       INT NOT NULL UNIQUE,
  `goles_a`        INT NOT NULL DEFAULT 0,
  `goles_b`        INT NOT NULL DEFAULT 0,
  `goleadores`     TEXT DEFAULT NULL,   -- JSON: [{"jugador":"..","equipo":"a","goles":2}]
  `asistencias`    TEXT DEFAULT NULL,   -- JSON: [{"jugador":"..","equipo":"a","asistencias":1}]
  `portero_a`      VARCHAR(80) DEFAULT '',
  `portero_b`      VARCHAR(80) DEFAULT '',
  `cs_a`           TINYINT(1) NOT NULL DEFAULT 0,
  `cs_b`           TINYINT(1) NOT NULL DEFAULT 0,
  `minutos_cs`     INT NOT NULL DEFAULT 0,   -- minutos de porteria en cero
  `actualizado`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_fecha FOREIGN KEY (`fecha_id`)
    REFERENCES `fechas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 7. CONTENIDOS  (pubs, museo, noticias, anuncios, alianzas, redes,
--                  equipo, donacion) -> todo editable desde el panel
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contenidos` (
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `modulo`    VARCHAR(40) NOT NULL,          -- clave del modulo
  `titulo`    VARCHAR(160) NOT NULL,
  `subtitulo` VARCHAR(300) DEFAULT '',
  `texto`     TEXT DEFAULT NULL,
  `enlace`    VARCHAR(500) DEFAULT '',
  `imagen`    VARCHAR(255) DEFAULT '',
  `dato_extra` VARCHAR(160) DEFAULT '',      -- ej: "@usuario", "Neptunzinho"
  `categoria` VARCHAR(60) DEFAULT '',        -- filtro del museo
  `fecha`     DATE DEFAULT NULL,
  `orden`     INT NOT NULL DEFAULT 0,
  `visible`   TINYINT(1) NOT NULL DEFAULT 1,
  `creado`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 8. FORO / SUGERENCIAS  (comentarios publicos)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `foro` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `nombre`     VARCHAR(60) NOT NULL,
  `mensaje`    TEXT NOT NULL,
  `fecha`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 9. X5 IDEAL  (los admins arman el cinco ideal de cada jornada)
--    5 jugadores por jornada, de cualquier equipo, con su posicion.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ideales` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `jornada`    VARCHAR(40) NOT NULL DEFAULT 'JORNADA 1',
  `division`   VARCHAR(10) NOT NULL DEFAULT 'D1',
  `jugador_id` INT NOT NULL,
  `posicion`   VARCHAR(10) NOT NULL DEFAULT 'Mid',  -- GK / Mid / Dfwd / Fwd
  `orden`      TINYINT NOT NULL DEFAULT 1,          -- 1 al 5
  `creado`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ideal (`jornada`, `division`, `jugador_id`),
  CONSTRAINT fk_ideal_jug FOREIGN KEY (`jugador_id`)
    REFERENCES `jugadores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;