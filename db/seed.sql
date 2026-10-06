-- =====================================================================
--  DIAMONDS LEAGUE - Datos iniciales
--  (c) 2026 Neptunzinho. Todos los derechos reservados.
-- =====================================================================
USE `bb5x50igan7rlrgmjbln`;

SET @pass := 'scrypt:32768:8:1$EAnL2RVBPQA5rD20$d3eafb584e9c7ddfcc5cd23ead9153bfca322493e5a3f6298210311cb33d97d964c7d28365386aad8b9818a4d0732a215e7720b591ccfa58f93bec1f85948ed2';

-- ---------------------------------------------------------------- USUARIOS
INSERT IGNORE INTO `usuarios` (`usuario`, `clave`, `nombre`, `rol`) VALUES
('admin', @pass, 'Neptunzinho', 'ADMINISTRADOR');

-- ----------------------------------------------------------------- MODULOS
INSERT IGNORE INTO `modulos` (`clave`, `nombre`, `titulo`, `subtitulo`, `orden`, `activo`) VALUES
('liga',      'LIGA',                  'La liga',                   'Divisiones, calendario, resultados y estadisticas de la temporada.', 1, 1),
('pubs',      'PUBS',                  'Salas de HaxBall',          'Entra directo a las salas publicas de la liga.', 2, 1),
('museo',     'MUSEO',                 'Museo de la liga',          'Premios, balones de oro y todo lo que se ha entregado.', 3, 1),
('noticias',  'NOTICIAS',              'Noticias',                  'Reportajes, entrevistas y Advances de cada jornada.', 4, 1),
('anuncios',  'ANUNCIOS - NOVEDADES',  'Anuncios y novedades',      'Avisos de la liga, inscripciones y comunicados oficiales.', 5, 1),
('alianzas',  'ALIANZAS',              'Alianzas y afiliados',     'Servers aliados y proximas afiliaciones.', 6, 1),
('redes',     'REDES SOCIALES',        'Redes sociales',            'Donde nos encontrar y los streams de la comunidad.', 7, 1),
('equipo',    'EQUIPO ADMINISTRACION', 'Equipo de administracion',  'Las personas que hacen posible que la liga funcione.', 8, 1),
('donacion',  'DONACION',              'Donaciones',                'Metodos para apoyar a la liga y al servidor.', 9, 1);

-- ----------------------------------------------------------------- EQUIPOS
INSERT IGNORE INTO `equipos` (`id`, `nombre`, `sigla`, `division`, `color`, `entrenador`, `fundado`, `ciudad`) VALUES
(1, 'Lexington',        'LEX', 'D1', '#7CF5FF', 'Santiago',  2023, 'Colombia'),
(2, 'Deportivo Lima',  'DEP', 'D1', '#9CFF9C', 'Ribero',    2023, 'Peru'),
(3, 'Kiosko FC',       'KIO', 'D1', '#FFD98E', 'Vallejo',   2024, 'Chile'),
(4, 'Titanes FC',      'TIT', 'D1', '#FFA8E0', 'Ortiz',     2024, 'Argentina'),
(5, 'Aurora Sporting', 'AUR', 'D1', '#C6B4FF', 'Molina',    2025, 'Mexico'),
(6, 'Rayo Norte',      'RYN', 'D1', '#FFB38A', 'Salas',     2025, 'Ecuador'),
(7, 'Deportivo Pereira','PER','D2', '#9EE7FF', 'Inuv',      2024, 'Colombia'),
(8, 'Halcones FC',     'HAL', 'D2', '#E0FFB0', 'Bustos',    2025, 'Bolivia');

-- --------------------------------------------------------------- JUGADORES
INSERT IGNORE INTO `jugadores` (`equipo_id`, `nombre`, `dorsal`, `posicion`, `goles`, `asistencias`, `cs`, `minutos_cs`) VALUES
(1,'Munoz',      '9', 'Fwd',  38, 11, 0,  0),
(1,'Oblea Gatona','1', 'GK',    0,  2, 6, 810),
(1,'Cardona',    '7', 'Mid',  12, 15, 0,  0),
(2,'Rios',      '10', 'Mid',  21,  8, 0,  0),
(2,'Vega',       '1', 'GK',    0,  1, 3, 540),
(3,'Gabinho',   '11', 'Fwd',  24, 12, 0,  0),
(3,'Sxra',       '1', 'GK',    0,  0, 5, 726),
(4,'Ferreyra',   '8', 'Fwd',  17,  6, 0,  0),
(5,'Duarte',     '6', 'Mid',  14,  9, 0,  0),
(6,'Cedeño',    '10', 'Mid',  11,  5, 0,  0),
(7,'Quintero',   '9', 'Fwd',  16,  7, 0,  0),
(8,'Aguilar',    '4', 'Dfwd',  9, 10, 0,  0);

-- ------------------------------------------------------------------ FECHAS
INSERT IGNORE INTO `fechas` (`id`, `equipo_a_id`, `equipo_b_id`, `fecha`, `hora`, `jornada`, `fase`, `sala`) VALUES
(1, 1, 2, '2026-08-03', '19:00:00', 'JORNADA 1', 'LIGA REGULAR', 'https://www.haxball.com/play?c=lnjqtRG-Z-E'),
(2, 3, 4, '2026-08-03', '20:00:00', 'JORNADA 1', 'LIGA REGULAR', 'https://www.haxball.com/play?c=lX3wqk3eNlo'),
(3, 5, 6, '2026-08-04', '19:00:00', 'JORNADA 1', 'LIGA REGULAR', 'https://www.haxball.com/play?c=1ziccjYd2JU'),
(4, 7, 8, '2026-08-04', '20:00:00', 'JORNADA 1', 'LIGA REGULAR', 'https://www.haxball.com/play?c=cPP-NvFDXTc');

-- --------------------------------------------------------------- RESULTADOS
INSERT IGNORE INTO `resultados` (`fecha_id`, `goles_a`, `goles_b`, `goleadores`, `asistencias`, `portero_a`, `portero_b`, `cs_a`, `cs_b`, `minutos_cs`) VALUES
(1, 4, 2,
 '[{"jugador":"Munoz","equipo":"a","goles":3},{"jugador":"Rios","equipo":"b","goles":2}]',
 '[{"jugador":"Cardona","equipo":"a","asistencias":2},{"jugador":"Rios","equipo":"b","asistencias":1}]',
 'Oblea Gatona', 'Vega', 0, 0, 0),
(2, 1, 3,
 '[{"jugador":"Ferreyra","equipo":"b","goles":2},{"jugador":"Gabinho","equipo":"a","goles":1}]',
 '[{"jugador":"Sxra","equipo":"a","asistencias":1}]',
 'Sxra', 'Gabinho', 1, 0, 78);

-- --------------------------------------------------------------- CONTENIDOS
-- PUBS
INSERT IGNORE INTO `contenidos` (`modulo`, `titulo`, `subtitulo`, `texto`, `enlace`, `orden`) VALUES
('pubs', 'ROOM 01', 'Diamonds Public',  'Sala oficial de la liga, siempre abierta.',  'https://www.haxball.com/play?c=lnjqtRG-Z-E', 1),
('pubs', 'ROOM 02', 'Diamonds Public',  'Partidos amistosos y scrims.',              'https://www.haxball.com/play?c=lX3wqk3eNlo', 2),
('pubs', 'ROOM 03', 'Training Room',    'Sala de practica libre para los equipos.',  'https://www.haxball.com/play?c=1ziccjYd2JU', 3),
('pubs', 'ROOM 04', 'Diamonds Public',  'Sala secundaria para más partidas.',       'https://www.haxball.com/play?c=cPP-NvFDXTc', 4),
('pubs', 'ROOM 05', 'Stream Room',      'Sala usada para transmisiones y eventos.',  'https://www.haxball.com/play?c=Fu5CTxD2F-s', 5);

-- MUSEO
INSERT IGNORE INTO `contenidos` (`modulo`, `titulo`, `subtitulo`, `texto`, `categoria`, `fecha`, `orden`) VALUES
('museo', 'BALON DE ORO D1', 'Munoz',            'Lexington - 38 goles, 11 asistencias y 7 partidos.', 'PREMIOS', '2026-07-20', 1),
('museo', 'BOTA DE ORO D1',  'Munoz',            'Lexington - 38 goles en 7 partidos.',                'PREMIOS', '2026-07-20', 2),
('museo', 'GUANTE DE ORO D1','Oblea Gatona',     'Lexington - 810 minutos de clean sheet.',            'PREMIOS', '2026-07-20', 3),
('museo', 'BALON DE ORO D2', 'Gabinho',          'Deportivo Pereira - 24 goles y 12 asistencias.',    'PREMIOS', '2026-07-20', 4),
('museo', 'BOTA DE ORO D2',  'Gabinho',          'Deportivo Pereira - 24 goles en liga.',              'PREMIOS', '2026-07-20', 5),
('museo', 'GUANTE DE ORO D2','Sxra',             'Kiosko FC - 726 minutos de clean sheet.',            'PREMIOS', '2026-07-20', 6),
('museo', 'RANKING BALON',   'Top 5 temporada',  'Seleccion oficial de los mejores jugadores.',         'RANKINGS','2026-07-21', 7),
('museo', 'CAMPEON D1',      'Lexington',        'Campeon de la Division 1 - DT Santiago.',            'CAMPEONES','2026-07-22', 8),
('museo', 'CAMPEON D2',      'Deportivo Pereira','Campeon de la Division 2 - DT Inuv.',               'CAMPEONES','2026-07-22', 9);

-- NOTICIAS
INSERT IGNORE INTO `contenidos` (`modulo`, `titulo`, `subtitulo`, `texto`, `fecha`, `orden`) VALUES
('noticias', 'NUEVA PAGINA DE LA LIGA', 'PORTADA',
 'En esta pagina se reuniran los avisos, resultados, entrevistas y contenido de cada jornada de The Diamonds League.', CURDATE(), 1),
('noticias', 'RESUMEN DE LA JORNADA 1', 'PERIODICO',
 'Lexington arranco la temporada con victoria 4-2 sobre Deportivo Lima. Kiosko FC cae 1-3 ante Titanes FC.', CURDATE(), 2),
('noticias', 'ENTREVISTA CON MUNOZ', 'ENTREVISTAS',
 'Hablamos con el maximo goleador de la Division 1 sobre el inicio de temporada y sus objetivos.', CURDATE(), 3);

-- ANUNCIOS
INSERT IGNORE INTO `contenidos` (`modulo`, `titulo`, `subtitulo`, `texto`, `dato_extra`, `fecha`, `orden`) VALUES
('anuncios', 'PREMIOS DE LA TEMPORADA 2', 'CEREMONIA DE PREMIOS',
 'Se anunciaron los ganadores de las principales categorias y los clubes campeones de cada division. Los premios completos estan en el Museo.',
 'TEMPORADA 2', '2026-07-20', 1),
('anuncios', 'INSCRIPCIONES TEMPORADA 3', 'INSCRIPCIONES',
 'Las inscripciones para la Temporada 3 abren el lunes 27 de julio de 2026. Los equipos interesados podran registrarse desde la primera jornada.',
 'CUPOS LIMITADOS', '2026-07-15', 2),
('anuncios', 'NUEVO SISTEMA DE SANCIONES', 'AVISO',
 'A partir de la proxima jornada se aplicaran las nuevas escalas de advertencias y sanciones del reglamento.', 'REGLAMENTO', CURDATE(), 3);

-- ALIANZAS
INSERT IGNORE INTO `contenidos` (`modulo`, `titulo`, `subtitulo`, `texto`, `enlace`, `orden`) VALUES
('alianzas', 'PARTNER 01', 'Server aliado',  'Enlace directo al Discord del servidor aliado.', 'https://discord.gg/8JTfxJy66K', 1),
('alianzas', 'PARTNER 02', 'Server aliado',  'Enlace directo al Discord del servidor aliado.', 'https://discord.gg/UgJUR8CGWu', 2),
('alianzas', 'PARTNER 03', 'Server aliado',  'Enlace directo al Discord del servidor aliado.', 'https://discord.gg/9ygkmbnjkE', 3),
('alianzas', 'DIAMONDS x RUSHBET', 'EN NEGOCIACION',
 'La afiliacion con RushBet esta en negociacion. Se announce la fecha oficial desde este mismo modulo.',
 '', 4);

-- REDES
INSERT IGNORE INTO `contenidos` (`modulo`, `titulo`, `subtitulo`, `texto`, `enlace`, `orden`) VALUES
('redes', 'TIKTOK OFICIAL',  '@diamondsleague89', 'Videos, clips y highlights de cada jornada.', 'https://www.tiktok.com/@diamondsleague89', 1),
('redes', 'DISCORD OFICIAL',  'Servidor de la liga', 'Comunidad, soporte y canal de sanciones.',      'https://discord.gg/kVAjgkeRsC', 2),
('redes', 'STREAM STEFY',     '@stream_stefy',      'Transmisiones de la Division 1.',               '', 3),
('redes', 'STREAM GABINHO',   '@stream_gabinho',    'Streams y contenido de la Division 2.',         '', 4);

-- EQUIPO ADMINISTRACION (nombres de discord y cargo en info.txt)
INSERT IGNORE INTO `contenidos` (`modulo`, `titulo`, `subtitulo`, `texto`, `dato_extra`, `imagen`, `orden`) VALUES
('equipo', 'SAMI',    'samantha_89._.',       'Fundadora de The Diamonds League.',                     'FUNDADORA',       'assets/sami.png',    1),
('equipo', 'SANTIAGO','sdstutaksvyksc',       'Fundador de The Diamonds League.',                      'FUNDADOR',        'assets/santiago.png', 2),
('equipo', 'NYX',     'nx0972',               'Master de la liga y encargado de las jornadas.',        'MASTER',          'assets/nyx.png',     3),
('equipo', 'RAPATUMADRE', 'kairuhz.singa_tuvida', 'Master de la liga y encargado de los resultados.',   'MASTER',          'assets/rapatumadre.png', 4),
('equipo', 'NEPTUNZINHO', 'andresneptunzinho', 'Desarrollador de esta pagina y administrador del panel.', 'DESARROLLADOR', 'assets/neptun.png',  5);

-- X5 IDEAL (ejemplo del cinco ideal de la jornada 1)
INSERT IGNORE INTO `ideales` (`jornada`, `division`, `jugador_id`, `posicion`, `orden`) VALUES
('JORNADA 1', 'D1', 2,  'GK',   1),
('JORNADA 1', 'D1', 4,  'Dfwd', 2),
('JORNADA 1', 'D1', 1,  'Mid',  3),
('JORNADA 1', 'D1', 5,  'Mid',  4),
('JORNADA 1', 'D1', 7,  'Fwd',  5);

-- DONACION
INSERT IGNORE INTO `contenidos` (`modulo`, `titulo`, `subtitulo`, `texto`, `enlace`, `orden`) VALUES
('donacion', 'PAYPAL',   'PayPal',    'Enviar donación al correo de la liga.',   'mailto:donaciones@diamondsleague.com', 1),
('donacion', 'NEFIS',    'Nequi',     'Donaciones con Nequi.',                   'https://nequi.com', 2),
('donacion', 'BTC',      'Cripto',    'Dirección de Bitcoin de la liga.',        '', 3),
('donacion', 'DISCORD',  'Nitro',     'Invitar a Neptunzinho por Discord para apoyar el proyecto.', 'https://discord.gg/kVAjgkeRsC', 4);

-- FORO DE BIENVENIDA
INSERT IGNORE INTO `foro` (`nombre`, `mensaje`, `fecha`) VALUES
('Administracion', 'Bienvenidos al foro de la liga. Dejen aqui sus sugerencias.', NOW() - INTERVAL 2 DAY);