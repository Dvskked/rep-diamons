/* =====================================================================
   THE DIAMONDS LEAGUE - Frontend publico (render por pagina)
   (c) 2026 Neptunzinho. Todos los derechos reservados.
   Uso y redistribucion prohibidos sin autorizacion del autor.
   ===================================================================== */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const DATOS = { modulos: [], contenidos: {}, equipos: [], fechas: [], ideales: [], foro: [] };

/* Estado de la seccion LIGA (division seleccionada + vista activa) */
const LIGA = { division: 'D1', vista: 'posiciones' };

/* Estado de INICIO (filtro de resultados + ranking lateral) */
const INICIO = { filtro: 'all', ranking: 'goles' };

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
        const cls = a.dataset.nav === 'donacion' ? ' class="nav-donar"'
          : a.dataset.nav === 'shop' ? ' class="nav-shop"' : '';
        return `<a href="${esc(a.getAttribute('href'))}"${cls}>${esc(a.textContent)}</a>`;
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

function escudoMini(eq) {
  if (!eq) return '';
  const color = esc(eq.color || '');
  if (eq.escudo) {
    return `<span class="escudo-mini" style="--eq:${color}"><img src="/static/${esc(eq.escudo)}" alt="" loading="lazy"></span>`;
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
    const goles = (f.goleadores || []).map((g) =>
      `${esc(g.nombre || g.jugador)} (${g.equipo === 'b' ? b.sigla || b.nombre : a.sigla || a.nombre}) x${num(g.goles) || 1}`).join(' · ');
    const asist = (f.asistencias || []).map((x) => esc(x.nombre || x.jugador)).join(' · ');
    const tags = [];
    if (num(f.cs_a) > 0) tags.push(`CS ${esc(a.sigla || a.nombre)}`);
    if (num(f.cs_b) > 0) tags.push(`CS ${esc(b.sigla || b.nombre)}`);
    if (goles || asist || tags.length) {
      detalle = `<div class="match-detalle">
        ${goles ? `Goles: <b>${goles}</b>` : ''}
        ${asist ? `<br>Asistencias: ${asist}` : ''}
        ${tags.length ? `<div class="partido-tags">${tags.map((t) => `<span>${t}</span>`).join('')}</div>` : ''}
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
  const escudo = eq.escudo
    ? `<img src="/static/${esc(eq.escudo)}" alt="Escudo de ${esc(eq.nombre)}" loading="lazy">`
    : iniciales(eq.sigla);

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
        ${num(j.cs) ? `<i title="Clean sheets">${num(j.cs)}CS</i>` : ''}
      </span>
    </div>`).join('') || '<p class="partido-detalle">Sin jugadores registrados.</p>';

  return `
    <article class="equipo-card reveal" style="--eq:${esc(color)}">
      <a class="equipo-topo" href="/equipos/${eq.id}">
        <div class="escudo">${escudo}</div>
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
      goles: num(j.goles), asistencias: num(j.asistencias), cs: num(j.cs),
      equipo: e.nombre, color: e.color, escudo: e.escudo, division: e.division
    }));
  });
  return lista;
}

function filaRanking(j, i, campo) {
  const insignia = j.escudo
    ? `<span class="equipo-punto escudo-logo"><img src="/static/${esc(j.escudo)}" alt="" loading="lazy"></span>`
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
  const todos = jugadosOrdenados(INICIO.filtro);
  const lista = todos.slice(0, 6);
  caja.innerHTML = lista.length
    ? lista.map((f) => filaPartido(f)).join('')
    : vacio(INICIO.filtro === 'D1' || INICIO.filtro === 'D2'
        ? `Todavia no hay resultados en la Division ${INICIO.filtro.slice(1)}.`
        : 'Todavia no hay resultados.');

  const nota = $('#resNota');
  if (nota) {
    nota.textContent = lista.length
      ? `Mostrando ${lista.length} de ${todos.length} partidos jugados.`
      : (INICIO.filtro === 'D1' || INICIO.filtro === 'D2'
          ? `Ningun partido jugado en la Division ${INICIO.filtro.slice(1)} por ahora.`
          : '');
  }
}

function pintarFiltroResultados() {
  const caja = $('#resFiltro');
  if (!caja) return;
  const opciones = [['all', 'Todos'], ['D1', 'Division 1'], ['D2', 'Division 2']];
  caja.innerHTML = opciones.map(([v, t]) =>
    `<button class="chip${INICIO.filtro === v ? ' activa' : ''}" type="button" data-filtro="${v}">${t}</button>`).join('');
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

  const fechas = fechasDivision(LIGA.division).sort((a, b) => fechaHora(a) - fechaHora(b));
  pintarFechas('#ligaCalendario', fechas, { vacio: `Todavia no hay fechas en la Division ${LIGA.division}.` });

  const grid = $('#equiposGrid');
  if (grid) {
    const lista = equiposDivision(LIGA.division);
    grid.innerHTML = lista.map(tarjetaEquipo).join('') || vacio(`Sin equipos en Division ${LIGA.division}.`);
  }

  pintarX5();
  revelar();
}

/* ------------------------------------------------------- PAGINA ESTADISTICAS */
function pintarStats() {
  const cuerpo = $('#tablaJugadores tbody');
  if (!cuerpo) return;

  const buscar = STATS.buscar.trim().toLowerCase();
  let filas = jugadoresTodos(STATS.division).filter((j) =>
    !buscar || j.nombre.toLowerCase().includes(buscar) || j.equipo.toLowerCase().includes(buscar));

  const campo = STATS.orden, dir = STATS.dir === 'asc' ? 1 : -1;
  filas = filas.slice().sort((a, b) => dir * (a[campo] - b[campo]) || a.nombre.localeCompare(b.nombre));

  cuerpo.innerHTML = filas.map((j, i) => {
    const insignia = j.escudo
      ? `<span class="escudo-mini cond-logo"><img src="/static/${esc(j.escudo)}" alt="" loading="lazy"></span>`
      : `<i class="equipo-punto" style="background:${esc(j.color || 'var(--cian)')}"></i>`;
    return `
    <tr>
      <td class="pos">${i + 1}</td>
      <td>${esc(j.nombre)}${j.dorsal ? ` <span style="color:var(--texto-tenue)">#${esc(j.dorsal)}</span>` : ''}</td>
      <td><span class="eq">${insignia}<span>${esc(j.equipo)}</span></span></td>
      <td>${esc(j.division)}</td>
      <td>${j.goles}</td><td>${j.asistencias}</td><td>${j.cs}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="7">${vacio('Sin jugadores que coincidan.')}</td></tr>`;

  const nota = $('#statNota');
  if (nota) nota.textContent = `${filas.length} jugadores`;

  $$('#tablaJugadores th.ord').forEach((th) => {
    th.classList.toggle('asc', th.dataset.orden === campo && STATS.dir === 'asc');
    th.classList.toggle('desc', th.dataset.orden === campo && STATS.dir === 'desc');
  });

  listaRanking('#listaGoles', 'goles', STATS.division);
  listaRanking('#listaAsistencias', 'asistencias', STATS.division);
  listaRanking('#listaCs', 'cs', STATS.division);
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
  const malla = $('#museoGrid');
  const filtros = $('#museoFiltros');
  if (!malla) return;
  const items = cont('museo');
  const iconos = { PREMIOS: '🏆', RANKINGS: '📊', CAMPEONES: '👑' };

  const pintar = (cat) => {
    malla.innerHTML = items.filter((i) => cat === 'TODO' || i.categoria === cat).map((i) => `
      <article class="museo-card reveal">
        <div class="icono">${iconos[i.categoria] || '🏅'}</div>
        <small>${esc(i.categoria || 'PREMIO')}</small>
        <strong>${esc(i.titulo)}</strong>
        <p>${esc(i.subtitulo || '')}</p>
        ${i.texto ? `<p style="margin-top:6px">${esc(i.texto)}</p>` : ''}
      </article>`).join('') || vacio('Sin premios en esta categoria.');
    revelar();
  };

  if (filtros) {
    const cats = Array.from(new Set(items.map((i) => i.categoria).filter(Boolean)));
    filtros.innerHTML = ['TODO', ...cats].map((c, i) =>
      `<button class="chip${i === 0 ? ' activa' : ''}" type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    filtros.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-cat]');
      if (!btn) return;
      $$('#museoFiltros .chip').forEach((b) => b.classList.remove('activa'));
      btn.classList.add('activa');
      pintar(btn.dataset.cat);
    });
  }
  pintar('TODO');
}

/* --------------------------------------------------------- NOTICIAS */
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
function pintarEquipo() {
  const caja = $('#equipoGrid');
  if (!caja) return;
  const iconos = {
    OWNER: '👑', FUNDADOR: '👑', FUNDADORA: '👑', DESARROLLADOR: '💻',
    MASTER: '🛡️', COACH: '📋', STAFF: '🎬'
  };
  caja.innerHTML = cont('equipo').map((p) => {
    const rol = (p.dato_extra || 'STAFF').toUpperCase();
    const foto = p.imagen
      ? `<img src="/static/${esc(p.imagen)}" alt="${esc(p.titulo)}" loading="lazy" decoding="async">`
      : iniciales(p.titulo);
    return `
      <article class="staff-card reveal ${rol === 'DESARROLLADOR' ? 'dev' : ''}">
        <div class="staff-avatar">${foto}</div>
        <span class="staff-rol">${iconos[rol] || '🛡️'} ${esc(rol)}</span>
        <h4>${esc(p.titulo)}</h4>
        ${p.subtitulo ? `<p class="staff-user">Discord · @${esc(p.subtitulo)}</p>` : ''}
        <p>${esc(p.texto || '')}</p>
      </article>`;
  }).join('') || vacio('Equipo no publicado.');
}

/* ----------------------------------------------------------- REDES */
function pintarRedes() {
  const caja = $('#redesGrid');
  if (!caja) return;
  caja.innerHTML = cont('redes').map((r) => {
    const inner = `
      <strong>${esc(r.titulo)}</strong>
      ${r.subtitulo ? `<span class="user">@${esc(r.subtitulo)}</span>` : ''}
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
    cajaEscudo.style.setProperty('--eq', eq.color || 'var(--cian)');
    cajaEscudo.innerHTML = eq.escudo
      ? `<img src="/static/${esc(eq.escudo)}" alt="Escudo de ${esc(eq.nombre)}">`
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

/* ---------------------------------------------- SHOP (PROXIMAMENTE) */
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-nav="shop"], a.nav-shop');
  if (!btn) return;
  ev.preventDefault();
  toast('La tienda se inaugura pronto. Estate atento en el Discord!');
});

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
      pintarLiga();
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
  const filtro = $('#resFiltro');
  if (filtro) {
    filtro.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-filtro]');
      if (!btn) return;
      INICIO.filtro = btn.dataset.filtro;
      pintarFiltroResultados();
      pintarResultadosInicio();
    });
  }
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
  const div = $('#statDivision');
  if (div) {
    div.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-division]');
      if (!btn) return;
      STATS.division = btn.dataset.division;
      $$('#statDivision .chip').forEach((b) => b.classList.toggle('activa', b === btn));
      pintarStats();
    });
  }
  const buscar = $('#statBuscar');
  if (buscar) {
    buscar.addEventListener('input', () => { STATS.buscar = buscar.value; pintarStats(); });
  }
  $$('#tablaJugadores th.ord').forEach((th) => {
    th.addEventListener('click', () => {
      const campo = th.dataset.orden;
      if (STATS.orden === campo) STATS.dir = STATS.dir === 'asc' ? 'desc' : 'asc';
      else { STATS.orden = campo; STATS.dir = 'desc'; }
      pintarStats();
    });
  });
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
      pintarFiltroResultados();
      pintarResultadosInicio();
      pintarFechas('#porJugar', pendientesOrdenados('all').slice(0, 5), { compacto: true, detalle: false, vacio: 'No hay partidos programados.' });
      pintarLideres();
      pintarMuseo();
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
