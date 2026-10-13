# The Diamonds League

Sitio oficial de **The Diamonds League**, liga competitiva de HaxBall X5.
Es un sitio **100% estatico**: todo el contenido esta embebido en
`static/data.js` y se renderiza en el navegador. No hay backend ni base de
datos.

- **Frontend:** HTML + CSS + JavaScript vanilla (sin build ni framework JS).
- **Datos:** `static/data.js` (`window.SITIO`), generado a partir de la base
  de datos original.
- **Despliegue:** Vercel (sitio estatico, `cleanUrls`).

---

## Caracteristicas

### Pagina publica (paginas separadas)
- **`/` Inicio**: hero con el ultimo resultado y el proximo partido, franja de
  resultados en movimiento, cards **Ligas en juego** (D1 / D2), listado de
  resultados, **Por jugar**, **Lideres de la temporada** y las secciones
  **Noticias** y **Anuncios**.
- **`/liga` Diamonds League**: doble filtro division (**D1 / D2**) y vista
  (**Posiciones, Calendario, Resultados, Equipos**). Tabla con PJ, G, E, P, GF,
  GC, DG y PTS; calendario por jornada y plantillas por equipo.
- **`/estadisticas`**: rankings por division de goles, asistencias y clean
  sheets, con buscador.
- **`/museo`**: galeria de premios, rankings y campeones con doble filtro por
  **temporada** (Todas / SS1 / SS2 / SS3) y **division** (Todas / D1 / D2), y
  modal de detalle.
- **`/equipo-detalle?id=<id>`**: plantilla, resultados, proximos partidos y
  posicion de un equipo.
- **`/pubs`**, **`/redes`**, **`/equipo`** (staff), **`/sponsors`** y
  **`/donacion`** como paginas propias.
- Header de una sola fila: Inicio, Diamonds League, Museo, Estadisticas, Pubs,
  Redes sociales, Equipo administracion, Sponsors, Shop y Donar.
- Responsive total, animaciones ligeras (solo `transform`/`opacity`) y
  respeto a `prefers-reduced-motion`.

---

## Estructura

```
.
├── index.html            # Pagina de inicio
├── liga.html
├── estadisticas.html
├── museo.html
├── pubs.html
├── redes.html
├── equipo.html           # Staff de administracion
├── sponsors.html
├── donacion.html
├── equipo-detalle.html   # Detalle de equipo (lee ?id=<id>)
├── static/
│   ├── data.js           # Todos los datos del sitio (window.SITIO)
│   ├── app.js            # Logica de render por pagina
│   ├── styles.css        # Hoja de estilos
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── assets/           # Logos, escudos, imagenes de museo y sponsors
│   └── uploads/          # Imagenes subidas (staff)
└── vercel.json
```

---

## Datos (`static/data.js`)

`data.js` define `window.SITIO` con las claves `modulos`, `contenidos`,
`equipos`, `fechas` e `ideales`. Cada pagina incluye este script antes de
`app.js`, que lee los datos y construye el DOM.

---

## Revision local

Cualquier servidor de archivos estaticos sirve. Por ejemplo:

```bash
npx serve .
# -> http://localhost:3000
```

Para comprobar la sintaxis del JavaScript:

```bash
node --check static/app.js
node --check static/data.js
```

---

## Despliegue en Vercel

`vercel.json` sirve el sitio como estatico con `cleanUrls` (las rutas
`/liga`, `/museo`, etc. resuelven a los `.html` sin extension). No se
requiere build ni variables de entorno.

---

## Licencia

Codigo y disenio (c) 2026 Neptunzinho. Uso y redistribucion prohibidos sin
autorizacion del autor.
