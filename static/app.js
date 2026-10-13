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

function pintarCalendario() {
  const caja = $('#ligaCalendario');
  const chipsBox = $('#ligaJornadas');
  if (!caja) return;

  const fechas = fechasDivision(LIGA.division)
    .slice()
    .sort((a, b) => fechaHora(a) - fechaHora(b));
  if (!fechas.length) {
    if (chipsBox) chipsBox.innerHTML = '';
    const nota = $('#calNota');
    if (nota) nota.textContent = '';
    caja.innerHTML = vacio(`Todavia no hay fechas en la Division ${LIGA.division}.`);
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

  const actual = jornadas.includes(LIGA.jornada) ? LIGA.jornada : jornadas[0];
  LIGA.jornada = actual;

  if (chipsBox) {
    chipsBox.innerHTML = jornadas
      .map((j) => `<button class="chip${j === actual ? ' activa' : ''}" type="button" data-jornada="${esc(j)}">${esc(j)}</button>`)
      .join('');
    chipsBox.hidden = jornadas.length <= 1;
  }

  const partidos = grupos.get(actual) || [];
  const nota = $('#calNota');
  if (nota) {
    nota.textContent = `${partidos.length} partidos · Division ${LIGA.division}`;
  }

  caja.innerHTML = `<section class="jornada-grupo reveal">
      <div class="jornada-partidos">${partidos.map((f) => filaCalendario(f)).join('')}</div>
    </section>`;
  revelar();
}

/* Fila del calendario: solo dia, hora y equipos (sin marcador). */
function filaCalendario(f) {
  const a = porId(f.equipo_a_id) || { nombre: f.equipo_a, sigla: f.sigla_a, color: f.color_a };
  const b = porId(f.equipo_b_id) || { nombre: f.equipo_b, sigla: f.sigla_b, color: f.color_b };
  const d = new Date(String(f.fecha).replace(' ', 'T') + 'T00:00:00');
  const dia = isNaN(d) ? '' : d.toLocaleDateString('es', { weekday: 'short' }).replace('.', '').toUpperCase();
  const fechaTxt = isNaN(d) ? esc(String(f.fecha || '')) :
    d.toLocaleDateString('es', { day: '2-digit', month: 'short' }).replace('.', '');
  return `
    <article class="cal-partido reveal">
      <div class="cal-cuando">
        <strong>${esc(dia)}</strong>
        <span>${esc(fechaTxt)}</span>
      </div>
      <div class="cal-choque">
        ${equipoLado(a, 'cal-eq a')}
        <span class="cal-vs">VS</span>
        ${equipoLado(b, 'cal-eq b')}
      </div>
      <span class="cal-hora">${esc(horaCorta(f.hora) || '--:--')}</span>
    </article>`;
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
        .map((g) => `<span class="stat-line"><i class="ic-gol" title="Goles">⚽</i>${esc(g.nombre || g.jugador)}<strong>x${num(g.goles) || 1}</strong></span>`);
      const asis = (f.asistencias || [])
        .filter((x) => (x.equipo || 'a') === lado)
        .map((x) => `<span class="stat-line"><i class="ic-asis" title="Asistencias">👟</i>${esc(x.nombre || x.jugador)}<strong>x${num(x.asistencias) || 1}</strong></span>`);
      const opuesto = lado === 'b' ? 'a' : 'b';
      const auto = (f.autogoles || [])
        .filter((x) => (x.equipo || 'a') === opuesto)
        .map((x) => `<span class="stat-line"><i class="ic-autogol" title="Autogol">🥅</i>${esc(x.nombre || x.jugador)} <em>(AG)</em></span>`);
      const esB = lado === 'b';
      const conCs = num(esB ? f.cs_b : f.cs_a) > 0;
      const portero = esB ? f.portero_b : f.portero_a;
      const csLine = conCs && portero
        ? `<span class="stat-line"><i class="ic-cs" title="Clean sheet">🧤</i>${esc(nombreJugador(portero) || portero)}<strong>${fmtMin(esB ? f.minutos_cs_b : f.minutos_cs_a)} MIN</strong></span>`
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

  return `
    <article class="match reveal">
      ${equipoLado(a, 'match-team a')}
      ${marcador}
      ${equipoLado(b, 'match-team b')}
      <div class="match-meta">${meta}${enlace}</div>
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
      <span class="rank-nom">${insignia}${esc(j.nombre)}<small>${esc(j.equipo)}</small></span>
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
    .sort((a, b) => fechaHora(a) - fechaHora(b));
}

function pintarResultadosInicio() {
  const caja = $('#resLista');
  if (!caja) return;
  const todos = jugadosOrdenados('all');
  const lista = todos.slice(0, 6);
  caja.innerHTML = lista.length
    ? lista.map((f) => filaPartido(f)).join('')
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
        <td>${esc(j.nombre)}${j.dorsal ? ` <span style="color:var(--texto-tenue)">#${esc(j.dorsal)}</span>` : ''}</td>
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
  'OWNER': { grupo: 'owners', etiqueta: "OWNER'S" },
  'FUNDADOR': { grupo: 'owners', etiqueta: "OWNER'S" },
  'FUNDADORA': { grupo: 'owners', etiqueta: "OWNER'S" },
  'MASTER': { grupo: 'staff', etiqueta: 'STAFF' },
  'STAFF': { grupo: 'staff', etiqueta: 'STAFF' },
  'COACH': { grupo: 'staff', etiqueta: 'STAFF' },
  'MOD': { grupo: 'staff', etiqueta: 'STAFF' },
  'DESARROLLADOR': { grupo: 'dev', etiqueta: 'DESARROLLADOR' }
};
const GRUPOS_EQUIPO = [
  { clave: 'owners', titulo: "Owner's", color: '#FFD86B' },
  { clave: 'staff', titulo: 'Staff', color: '#0AFFD6' },
  { clave: 'dev', titulo: 'Desarrollador', color: '#FF4D9D' }
];
function infoRol(rol) {
  return ROLES_INFO[String(rol || 'STAFF').toUpperCase()] || { grupo: 'staff', etiqueta: 'STAFF' };
}
function pintarEquipo() {
  const caja = $('#equipoGrid');
  if (!caja) return;
  const items = cont('equipo');
  if (!items.length) { caja.innerHTML = vacio('Equipo no publicado.'); return; }
  const porGrupo = { owners: [], staff: [], dev: [] };
  items.forEach((p) => { porGrupo[infoRol(p.dato_extra).grupo].push(p); });
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
  const user = p.subtitulo ? `<p class="staff-user">Discord &middot; @${esc(p.subtitulo)}</p>` : '';
  const texto = p.texto ? `<p class="staff-texto">${esc(p.texto)}</p>` : '';
  return `<article class="staff-card ${info.grupo} reveal">
    <div class="staff-avatar">${foto}</div>
    <span class="staff-rol">${esc(info.etiqueta)}</span>
    <h4>${esc(p.titulo)}</h4>
    ${user}${texto}
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
  if (d.ticket) return { modo: 'ticket', valor: 'https://discord.gg/6K7nezXhx6' };
  const copiar = String(d.copiar || '').trim();
  if (copiar) return { modo: 'datos', valor: copiar, datos: Array.isArray(d.datos) ? d.datos : [] };
  return { modo: 'proximamente', valor: '' };
}

/* Dibuja la lista de datos (etiqueta/valor) de un metodo. */
function bloqueDatos(datos) {
  return '<div class="donacion-detalle-lista">' + datos.map((x) => (
    '<div class="donacion-det-item">'
    + `<span class="donacion-det-label">${esc(x.etiqueta || '')}</span>`
    + `<span class="donacion-det-valor">${esc(x.valor || '')}</span>`
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

function abrirDonacion(id) {
  const d = DONACION_ACTUAL[String(id)];
  const modal = $('#donacionModal');
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
  } else if (DONACION_SEL.modo === 'datos') {
    const datos = DONACION_SEL.datos.length
      ? DONACION_SEL.datos
      : [{ etiqueta: 'Dato para donar', valor: DONACION_SEL.valor }];
    if (detalle) detalle.innerHTML = bloqueDatos(datos)
      + `<button class="donacion-copiar" type="button" data-copiar="${esc(DONACION_SEL.valor)}">COPIAR DATOS</button>`;
    if (btn) { btn.href = '#'; btn.classList.remove('is-off'); }
    if (btnTxt) btnTxt.textContent = 'DONAR (COPIAR DATOS)';
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
        copiar.textContent = 'COPIADO';
        setTimeout(() => { copiar.textContent = 'COPIAR DATOS'; }, 1700);
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
          ev.preventDefault();
          copiarTexto(DONACION_SEL.valor);
          toast('Datos copiados. Envia la captura al Discord.');
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

  const involucra = (f) => f.equipo_a_id === id || f.equipo_b_id === id;
  const jugados = DATOS.fechas.filter((f) => f.jugado && involucra(f))
    .sort((a, b) => fechaHora(b) - fechaHora(a));
  const proximos = DATOS.fechas.filter((f) => !f.jugado && involucra(f))
    .sort((a, b) => fechaHora(a) - fechaHora(b));

  pintarFechas('#eqResultados', jugados, { vacio: 'Este equipo todavia no tiene resultados.' });
  pintarFechas('#eqProximos', proximos, { compacto: true, detalle: false, vacio: 'No hay partidos programados.' });

  const plantilla = $('#eqPlantilla');
  if (plantilla) {
    const jugadores = (eq.jugadores || []).slice().sort((a, b) =>
      (a.dorsal ?? 999) - (b.dorsal ?? 999) || a.nombre.localeCompare(b.nombre));
    plantilla.innerHTML = jugadores.length
      ? jugadores.map((j) => `
        <div class="jugador-fila">
          <span class="jugador-num">${esc(j.dorsal ?? '-')}</span>
          <span class="jugador-nom">${esc(j.nombre)}</span>
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






