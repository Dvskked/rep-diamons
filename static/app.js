/* =====================================================================
   THE DIAMONDS LEAGUE - Frontend publico (render por pagina)
   (c) 2026 Neptunzinho. Todos los derechos reservados.
   Uso y redistribucion prohibidos sin autorizacion del autor.
   ===================================================================== */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const DATOS = { modulos: [], contenidos: {}, equipos: [], fechas: [], ideales: [], foro: [] };

/* Estado de la seccion LIGA (division seleccionada + vista activa + jornada) */
const LIGA = { division: 'D1', vista: 'posiciones', jornada: '' };

/* Estado de INICIO (ranking lateral) */
const INICIO = { ranking: 'goles' };

/* Estado de ESTADISTICAS (filtro + busqueda + orden) */
const STATS = { division: 'all', buscar: '', orden: 'goles', dir: 'desc' };

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

async function pedir(url, opciones = {}) {
  const r = await fetch(url, { credentials: 'same-origin', ...opciones });
  let json = {};
  try { json = await r.json(); } catch (e) { /* respuesta sin cuerpo */ }
  if (!r.ok) throw new Error(json.error || 'Error ' + r.status);
  return json;
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
    mm.innerHTML = enlaces + '<a href="/admin">Administrar</a>';
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
  const jugados = partidos.filter((f) => f.jugado).length;
  const nota = $('#calNota');
  if (nota) {
    nota.textContent = `${partidos.length} partidos · ${jugados} jugados · Division ${LIGA.division}`;
  }

  caja.innerHTML = `<section class="jornada-grupo reveal">
      <div class="jornada-partidos">${partidos.map((f) => filaPartido(f)).join('')}</div>
    </section>`;
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
    ? `<a class="${clase}" href="/equipos/${eq.id}">${inner}</a>`
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
      <a class="equipo-topo" href="/equipos/${eq.id}">
        <div class="${escudoClase}">${escudo}</div>
        <div class="equipo-nombre">
          <h4>${esc(eq.nombre)}</h4>
          <small>${esc(eq.sigla)}</small>
        </div>
      </a>
      <div class="equipo-meta">${meta}</div>
      ${jugadores}
      <a class="link-btn" href="/equipos/${eq.id}">VER EQUIPO</a>
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
      <td><a class="eq" href="/equipos/${f.eq.id}">${escudoMini(f.eq)}${esc(f.eq.nombre)}</a></td>
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

  const chip = (f) => {
    const a = porId(f.equipo_a_id) || { sigla: f.sigla_a, nombre: f.equipo_a };
    const b = porId(f.equipo_b_id) || { sigla: f.sigla_b, nombre: f.equipo_b };
    return `<span class="result-chip"><span class="sig">${esc(a.sigla || a.nombre)}</span> <b>${num(f.goles_a)} - ${num(f.goles_b)}</b> <span class="sig">${esc(b.sigla || b.nombre)}</span></span>`;
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
      <a class="mini-team" href="/equipos/${f.eq.id}">
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

/* ---------------------------------------------------------- X5 IDEAL */
function jornadasIdeal(div = LIGA.division) {
  const lista = DATOS.ideales.filter((i) => i.division === div);
  return Array.from(new Set(lista.map((i) => i.jornada)));
}

function pintarX5() {
  const sel = $('#x5Jornada');
  const caja = $('#x5Cancha');
  if (!sel || !caja) return;

  const jornadas = jornadasIdeal(LIGA.division);
  const actual = jornadas.includes(sel.value) ? sel.value : (jornadas[0] || '');
  sel.innerHTML = jornadas.length
    ? jornadas.map((j) => `<option value="${esc(j)}"${j === actual ? ' selected' : ''}>${esc(j)}</option>`).join('')
    : '<option value="">SIN JORNADAS</option>';
  sel.disabled = !jornadas.length;
  pintarX5Cancha();
}

function pintarX5Cancha() {
  const caja = $('#x5Cancha');
  const sel = $('#x5Jornada');
  if (!caja || !sel) return;
  const jornada = sel.value;
  const slots = DATOS.ideales
    .filter((i) => i.division === LIGA.division && i.jornada === jornada)
    .sort((a, b) => a.orden - b.orden);

  if (!slots.length) {
    caja.innerHTML = vacio(`El staff todavia no eligio el cinco ideal de ${LIGA.division}.`);
    return;
  }

  caja.innerHTML = slots.map((s) => `
    <div class="x5-slot reveal" style="--eq:${esc(s.equipo_color || 'var(--cian)')}">
      <span class="x5-pos">${esc(s.posicion || '')}</span>
      <span class="x5-avatar">${iniciales(s.jugador)}</span>
      <span class="x5-datos">
        <strong>${esc(s.jugador)}</strong>
        <small><i class="equipo-punto" style="background:${esc(s.equipo_color || 'var(--cian)')}"></i>${esc(s.equipo || '')} · ${esc(s.dorsal || '--')}</small>
      </span>
      <span class="x5-orden">${s.orden}</span>
    </div>`).join('');
}

/* ------------------------------------------------------------- PAGINA LIGA */
function mostrarVista(vista) {
  LIGA.vista = vista;
  $$('#ligaVista .chip').forEach((b) => b.classList.toggle('activa', b.dataset.vista === vista));
  $$('.panel-panel').forEach((p) => p.classList.toggle('activo', p.dataset.panel === vista));
  revelar();
}

function pintarLiga() {
  $$('#ligaDivision .chip').forEach((b) => b.classList.toggle('activa', b.dataset.division === LIGA.division));

  pintarTablaPosiciones();
  pintarCalendario();

  const grid = $('#equiposGrid');
  if (grid) {
    const lista = equiposDivision(LIGA.division);
    grid.innerHTML = lista.map(tarjetaEquipo).join('') || vacio(`Sin equipos en Division ${LIGA.division}.`);
  }

  pintarX5();
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
function pintarMuseo() {
  const caja = $('#museoGrid');
  if (!caja) return;
  const items = cont('museo');
  const filtrosBox = $('#museoFiltros');
  if (filtrosBox) {
    const cats = new Set(['TODO']);
    items.forEach((m) => { if (m.categoria) cats.add(m.categoria); });
    const orden = ['TODO', 'PREMIOS D1', 'PREMIOS D2', 'RANKINGS D1', 'RANKINGS D2', 'CAMPEONES'];
    filtrosBox.innerHTML = Array.from(cats)
      .sort((a, b) => {
        const ia = orden.indexOf(a), ib = orden.indexOf(b);
        if (ia < 0 && ib < 0) return a.localeCompare(b);
        if (ia < 0) return 1;
        if (ib < 0) return -1;
        return ia - ib;
      })
      .map((c) => `<button type="button" class="chip filtro${c === 'TODO' ? ' activa activo' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`)
      .join('');
    filtrosBox.onclick = (ev) => {
      const btn = ev.target.closest('[data-cat]');
      if (!btn) return;
      filtrosBox.querySelectorAll('.filtro').forEach((x) => x.classList.remove('activa', 'activo'));
      btn.classList.add('activa', 'activo');
      pintarMuseoFiltrado(btn.dataset.cat);
    };
  }
  pintarMuseoFiltrado('TODO');
}

function pintarMuseoFiltrado(filtro) {
  const caja = $('#museoGrid');
  if (!caja) return;
  let items = cont('museo');
  if (filtro && filtro !== 'TODO') {
    items = items.filter((m) => (m.categoria || '') === filtro);
  }
  items = items.slice().sort((a, b) =>
    (num(a.orden) - num(b.orden)) || (a.titulo || '').localeCompare(b.titulo || ''));
  const nota = $('#museoNota');
  if (nota) nota.textContent = items.length
    ? `${items.length} ${items.length === 1 ? 'pieza' : 'piezas'} en exhibicion` : '';
  if (!items.length) { caja.innerHTML = vacio('No hay elementos en el museo.'); return; }
  caja.innerHTML = items.map((i) => {
    let img = imagenMuseo(i) || '';
    if (img && !img.startsWith('assets/') && !img.startsWith('http')) img = 'assets/' + img;
    const respaldo = imagenMuseoLocal(i);
    const imagenHtml = img
      ? `<div class="museo-img"><img src="/static/${esc(img)}" alt="${esc(i.titulo || '')}"`
        + ` loading="lazy" decoding="async"`
        + (respaldo ? ` data-fb="${esc(respaldo)}" onerror="museoImgError(this)"` : '')
        + `></div>`
      : '';
    const tag = i.dato_extra ? `<span class="museo-tag">${esc(i.dato_extra)}</span>` : '';
    const sub = i.subtitulo ? `<p class="museo-sub">${esc(i.subtitulo)}</p>` : '';
    const txt = i.texto ? `<p class="museo-txt">${esc(i.texto)}</p>` : '';
    return `<article class="museo-card reveal ${img ? 'con-imagen' : ''}">
      ${imagenHtml}
      <div class="museo-cuerpo">${tag}<h4>${esc(i.titulo || '')}</h4>${sub}${txt}</div>
    </article>`;
  }).join('');
  revelar();
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

/* --------------------------------------------------------- ALIANZAS */
function pintarAlianzas() {
  const caja = $('#alianzasGrid');
  if (!caja) return;
  caja.innerHTML = cont('alianzas').map((a) => {
    const pendiente = (a.dato_extra || '').toUpperCase().includes('NEGOCIACION');
    const inner = `
      <div class="alianza-icon">${pendiente ? '⏳' : '🤝'}</div>
      <div>
        <strong>${esc(a.titulo)}</strong>
        <small>${esc(a.subtitulo || '')}</small>
        ${a.texto ? `<small style="display:block;margin-top:4px">${esc(a.texto)}</small>` : ''}
      </div>`;
    return a.enlace
      ? `<a class="alianza-card reveal" href="${esc(a.enlace)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="alianza-card reveal ${pendiente ? 'pendiente' : ''}">${inner}</div>`;
  }).join('') || vacio('No hay alianzas registradas.');
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
function pintarDonacion() {
  const caja = $('#donacionGrid');
  if (!caja) return;
  const iconos = { PAYPAL: '🅿️', NEQUI: '📱', BTC: '₿', DISCORD: '💜' };
  caja.innerHTML = cont('donacion').map((d) => {
    const tipo = (d.subtitulo || '').toUpperCase();
    const logo = d.imagen
      ? `<img src="/static/${esc(d.imagen)}" alt="${esc(tipo)}" loading="lazy" decoding="async">`
      : (iconos[tipo] || '💛');
    const inner = `
      <div class="donacion-icon">${logo}</div>
      <small>${esc(d.subtitulo || 'METODO')}</small>
      <strong>${esc(d.titulo)}</strong>
      <p>${esc(d.texto || '')}</p>`;
    return d.enlace
      ? `<a class="donacion-card reveal" href="${esc(d.enlace)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="donacion-card reveal">${inner}</div>`;
  }).join('') || vacio('No hay metodos de donacion.');
}

/* ------------------------------------------------ EQUIPO (DETALLE) */
function pintarEquipoDetalle() {
  const id = num(document.body.dataset.equipo);
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

/* -------------------------------------------------------------- FORO */
function pintarForo() {
  const caja = $('#foroLista');
  if (!caja) return;
  caja.innerHTML = DATOS.foro.length
    ? DATOS.foro.map((m) => `
      <article class="mensaje">
        <div class="mensaje-avatar">${iniciales(m.nombre)}</div>
        <div>
          <div class="mensaje-cab">
            <strong>${esc(m.nombre)}</strong>
            <time>${esc(fechaLarga(m.fecha))}</time>
          </div>
          <p>${esc(m.mensaje)}</p>
        </div>
      </article>`).join('')
    : vacio('Aun no hay mensajes. Se el primero en publicar.');
}

function configForo() {
  const form = $('#foroForm');
  if (!form) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const nombre = $('#foroNombre').value.trim();
    const mensaje = $('#foroMensaje').value.trim();
    const msg = $('#foroMsg');
    msg.textContent = ''; msg.classList.remove('error');

    if (!nombre || !mensaje) {
      msg.textContent = 'Completa tu nombre y el mensaje.';
      msg.classList.add('error');
      return;
    }
    try {
      const r = await pedir('/api/foro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, mensaje })
      });
      DATOS.foro.unshift(r.mensaje);
      pintarForo();
      $('#foroNombre').value = '';
      $('#foroMensaje').value = '';
      msg.textContent = 'Mensaje publicado. Gracias!';
      toast('Mensaje publicado en el foro');
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('error');
    }
  });
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
  const vista = $('#ligaVista');
  if (vista) {
    vista.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-vista]');
      if (btn) mostrarVista(btn.dataset.vista);
    });
  }
  const sel = $('#x5Jornada');
  if (sel) sel.addEventListener('change', pintarX5Cancha);
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
      pintarAlianzas();
      pintarForo();
      configForo();
      break;
  }
  revelar();
}

/* --------------------------------------------------------------- INICIO */
async function iniciar() {
  configBotonSubir();
  configMenu();
  pintarNav();

  try {
    const r = await pedir('/api/sitio');
    Object.assign(DATOS, {
      modulos: r.modulos || [], contenidos: r.contenidos || {},
      equipos: r.equipos || [], fechas: r.fechas || [],
      ideales: r.ideales || [], foro: r.foro || []
    });

    pintarModulos();
    renderPagina(document.body.dataset.pagina || 'inicio');

    const s = await pedir('/api/sesion');
    const btn = $('#btnAdmin');
    if (s.autenticado && btn) {
      btn.textContent = 'IR AL PANEL';
    }
  } catch (err) {
    console.error(err);
    mostrarErrorBaseDatos();
  } finally {
    revelar();
    requestAnimationFrame(ocultarPreloader);
  }
}

/* ------------------------------------------- ERROR DE BASE DE DATOS */
function mostrarErrorBaseDatos() {
  if ($('#falloPantalla')) return;
  const caja = document.createElement('div');
  caja.id = 'falloPantalla';
  caja.className = 'fallo-pantalla';
  caja.setAttribute('role', 'alert');
  caja.innerHTML = `
    <span class="fallo-cancha" aria-hidden="true"></span>
    <div class="fallo-card reveal visible">
      <span class="fallo-logo">
        <img src="/static/assets/logo-128.webp" width="84" height="84" alt="">
        <span class="fallo-anillo"></span>
      </span>
      <span class="fallo-tag">SIN SERVICIO</span>
      <h1>La pagina esta caida</h1>
      <p>No se pudo conectar con la base de datos. Podemos estar de mantenimiento o el servidor tuvo un
        problema temporal.</p>
      <div class="fallo-acciones">
        <button class="btn btn-primary big" type="button" data-fallo-reintentar>REINTENTAR</button>
        <button class="btn btn-soft big" type="button" data-fallo-puede>ENTENDIDO</button>
      </div>
      <small>Si seguis viendo este mensaje, recarga con <b>Ctrl + R</b> o avisanos por el Discord.</small>
    </div>`;
  document.body.appendChild(caja);

  caja.querySelector('[data-fallo-reintentar]').addEventListener('click', () => location.reload());
  caja.querySelector('[data-fallo-puede]').addEventListener('click', () => caja.remove());
}

document.addEventListener('DOMContentLoaded', iniciar);






