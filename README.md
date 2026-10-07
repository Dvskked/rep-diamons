# The Diamonds League

Sitio oficial de **The Diamonds League**, liga competitiva de HaxBall X5.
Incluye la pagina publica (liga, fechas, estadisticas, X5 ideal, museo, foro)
y un panel de administracion privado.

- **Frontend:** HTML + CSS + JavaScript vanilla (sin build ni framework JS).
- **Backend:** Flask 3 (Python) con plantillas Jinja2.
- **Base de datos:** MySQL (Clever Cloud en produccion, configurable por `.env`).
- **Despliegue:** Vercel (`vercel.json` + `api/index.py`).

---

## Caracteristicas

### Pagina publica (paginas separadas)
- **`/` Inicio**: hero con el ultimo resultado y el proximo partido, franja de
  resultados en movimiento, cards **Ligas en juego** (D1 / D2), listado de
  resultados con filtro por division, **Por jugar**, **Lideres de la temporada**
  y las secciones **PUBS**, **Museo**, **Noticias**, **Anuncios**, **Alianzas**
  y **Foro**.
- **`/liga` Diamonds League**: doble filtro division (**D1 / D2**) y vista
  (**Posiciones, Calendario, X5 Ideal, Equipos**). Tabla con PJ, G, E, P, GF,
  GC, DG y PTS; cancha del cinco ideal por jornada; plantillas por equipo.
- **`/estadisticas`**: filtro por division + buscador y tabla ordenable por
  goles, asistencias y clean sheets, con mini-rankings.
- **`/redes`**, **`/equipo`** (staff) y **`/donacion`** como paginas propias.
- Header de una sola fila: Inicio, Diamonds League, Estadisticas, Redes
  sociales, Equipo administracion, Donar y boton **Administrar**.
- Responsive total, animaciones ligeras (solo `transform`/`opacity`) y
  respeto a `prefers-reduced-motion`.

### Panel de administracion (`/admin`)
- Gestion de equipos (color, division, escudo, entrenador) y jugadores
  (dorsal, posicion, estadisticas).
- Calendario de fechas, resultados y limpieza de arcos.
- Armado del **X5 ideal** por jornada y division.
- Contenido editable de cada modulo del header (anuncios, noticias, museo,
  pubs, staff, redes, donaciones), modulos del header y foro.
- Acceso con sesion (`admin / mascapito` en el seed).

---

## Estructura

```
.
├── app.py            # Rutas, API publica y API de administracion
├── config.py         # Lectura de variables de entorno
├── db.py             # Conexion y consultas MySQL
├── init_db.py        # Crea la base de datos y carga db/seed.sql
├── migrar.py         # Migracion de bases de datos anteriores
├── api/index.py      # Punto de entrada para Vercel
├── db/
│   ├── schema.sql    # Esquema de tablas
│   └── seed.sql      # Datos iniciales (equipos, staff, modulos...)
├── templates/        # base.html + inicio, liga, estadisticas, redes,
│                     #   equipo, donacion, admin y login
├── static/
│   ├── styles.css    # Hoja publica
│   ├── app.js        # Logica de la pagina publica (render por pagina)
│   ├── admin.css     # Estilos del panel
│   ├── admin.js      # Logica del panel
│   └── assets/       # Logos, escudos e imagenes del staff
├── info.txt          # Staff (nombre, discord, cargo, imagen)
├── requirements.txt
└── vercel.json
```

---

## Requisitos

- Python 3.10+
- MySQL 5.7 / 8.0 (o MariaDB equivalente)
- Node.js 16+ (solo para revisar la sintaxis del JS: `node --check`)

---

## Instalacion

```bash
git clone <repo>
cd proyec-diamons

python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux / macOS

pip install -r requirements.txt
copy .env.example .env        # Windows
# cp .env.example .env        # Linux / macOS
```

Edita `.env` con tus datos reales:

```env
MYSQL_ADDON_HOST=...
MYSQL_ADDON_DB=...
MYSQL_ADDON_USER=...
MYSQL_ADDON_PASSWORD=...
MYSQL_ADDON_PORT=3306
SECRET_KEY=clave-larga-y-aleatoria
```

Tambien se acepta una unica variable `MYSQL_ADDON_URI`
(`mysql://usuario:clave@host:puerto/base`).

### Base de datos

| Comando | Que hace |
|---|---|
| `python init_db.py` | Crea las tablas (`db/schema.sql`) y carga `db/seed.sql` |
| `python migrar.py`  | Migracion idempotente de una base existente: agrega `equipos.color`, convierte `jugadores.numero` a `dorsal`, normaliza posiciones, crea la tabla `ideales` y actualiza el staff segun `info.txt` |

> `migrar.py` se puede ejecutar tantas veces como sea necesario; no pierde datos.

---

## Ejecucion local

```bash
python app.py
# -> http://127.0.0.1:5000
```

El panel queda en `http://127.0.0.1:5000/admin`.

---

## API

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/sitio` | Todo el contenido publico (modulos, equipos, fechas, ideales, foro) |
| POST | `/api/foro` | Publicar mensaje en el foro |
| POST / GET | `/api/login`, `/api/sesion`, `/api/logout` | Sesion de administrador |
| GET/POST/PUT/DELETE | `/api/admin/equipos`, `/api/admin/jugadores` | Plantillas |
| GET/POST/DELETE | `/api/admin/ideales` | X5 ideal por jornada y division |
| GET/POST/PUT/DELETE | `/api/admin/fechas`, `/api/admin/resultados` | Calendario y resultados |
| GET/POST/PUT/DELETE | `/api/admin/contenidos`, `/api/admin/modulos` | Contenido del sitio |
| GET/DELETE | `/api/admin/foro` | Moderacion del foro |

Todas las rutas `/api/admin/*` exigen sesion de administrador.

---

## Despliegue en Vercel

`vercel.json` publica `static/` como ficheros estaticos con cache de un ano y
enruta todo lo demas a `api/index.py` (build de Python con `templates/`, `db/`
y los `.py` incluidos). Configura las mismas variables de entorno en el
panel de Vercel y despliega.

---

## Notas de rendimiento

- Sin `background-attachment: fixed` ni `backdrop-filter` en tarjetas.
- Animaciones limitadas a `transform` y `opacity`.
- `loading="lazy"` en imagenes no criticas y `preload` del logo del hero.
- Consultas unicas a la base por peticion (`/api/sitio` devuelve todo el sitio).

---

## Licencia

Codigo y disenio (c) 2026 Neptunzinho. Uso y redistribucion prohibidos sin
autorizacion del autor.
