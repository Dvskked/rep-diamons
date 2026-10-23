/* =====================================================================
   THE DIAMONDS LEAGUE - Frontend publico (render por pagina)
   (c) 2026 Neptunzinho. Todos los derechos reservados.
   Uso y redistribucion prohibidos sin autorizacion del autor.
   ===================================================================== */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const DATOS = { modulos: [], contenidos: {}, equipos: [], fechas: [], ideales: [] };

/* Estado de la seccion LIGA (division seleccionada + vista activa + jornadas) */
const LIGA = { division: 'D1', vista: 'posiciones', jornada: '', jornadaRes: '' };

/* Estado de INICIO (ranking lateral) */
const INICIO = { ranking: 'goles' };

/* Estado de ESTADISTICAS (filtro + busqueda + orden) */
const STATS = { division: 'all', buscar: '', orden: 'goles', dir: 'desc' };

/* Estado del MUSEO (filtros por temporada y division) */
const MUSEO = { temporada: 'TODO', division: 'TODO' };

/* Estado de CARTAS (division + equipo + busqueda) */
const CARTAS = { division: 'all', equipo: 'all', buscar: '' };

/* Estado del CALENDARIO (mes visible en la vista de calendario) */
const CAL = { mes: '' };
/* Mes visible del calendario dentro de la ficha de cada equipo. */
const EQ_CAL = { mes: '' };

/* Discord oficial de la liga (comunidad, donacion y tickets). */
const DISCORD_LEAGUE = 'https://discord.gg/kVAjgkeRsC';

/* ------------------------------------------------------------ UTILIDADES */
function ocultarPreloader() {
  const p = document.getElementById('preloader');
  document.body.classList.remove('carga-activa');
  if (!p) return;
  p.classList.add('fuera');
  setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 500);
}
/* Red de seguridad: nunca dejamos la pantalla de carga pegada */
setTimeout(ocultarPreloader, 8000);

const esc = (txt) => String(txt ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const iniciales = (nombre) => esc(String(nombre || '?').trim().charAt(0).toUpperCase());

const fechaLarga = (f) => {
  if (!f) return '';
  const d = new Date(String(f).replace(' ', 'T'));
  if (isNaN(d)) return esc(f);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

const horaCorta = (h) => h ? String(h).slice(0, 5) : '';

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

/* Escudos locales de respaldo (static/assets/d1 y d2) para equipos que
   todavia no tienen imagen subida en la base de datos. */
const ESCUDOS_LOCALES = {
  alajuense: 'assets/d1/Alajuense.png',
  dominion: 'assets/d1/dominion.png',
  klokan: 'assets/d1/Klokan.png',
  lexington: 'assets/d1/Lexington.png',
  littlepony: 'assets/d1/littlepony.png',
  mafia: 'assets/d1/mafia.png',
  melgar: 'assets/d1/melgar.png',
  mysticstorm: 'assets/d1/mysticstorm.png',
  novasquad: 'assets/d1/Novasquad.png',
  orense: 'assets/d1/ORENSE.png',
  parceros: 'assets/d1/parceros.png',
  pereira: 'assets/d1/PEREIRA.png',
  blueknight: 'assets/d2/blueKnight.png',
  deportivopasto: 'assets/d2/deportivopasto.png',
  distritoevolutions: 'assets/d2/distritoevolutions.png',
  fenix: 'assets/d2/fenix.png',
  platanera: 'assets/d2/platanera.png',
  pollolandia: 'assets/d2/pollolandia.png',
  spider: 'assets/d2/spider.png',
  visajosos: 'assets/d2/visajosos.png'
};

const slug = (txt) => String(txt || '').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

/* Devuelve la ruta del escudo del equipo: el subido o uno local de respaldo. */
function escudoDe(eq) {
  if (!eq) return '';
  if (eq.escudo) return eq.escudo;
  return ESCUDOS_LOCALES[slug(eq.nombre)] || '';
}

/* Imagenes locales del museo (static/assets/museo) para piezas que todavia
   no tienen imagen cargada en la base de datos. */
const MUSEO_IMGS = {
  balondeorod1: 'assets/museo/d1-balon-de-oro.webp',
  botadeorod1: 'assets/museo/d1-bota-de-oro.webp',
  guantedeorod1: 'assets/museo/d1-guante-de-oro.webp',
  balondeorod2: 'assets/museo/d2-balon-de-oro.webp',
  botadeorod2: 'assets/museo/d2-bota-de-oro.webp',
  guantedeorod2: 'assets/museo/d2-guante-de-oro.webp',
  rankingbalond1: 'assets/museo/d1-ranking-balon.webp',
  rankingbotad1: 'assets/museo/d1-ranking-bota.webp',
  rankingguanted1: 'assets/museo/d1-ranking-guante.webp',
  rankingbalond2: 'assets/museo/d2-ranking-balon.webp',
  rankingbotad2: 'assets/museo/d2-ranking-bota.webp',
  rankingguanted2: 'assets/museo/d2-ranking-guante.webp',
  mejorclubd1: 'assets/museo/d1-mejor-club.webp',
  mejorclubd2: 'assets/museo/d2-mejor-club.webp'
};

/* Imagen local del museo segun el titulo/categoria (respaldo sin BD). */
function imagenMuseoLocal(m) {
  if (!m) return '';
  const titulo = slug(m.titulo);
  if (MUSEO_IMGS[titulo]) return MUSEO_IMGS[titulo];
  const clave = titulo + slug(m.categoria);
  for (const k in MUSEO_IMGS) { if (clave.indexOf(k) >= 0) return MUSEO_IMGS[k]; }
  return '';
}

/* Imagen del museo: la de la BD o una local de respaldo. */
function imagenMuseo(m) {
  return (m && m.imagen) ? m.imagen : imagenMuseoLocal(m);
}

/* Ruta final (URL) de la imagen del museo lista para usar en <img src>. */
function rutaMuseo(m) {
  let img = imagenMuseo(m) || '';
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('/')) return img;
  if (!img.startsWith('assets/')) img = 'assets/' + img;
  return '/static/' + img;
}

/* Si una imagen del museo no carga, se reemplaza por la local. */
function museoImgError(img) {
  const fb = img && img.dataset ? img.dataset.fb : '';
  if (fb && img.src.indexOf(fb) < 0) {
    img.src = '/static/' + fb;
    img.removeAttribute('data-fb');
  } else {
    const caja = img.parentNode;
    img.remove();
    if (caja) caja.classList.add('museo-img-vacia');
  }
}

function toast(texto) {
  const t = $('#toast');
  if (!t) return;
  $('p', t).textContent = texto;
  t.classList.add('ver');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('ver'), 3600);
}

const cont = (modulo) => DATOS.contenidos[modulo] || [];

const porId = (id) => DATOS.equipos.find((e) => e.id === id) || null;

const nombreJugador = (id) => {
  if (id == null || id === '') return '';
  const buscado = String(id);
  for (const e of DATOS.equipos) {
    const j = (e.jugadores || []).find((x) => String(x.id) === buscado);
    if (j) return j.nombre;
  }
  return '';
};

/* Nombre de jugador clickeable: abre su ficha con los datos de la temporada. */
function jugLink(id, nombre, clase = '') {
  const txt = esc(nombre || '');
  if (id == null || id === '') return `<span class="${clase}">${txt}</span>`;
  return `<button type="button" class="jug-link ${clase}" data-jugador="${esc(String(id))}"
    title="Ver ficha de ${txt}">${txt}</button>`;
}

function vacio(txt) {
  return `<p style="grid-column:1/-1;padding:44px;text-align:center;color:var(--texto-suave)">${esc(txt)}</p>`;
}

/* --------------------------------------------------------------- HEADER */
function pintarNav() {
  const pagina = document.body.dataset.pagina || 'inicio';
  $$('[data-nav]').forEach((a) => a.classList.toggle('activo', a.dataset.nav === pagina));

  const nav = $('#navPrincipal');
  const mm = $('#mobileMenu');
  if (nav && mm) {
    const enlaces = Array.from(nav.querySelectorAll('a'))
      .map((a) => {
        const href = a.getAttribute('href') || '#';
        const clases = [];
        if (a.dataset.nav === 'donacion') clases.push('nav-donar');
        if (a.dataset.nav === 'shop') clases.push('nav-shop');
        if (a.dataset.nav === pagina) clases.push('mm-activo');
        const cls = clases.length ? ` class="${clases.join(' ')}"` : '';
        const ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${esc(href)}"${cls}${ext}>${esc(a.textContent)}</a>`;
      })
      .join('');
    mm.innerHTML = enlaces;
  }
}

function pintarModulos() {
  DATOS.modulos.forEach((m) => {
    const t = $(`[data-titulo="${m.clave}"]`);
    const s = $(`[data-subtitulo="${m.clave}"]`);
    const e = $(`[data-etiqueta="${m.clave}"]`);
    if (t && m.titulo) t.textContent = m.titulo;
    if (s && m.subtitulo) s.textContent = m.subtitulo;
    if (e && m.nombre) e.textContent = m.nombre;
  });
}

/* -------------------------------------------------------------- EQUIPOS */
function equiposDivision(div = LIGA.division) {
  return DATOS.equipos.filter((e) => e.division === div);
}

function fechasDivision(div = LIGA.division) {
  return DATOS.fechas.filter((f) => {
    if (!f.division_a && !f.division_b) return true;
    return f.division_a === div || f.division_b === div;
  });
}

/* ---------------------------------------------------------- CALENDARIO */
const DIAS_SEMANA = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const NOMBRES_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/* Fecha del partido en formato YYYY-MM-DD. */
function fechaISO(f) {
  const s = String(f || '').trim();
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(s.replace(' ', 'T'));
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* Mes del partido en formato YYYY-MM. */
function mesDe(fecha) {
  const iso = fechaISO(fecha);
  return iso ? iso.slice(0, 7) : '';
}

/* Etiqueta larga del mes (ej. "Octubre 2026"). */
function etiquetaMes(ym) {
  const [y, m] = String(ym || '').split('-').map(Number);
  if (!y || !m) return '';
  return `${NOMBRES_MES[m - 1]} ${y}`;
}

/* Suma o resta meses a una clave YYYY-MM. */
function moverMes(ym, delta) {
  const [y, m] = String(ym || '').split('-').map(Number);
  if (!y || !m) return '';
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function pintarCalendario() {
  const caja = $('#ligaCalendario');
  const chipsBox = $('#ligaJornadas');
  if (!caja) return;

  const todas = fechasDivision(LIGA.division)
    .slice()
    .sort((a, b) => fechaHora(a) - fechaHora(b));
  if (!todas.length) {
    if (chipsBox) chipsBox.innerHTML = '';
    const nota = $('#calNota');
    if (nota) nota.textContent = '';
    caja.innerHTML = vacio(`Todavia no hay fechas en la Division ${LIGA.division}.`);
    return;
  }

  /* grouping por jornada */
  const grupos = new Map();
  todas.forEach((f) => {
    const clave = (f.jornada || 'SIN JORNADA').trim();
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(f);
  });

  const jornadas = Array.from(grupos.keys())
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

  const opciones = ['TODAS'].concat(jornadas);
  const actual = opciones.includes(LIGA.jornada) ? LIGA.jornada : 'TODAS';
  LIGA.jornada = actual;

  if (chipsBox) {
    chipsBox.innerHTML = opciones
      .map((j) => `<button class="chip${j === actual ? ' activa' : ''}" type="button" data-jornada="${esc(j)}">${esc(j)}</button>`)
      .join('');
    chipsBox.hidden = opciones.length <= 1;
  }

  const partidos = actual === 'TODAS' ? todas : (grupos.get(actual) || []);
  const jugados = partidos.filter((f) => f.jugado).length;
  const pendientes = partidos.length - jugados;

  const nota = $('#calNota');
  if (nota) {
    nota.textContent = `${partidos.length} partidos · ${actual === 'TODAS' ? 'temporada completa' : actual} · Division ${LIGA.division}`;
  }

  caja.innerHTML = `<section class="calendario cal-solo-lista reveal">
      <header class="cal-cab">
        <div class="cal-titulo-bloque">
          <span class="etiqueta">CALENDARIO</span>
          <strong>${esc(actual === 'TODAS' ? 'Todos los partidos' : actual)}</strong>
          <small>${esc(etiquetaDivision())} · Toca un partido para abrir su informe completo.</small>
        </div>
        <div class="cal-resumen">
          <div class="cal-res"><b>${partidos.length}</b><span>Partidos</span></div>
          <div class="cal-res ok"><b>${jugados}</b><span>Jugados</span></div>
          <div class="cal-res pend"><b>${pendientes}</b><span>Pendientes</span></div>
        </div>
      </header>
      <section class="cal-lista">
        <header class="cal-lista-cab">
          <h3>${esc(actual === 'TODAS' ? 'Partidos de la temporada' : actual)}</h3>
          <span>${partidos.length} partido${partidos.length === 1 ? '' : 's'}</span>
        </header>
        <div class="cal-lista-grid">
          ${partidos.map((f) => filaCalendario(f)).join('')}
        </div>
      </section>
    </section>`;
  revelar();
}

/* Fila compacta de partido para la lista del calendario. */
function filaCalendario(f) {
  const a = porId(f.equipo_a_id) || { nombre: f.equipo_a, sigla: f.sigla_a, color: f.color_a };
  const b = porId(f.equipo_b_id) || { nombre: f.equipo_b, sigla: f.sigla_b, color: f.color_b };
  const cresta = (eq) => eq.escudo
    ? `<span class="clp-crest logo-img"><img src="/static/${esc(eq.escudo)}" alt="" loading="lazy"></span>`
    : `<span class="clp-crest" style="--eq:${esc(eq.color || '#5AA9F0')}">${esc(eq.sigla || iniciales(eq.nombre))}</span>`;
  const res = f.jugado
    ? `<b class="clp-marc">${num(f.goles_a)} <i>-</i> ${num(f.goles_b)}</b>`
    : `<b class="clp-marc pend">${esc(horaCorta(f.hora) || '--:--')}</b>`;
  const metas = [
    f.jornada ? `<span class="clp-chip">${esc(f.jornada)}</span>` : '',
    f.fase ? `<span class="clp-chip soft">${esc(f.fase)}</span>` : '',
    f.division_a ? `<span class="clp-chip div">${esc(f.division_a)}</span>` : '',
    `<span class="clp-fecha">${esc(fechaLarga(f.fecha))}</span>`
  ].filter(Boolean).join('');

  return `
    <button type="button" class="clp${f.jugado ? ' jugado' : ''}" data-fecha="${esc(String(f.id))}">
      <span class="clp-eq a">${cresta(a)}<b>${esc(a.nombre)}</b></span>
      ${res}
      <span class="clp-eq b"><b>${esc(b.nombre)}</b>${cresta(b)}</span>
      <span class="clp-metas">${metas}</span>
      <span class="clp-ver">VER INFORME</span>
    </button>`;
}

/* Nombre de la division activa (para las cabeceras). */
function etiquetaDivision() {
  return `Division ${String(LIGA.division || '').replace(/^D/, '')}`;
}

/* Celdas del mes: una por dia, con los partidos de ese dia. */
function celdasCalendario(partidos, ym, opts = {}) {
  const [y, m] = String(ym || '').split('-').map(Number);
  if (!y || !m) return '';
  const primero = new Date(y, m - 1, 1);
  const total = new Date(y, m, 0).getDate();
  const offset = (primero.getDay() + 6) % 7; /* la semana empieza en lunes */
  const hoy = new Date();
  const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  let html = '';
  for (let i = 0; i < offset; i++) html += '<div class="cal-dia cal-vacia"></div>';

  for (let d = 1; d <= total; d++) {
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const delDia = partidos.filter((f) => fechaISO(f.fecha) === iso);
    const esHoy = iso === hoyISO;
    const items = delDia.map((f) => {
      const a = porId(f.equipo_a_id) || { sigla: f.sigla_a, nombre: f.equipo_a, color: f.color_a };
      const b = porId(f.equipo_b_id) || { sigla: f.sigla_b, nombre: f.equipo_b, color: f.color_b };
      const esMio = opts.equipoId != null && (String(f.equipo_a_id) === String(opts.equipoId) || String(f.equipo_b_id) === String(opts.equipoId));
      const res = f.jugado
        ? `<b class="cp-marcador">${num(f.goles_a)} - ${num(f.goles_b)}</b>`
        : `<b class="cp-marcador pend">${esc(horaCorta(f.hora) || '--:--')}</b>`;
      return `<button type="button" class="cal-part${f.jugado ? ' jugado' : ''}${esMio ? ' es-mio' : ''}" data-fecha="${esc(String(f.id))}"
          title="${esc(f.equipo_a)} vs ${esc(f.equipo_b)}">
          <span class="cp-sig" style="--eq:${esc(a.color || '#5AA9F0')}">${esc(a.sigla || a.nombre)}</span>
          ${res}
          <span class="cp-sig" style="--eq:${esc(b.color || '#5AA9F0')}">${esc(b.sigla || b.nombre)}</span>
        </button>`;
    }).join('');
    html += `<div class="cal-dia${esHoy ? ' hoy' : ''}${delDia.length ? ' con-partidos' : ''}">
        <span class="cal-num">${d}</span>
        <div class="cal-parts">${items}</div>
      </div>`;
  }
  return html;
}

/* Resultados de la liga: por jornada, con marcador y estadisticas. */
function pintarResultadosLiga() {
  const caja = $('#ligaResultados');
  const chipsBox = $('#ligaResJornadas');
  if (!caja) return;

  const fechas = fechasDivision(LIGA.division)
    .filter((f) => f.jugado)
    .sort((a, b) => fechaHora(b) - fechaHora(a));

  const nota = $('#resLigaNota');
  if (!fechas.length) {
    if (chipsBox) { chipsBox.innerHTML = ''; chipsBox.hidden = true; }
    if (nota) nota.textContent = '';
    caja.innerHTML = vacio(`Todavia no hay resultados en la Division ${LIGA.division}.`);
    return;
  }

  const grupos = new Map();
  fechas.forEach((f) => {
    const clave = (f.jornada || 'SIN JORNADA').trim();
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(f);
  });

  const jornadas = Array.from(grupos.keys())
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

  const actual = jornadas.includes(LIGA.jornadaRes) ? LIGA.jornadaRes : jornadas[jornadas.length - 1];
  LIGA.jornadaRes = actual;

  if (chipsBox) {
    chipsBox.innerHTML = jornadas
      .map((j) => `<button class="chip${j === actual ? ' activa' : ''}" type="button" data-jornada-res="${esc(j)}">${esc(j)}</button>`)
      .join('');
    chipsBox.hidden = jornadas.length <= 1;
  }

  const partidos = grupos.get(actual) || [];
  if (nota) nota.textContent = `${partidos.length} partidos jugados · Division ${LIGA.division}`;
  caja.innerHTML = partidos.map((f) => filaPartido(f, { detalle: false })).join('');
  revelar();
}

function escudoMini(eq) {
  if (!eq) return '';
  const color = esc(eq.color || '');
  const src = escudoDe(eq);
  if (src) {
    return `<span class="escudo-mini logo-img" style="--eq:${color}"><img src="/static/${esc(src)}" alt="" loading="lazy"></span>`;
  }
  return `<span class="escudo-mini" style="--eq:${color}">${iniciales(eq.sigla || eq.nombre)}</span>`;
}

function fechaHora(f) {
  const d = new Date(String(f.fecha).replace(' ', 'T') + 'T' + (f.hora || '00:00:00'));
  return isNaN(d) ? 0 : d.getTime();
}

/* Envuelve un contenido en el enlace a la pagina del equipo (si tiene id). */
function equipoLado(eq, clase) {
  const inner = `${escudoMini(eq)}<span class="nm">${esc(eq.nombre)}</span>`;
  return eq && eq.id
    ? `<a class="${clase}" href="/equipo-detalle?id=${eq.id}">${inner}</a>`
    : `<span class="${clase}">${inner}</span>`;
}

/* --------------------------------------------------------- FILA PARTIDO */
function filaPartido(f, opciones = {}) {
  const a = porId(f.equipo_a_id) || { nombre: f.equipo_a, sigla: f.sigla_a, color: f.color_a };
  const b = porId(f.equipo_b_id) || { nombre: f.equipo_b, sigla: f.sigla_b, color: f.color_b };
  const jugado = !!f.jugado;
  const conDetalle = opciones.detalle !== false;

  const marcador = jugado
    ? `<span class="match-score">${num(f.goles_a)} - ${num(f.goles_b)}</span>`
    : `<span class="match-score pend">VS</span>`;

  const meta = [
    `<span>${esc(fechaLarga(f.fecha))}</span>`,
    f.hora ? `<span>${esc(horaCorta(f.hora))}</span>` : '',
    f.jornada ? `<span>${esc(f.jornada)}</span>` : '',
    f.fase ? `<span>${esc(f.fase)}</span>` : '',
    f.division_a ? `<span class="div-chip">${esc(f.division_a)}</span>` : ''
  ].filter(Boolean).join('');

  let detalle = '';
  if (jugado && conDetalle && opciones.compacto !== true) {
    const blocDe = (lado) => {
      const goles = (f.goleadores || [])
        .filter((g) => (g.equipo || 'a') === lado)
        .map((g) => `<span class="stat-line"><i class="ic-gol" title="Goles">⚽</i>${jugLink(g.jugador_id, g.nombre || g.jugador)}<strong>x${num(g.goles) || 1}</strong></span>`);
      const asis = (f.asistencias || [])
        .filter((x) => (x.equipo || 'a') === lado)
        .map((x) => `<span class="stat-line"><i class="ic-asis" title="Asistencias">👟</i>${jugLink(x.jugador_id, x.nombre || x.jugador)}<strong>x${num(x.asistencias) || 1}</strong></span>`);
      const opuesto = lado === 'b' ? 'a' : 'b';
      const auto = (f.autogoles || [])
        .filter((x) => (x.equipo || 'a') === opuesto)
        .map((x) => `<span class="stat-line"><i class="ic-autogol" title="Autogol">🥅</i>${jugLink(x.jugador_id, x.nombre || x.jugador)} <em>(AG)</em></span>`);
      const esB = lado === 'b';
      const conCs = num(esB ? f.cs_b : f.cs_a) > 0;
      const portero = esB ? f.portero_b : f.portero_a;
      const csLine = conCs && portero
        ? `<span class="stat-line"><i class="ic-cs" title="Clean sheet">🧤</i>${jugLink(portero, nombreJugador(portero) || portero)}<strong>${fmtMin(esB ? f.minutos_cs_b : f.minutos_cs_a)} MIN</strong></span>`
        : '';
      return goles.concat(asis, auto, csLine ? [csLine] : []).join('');
    };
    const htmlA = blocDe('a');
    const htmlB = blocDe('b');
    if (htmlA || htmlB) {
      detalle = `<div class="match-detalle">
        <div class="detalle-col a">${htmlA}</div>
        <div class="detalle-col b">${htmlB}</div>
      </div>`;
    }
  }

  const enlace = (!jugado && f.sala)
    ? `<a class="link-btn" href="${esc(f.sala)}" target="_blank" rel="noopener">ABRIR SALA</a>`
    : '';

  const pista = jugado
    ? '<span class="match-pista">Ver informe del partido</span>'
    : '<span class="match-pista">Ver ficha del partido</span>';

  return `
    <article class="match reveal match-click" data-fecha="${esc(String(f.id))}">
      ${equipoLado(a, 'match-team a')}
      ${marcador}
      ${equipoLado(b, 'match-team b')}
      <div class="match-meta">${meta}${enlace}${pista}</div>
      ${detalle}
    </article>`;
}

function pintarFechas(destino, fechas, opciones = {}) {
  const caja = $(destino);
  if (!caja) return;
  caja.innerHTML = fechas.length
    ? fechas.map((f) => filaPartido(f, opciones)).join('')
    : vacio(opciones.vacio || 'Todavia no hay partidos.');
}

/* ------------------------------------------------------------ TARJETAS */
function tarjetaEquipo(eq) {
  const color = eq.color || 'var(--cian)';
  const src = escudoDe(eq);
  const escudo = src
    ? `<img src="/static/${esc(src)}" alt="Escudo de ${esc(eq.nombre)}" loading="lazy">`
    : iniciales(eq.sigla);
  const escudoClase = src ? 'escudo logo-img' : 'escudo';

  const meta = [
    eq.entrenador && `DT. ${esc(eq.entrenador)}`,
    eq.division && `Division ${esc(eq.division)}`,
    eq.ciudad && esc(eq.ciudad),
    eq.fundado && `Fundado en ${esc(eq.fundado)}`
  ].filter(Boolean).map((t) => `<span>${t}</span>`).join('');

  const jugadores = (eq.jugadores || []).map((j) => `
    <div class="jugador-fila">
      <span class="jugador-num">${esc(j.dorsal ?? '-')}</span>
      <span class="jugador-nom">${esc(j.nombre)}</span>
      <span class="jugador-pos">${esc(j.posicion || '')}</span>
      <span class="jugador-stats">
        <i title="Goles">${num(j.goles)}G</i>
        <i title="Asistencias">${num(j.asistencias)}A</i>
        ${num(j.autogoles) ? `<i title="Autogoles">${num(j.autogoles)}AG</i>` : ''}
        ${num(j.cs) ? `<i title="Clean sheets">${num(j.cs)}CS</i>` : ''}
      </span>
    </div>`).join('') || '<p class="partido-detalle">Sin jugadores registrados.</p>';

  return `
    <article class="equipo-card reveal" style="--eq:${esc(color)}">
      <a class="equipo-topo" href="/equipo-detalle?id=${eq.id}">
        <div class="${escudoClase}">${escudo}</div>
        <div class="equipo-nombre">
          <h4>${esc(eq.nombre)}</h4>
          <small>${esc(eq.sigla)}</small>
        </div>
      </a>
      <div class="equipo-meta">${meta}</div>
      ${jugadores}
      <a class="link-btn" href="/equipo-detalle?id=${eq.id}">VER EQUIPO</a>
    </article>`;
}

/* --------------------------------------------------------------- TABLA */
function standings(div) {
  const tabla = new Map();
  equiposDivision(div).forEach((e) => tabla.set(e.id, {
    eq: e, pj: 0, g: 0, emp: 0, p: 0, gf: 0, gc: 0, pts: 0
  }));

  fechasDivision(div).filter((f) => f.jugado).forEach((f) => {
    const a = tabla.get(f.equipo_a_id), b = tabla.get(f.equipo_b_id);
    if (!a || !b) return;
    const ga = num(f.goles_a), gb = num(f.goles_b);
    a.pj++; b.pj++;
    a.gf += ga; a.gc += gb;
    b.gf += gb; b.gc += ga;
    if (ga > gb) { a.g++; a.pts += 3; b.p++; }
    else if (gb > ga) { b.g++; b.pts += 3; a.p++; }
    else { a.emp++; b.emp++; a.pts++; b.pts++; }
  });

  return Array.from(tabla.values()).sort((x, y) =>
    y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf ||
    x.eq.nombre.localeCompare(y.eq.nombre));
}

function pintarTablaPosiciones() {
  const cuerpo = $('#tablaPosiciones tbody');
  if (!cuerpo) return;
  const filas = standings(LIGA.division);
  const medalla = (i) => (i === 0 ? ' oro' : i === 1 ? ' plata' : i === 2 ? ' bronce' : '');

  cuerpo.innerHTML = filas.map((f, i) => `
    <tr>
      <td class="pos${medalla(i)}">${i + 1}</td>
      <td><a class="eq" href="/equipo-detalle?id=${f.eq.id}">${escudoMini(f.eq)}${esc(f.eq.nombre)}</a></td>
      <td>${f.pj}</td><td>${f.g}</td><td>${f.emp}</td><td>${f.p}</td>
      <td>${f.gf}</td><td>${f.gc}</td><td>${f.gf - f.gc}</td>
      <td class="pos">${f.pts}</td>
    </tr>`).join('') || `<tr><td colspan="10">${vacio('Sin resultados aun.')}</td></tr>`;

  const nota = $('#posNota');
  if (nota) nota.textContent = `${filas.length} equipos en Division ${LIGA.division}`;
}

/* ------------------------------------------------------ ESTADISTICAS */
function jugadoresTodos(div = 'all') {
  const lista = [];
  DATOS.equipos.forEach((e) => {
    if (div && div !== 'all' && e.division !== div) return;
    (e.jugadores || []).forEach((j) => lista.push({
      id: j.id, nombre: j.nombre, dorsal: j.dorsal, posicion: j.posicion,
      goles: num(j.goles), asistencias: num(j.asistencias),
      autogoles: num(j.autogoles), cs: num(j.cs), minutos_cs: num(j.minutos_cs),
      equipo: e.nombre, color: e.color, escudo: escudoDe(e), division: e.division
    }));
  });
  return lista;
}

function filaRanking(j, i, campo) {
  const insignia = j.escudo
    ? `<span class="equipo-punto escudo-logo logo-img"><img src="/static/${esc(j.escudo)}" alt="" loading="lazy"></span>`
    : `<i class="equipo-punto" style="background:${esc(j.color || 'var(--cian)')}"></i>`;
  return `
    <div class="rank-fila">
      <span class="rank-pos">${i + 1}</span>
      <span class="rank-nom">${insignia}${jugLink(j.id, j.nombre)}<small>${esc(j.equipo)}</small></span>
      <span class="rank-val">${num(j[campo])}</span>
    </div>`;
}

function listaRanking(destino, campo, div = 'all', limite = 8) {
  const box = $(destino);
  if (!box) return;
  const datos = jugadoresTodos(div)
    .filter((j) => j[campo] > 0)
    .sort((a, b) => b[campo] - a[campo] || a.nombre.localeCompare(b.nombre))
    .slice(0, limite);
  box.innerHTML = datos.length
    ? datos.map((j, i) => filaRanking(j, i, campo)).join('')
    : vacio('Sin datos por ahora.');
}

function pintarLideres() {
  const campo = INICIO.ranking;
  listaRanking('#lideres', campo, 'all', 6);
  $$('#liderTabs .chip').forEach((b) => b.classList.toggle('activa', b.dataset.rank === campo));
}

/* ------------------------------------------------ INICIO: RESULTADOS */
function divisionDePartido(f, lado) {
  const clave = lado === 'b' ? 'division_b' : 'division_a';
  if (f[clave]) return f[clave];
  const eq = porId(lado === 'b' ? f.equipo_b_id : f.equipo_a_id);
  return eq ? eq.division : '';
}

function filtrarPorDivision(f, div) {
  return div === 'all' || !div || divisionDePartido(f, 'a') === div || divisionDePartido(f, 'b') === div;
}

function jugadosOrdenados(div) {
  return DATOS.fechas.filter((f) => f.jugado && filtrarPorDivision(f, div))
    .sort((a, b) => fechaHora(b) - fechaHora(a));
}

function pendientesOrdenados(div) {
  return DATOS.fechas.filter((f) => !f.jugado && filtrarPorDivision(f, div))
    .sort((a, b) => (fechaHora(a) || Infinity) - (fechaHora(b) || Infinity));
}

function pintarResultadosInicio() {
  const caja = $('#resLista');
  if (!caja) return;
  const todos = jugadosOrdenados('all');
  const lista = todos.slice(0, 6);
  caja.innerHTML = lista.length
    ? lista.map((f) => filaPartido(f, { detalle: false })).join('')
    : vacio('Todavia no hay resultados.');

  const nota = $('#resNota');
  if (nota) {
    nota.textContent = lista.length
      ? `Mostrando ${lista.length} de ${todos.length} partidos jugados.`
      : '';
  }
}

function pintarStrip() {
  const strip = $('#strip');
  const track = $('#stripTrack');
  if (!strip || !track) return;
  const ultimos = jugadosOrdenados('all').slice(0, 10);
  if (!ultimos.length) { strip.hidden = true; return; }

  const escudoChip = (eq) => {
    const src = escudoDe(eq);
    if (src) return `<span class="rc-esc"><img src="/static/${esc(src)}" alt="" loading="lazy" decoding="async"></span>`;
    return `<span class="rc-esc" style="--eq:${esc(eq.color || 'var(--cian)')}">${esc(iniciales(eq.sigla || eq.nombre))}</span>`;
  };
  const chip = (f) => {
    const a = porId(f.equipo_a_id) || { sigla: f.sigla_a, nombre: f.equipo_a, color: f.color_a };
    const b = porId(f.equipo_b_id) || { sigla: f.sigla_b, nombre: f.equipo_b, color: f.color_b };
    return `<span class="result-chip">
      ${escudoChip(a)}<span class="rc-sig">${esc(a.sigla || a.nombre)}</span>
      <b class="rc-score">${num(f.goles_a)} - ${num(f.goles_b)}</b>
      <span class="rc-sig">${esc(b.sigla || b.nombre)}</span>${escudoChip(b)}
    </span>`;
  };
  const contenido = ultimos.map(chip).join('');
  track.innerHTML = contenido + contenido; /* duplicado para bucle */
  strip.hidden = false;
}

function pintarHero() {
  const caja = $('#heroUltimo');
  if (!caja) return;
  const ultimo = jugadosOrdenados('all')[0];
  const proximo = pendientesOrdenados('all')[0];
  let html = '';
  if (ultimo) html += `<div class="hero-mini reveal"><h3>Ultimo resultado</h3>${filaPartido(ultimo, { compacto: true, detalle: false })}</div>`;
  if (proximo) html += `<div class="hero-mini reveal"><h3>Proximo partido</h3>${filaPartido(proximo, { compacto: true, detalle: false })}</div>`;
  caja.innerHTML = html;
}

function pintarLigas() {
  const grid = $('#ligasGrid');
  if (!grid) return;
  grid.innerHTML = ['D1', 'D2'].map((div) => {
    const tabla = standings(div);
    const top = tabla.slice(0, 3).map((f) => `
      <a class="mini-team" href="/equipo-detalle?id=${f.eq.id}">
        ${escudoMini(f.eq)}
        <b>${esc(f.eq.nombre)}</b>
        <span class="pts">${f.pts} PTS</span>
      </a>`).join('') || '<p class="partido-detalle">Sin equipos.</p>';
    return `
      <article class="card-liga reveal">
        <div class="card-top">
          <h3>Division ${esc(div.slice(1))}</h3>
          <span class="card-count">${tabla.length} EQUIPOS</span>
        </div>
        <div class="card-mini">${top}</div>
        <a class="link-btn" href="/liga">Ver la liga</a>
      </article>`;
  }).join('');
}

/* ------------------------------------------------------------- PAGINA LIGA */
function mostrarVista(vista) {
  if (!vista || !['posiciones','calendario','resultados','equipos'].includes(vista)) return;
  LIGA.vista = vista;
  $$('#ligaVista .chip').forEach((b) => b.classList.toggle('activa', b.dataset.vista === vista));
  $$('.panel-panel').forEach((p) => p.classList.toggle('activo', p.dataset.panel === vista));
  revelar();
}

function pintarLiga() {
  $$('#ligaDivision .chip').forEach((b) => b.classList.toggle('activa', b.dataset.division === LIGA.division));

  pintarTablaPosiciones();
  pintarCalendario();
  pintarResultadosLiga();

  const grid = $('#equiposGrid');
  if (grid) {
    const lista = equiposDivision(LIGA.division);
    grid.innerHTML = lista.map(tarjetaEquipo).join('') || vacio(`Sin equipos en Division ${LIGA.division}.`);
  }

  revelar();
}

/* ------------------------------------------------------- PAGINA ESTADISTICAS */
const fmtMin = (v) => {
  const n = num(v);
  return Number.isInteger(n) ? String(n) : (Math.round(n * 100) / 100).toString();
};

function insigniaJugador(j) {
  return j.escudo
    ? `<span class="escudo-mini cond-logo logo-img"><img src="/static/${esc(j.escudo)}" alt="" loading="lazy"></span>`
    : `<i class="equipo-punto" style="background:${esc(j.color || 'var(--cian)')}"></i>`;
}

/* Tabla de ranking por division para una estadistica concreta. */
function tablaStats(destino, div, campo, opciones = {}) {
  const box = $(destino);
  if (!box) return 0;
  const buscar = STATS.buscar.trim().toLowerCase();
  const valor = opciones.valor || ((j) => j[campo]);
  const filas = jugadoresTodos(div)
    .map((j) => ({ ...j, _val: num(valor(j)) }))
    .filter((j) => j._val > 0)
    .filter((j) => !buscar || j.nombre.toLowerCase().includes(buscar) || j.equipo.toLowerCase().includes(buscar))
    .sort((a, b) => b._val - a._val || a.nombre.localeCompare(b.nombre))
    .slice(0, opciones.limite || 15);

  if (!filas.length) {
    box.innerHTML = `<p class="stats-vacio">Sin datos por ahora.</p>`;
    return 0;
  }
  const fmt = opciones.formato || ((v) => v);
  box.innerHTML = `<div class="tabla-wrap"><table class="tabla tabla-stats">
    <caption class="visually-hidden">${esc(opciones.titulo || 'Estadistica')}</caption>
    <thead><tr>
      <th scope="col">#</th><th scope="col">JUGADOR</th>
      <th scope="col">EQUIPO</th><th scope="col">${esc(opciones.columna || '')}</th>
    </tr></thead>
    <tbody>${filas.map((j, i) => `
      <tr>
        <td class="pos">${i + 1}</td>
        <td>${jugLink(j.id, j.nombre)}${j.dorsal ? ` <span style="color:var(--texto-tenue)">#${esc(j.dorsal)}</span>` : ''}</td>
        <td><span class="eq">${insigniaJugador(j)}<span>${esc(j.equipo)}</span></span></td>
        <td class="pos">${esc(fmt(j._val))}</td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
  return filas.length;
}

function pintarStats() {
  if (!$('#tablaGolesD1')) return;

  const nGoles = tablaStats('#tablaGolesD1', 'D1', 'goles', { columna: 'GOLES', titulo: 'Goleadores Division 1' })
    + tablaStats('#tablaGolesD2', 'D2', 'goles', { columna: 'GOLES', titulo: 'Goleadores Division 2' });

  const nAsis = tablaStats('#tablaAsisD1', 'D1', 'asistencias', { columna: 'ASIST', titulo: 'Asistidores Division 1' })
    + tablaStats('#tablaAsisD2', 'D2', 'asistencias', { columna: 'ASIST', titulo: 'Asistidores Division 2' });

  const csValor = (j) => (num(j.minutos_cs) > 0 ? num(j.minutos_cs) : num(j.cs));
  const nCs = tablaStats('#tablaCsD1', 'D1', null, { valor: csValor, columna: 'CS (MIN)', formato: fmtMin, titulo: 'Clean sheets Division 1' })
    + tablaStats('#tablaCsD2', 'D2', null, { valor: csValor, columna: 'CS (MIN)', formato: fmtMin, titulo: 'Clean sheets Division 2' });

  const notaG = $('#notaGoles'); if (notaG) notaG.textContent = `${nGoles} jugadores con gol`;
  const notaA = $('#notaAsis'); if (notaA) notaA.textContent = `${nAsis} jugadores con asistencia`;
  const notaC = $('#notaCs'); if (notaC) notaC.textContent = `${nCs} arqueros con clean sheet`;
}

/* ------------------------------------------------------------ PUBS */
function pintarPubs() {
  const caja = $('#salasGrid');
  if (!caja) return;
  caja.innerHTML = cont('pubs').map((s) => {
    const inner = `<span>${esc(s.titulo)}</span>
      <strong>${esc(s.subtitulo || 'Sala publica')}</strong>
      <small>${esc(s.texto || '')}</small>
      <b>ABRIR SALA</b>`;
    return s.enlace
      ? `<a class="sala-card reveal" href="${esc(s.enlace)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="sala-card reveal">${inner}</div>`;
  }).join('') || vacio('No hay salas publicadas.');
}

/* ------------------------------------------------------------ MUSEO */
/* Temporada de una pieza: parsea "Temporada 2" -> "SS2". */
function temporadaMuseo(m) {
  const txt = `${m.dato_extra || ''} ${m.categoria || ''} ${m.subtitulo || ''} ${m.texto || ''}`;
  const match = txt.match(/temporada\s*(\d+)/i) || txt.match(/\bss\s*(\d+)/i);
  return match ? `SS${match[1]}` : '';
}

/* Division de una pieza del museo: busca D1/D2 en sus campos. */
function divisionMuseo(m) {
  const txt = `${m.categoria || ''} ${m.titulo || ''} ${m.subtitulo || ''}`;
  if (/\bD1\b/i.test(txt)) return 'D1';
  if (/\bD2\b/i.test(txt)) return 'D2';
  return '';
}

function pintarMuseo() {
  const caja = $('#museoGrid');
  if (!caja) return;

  const grupoTemp = $('#museoTemporada');
  if (grupoTemp && !grupoTemp.dataset.listo) {
    grupoTemp.dataset.listo = '1';
    grupoTemp.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-temporada]');
      if (!btn) return;
      MUSEO.temporada = btn.dataset.temporada;
      pintarMuseoFiltrado();
    });
  }

  const grupoDiv = $('#museoDivision');
  if (grupoDiv && !grupoDiv.dataset.listo) {
    grupoDiv.dataset.listo = '1';
    grupoDiv.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-division]');
      if (!btn) return;
      MUSEO.division = btn.dataset.division;
      pintarMuseoFiltrado();
    });
  }

  pintarMuseoFiltrado();
}

let MUSEO_ACTUAL = {};

function pintarMuseoFiltrado() {
  const caja = $('#museoGrid');
  if (!caja) return;

  $$('#museoTemporada [data-temporada]').forEach((b) =>
    b.classList.toggle('activa', b.dataset.temporada === MUSEO.temporada));
  $$('#museoDivision [data-division]').forEach((b) =>
    b.classList.toggle('activa', b.dataset.division === MUSEO.division));

  let items = cont('museo');
  if (MUSEO.temporada !== 'TODO') {
    items = items.filter((m) => temporadaMuseo(m) === MUSEO.temporada);
  }
  if (MUSEO.division !== 'TODO') {
    items = items.filter((m) => divisionMuseo(m) === MUSEO.division);
  }
  items = items.slice().sort((a, b) =>
    (num(a.orden) - num(b.orden)) || (a.titulo || '').localeCompare(b.titulo || ''));
  const nota = $('#museoNota');
  if (nota) nota.textContent = items.length
    ? `${items.length} ${items.length === 1 ? 'pieza' : 'piezas'} en exhibicion` : '';
  if (!items.length) {
    caja.innerHTML = `<div class="museo-vacio">
      <strong>Sin piezas para este filtro</strong>
      <span>Todavia no hay premios registrados en esta combinacion de temporada y division.</span>
    </div>`;
    return;
  }

  MUSEO_ACTUAL = {};
  items.forEach((i) => { MUSEO_ACTUAL[String(i.id)] = i; });

  caja.innerHTML = items.map((i) => {
    const src = rutaMuseo(i);
    const respaldo = imagenMuseoLocal(i);
    const imagenHtml = src
      ? `<div class="museo-img"><img src="${esc(src)}" alt="${esc(i.titulo || '')}"`
        + ` loading="lazy" decoding="async"`
        + (respaldo ? ` data-fb="${esc(respaldo)}" onerror="museoImgError(this)"` : '')
        + `></div>`
      : '';
    const tag = i.dato_extra ? `<span class="museo-tag">${esc(i.dato_extra)}</span>` : '';
    const sub = i.subtitulo ? `<p class="museo-sub">${esc(i.subtitulo)}</p>` : '';
    const txt = i.texto ? `<p class="museo-txt">${esc(i.texto)}</p>` : '';
    return `<button type="button" class="museo-card reveal ${src ? 'con-imagen' : ''}" data-museo="${esc(i.id)}" aria-label="Ver detalle de ${esc(i.titulo || 'pieza')}">
      ${imagenHtml}
      <div class="museo-cuerpo">${tag}<h4>${esc(i.titulo || '')}</h4>${sub}${txt}</div>
      <span class="museo-ver">Ver detalle</span>
    </button>`;
  }).join('');
  revelar();
}

function abrirMuseo(id) {
  const item = MUSEO_ACTUAL[String(id)];
  const modal = $('#museoModal');
  if (!item || !modal) return;
  const img = $('#museoModalImg');
  const src = rutaMuseo(item);
  if (img) {
    if (src) { img.src = src; img.removeAttribute('data-fb'); img.hidden = false; }
    else { img.removeAttribute('src'); img.hidden = true; }
  }
  const tag = $('#museoModalTag');
  if (tag) { tag.textContent = item.dato_extra || item.categoria || ''; tag.hidden = !(item.dato_extra || item.categoria); }
  const titulo = $('#museoModalTitulo');
  if (titulo) titulo.textContent = item.titulo || '';
  const sub = $('#museoModalSub');
  if (sub) { sub.textContent = item.subtitulo || ''; sub.hidden = !item.subtitulo; }
  const txt = $('#museoModalTexto');
  if (txt) {
    txt.textContent = item.texto || 'Pieza de la historia de The Diamonds League.';
  }
  modal.hidden = false;
  document.body.classList.add('modal-abierto');
  const cerrar = modal.querySelector('.museo-modal-x');
  if (cerrar) cerrar.focus();
}

function cerrarMuseo() {
  const modal = $('#museoModal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('modal-abierto');
}

function configMuseoModal() {
  const modal = $('#museoModal');
  const grid = $('#museoGrid');
  if (!modal) return;
  if (grid) {
    grid.addEventListener('click', (ev) => {
      const card = ev.target.closest('[data-museo]');
      if (card) abrirMuseo(card.dataset.museo);
    });
  }
  modal.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-cerrar-museo]')) cerrarMuseo();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') cerrarMuseo();
  });
}

function pintarNoticias() {
  const caja = $('#noticiasGrid');
  if (!caja) return;
  caja.innerHTML = cont('noticias').map((n) => `
    <article class="noticia reveal">
      <span>${esc(n.subtitulo || 'NOTICIA')}</span>
      <h4>${esc(n.titulo)}</h4>
      <p>${esc(n.texto || '')}</p>
      ${n.fecha ? `<time>${fechaLarga(n.fecha)}</time>` : ''}
    </article>`).join('') || vacio('No hay noticias publicadas.');
}

/* --------------------------------------------------------- ANUNCIOS */
function pintarAnuncios() {
  const caja = $('#anunciosGrid');
  if (!caja) return;
  caja.innerHTML = cont('anuncios').map((a, i) => `
    <article class="anuncio reveal ${i % 2 ? 'aceptado' : ''}">
      <div class="anuncio-cab">
        <span>COMUNICADO ${String(i + 1).padStart(2, '0')}</span>
        ${a.dato_extra ? `<b class="anuncio-dato">${esc(a.dato_extra)}</b>` : ''}
      </div>
      <h4>${esc(a.titulo)}</h4>
      <p>${esc(a.texto || '')}</p>
      ${a.fecha ? `<time style="font-size:.74rem;color:var(--texto-tenue)">${fechaLarga(a.fecha)}</time>` : ''}
    </article>`).join('') || vacio('No hay anuncios publicados.');
}

/* ----------------------------------------------------------- EQUIPO */
const ROLES_INFO = {
  'OWNER': { grupo: 'fundadores', etiqueta: 'FUNDADORES' },
  'FUNDADOR': { grupo: 'fundadores', etiqueta: 'FUNDADORES' },
  'FUNDADORA': { grupo: 'fundadores', etiqueta: 'FUNDADORES' },
  'STAFF': { grupo: 'staff', etiqueta: 'STAFF' },
  'COACH': { grupo: 'staff', etiqueta: 'STAFF' },
  'MOD': { grupo: 'staff', etiqueta: 'STAFF' },
  'ADMIN': { grupo: 'staff', etiqueta: 'STAFF' },
  'ARBITRO': { grupo: 'arbitros', etiqueta: 'ÁRBITROS' },
  'ÁRBITRO': { grupo: 'arbitros', etiqueta: 'ÁRBITROS' },
  'ARBITROS': { grupo: 'arbitros', etiqueta: 'ÁRBITROS' },
  'DISENADOR': { grupo: 'disenadores', etiqueta: 'DISEÑADORES' },
  'DISEÑADOR': { grupo: 'disenadores', etiqueta: 'DISEÑADORES' },
  'DISEÑADORES': { grupo: 'disenadores', etiqueta: 'DISEÑADORES' }
};
const ROLES_OCULTOS = new Set(['MASTER', 'DESARROLLADOR', 'PROGRAMADOR', 'PROGRAMADORES']);
const GRUPOS_EQUIPO = [
  { clave: 'fundadores', titulo: 'Fundadores', color: '#ff6bf0' },
  { clave: 'staff', titulo: 'Staff', color: '#207be4' },
  { clave: 'arbitros', titulo: 'Árbitros', color: '#ebf05a' },
  { clave: 'disenadores', titulo: 'Diseñadores', color: '#1cddff' },
  { clave: 'programador', titulo: 'Desarrolladores', color: '#771cff' }
];
function infoRol(rol) {
  return ROLES_INFO[String(rol || 'STAFF').toUpperCase()] || { grupo: 'staff', etiqueta: 'STAFF' };
}
function pintarEquipo() {
  const caja = $('#equipoGrid');
  if (!caja) return;
  const items = cont('equipo').filter((p) => !ROLES_OCULTOS.has(String(p.dato_extra || '').toUpperCase()));
  if (!items.length) { caja.innerHTML = vacio('Equipo no publicado.'); return; }
  const porGrupo = { fundadores: [], staff: [], arbitros: [], disenadores: [], programador: [] };
  items.forEach((p) => {
    const g = infoRol(p.dato_extra).grupo;
    if (porGrupo[g]) porGrupo[g].push(p);
    else porGrupo.staff.push(p);
  });
  const esNeptun = (p) => /neptun/i.test(`${p.titulo || ''} ${p.subtitulo || ''}`);
  porGrupo.staff.sort((a, b) => (esNeptun(b) ? 1 : 0) - (esNeptun(a) ? 1 : 0));
  caja.innerHTML = GRUPOS_EQUIPO.filter((g) => porGrupo[g.clave].length).map((g) => {
    const tarjetas = porGrupo[g.clave].map(renderStaffHTML).join('');
    return `<section class="equipo-grupo ${g.clave}" style="--rol:${g.color}">
      <h3 class="equipo-seccion-titulo">${esc(g.titulo)}</h3>
      <div class="equipo-staff-grid">${tarjetas}</div>
    </section>`;
  }).join('');
  revelar();
}
function renderStaffHTML(p) {
  const info = infoRol(p.dato_extra);
  const foto = p.imagen
    ? `<img src="/static/${esc(p.imagen)}" alt="Foto de ${esc(p.titulo)}" loading="lazy" decoding="async">`
    : iniciales(p.titulo);
  const sub = p.subtitulo ? esc(p.subtitulo).replace(/^[A-Z]{3}\s*\|\s*/i, '') : '';
  const user = sub ? `<p class="staff-user">Discord · ${sub}</p>` : '';
  const texto = p.texto ? `<p class="staff-texto">${esc(p.texto)}</p>` : '';
  const titulo = p.titulo ? esc(p.titulo).replace(/^[A-Z]{3}\s*\|\s*/i, '') : '';
  const esNeptun = /neptun/i.test(`${p.titulo || ''} ${p.subtitulo || ''}`);
  const aura = esNeptun ? '<span class="staff-aura" aria-hidden="true"></span>' : '';
  return `<article class="staff-card ${info.grupo}${esNeptun ? ' neptun' : ''} reveal">
    ${aura}
    <div class="staff-avatar">${foto}</div>
    <div class="staff-info">
      <span class="staff-rol">${esc(info.etiqueta)}</span>
      <h4>${titulo}</h4>
      ${user}${texto}
    </div>
  </article>`;
}

function pintarRedes() {
  const caja = $('#redesGrid');
  if (!caja) return;
  caja.innerHTML = cont('redes').map((r) => {
    const logo = r.imagen
      ? `<span class="red-logo"><img src="/static/${esc(r.imagen)}" alt="${esc(r.titulo)}" loading="lazy" decoding="async"></span>`
      : `<span class="red-logo sin-logo">${iniciales(r.titulo)}</span>`;
    const usuario = r.subtitulo ? `<span class="user">${esc(r.subtitulo)}</span>` : '';
    const inner = `
      ${logo}
      <strong>${esc(r.titulo)}</strong>
      ${usuario}
      <p>${esc(r.texto || '')}</p>
      <b>${r.enlace ? 'VER PERFIL' : 'PROXIMAMENTE'}</b>`;
    return r.enlace
      ? `<a class="red-card reveal" href="${esc(r.enlace)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="red-card reveal vacio">${inner}</div>`;
  }).join('') || vacio('No hay redes registradas.');
}

/* -------------------------------------------------------- DONACION */
let DONACION_ACTUAL = {};
let DONACION_SEL = null;

/* Determina como funciona un metodo: enlace, datos, ticket o proximamente. */
function infoDonacion(d) {
  if (/^https?:/i.test(d.enlace || '')) return { modo: 'link', valor: d.enlace };
  if (d.ticket) return { modo: 'ticket', valor: DISCORD_LEAGUE };
  const copiar = String(d.copiar || '').trim();
  if (copiar) return { modo: 'datos', valor: copiar, datos: Array.isArray(d.datos) ? d.datos : [] };
  return { modo: 'proximamente', valor: '' };
}

/* Dibuja la lista de datos (etiqueta/valor) de un metodo. */
function bloqueDatos(datos) {
  return '<div class="donacion-detalle-lista">' + datos.map((x, idx) => (
    '<div class="donacion-det-item">'
    + `<span class="donacion-det-label">${esc(x.etiqueta || '')}</span>`
    + `<div class="donacion-det-line"><span class="donacion-det-valor">${esc(x.valor || '')}</span>`
    + `<button class="donacion-copiar-chico" type="button" data-copiar-valor="${esc(x.valor || '')}" aria-label="Copiar ${esc(x.etiqueta || '')}">COPIAR</button></div>`
    + '</div>'
  )).join('') + '</div>';
}

function copiarTexto(txt) {
  const t = String(txt || '');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).catch(() => {});
  } else {
    const ta = document.createElement('textarea');
    ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }
}

function pintarDonacion() {
  const caja = $('#donacionGrid');
  if (!caja) return;
  crearModalDonacion();
  const items = cont('donacion');
  DONACION_ACTUAL = {};
  caja.innerHTML = items.map((d) => {
    DONACION_ACTUAL[String(d.id)] = d;
    const info = infoDonacion(d);
    const logo = d.imagen
      ? `<img src="/static/${esc(d.imagen)}" alt="${esc(d.subtitulo || d.titulo)}" loading="lazy" decoding="async">`
      : `<span class="donacion-emoji" aria-hidden="true">&#128176;</span>`;
    const estado = info.modo === 'proximamente'
      ? '<span class="donacion-estado off">Proximamente</span>'
      : '<span class="donacion-estado on">Disponible</span>';
    return `<button type="button" class="donacion-card reveal" data-donacion="${esc(d.id)}" aria-label="Donar con ${esc(d.titulo)}">
      ${estado}
      <div class="donacion-icon">${logo}</div>
      <small>${esc(d.subtitulo || 'METODO')}</small>
      <strong>${esc(d.titulo)}</strong>
      <p>${esc(d.texto || '')}</p>
      <span class="donacion-abrir">Ver detalle &#8594;</span>
    </button>`;
  }).join('') || vacio('No hay metodos de donacion.');

  configDonacion();
}

/* Crea el modal de donacion si la pagina no lo trae en el HTML. */
function crearModalDonacion() {
  let modal = document.getElementById('donacionModal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'donacionModal';
  modal.className = 'donacion-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="donacion-modal-fondo" data-cerrar-donacion></div>
    <div class="donacion-modal-card" role="document">
      <button type="button" class="donacion-modal-x" data-cerrar-donacion aria-label="Cerrar">&times;</button>
      <div class="donacion-modal-top">
        <div class="donacion-modal-logo" id="donacionModalLogo"></div>
        <div class="donacion-modal-head">
          <span class="donacion-tag" id="donacionModalTag">METODO</span>
          <h3 id="donacionModalTitulo">Donar</h3>
          <p class="donacion-modal-txt" id="donacionModalTexto"></p>
        </div>
      </div>
      <div class="donacion-modal-detalle" id="donacionModalDetalle"></div>
      <a class="donacion-modal-btn" id="donacionModalBtn" href="${DISCORD_LEAGUE}" target="_blank" rel="noopener">
        <span id="donacionModalBtnTxt">DONAR AHORA</span>
      </a>
      <div class="donacion-modal-discord" id="donacionModalDiscord" hidden>
        <span class="donacion-discord-ic">&#128172;</span>
        <div>
          <strong>Confirma tu aporte en el Discord</strong>
          <p>Crea un ticket en el Discord oficial de la liga y envianos la captura para validar tu donacion.</p>
          <a class="donacion-discord-btn" href="${DISCORD_LEAGUE}" target="_blank" rel="noopener">ABRIR DISCORD DE LA LIGA</a>
        </div>
      </div>
      <div class="donacion-acordeon" id="donacionModalAcordeon">
        <button type="button" class="donacion-acordeon-cab" aria-expanded="false">
          <span>Como se confirma la donacion</span><i>+</i>
        </button>
        <div class="donacion-acordeon-cuerpo">
          <p>Todos los aportes se confirman con el staff de la liga en el Discord oficial. Copia los datos,
             hace la donacion y manda la captura en el ticket para que la registremos.</p>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
}

function abrirDonacion(id) {
  const d = DONACION_ACTUAL[String(id)];
  const modal = crearModalDonacion();
  if (!d || !modal) return;
  DONACION_SEL = infoDonacion(d);

  const logo = $('#donacionModalLogo');
  if (logo) logo.innerHTML = d.imagen
    ? `<img src="/static/${esc(d.imagen)}" alt="${esc(d.subtitulo || d.titulo)}">` : '';
  const tag = $('#donacionModalTag');
  if (tag) tag.textContent = d.subtitulo || 'METODO';
  const tit = $('#donacionModalTitulo');
  if (tit) tit.textContent = d.titulo;
  const txt = $('#donacionModalTexto');
  if (txt) txt.textContent = d.texto || '';

  const detalle = $('#donacionModalDetalle');
  const btn = $('#donacionModalBtn');
  const btnTxt = $('#donacionModalBtnTxt');
  const disc = $('#donacionModalDiscord');
  if (disc) disc.hidden = true;

  if (DONACION_SEL.modo === 'link') {
    if (detalle) detalle.innerHTML = '<span class="donacion-det-label">Enlace de donacion</span>'
      + `<span class="donacion-det-valor">${esc(DONACION_SEL.valor)}</span>`;
    if (btn) { btn.href = DONACION_SEL.valor; btn.classList.remove('is-off'); }
    if (btnTxt) btnTxt.textContent = 'DONAR AHORA';
  } else   if (DONACION_SEL.modo === 'datos') {
    const datos = DONACION_SEL.datos.length
      ? DONACION_SEL.datos
      : [{ etiqueta: 'Dato para donar', valor: DONACION_SEL.valor }];
    if (detalle) detalle.innerHTML = bloqueDatos(datos)
      + `<button class="donacion-copiar" type="button" data-copiar="${esc(DONACION_SEL.valor)}">COPIAR TODO</button>`;
    if (btn) { btn.href = DISCORD_LEAGUE; btn.classList.remove('is-off'); }
    if (btnTxt) btnTxt.textContent = 'DONAR (COPIAR TODO)';
  } else if (DONACION_SEL.modo === 'ticket') {
    if (detalle) detalle.innerHTML = '<span class="donacion-det-label">Como donar</span>'
      + '<span class="donacion-det-valor">Abre un ticket en nuestro Discord y envia la captura de tu donacion.</span>';
    if (btn) { btn.href = DONACION_SEL.valor; btn.classList.remove('is-off'); }
    if (btnTxt) btnTxt.textContent = 'ABRIR DISCORD Y CREAR TICKET';
  } else {
    if (detalle) detalle.innerHTML = '<span class="donacion-det-label">Informacion</span>'
      + '<span class="donacion-det-valor">Este metodo estara disponible muy pronto.</span>';
    if (btn) { btn.href = '#'; btn.classList.add('is-off'); }
    if (btnTxt) btnTxt.textContent = 'PROXIMAMENTE';
  }

  const aco = $('#donacionModalAcordeon');
  if (aco) {
    aco.classList.remove('abierto');
    const cab = aco.querySelector('.donacion-acordeon-cab');
    if (cab) cab.setAttribute('aria-expanded', 'false');
  }

  modal.hidden = false;
  document.body.classList.add('modal-abierto');
  const x = modal.querySelector('.donacion-modal-x');
  if (x) x.focus();
}

function revelarDiscordDonacion() {
  const disc = $('#donacionModalDiscord');
  if (!disc) return;
  disc.hidden = false;
  disc.classList.add('ver');
}

function cerrarDonacion() {
  const modal = $('#donacionModal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('modal-abierto');
}

function configDonacion() {
  const grid = $('#donacionGrid');
  if (grid && !grid.dataset.config) {
    grid.dataset.config = '1';
    grid.addEventListener('click', (ev) => {
      const card = ev.target.closest('[data-donacion]');
      if (card) abrirDonacion(card.dataset.donacion);
    });
  }

  const modal = $('#donacionModal');
  if (modal && !modal.dataset.config) {
    modal.dataset.config = '1';

    modal.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-cerrar-donacion]')) { cerrarDonacion(); return; }
       const copiar = ev.target.closest('[data-copiar]');
       if (copiar) {
         copiarTexto(copiar.dataset.copiar);
         const old = copiar.textContent;
         copiar.textContent = 'COPIADO';
         setTimeout(() => { copiar.textContent = old || 'COPIAR'; }, 1700);
         return;
       }
       const copiarVal = ev.target.closest('[data-copiar-valor]');
       if (copiarVal) {
         copiarTexto(copiarVal.dataset.copiarValor);
         const old = copiarVal.textContent;
         copiarVal.textContent = 'COPIADO';
         setTimeout(() => { copiarVal.textContent = old || 'COPIAR'; }, 1500);
         return;
       }
      const cab = ev.target.closest('.donacion-acordeon-cab');
      if (cab) {
        const aco = cab.closest('.donacion-acordeon');
        const abierto = aco.classList.toggle('abierto');
        cab.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      }
    });

    const btn = $('#donacionModalBtn');
    if (btn) {
      btn.addEventListener('click', (ev) => {
        if (!DONACION_SEL) return;
        if (DONACION_SEL.modo === 'link') {
          revelarDiscordDonacion();
        } else if (DONACION_SEL.modo === 'datos') {
          copiarTexto(DONACION_SEL.valor);
          toast('Datos copiados. Te llevamos al Discord para confirmar.');
          revelarDiscordDonacion();
        } else if (DONACION_SEL.modo === 'ticket') {
          /* el enlace abre Discord directamente */
        } else {
          ev.preventDefault();
        }
      });
    }

    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') cerrarDonacion(); });
  }
}

/* ------------------------------------------------ EQUIPO (DETALLE) */
/* Calendario mensual con solo los partidos del equipo que se esta viendo. */
function pintarCalendarioEquipo(eq) {
  const caja = $('#eqCalendario');
  if (!caja) return;
  const nota = $('#eqCalNota');
  const partidos = DATOS.fechas
    .filter((f) => String(f.equipo_a_id) === String(eq.id) || String(f.equipo_b_id) === String(eq.id))
    .sort((a, b) => fechaHora(a) - fechaHora(b));

  if (!partidos.length) {
    caja.innerHTML = vacio('Este equipo todavia no tiene partidos en el calendario.');
    if (nota) nota.textContent = '';
    return;
  }

  const meses = Array.from(new Set(partidos.map((f) => mesDe(f.fecha)).filter(Boolean))).sort();
  if (!meses.includes(EQ_CAL.mes)) {
    const hoy = new Date();
    const mesHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    EQ_CAL.mes = meses.includes(mesHoy) ? mesHoy : meses[0];
  }

  const delMes = partidos.filter((f) => mesDe(f.fecha) === EQ_CAL.mes);
  const jugados = partidos.filter((f) => f.jugado).length;
  const pendientes = partidos.length - jugados;
  const ganados = partidos.filter((f) => {
    if (!f.jugado) return false;
    const esA = String(f.equipo_a_id) === String(eq.id);
    return esA ? num(f.goles_a) > num(f.goles_b) : num(f.goles_b) > num(f.goles_a);
  }).length;

  if (nota) {
    nota.textContent = `${partidos.length} partido${partidos.length === 1 ? '' : 's'} · ${jugados} jugados`;
  }

  caja.innerHTML = `<section class="calendario cal-equipo reveal">
      <header class="cal-cab">
        <div class="cal-nav">
          <button type="button" class="cal-nav-btn" data-eq-cal-move="-1" aria-label="Mes anterior">&lsaquo;</button>
          <div class="cal-nav-txt">
            <strong>${esc(etiquetaMes(EQ_CAL.mes))}</strong>
            <small>${esc(eq.nombre)} · ${esc(etiquetaMes(EQ_CAL.mes))}</small>
          </div>
          <button type="button" class="cal-nav-btn" data-eq-cal-move="1" aria-label="Mes siguiente">&rsaquo;</button>
        </div>
        <div class="cal-resumen">
          <div class="cal-res"><b>${partidos.length}</b><span>Partidos</span></div>
          <div class="cal-res ok"><b>${jugados}</b><span>Jugados</span></div>
          <div class="cal-res pend"><b>${delMes.length}</b><span>Este mes</span></div>
          <div class="cal-res"><b>${ganados}</b><span>Ganados</span></div>
        </div>
      </header>
      <div class="cal-grid">
        ${DIAS_SEMANA.map((d) => `<div class="cal-dow">${d}</div>`).join('')}
        ${celdasCalendario(partidos, EQ_CAL.mes, { equipoId: eq.id })}
      </div>
      <p class="cal-pie">Partidos de ${esc(eq.nombre)} · Toca un partido para abrir su informe.</p>
    </section>`;
  revelar();
}

function pintarEquipoDetalle() {
  const id = num(new URLSearchParams(location.search).get('id') || document.body.dataset.equipo);
  const eq = porId(id);
  if (!eq) {
    const nombre = $('#eqNombre');
    if (nombre) nombre.textContent = 'Equipo no encontrado';
    return;
  }
  const div = eq.division || 'D1';

  const cajaEscudo = $('#eqEscudo');
  if (cajaEscudo) {
    const src = escudoDe(eq);
    cajaEscudo.style.setProperty('--eq', eq.color || 'var(--cian)');
    cajaEscudo.innerHTML = src
      ? `<img src="/static/${esc(src)}" alt="Escudo de ${esc(eq.nombre)}">`
      : `<span>${iniciales(eq.sigla || eq.nombre)}</span>`;
  }

  const nombre = $('#eqNombre');
  if (nombre) nombre.textContent = eq.nombre;
  const etq = $('#eqDivision');
  if (etq) etq.textContent = `Division ${div}`;
  const meta = $('#eqMeta');
  if (meta) {
    meta.textContent = [
      eq.sigla && `Sigla ${eq.sigla}`,
      eq.entrenador && `DT. ${eq.entrenador}`,
      eq.ciudad,
      eq.fundado && `Fundado en ${eq.fundado}`
    ].filter(Boolean).join(' · ');
  }

  const tabla = standings(div);
  const idx = tabla.findIndex((f) => f.eq.id === id);
  const fila = idx >= 0 ? tabla[idx] : null;
  const stats = $('#eqStats');
  if (stats) {
    const goles = (eq.jugadores || []).reduce((s, j) => s + num(j.goles), 0);
    const asis = (eq.jugadores || []).reduce((s, j) => s + num(j.asistencias), 0);
    stats.innerHTML = [
      ['POSICION', fila ? `${idx + 1} / ${tabla.length}` : '--'],
      ['PUNTOS', fila ? fila.pts : 0],
      ['PARTIDOS', fila ? fila.pj : 0],
      ['GOLES A FAVOR', fila ? fila.gf : 0],
      ['GOLES EN CONTRA', fila ? fila.gc : 0],
      ['DIFERENCIA', fila ? fila.gf - fila.gc : 0],
      ['GOLES PLANTILLA', goles],
      ['ASISTENCIAS', asis]
    ].map(([t, v]) => `<div class="eq-stat"><small>${esc(t)}</small><strong>${esc(v)}</strong></div>`).join('');
  }

  pintarCalendarioEquipo(eq);

  const calEq = $('#eqCalendario');
  if (calEq && !calEq.dataset.config) {
    calEq.dataset.config = '1';
    calEq.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-eq-cal-move]');
      if (!btn) return;
      EQ_CAL.mes = moverMes(EQ_CAL.mes, Number(btn.dataset.eqCalMove) || 0);
      pintarCalendarioEquipo(eq);
    });
  }

  const involucra = (f) => f.equipo_a_id === id || f.equipo_b_id === id;
  const jugados = DATOS.fechas.filter((f) => f.jugado && involucra(f))
    .sort((a, b) => fechaHora(b) - fechaHora(a));
  const proximos = DATOS.fechas.filter((f) => !f.jugado && involucra(f))
    .sort((a, b) => fechaHora(a) - fechaHora(b));

  pintarFechas('#eqResultados', jugados, { detalle: false, vacio: 'Este equipo todavia no tiene resultados.' });
  pintarFechas('#eqProximos', proximos, { compacto: true, detalle: false, vacio: 'No hay partidos programados.' });

  const plantilla = $('#eqPlantilla');
  if (plantilla) {
    const jugadores = (eq.jugadores || []).slice().sort((a, b) =>
      (a.dorsal ?? 999) - (b.dorsal ?? 999) || a.nombre.localeCompare(b.nombre));
    plantilla.innerHTML = jugadores.length
      ? jugadores.map((j) => `
        <div class="jugador-fila">
          <span class="jugador-num">${esc(j.dorsal ?? '-')}</span>
          <span class="jugador-nom">${jugLink(j.id, j.nombre)}</span>
          <span class="jugador-pos">${esc(j.posicion || '')}</span>
          <span class="jugador-stats">
            <i title="Goles">${num(j.goles)}G</i>
            <i title="Asistencias">${num(j.asistencias)}A</i>
            ${num(j.cs) ? `<i title="Clean sheets">${num(j.cs)}CS</i>` : ''}
          </span>
        </div>`).join('')
      : vacio('Sin jugadores registrados.');
  }
  const nota = $('#eqPlantillaNota');
  if (nota) nota.textContent = `${(eq.jugadores || []).length} jugadores`;
}

/* ---------------------------------------------------------------- CARTAS */
/* Cartas estilo FIFA (Haxball) calculadas a partir de las estadisticas
   reales de cada jugador y de la fuerza de su equipo. */
let _fuerzaCache = null;
let _porterosCache = null;

/* Resumen de rendimiento por equipo (partidos, goles a favor/en contra, victorias). */
function fuerzaEquipos() {
  if (_fuerzaCache) return _fuerzaCache;
  const m = new Map();
  DATOS.equipos.forEach((e) => m.set(e.id, { pj: 0, gf: 0, gc: 0, w: 0, l: 0, d: 0 }));
  DATOS.fechas.filter((f) => f.jugado).forEach((f) => {
    const a = m.get(f.equipo_a_id), b = m.get(f.equipo_b_id);
    if (!a || !b) return;
    const ga = num(f.goles_a), gb = num(f.goles_b);
    a.pj++; b.pj++; a.gf += ga; a.gc += gb; b.gf += gb; b.gc += ga;
    if (ga > gb) { a.w++; b.l++; } else if (gb > ga) { b.w++; a.l++; } else { a.d++; b.d++; }
  });
  _fuerzaCache = m;
  return m;
}

/* Ids de jugadores que alguna vez atajaron (para detectar arqueros). */
function porteroIds() {
  if (_porterosCache) return _porterosCache;
  const s = new Set();
  DATOS.fechas.forEach((f) => {
    if (f.portero_a) s.add(String(f.portero_a));
    if (f.portero_b) s.add(String(f.portero_b));
  });
  _porterosCache = s;
  return s;
}

/* Variacion determinista (0..1) a partir del nombre: da vida a PAC/DRI/PHY
   sin dejar de ser estable entre cargas. */
function variacion(str, semilla) {
  let h = 2166136261 ^ (semilla || 0);
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 1000) / 1000;
}

/* Posicion de carta derivada de su rol y sus numeros. */
function posicionCarta(j) {
  if (porteroIds().has(String(j.id))) return 'GK';
  if (num(j.goles) > num(j.asistencias) && num(j.goles) > 0) return 'DEL';
  if (num(j.asistencias) > 0) return 'MED';
  return 'DEF';
}

/* Iniciales tipo Haxball (hasta 2 letras) para el avatar de la bola. */
function inicialesJugador(nombre) {
  const partes = String(nombre || '').split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  const una = partes[0] || '?';
  return una.slice(0, 2).toUpperCase();
}

/* Color de texto legible sobre un color de equipo (claro u oscuro). */
function textoLegible(color) {
  const h = String(color || '').replace('#', '');
  if (h.length !== 6) return '#ffffff';
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#0a1024' : '#ffffff';
}

const _corta = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));

/* Calcula las 6 stats estilo FIFA + el rating global (OVR). */
function cartaDe(j) {
  const f = fuerzaEquipos().get(j.equipoId) || { pj: 0, gf: 0, gc: 0, w: 0 };
  const g = num(j.goles), a = num(j.asistencias), ag = num(j.autogoles), cs = num(j.cs);
  const wr = f.pj ? f.w / f.pj : 0;
  const dif = f.pj ? (f.gf - f.gc) / f.pj : 0;

  const sho = _corta(58 + (g / 6) * 41 - ag * 8, 45, 99);
  const pas = _corta(58 + (a / 4) * 41, 45, 99);
  const dri = _corta(58 + ((g + a) / 8) * 31 + variacion(j.nombre, 3) * 8 - 4, 45, 99);
  const def = _corta(58 + wr * 8 + dif * 3 - ag * 8 + cs * 12, 45, 99);
  const pac = _corta(58 + wr * 10 + variacion(j.nombre, 1) * 14 - 7, 45, 99);
  const phy = _corta(58 + Math.min(f.pj, 20) * 0.7 + variacion(j.nombre, 2) * 10 - 5 - ag * 5, 45, 99);
  const ovr = _corta(sho * 0.26 + pas * 0.2 + dri * 0.19 + def * 0.13 + pac * 0.12 + phy * 0.1 + (g + a) * 1.3, 45, 95);

  return { ovr, sho, pas, dri, def, pac, phy, pos: posicionCarta(j), ini: inicialesJugador(j.nombre) };
}

/* ------------------------------------------------------------- RANGOS */
/* Los 4 rangos oficiales de The Diamonds League. El umbral de DIAMANTE es
   fijo (GRL 95+) y el resto se calcula con las estadisticas reales. */
const GRL_ETIQUETA = 'GRL';
const RANGOS = [
  { id: 'diamante', nombre: 'DIAMANTE', corto: 'DIA' },
  { id: 'oro', nombre: 'ORO', corto: 'ORO' },
  { id: 'plata', nombre: 'PLATA', corto: 'PLA' },
  { id: 'bronce', nombre: 'BRONCE', corto: 'BRO' }
];
const RANGO_DIAMANTE = 95;

/* Umbrales de rango calculados con las estadisticas reales de la liga:
   oro para el 10% mas alto, plata para el siguiente 25% y bronce el resto. */
let _tierCache = null;
function umbralesTier() {
  if (_tierCache) return _tierCache;
  const ovrs = [];
  DATOS.equipos.forEach((e) => (e.jugadores || []).forEach((p) => {
    ovrs.push(cartaDe({
      id: p.id, nombre: p.nombre, goles: num(p.goles), asistencias: num(p.asistencias),
      autogoles: num(p.autogoles), cs: num(p.cs), equipoId: e.id, equipo: e.nombre
    }).ovr);
  }));
  ovrs.sort((a, b) => b - a);
  const n = ovrs.length;
  const corte = (p) => (n ? ovrs[Math.min(n - 1, Math.floor(n * p))] : 0);
  const oro = Math.max(70, corte(0.10));
  const plata = Math.max(60, Math.min(oro - 1, corte(0.35)));
  _tierCache = { diamante: RANGO_DIAMANTE, oro, plata };
  return _tierCache;
}

const rangoDe = (ovr) => {
  const t = umbralesTier();
  if (ovr >= t.diamante) return 'diamante';
  if (ovr >= t.oro) return 'oro';
  if (ovr >= t.plata) return 'plata';
  return 'bronce';
};
const rangoInfo = (id) => RANGOS.find((r) => r.id === id) || RANGOS[RANGOS.length - 1];
const RANGO_TXT = RANGOS.reduce((m, r) => { m[r.id] = r.nombre; return m; }, {});

let _cartasActuales = [];

/* Paleta de cada rango: diamante cristal, oro brillante, plata fria y bronce calido. */
const RANGO_PALETA = {
  diamante: {
    bg: 'linear-gradient(165deg,#0A2542 0%,#0D3B63 34%,#0E6E9E 62%,#3FC7F0 100%)',
    bd: '#9CEEFF', col: '#B9F4FF', chip: '#8FE3FF', ink: '#04304F', brillo: .5
  },
  oro: {
    bg: 'linear-gradient(170deg,#FFFBEA 0%,#FFE7A2 52%,#FFCE5C 100%)',
    bd: '#E0A32C', col: '#8A5A00', chip: '#F5C542', ink: '#3E2A00', brillo: .35
  },
  plata: {
    bg: 'linear-gradient(170deg,#FFFFFF 0%,#F1F5FC 52%,#DBE4F3 100%)',
    bd: '#A6B8D0', col: '#4A5C78', chip: '#C3D1E4', ink: '#1E2937', brillo: .25
  },
  bronce: {
    bg: 'linear-gradient(170deg,#FFF8F0 0%,#F8DFC1 52%,#EEBB86 100%)',
    bd: '#C98045', col: '#8A4B1E', chip: '#E2A76E', ink: '#40230F', brillo: .18
  }
};

const rangoCss = (ovr) => {
  const p = RANGO_PALETA[rangoDe(ovr)];
  return { bg: p.bg, bd: p.bd, tierCol: p.col, chip: p.chip, ink: p.ink, brillo: p.brillo };
};

/* Markup de una carta de jugador. `opts.grande` la dibuja como bloque
   (se usa dentro del modal) en vez de boton. */
function tarjetaCarta(j, opts = {}) {
  const c = j._carta;
  const rango = rangoDe(c.ovr);
  const color = j.color || '#5DA4B6';
  const tc = rangoCss(c.ovr);
  const escudoHtml = j.escudo
    ? `<span class="fc-crest logo-img"><img src="/static/${esc(j.escudo)}" alt="" loading="lazy"></span>`
    : `<span class="fc-crest">${esc(j.sigla || inicialesJugador(j.equipo))}</span>`;
  const stat = (lbl, val) =>
    `<div class="fc-stat"><b>${val}</b><span>${lbl}</span><i style="--v:${val}%"></i></div>`;

  const insignia = rango === 'diamante'
    ? `<span class="fc-diamante-badge" title="Rango Diamante"><i></i><b>${esc(GRL_ETIQUETA)}</b></span>`
    : '';

  const cuerpo = `
      <span class="fc-deco" aria-hidden="true">
        <span class="fc-facetas"></span>
        <span class="fc-rayos"></span>
        <span class="fc-prisma"></span>
        <span class="fc-borde"></span>
      </span>
      <span class="fc-head">
        <span class="fc-rating">
          <small>${esc(GRL_ETIQUETA)}</small>
          <strong>${c.ovr}</strong>
          <span>${c.pos}</span>
        </span>
        ${insignia}
        <span class="fc-tier" style="background:${tc.chip};color:${tc.ink}">${RANGO_TXT[rango]}</span>
      </span>
      <span class="fc-ball-wrap">
        <span class="fc-halo" aria-hidden="true"></span>
        <span class="fc-rayos-bola" aria-hidden="true"></span>
        <span class="fc-ball"><span class="fc-ini">${esc(c.ini)}</span></span>
        ${escudoHtml}
      </span>
      <span class="fc-name">${esc(j.nombre)}</span>
      <span class="fc-team">${esc(j.equipo)}</span>
      <span class="fc-stats">
        ${stat('PAC', c.pac)}${stat('SHO', c.sho)}${stat('PAS', c.pas)}
        ${stat('DRI', c.dri)}${stat('DEF', c.def)}${stat('PHY', c.phy)}
      </span>
      ${opts.grande ? '' : '<span class="fc-hint">Click para detalle</span>'}`;

  const estilo = `--eq:${esc(color)};--eq-txt:${textoLegible(color)};--tier-bg:${tc.bg};--tier-bd:${tc.bd};--tier:${tc.tierCol};--tier-ink:${tc.ink};--brillo:${tc.brillo}`;

  if (opts.grande) {
    return `<div class="fc-card fc-${rango} fc-grande reveal" style="${estilo}">${cuerpo}</div>`;
  }
  return `
    <button type="button" class="fc-card fc-${rango} reveal" data-id="${esc(String(j.id))}" style="${estilo}">
      ${cuerpo}
    </button>`;
}

/* Lista de jugadores (con metadata de equipo) segun los filtros activos. */
function cartasLista() {
  const porEquipo = new Set(
    DATOS.equipos.filter((e) => CARTAS.division === 'all' || e.division === CARTAS.division).map((e) => e.id)
  );
  const q = CARTAS.buscar.trim().toLowerCase();
  const lista = [];
  DATOS.equipos.forEach((e) => {
    if (!porEquipo.has(e.id)) return;
    if (CARTAS.equipo !== 'all' && String(e.id) !== String(CARTAS.equipo)) return;
    (e.jugadores || []).forEach((p) => {
      if (q && !(String(p.nombre).toLowerCase().includes(q) || e.nombre.toLowerCase().includes(q))) return;
      const j = {
        id: p.id, nombre: p.nombre, goles: num(p.goles), asistencias: num(p.asistencias),
        autogoles: num(p.autogoles), cs: num(p.cs), equipoId: e.id, equipo: e.nombre,
        sigla: e.sigla, color: e.color, escudo: escudoDe(e), division: e.division
      };
      j._carta = cartaDe(j);
      lista.push(j);
    });
  });
  return lista;
}

/* Rellena el selector de equipos segun la division activa. */
function cargarEquipoSelect() {
  const sel = $('#cartasEquipo');
  if (!sel) return;
  const eqs = DATOS.equipos
    .filter((e) => CARTAS.division === 'all' || e.division === CARTAS.division)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  sel.innerHTML = `<option value="all">Todos los equipos</option>`
    + eqs.map((e) => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('');
  sel.value = CARTAS.equipo;
}

function pintarCartas() {
  const grid = $('#cartasGrid');
  const destacados = $('#cartasDestacados');
  const nota = $('#cartasNota');
  if (!grid && !destacados) return;

  $$('#cartasDivision .chip').forEach((b) => b.classList.toggle('activa', b.dataset.division === CARTAS.division));

  const lista = cartasLista().sort((a, b) =>
    b._carta.ovr - a._carta.ovr || a.nombre.localeCompare(b.nombre, 'es'));

  _cartasActuales = lista;

  if (nota) nota.textContent = `${lista.length} ${lista.length === 1 ? 'carta' : 'cartas'}`;

  if (destacados) {
    destacados.innerHTML = lista.length
      ? lista.slice(0, 3).map(tarjetaCarta).join('')
      : vacio('Sin jugadores para mostrar.');
  }
  if (grid) {
    grid.innerHTML = lista.length
      ? lista.map(tarjetaCarta).join('')
      : vacio('No hay jugadores que coincidan con tu busqueda.');
  }
  revelar();
  _configurarCartasClickeables();
}

function _configurarCartasClickeables() {
  document.querySelectorAll('.fc-card[data-id]').forEach((btn) => {
    if (btn.dataset.cartabind === '1') return;
    btn.dataset.cartabind = '1';
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = btn.getAttribute('data-id');
      const j = _cartasActuales.find((x) => String(x.id) === String(id));
      if (j) abrirCartaModal(j);
    });
  });
}

function abrirCartaModal(j) {
  const modal = abrirModal('cartaModal', cartaModalHTML(j));
  const x = modal.querySelector('.carta-modal-x');
  if (x) x.focus();
}

function cartaModalHTML(j) {
  const c = j._carta;
  const rango = rangoDe(c.ovr);
  const tc = rangoCss(c.ovr);
  const f = fuerzaEquipos().get(j.equipoId) || { pj: 0, gf: 0, gc: 0, w: 0, l: 0, d: 0 };
  const wr = f.pj ? Math.round((f.w / f.pj) * 100) : 0;
  const rangoText = RANGO_TXT[rango];
  const d = datosJugador(j.id);

  const dato = (lbl, val, extra = '') =>
    `<div class="cm-item${extra}"><small>${lbl}</small><strong>${val}</strong></div>`;

  return `
  <div class="carta-modal-fondo cm-fondo-deco" aria-hidden="true"></div>
  <div class="carta-modal-card cm-amplio cm-${rango}" role="document"
       style="--tier-bg:${tc.bg};--tier-bd:${tc.bd};--tier:${tc.tierCol};--tier-ink:${tc.ink};--brillo:${tc.brillo}">
    <button type="button" class="carta-modal-x" aria-label="Cerrar">×</button>
    <span class="cm-deco" aria-hidden="true">
      <span class="cm-rayos"></span>
      <span class="cm-facetas"></span>
      <span class="cm-prisma"></span>
    </span>

    <div class="cm-izq">
      ${tarjetaCarta(j, { grande: true })}
      <div class="cm-escudo-strip">
        <span class="cm-escudo-mini">${esc(j.sigla || inicialesJugador(j.equipo))}</span>
        <div>
          <small>EQUIPO</small>
          <strong>${esc(j.equipo)}</strong>
        </div>
      </div>
    </div>

    <div class="cm-der">
      <div class="cm-cabecera">
        <span class="cm-tier-badge cm-rango-badge" style="background:${tc.chip};color:${tc.ink};border-color:${tc.bd}">
          <i class="cm-rango-gema" aria-hidden="true"></i>RANGO ${rangoText}
        </span>
        <h3 class="cm-titulo">${esc(j.nombre)}</h3>
        <p class="cm-sub">${esc(j.equipo)} · ${esc(j.division || '-')} · ${esc(c.pos)}${d && d.dorsal ? ` · #${esc(d.dorsal)}` : ''}</p>
      </div>

      <div class="cm-destacados">
        <div class="cm-dest">
          <small>GOLES</small>
          <b>${num(j.goles)}</b>
          <span>en la temporada</span>
        </div>
        <div class="cm-dest">
          <small>ASISTENCIAS</small>
          <b>${num(j.asistencias)}</b>
          <span>repartidas</span>
        </div>
        <div class="cm-dest">
          <small>PARTIDOS</small>
          <b>${f.pj}</b>
          <span>con ${esc(j.equipo)}</span>
        </div>
        <div class="cm-dest">
          <small>WIN RATE</small>
          <b>${wr}<i>%</i></b>
          <span>${f.w} victorias</span>
        </div>
      </div>

      <div class="cm-datos">
        <h4>ESTADISTICAS PERSONALES E INFORMACION</h4>
        <div class="cm-lista">
          ${dato('Partidos jugados', f.pj)}
          ${dato('Victorias', f.w)}
          ${dato('Derrotas', f.l)}
          ${dato('Empates', f.d)}
          ${dato('Autogoles', num(j.autogoles))}
          ${dato('Clean Sheets', num(j.cs))}
          ${dato('Goles a favor', f.gf)}
          ${dato('Goles en contra', f.gc)}
          ${dato('Equipo · Division', `${esc(j.equipo)} (${esc(j.division || '-').toUpperCase()})`, ' full')}
          ${dato('Posicion · Rango', `${c.pos} · ${rangoText}`)}
        </div>
      </div>

      <div class="cm-acciones">
        <button type="button" class="btn-soft cm-btn cm-btn-primario" data-jugador="${esc(String(j.id))}">FICHA DEL JUGADOR</button>
        ${j.equipoId ? `<a class="btn-soft cm-btn" href="/equipo-detalle?id=${esc(String(j.equipoId))}">VER EQUIPO</a>` : ''}
        <a class="btn-soft cm-btn" href="/cartas">VER TODAS LAS CARTAS</a>
      </div>
    </div>
  </div>
  `;
}

function eventosCartas() {
  const div = $('#cartasDivision');
  if (div && !div.dataset.config) {
    div.dataset.config = '1';
    div.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-division]');
      if (!btn) return;
      CARTAS.division = btn.dataset.division;
      CARTAS.equipo = 'all';
      cargarEquipoSelect();
      pintarCartas();
    });
  }
  const sel = $('#cartasEquipo');
  if (sel && !sel.dataset.config) {
    sel.dataset.config = '1';
    sel.addEventListener('change', () => { CARTAS.equipo = sel.value; pintarCartas(); });
  }
  const buscar = $('#cartasBuscar');
  if (buscar && !buscar.dataset.config) {
    buscar.dataset.config = '1';
    buscar.addEventListener('input', () => { CARTAS.buscar = buscar.value; pintarCartas(); });
  }
}

/* ------------------------------------------------------------- MODALES */
/* Crea (si hace falta) un contenedor de modal y lo abre con el HTML dado. */
function abrirModal(id, html) {
  let modal = document.getElementById(id);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = id;
    modal.className = 'carta-modal';
    modal.setAttribute('hidden', '');
    document.body.appendChild(modal);
  }
  modal.innerHTML = html;
  modal.removeAttribute('hidden');
  document.body.classList.add('carta-modal-abierto');
  modal.dataset.open = '1';

  const fondo = modal.querySelector('.carta-modal-fondo');
  const cerrar = modal.querySelector('.carta-modal-x');
  const onClose = () => {
    modal.setAttribute('hidden', '');
    delete modal.dataset.open;
    if (!document.querySelector('.carta-modal:not([hidden])')) {
      document.body.classList.remove('carta-modal-abierto');
    }
    if (fondo) fondo.removeEventListener('click', onClose);
    if (cerrar) cerrar.removeEventListener('click', onClose);
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => { if (e.key === 'Escape') onClose(); };
  if (fondo) fondo.addEventListener('click', onClose);
  if (cerrar) cerrar.addEventListener('click', onClose);
  document.addEventListener('keydown', onKey);
  return modal;
}

/* ------------------------------------------------------ FICHA JUGADOR */
/* Todos los datos de un jugador: temporada, equipo y partidos. */
function datosJugador(id) {
  const clave = String(id);
  for (const e of DATOS.equipos) {
    const j = (e.jugadores || []).find((x) => String(x.id) === clave);
    if (!j) continue;
    const resumen = fuerzaEquipos().get(e.id) || { pj: 0, gf: 0, gc: 0, w: 0, l: 0, d: 0 };
    const participaciones = DATOS.fechas.filter((f) => f.jugado && (
      (f.goleadores || []).some((g) => String(g.jugador_id) === clave) ||
      (f.asistencias || []).some((x) => String(x.jugador_id) === clave) ||
      (f.autogoles || []).some((x) => String(x.jugador_id) === clave) ||
      String(f.portero_a) === clave || String(f.portero_b) === clave)).length;
    return {
      id: j.id, nombre: j.nombre, dorsal: j.dorsal, posicion: j.posicion,
      goles: num(j.goles), asistencias: num(j.asistencias), autogoles: num(j.autogoles),
      cs: num(j.cs), minutos_cs: num(j.minutos_cs),
      equipo: e.nombre, sigla: e.sigla, color: e.color, escudo: escudoDe(e),
      division: e.division, equipoId: e.id, resumen, participaciones
    };
  }
  return null;
}

/* Objeto de carta de un jugador suelto (para reutilizar cartaDe). */
function cartaDeJugador(d) {
  const j = {
    id: d.id, nombre: d.nombre, goles: d.goles, asistencias: d.asistencias,
    autogoles: d.autogoles, cs: d.cs, equipoId: d.equipoId, equipo: d.equipo,
    sigla: d.sigla, color: d.color, escudo: d.escudo, division: d.division
  };
  j._carta = cartaDe(j);
  return j;
}

function abrirJugadorModal(id) {
  const d = datosJugador(id);
  if (!d) return;
  const modal = abrirModal('jugadorModal', jugadorModalHTML(d));
  const x = modal.querySelector('.carta-modal-x');
  if (x) x.focus();
}

function jugadorModalHTML(d) {
  const j = cartaDeJugador(d);
  const c = j._carta;
  const rango = rangoDe(c.ovr);
  const tc = rangoCss(c.ovr);
  const r = d.resumen;
  const escudo = d.escudo
    ? `<span class="jf-crest logo-img"><img src="/static/${esc(d.escudo)}" alt="" loading="lazy"></span>`
    : `<span class="jf-crest">${esc(d.sigla || inicialesJugador(d.equipo))}</span>`;

  const stat = (lbl, val) => `<div class="jf-stat"><b>${val}</b><span>${lbl}</span></div>`;

  return `
  <div class="carta-modal-fondo" aria-hidden="true"></div>
  <div class="carta-modal-card jf-card" role="document">
    <button type="button" class="carta-modal-x" aria-label="Cerrar">×</button>
    <header class="jf-cab">
      ${escudo}
      <div class="jf-id">
        <h3>${esc(d.nombre)}</h3>
        <p>${esc(d.equipo)} · ${esc(d.division || '-')}${d.posicion ? ` · ${esc(d.posicion)}` : ''}${d.dorsal ? ` · #${esc(d.dorsal)}` : ''}</p>
      </div>
      <span class="jf-tier" style="background:${tc.chip};color:${tc.ink};border-color:${tc.bd}">${c.ovr} ${RANGO_TXT[rango]}</span>
    </header>
    <div class="jf-stats">
      ${stat('PARTIDOS', r.pj)}
      ${stat('VICTORIAS', r.w)}
      ${stat('DERROTAS', r.l)}
      ${stat('EMPATES', r.d)}
      ${stat('GOLES', d.goles)}
      ${stat('ASISTENCIAS', d.asistencias)}
      ${stat('PARTICIPACIONES', d.participaciones)}
      ${stat('CLEAN SHEETS', d.cs)}
    </div>
    <div class="jf-pie">
      <button type="button" class="btn-soft cm-btn" data-carta="${esc(String(d.id))}">VER CARTA COMPLETA</button>
      <a class="btn-soft cm-btn" href="/equipo-detalle?id=${esc(String(d.equipoId))}">VER EQUIPO</a>
    </div>
  </div>`;
}

/* --------------------------------------------------- INFORME DE PARTIDO */
/* Jugador con mejor participacion del partido (goles x2, asistencias x1). */
function mejorJugador(f) {
  const mapa = new Map();
  const add = (id, nombre, equipo, g, a) => {
    const k = String(id || nombre);
    if (!mapa.has(k)) mapa.set(k, { id: id, nombre: nombre, equipo: equipo, goles: 0, asis: 0 });
    const e = mapa.get(k);
    e.goles += g; e.asis += a;
  };
  (f.goleadores || []).forEach((g) => add(g.jugador_id, g.nombre, g.equipo, num(g.goles), 0));
  (f.asistencias || []).forEach((x) => add(x.jugador_id, x.nombre, x.equipo, 0, num(x.asistencias)));
  let best = null;
  mapa.forEach((v) => {
    v.pts = v.goles * 2 + v.asis;
    if (!best || v.pts > best.pts) best = v;
  });
  if (best && best.id != null) {
    const nombreReal = nombreJugador(best.id);
    if (nombreReal) best.nombre = nombreReal;
  }
  return best;
}

function abrirInforme(id) {
  const f = DATOS.fechas.find((x) => String(x.id) === String(id));
  if (!f) return;
  const modal = abrirModal('informeModal', informeHTML(f));
  const x = modal.querySelector('.carta-modal-x');
  if (x) x.focus();
}

/* Tabla de un equipo dentro del informe: lo que hizo cada jugador. */
function tablaEquipoInforme(f, lado, equipo) {
  const esB = lado === 'b';
  const de = (arr) => (arr || []).filter((x) => (x.equipo || 'a') === lado);
  const filas = new Map();
  const add = (id, nombre, g, a) => {
    const k = String(id || nombre);
    if (!filas.has(k)) filas.set(k, { id: id, nombre: nombre, goles: 0, asis: 0 });
    const e = filas.get(k);
    e.goles += g; e.asis += a;
  };
  de(f.goleadores).forEach((g) => add(g.jugador_id, g.nombre, num(g.goles), 0));
  de(f.asistencias).forEach((x) => add(x.jugador_id, x.nombre, 0, num(x.asistencias)));

  const portero = esB ? f.portero_b : f.portero_a;
  const cs = num(esB ? f.cs_b : f.cs_a) > 0 && portero;
  if (cs) add(portero, nombreJugador(portero) || portero, 0, 0);

  const lista = Array.from(filas.values()).sort((x, y) =>
    (y.goles - x.goles) || (y.asis - x.asis) || String(x.nombre).localeCompare(String(y.nombre)));

  const maxG = Math.max(1, ...lista.map((p) => p.goles));
  const maxA = Math.max(1, ...lista.map((p) => p.asis));

  const cuerpo = lista.length
    ? lista.map((p, i) => `<tr>
        <td class="inf-rank">${i + 1}</td>
        <td class="inf-jug">${jugLink(p.id, p.nombre)}
          <span class="inf-barras">
            <i class="g" style="--w:${(p.goles / maxG) * 100}%"></i>
            <i class="a" style="--w:${(p.asis / maxA) * 100}%"></i>
          </span>
        </td>
        <td class="pos"><b>${p.goles}</b></td>
        <td class="pos"><b>${p.asis}</b></td>
        <td class="pos inf-pts">${p.goles * 2 + p.asis}</td>
        <td>${cs && String(p.id) === String(portero) ? '<span class="jf-cs">CS</span>' : ''}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="jf-sin">Sin participaciones registradas</td></tr>`;

  const tg = lista.reduce((s, p) => s + p.goles, 0);
  const ta = lista.reduce((s, p) => s + p.asis, 0);

  return `
    <div class="inf-equipo-bloque" style="--eq:${esc(equipo.color || '#5AA9F0')}">
      <div class="inf-equipo-cab">
        <span class="inf-eq-dot"></span>
        <span class="inf-eq-nom">${esc(equipo.nombre)}</span>
        <span class="inf-eq-sig">${esc(equipo.sigla || '')}</span>
      </div>
      <table class="tabla tabla-stats inf-tabla">
        <thead><tr><th scope="col">#</th><th scope="col">JUGADOR</th><th scope="col">G</th><th scope="col">A</th><th scope="col">PTS</th><th scope="col"></th></tr></thead>
        <tbody>${cuerpo}</tbody>
        <tfoot><tr><td></td><td>TOTALES</td><td class="pos">${tg}</td><td class="pos">${ta}</td><td class="pos">${tg * 2 + ta}</td><td></td></tr></tfoot>
      </table>
    </div>`;
}

function informeHTML(f) {
  const a = porId(f.equipo_a_id) || { nombre: f.equipo_a, sigla: f.sigla_a, color: f.color_a, division: f.division_a, escudo: f.escudo_a };
  const b = porId(f.equipo_b_id) || { nombre: f.equipo_b, sigla: f.sigla_b, color: f.color_b, division: f.division_b, escudo: f.escudo_b };
  const jugados = !!f.jugado;
  const d = new Date(String(f.fecha).replace(' ', 'T') + 'T00:00:00');
  const fechaTxt = isNaN(d)
    ? esc(String(f.fecha || ''))
    : d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const mvp = jugados ? mejorJugador(f) : null;

  const escudo = (eq) => {
    const src = escudoDe(eq);
    return src
      ? `<span class="inf-crest logo-img"><img src="/static/${esc(src)}" alt="" loading="lazy"></span>`
      : `<span class="inf-crest" style="--eq:${esc(eq.color || '#5AA9F0')}">${esc(iniciales(eq.sigla || eq.nombre))}</span>`;
  };

  const de = (arr, lado) => (arr || []).filter((x) => (x.equipo || 'a') === lado);
  const sumaAsis = (lado) => de(f.asistencias, lado).reduce((s, x) => s + num(x.asistencias), 0);
  const Ck = (lado) => {
    const ids = new Set();
    de(f.goleadores, lado).forEach((g) => ids.add(String(g.jugador_id)));
    de(f.asistencias, lado).forEach((x) => ids.add(String(x.jugador_id)));
    return ids.size;
  };

  /* Bloque de aportaciones de un equipo, agrupadas por tipo. */
  const bloque = (lado) => {
    const esB = lado === 'b';
    const eq = esB ? b : a;
    const goles = de(f.goleadores, lado);
    const asis = de(f.asistencias, lado);
    const auto = de(f.autogoles, lado);
    const portero = esB ? f.portero_b : f.portero_a;
    const csMin = num(esB ? f.minutos_cs_b : f.minutos_cs_a);
    const conCs = num(esB ? f.cs_b : f.cs_a) > 0 && portero;
    const maxG = Math.max(1, ...goles.map((g) => num(g.goles)));
    const maxA = Math.max(1, ...asis.map((x) => num(x.asistencias)));

    const seccion = (titulo, icono, items, max, clase) => `
      <div class="inf-sec ${clase}">
        <div class="inf-sec-cab"><i>${icono}</i><span>${titulo}</span><b>${items.reduce((s, x) => s + (num(x.v) || 1), 0)}</b></div>
        ${items.length ? `<ul class="inf-sec-lista">${items.map((x) => `
          <li class="inf-linea">
            ${jugLink(x.id, x.nombre)}
            <span class="inf-linea-bar"><i style="--w:${(num(x.v) / max) * 100}%"></i></span>
            <strong>x${num(x.v) || 1}</strong>
          </li>`).join('')}</ul>` : '<p class="jf-sin">Sin registros</p>'}
      </div>`;

    return `
      <div class="inf-bloque" style="--eq:${esc(eq.color || '#5AA9F0')}">
        <header class="inf-bloque-cab">
          ${escudo(eq)}
          <div><strong>${esc(eq.nombre)}</strong><small>${esc(eq.division || '')} · ${esc(eq.sigla || '')}</small></div>
        </header>
        <div class="inf-mini">
          <span>GF <b>${num(esB ? f.goles_b : f.goles_a)}</b></span>
          <span>GC <b>${num(esB ? f.goles_a : f.goles_b)}</b></span>
          <span>CS <b>${num(esB ? f.cs_b : f.cs_a)}</b></span>
        </div>
        ${seccion('GOLES', '⚽', goles.map((g) => ({ id: g.jugador_id, nombre: g.nombre || g.jugador, v: num(g.goles) })), maxG, 'gol')}
        ${seccion('ASISTENCIAS', '👟', asis.map((x) => ({ id: x.jugador_id, nombre: x.nombre || x.jugador, v: num(x.asistencias) })), maxA, 'asis')}
        ${auto.length ? seccion('AUTOGOLES', '🥅', auto.map((x) => ({ id: x.jugador_id, nombre: x.nombre || x.jugador, v: 1 })), 1, 'auto') : ''}
        ${conCs ? `<div class="inf-sec cs">
            <div class="inf-sec-cab"><i>🧤</i><span>PORTERO</span><b>${csMin ? fmtMin(csMin) + ' MIN' : 'CS'}</b></div>
            <ul class="inf-sec-lista"><li class="inf-linea">${jugLink(portero, nombreJugador(portero) || portero)}</li></ul>
          </div>` : ''}
      </div>`;
  };

  /* Barra comparativa de una metrica. */
  const cmp = (label, va, vb, icono) => {
    const tot = va + vb;
    const pa = tot ? (va / tot) * 100 : 50;
    return `<div class="inf-cmp">
        <span class="inf-cmp-val a">${va}</span>
        <span class="inf-cmp-mid"><i>${icono}</i><small>${label}</small></span>
        <span class="inf-cmp-val b">${vb}</span>
        <span class="inf-cmp-barra"><i class="a" style="--w:${pa}%"></i><i class="b" style="--w:${100 - pa}%"></i></span>
      </div>`;
  };

  const marcador = jugados
    ? `<b>${num(f.goles_a)}</b><i>-</i><b>${num(f.goles_b)}</b>`
    : `<b class="inf-vs">VS</b>`;

  const sala = !jugados && f.sala
    ? `<a class="btn-soft cm-btn cm-btn-primario" href="${esc(f.sala)}" target="_blank" rel="noopener">ABRIR SALA</a>`
    : '';

  const chips = [
    f.fecha ? `<span class="inf-chip">📅 ${fechaTxt}</span>` : '',
    f.hora ? `<span class="inf-chip">🕐 ${esc(horaCorta(f.hora))}</span>` : '',
    f.jornada ? `<span class="inf-chip gold">🏆 ${esc(f.jornada)}</span>` : '',
    f.fase ? `<span class="inf-chip soft">🧩 ${esc(f.fase)}</span>` : '',
    a.division ? `<span class="inf-chip soft">🎮 ${esc(a.division)}</span>` : '',
    jugados ? `<span class="inf-chip ok">✔ FINALIZADO</span>` : '<span class="inf-chip pend">⏳ PENDIENTE</span>'
  ].filter(Boolean).join('');

  return `
  <div class="carta-modal-fondo cm-fondo-deco" aria-hidden="true"></div>
  <div class="carta-modal-card informe inf-v2" role="document"
       style="--eq-a:${esc(a.color || '#5AA9F0')};--eq-b:${esc(b.color || '#5AA9F0')}">
    <button type="button" class="carta-modal-x" aria-label="Cerrar">×</button>
    <span class="inf-deco" aria-hidden="true"><span class="inf-facetas"></span><span class="inf-rayos"></span></span>

    <header class="inf-hero">
      <div class="inf-hero-bg"></div>
      <div class="inf-eq a">
        ${escudo(a)}
        <strong>${esc(a.nombre)}</strong>
        <small>${esc(a.division || '')}</small>
      </div>
      <div class="inf-marc">
        <div class="inf-score">${marcador}</div>
        <div class="inf-marc-sub">${esc(f.jornada || 'PARTIDO')}${f.fase ? ' · ' + esc(f.fase) : ''}</div>
      </div>
      <div class="inf-eq b">
        ${escudo(b)}
        <strong>${esc(b.nombre)}</strong>
        <small>${esc(b.division || '')}</small>
      </div>
    </header>

    <div class="inf-chips">${chips}</div>

    <div class="inf-comparativa">
      <h4 class="inf-tit">COMPARATIVA DEL PARTIDO</h4>
      ${cmp('GOLES', num(f.goles_a), num(f.goles_b), '⚽')}
      ${cmp('ASISTENCIAS', sumaAsis('a'), sumaAsis('b'), '👟')}
      ${cmp('CONTRIBUYENTES', Ck('a'), Ck('b'), '👥')}
      ${cmp('PORTEROS CS', num(f.cs_a) > 0 ? 1 : 0, num(f.cs_b) > 0 ? 1 : 0, '🧤')}
    </div>

    ${mvp ? `<div class="inf-mvp">
        <span class="inf-mvp-tag">MEJOR JUGADOR</span>
        <div class="inf-mvp-jug">${jugLink(mvp.id, mvp.nombre)}</div>
        <div class="inf-mvp-stats">
          <span>⚽ <b>${mvp.goles}</b> goles</span>
          <span>👟 <b>${mvp.asis}</b> asistencias</span>
          <span class="inf-mvp-pts"><b>${mvp.pts}</b> pts</span>
        </div>
      </div>` : `<div class="inf-mvp vacio">Partido todavia no disputado</div>`}

    <div class="inf-cols">
      ${bloque('a')}
      ${bloque('b')}
    </div>

    <div class="inf-tablas">
      ${tablaEquipoInforme(f, 'a', a)}
      ${tablaEquipoInforme(f, 'b', b)}
    </div>

    <div class="cm-acciones inf-acciones">
      ${sala}
      <a class="btn-soft cm-btn" href="/equipo-detalle?id=${esc(String(a.id))}">EQUIPO ${esc(a.sigla || '')}</a>
      <a class="btn-soft cm-btn" href="/equipo-detalle?id=${esc(String(b.id))}">EQUIPO ${esc(b.sigla || '')}</a>
      <a class="btn-soft cm-btn" href="/liga">VER LIGA</a>
    </div>
  </div>`;
}

/* ---------------------------------------------------------- UI GENERAL */
function configBotonSubir() {
  const boton = $('#btnTop');
  if (!boton) return;
  const alCambiar = () => boton.classList.toggle('ver', window.scrollY > 500);
  window.addEventListener('scroll', alCambiar, { passive: true });
  alCambiar();
  boton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function revelar() {
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  $$('.reveal:not(.visible)').forEach((el) => obs.observe(el));
}

function configMenu() {
  const toggle = $('#menuToggle');
  const menu = $('#mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    toggle.setAttribute('aria-expanded', String(abierto));
  });
  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      menu.classList.remove('abierto');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* --------------------------------------------------------- EVENTOS LIGA */
function eventosLiga() {
  const div = $('#ligaDivision');
  if (div) {
    div.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-division]');
      if (!btn) return;
      LIGA.division = btn.dataset.division;
      LIGA.jornada = '';
      LIGA.jornadaRes = '';
      pintarLiga();
    });
  }
  const jornadas = $('#ligaJornadas');
  if (jornadas) {
    jornadas.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-jornada]');
      if (!btn) return;
      LIGA.jornada = btn.dataset.jornada;
      pintarCalendario();
    });
  }
  const jornadasRes = $('#ligaResJornadas');
  if (jornadasRes) {
    jornadasRes.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-jornada-res]');
      if (!btn) return;
      LIGA.jornadaRes = btn.dataset.jornadaRes;
      pintarResultadosLiga();
    });
  }
  const vista = $('#ligaVista');
  if (vista) {
    vista.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-vista]');
      if (btn) mostrarVista(btn.dataset.vista);
    });
  }

  const cal = $('#ligaCalendario');
  if (cal && !cal.dataset.config) {
    cal.dataset.config = '1';
    cal.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-cal-move]');
      if (!btn) return;
      CAL.mes = moverMes(CAL.mes, Number(btn.dataset.calMove) || 0);
      pintarCalendario();
    });
  }
}

/* ------------------------------------------------- EVENTOS GLOBALES */
/* Ficha de jugador, carta completa e informe de partido: un solo Delegado
   para que funcionen en cualquier pagina. */
function eventosGlobales() {
  document.addEventListener('click', (ev) => {
    if (ev.target.closest('a')) return;
    const jug = ev.target.closest('[data-jugador]');
    if (jug) {
      ev.preventDefault();
      abrirJugadorModal(jug.dataset.jugador);
      return;
    }
    const carta = ev.target.closest('[data-carta]');
    if (carta) {
      ev.preventDefault();
      abrirCartaDeJugador(carta.dataset.carta);
      return;
    }
    const fecha = ev.target.closest('[data-fecha]');
    if (fecha) {
      ev.preventDefault();
      abrirInforme(fecha.dataset.fecha);
    }
  });
}

/* Abre la carta completa de un jugador suelto. */
function abrirCartaDeJugador(id) {
  const d = datosJugador(id);
  if (!d) return;
  abrirCartaModal(cartaDeJugador(d));
}

/* ------------------------------------------------------- EVENTOS INICIO */
function eventosInicio() {
  const tabs = $('#liderTabs');
  if (tabs) {
    const opciones = [['goles', 'Goles'], ['asistencias', 'Asistencias'], ['cs', 'Clean Sheets']];
    tabs.innerHTML = opciones.map(([v, t]) =>
      `<button class="chip${INICIO.ranking === v ? ' activa' : ''}" type="button" data-rank="${v}">${t}</button>`).join('');
    tabs.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-rank]');
      if (!btn) return;
      INICIO.ranking = btn.dataset.rank;
      pintarLideres();
    });
  }
}

/* --------------------------------------------------- EVENTOS ESTADISTICAS */
function eventosStats() {
  const buscar = $('#statBuscar');
  if (buscar) {
    buscar.addEventListener('input', () => { STATS.buscar = buscar.value; pintarStats(); });
  }
}

/* ------------------------------------------------------------- RENDER */
function renderPagina(pagina) {
  switch (pagina) {
    case 'liga':
      eventosLiga();
      pintarLiga();
      mostrarVista(LIGA.vista);
      break;
    case 'estadisticas':
      eventosStats();
      pintarStats();
      break;
    case 'cartas':
      eventosCartas();
      cargarEquipoSelect();
      pintarCartas();
      break;
    case 'museo':
      pintarMuseo();
      configMuseoModal();
      break;
    case 'redes':
      pintarRedes();
      break;
    case 'equipo':
      pintarEquipo();
      break;
    case 'donacion':
      pintarDonacion();
      break;
    case 'pubs':
      pintarPubs();
      break;
    case 'sponsors':
      break;
    case 'equipo-detalle':
      pintarEquipoDetalle();
      break;
    case 'inicio':
    default:
      eventosInicio();
      pintarHero();
      pintarStrip();
      pintarLigas();
      pintarResultadosInicio();
      pintarFechas('#porJugar', pendientesOrdenados('all').slice(0, 5), { compacto: true, detalle: false, vacio: 'No hay partidos programados.' });
      pintarLideres();
      pintarNoticias();
      pintarAnuncios();
      break;
  }
  revelar();
}

/* --------------------------------------------------------------- INICIO */
function iniciar() {
  configBotonSubir();
  configMenu();
  eventosGlobales();
  pintarNav();

  const fuente = window.SITIO || {};
  Object.assign(DATOS, {
    modulos: fuente.modulos || [], contenidos: fuente.contenidos || {},
    equipos: fuente.equipos || [], fechas: fuente.fechas || [],
    ideales: fuente.ideales || []
  });

  pintarModulos();
  renderPagina(document.body.dataset.pagina || 'inicio');

  revelar();
  requestAnimationFrame(ocultarPreloader);
}

document.addEventListener('DOMContentLoaded', iniciar);






