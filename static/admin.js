/* =====================================================================
   THE DIAMONDS LEAGUE - Panel administrativo
   (c) 2026 Neptunzinho. Todos los derechos reservados.
   Uso y redistribucion prohibidos sin autorizacion del autor.
   ===================================================================== */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

const ESTADO = { equipos: [], fechas: [], contenidos: [], modulos: [], foro: [] };

/* ------------------------------------------------ PANTALLA DE CARGA */
function ocultarPreloader() {
  const p = document.getElementById('preloader');
  document.body.classList.remove('carga-activa');
  if (!p) return;
  p.classList.add('fuera');
  setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 500);
}
setTimeout(ocultarPreloader, 8000);

const esc = (t) => String(t ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fechaCorta = (f) => {
  if (!f) return '';
  const d = new Date(String(f).replace(' ', 'T'));
  return isNaN(d) ? esc(f) : d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ------------------------------------------------------------- RED */
async function api(url, opciones = {}) {
  const r = await fetch(url, { credentials: 'same-origin', ...opciones });
  if (r.status === 401) { window.location.href = '/admin'; throw new Error('Sesion expirada'); }
  let j = {};
  try { j = await r.json(); } catch (e) { /* sin cuerpo */ }
  if (!r.ok) throw new Error(j.error || 'Error ' + r.status);
  return j;
}

const get  = (u) => api(u);
const post = (u, d) => api(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
const put  = (u, d) => api(u, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
const del  = (u) => api(u, { method: 'DELETE' });

function toast(txt) {
  const t = $('#toast');
  $('p', t).textContent = txt;
  t.classList.add('ver');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('ver'), 3200);
}

function confirmar(texto, alConfirmar) {
  const m = $('#confirmModal');
  $('#confirmTexto').textContent = texto;
  m.classList.add('abierto');
  $('#confirmSi').onclick = async () => {
    m.classList.remove('abierto');
    await alConfirmar();
  };
  $('#confirmNo').onclick = () => m.classList.remove('abierto');
}

/* ------------------------------------------------------------- TABS */
const TABS = {
  resumen:    ['Resumen', 'Vista general del contenido de la liga.'],
  equipos:    ['Equipos', 'Agrega equipos, escudos, entrenadores y jugadores.'],
  fechas:     ['Fechas', 'Programa los partidos y el calendario.'],
  resultados: ['Resultados', 'Goles, asistencias y clean sheets por equipo.'],
  anuncios:   ['Anuncios', 'Gestiona anuncios, noticias, premios y enlaces.'],
  contenido:  ['Contenido', 'Todos los modulos de la pagina en un solo lugar.'],
  modulos:    ['Modulos', 'Los botones del header y sus titulos.'],
  foro:       ['Foro', 'Mensajes y sugerencias de la comunidad.']
};

/* ------------------------------------------------- MENU LATERAL MOVIL */
const sidebar = $('#sidebar');
const overlay = $('#sideOverlay');
const btnMenu = $('#btnMenu');

function abrirMenu() {
  sidebar.classList.add('abierta');
  overlay.classList.add('visible');
  btnMenu.setAttribute('aria-expanded', 'true');
}
function cerrarMenu() {
  sidebar.classList.remove('abierta');
  overlay.classList.remove('visible');
  btnMenu.setAttribute('aria-expanded', 'false');
}
if (btnMenu) btnMenu.addEventListener('click', () =>
  sidebar.classList.contains('abierta') ? cerrarMenu() : abrirMenu());
if (overlay) overlay.addEventListener('click', cerrarMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });

function irATab(tab) {
  $$('.side-item').forEach((b) => b.classList.toggle('activo', b.dataset.tab === tab));
  $$('.tab-panel').forEach((p) => p.classList.toggle('activo', p.dataset.panel === tab));
  $('#tabTitulo').textContent = TABS[tab][0];
  $('#tabTexto').textContent = TABS[tab][1];
  if (tab === 'resumen') cargarResumen();
  if (tab === 'fechas' || tab === 'resultados') cargarFechas();
  if (tab === 'anuncios') cargarContenidos();
  if (tab === 'contenido') cargarContenidoTodo();
  if (tab === 'modulos') cargarModulos();
  if (tab === 'foro') cargarForo();
  cerrarMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$$('.side-item').forEach((btn) => {
  btn.addEventListener('click', () => irATab(btn.dataset.tab));
});

/* ---------------------------------------------------------- RESUMEN */
async function cargarResumen() {
  const s = await get('/api/sitio');
  ESTADO.equipos = s.equipos || [];
  ESTADO.foro = s.foro || [];

  const jugados = (s.fechas || []).filter((f) => f.jugado).length;
  const proximos = (s.fechas || []).filter((f) => !f.jugado).slice(0, 5);
  const totalCont = Object.values(s.contenidos || {}).reduce((a, b) => a + b.length, 0);

  $('#kpis').innerHTML = [
    ['EQUIPOS', ESTADO.equipos.length, ''],
    ['PARTIDOS JUGADOS', jugados, ''],
    ['PENDIENTES', (s.fechas || []).length - jugados, 'lav'],
    ['PUBLICACIONES', totalCont, 'lav']
  ].map(([t, v, c]) => `<div class="kpi ${c}"><small>${t}</small><strong>${v}</strong></div>`).join('');

  $('#resumenForo').innerHTML = ESTADO.foro.slice(0, 4).map((m) => `
    <div class="mini-fila">
      <strong>${esc(m.nombre)}</strong>
      <small>${esc(String(m.mensaje).slice(0, 90))} · ${fechaCorta(m.fecha)}</small>
    </div>`).join('') || '<div class="vacio-mini">Sin mensajes.</div>';

  $('#resumenPartidos').innerHTML = proximos.length ? proximos.map((f) => `
    <div class="mini-fila">
      <strong>${esc(f.equipo_a)} vs ${esc(f.equipo_b)}</strong>
      <small>${fechaCorta(f.fecha)} · ${esc(f.jornada || '')}</small>
    </div>`).join('') : '<div class="vacio-mini">No hay partidos pendientes.</div>';
}

/* ---------------------------------------------------------- EQUIPOS */
async function cargarEquipos() {
  const r = await get('/api/admin/equipos');
  ESTADO.equipos = r.equipos || [];
  llenarSelectEquipos();

  $('#listaEquipos').innerHTML = ESTADO.equipos.map((e) => `
    <div class="fila principal">
      <div class="escudo" style="width:46px;height:46px;font-size:.9rem">
        ${e.escudo ? `<img src="/static/${esc(e.escudo)}" alt="">` : esc(e.sigla.charAt(0))}
      </div>
      <div class="fila-info">
        <strong>${esc(e.nombre)} <span class="fila-dato">${esc(e.division)}</span></strong>
        <small>Sigla ${esc(e.sigla)} · DT. ${esc(e.entrenador || 'sin entrenador')} · ${esc(e.ciudad || 'sin ciudad')}</small>
      </div>
      <div class="fila-acciones">
        <button class="btn-ico" data-add-jugador="${e.id}">+ JUGADOR</button>
        <button class="btn-ico" data-edit-equipo="${e.id}">EDITAR</button>
        <button class="btn-ico peligro" data-del-equipo="${e.id}">ELIMINAR</button>
      </div>
      <div class="fila-jugadores">
        ${(e.jugadores || []).map((j) => `
          <div class="jug-chip">
            <b>${j.numero ?? '-'}</b>
            <span>${esc(j.nombre)}</span>
            <small>${esc(j.posicion || '')}</small>
            <button class="btn-ico peligro" data-del-jugador="${j.id}">QUITAR</button>
          </div>`).join('')
          || '<div class="vacio-mini">Sin jugadores. Usa "+ JUGADOR" para agregar.</div>'}
        <form class="form-grid form-jugador" data-form-jugador="${e.id}">
          <label>Nombre <input name="nombre" required maxlength="80" placeholder="Nombre del jugador"></label>
          <label>Numero <input name="numero" type="number" min="1" max="99"></label>
          <label>Posicion
            <select name="posicion">
              <option>Titular</option><option>Portero</option><option>Suplente</option>
            </select>
          </label>
          <button class="btn btn-primary" type="submit">AGREGAR</button>
        </form>
      </div>
    </div>`).join('') || '<div class="vacio-mini">No hay equipos. Crea el primero.</div>';
}

function llenarSelectEquipos() {
  const opciones = ESTADO.equipos.map((e) =>
    `<option value="${e.id}">${esc(e.nombre)} (${esc(e.sigla)})</option>`).join('');
  ['equipo_a_id', 'equipo_b_id'].forEach((n) => {
    const s = $(`[name="${n}"]`);
    if (s) s.innerHTML = opciones;
  });
  if (!$('#selFecha').options.length) actualizarSelectFechas();
}

$('#formEquipo').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const fd = new FormData(f);
  try {
    await api('/api/admin/equipos', { method: 'POST', body: fd });
    f.reset();
    await cargarEquipos();
    toast('Equipo guardado');
  } catch (e) { toast(e.message); }
});

$('#listaEquipos').addEventListener('click', async (ev) => {
  const addJ = ev.target.closest('[data-add-jugador]');
  if (addJ) {
    const fila = addJ.closest('.fila').querySelector('[data-form-jugador] input[name=nombre]');
    fila.focus();
    fila.closest('form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const delJ = ev.target.closest('[data-del-jugador]');
  if (delJ) {
    confirmar('Quitar este jugador de la lista?', async () => {
      await del(`/api/admin/jugadores/${delJ.dataset.delJugador}`);
      await cargarEquipos();
      toast('Jugador eliminado');
    });
    return;
  }

  const delE = ev.target.closest('[data-del-equipo]');
  if (delE) {
    confirmar('Se eliminara el equipo con todos sus jugadores y partidos. Continuar?', async () => {
      await del(`/api/admin/equipos/${delE.dataset.delEquipo}`);
      await cargarEquipos();
      toast('Equipo eliminado');
    });
    return;
  }

  const edE = ev.target.closest('[data-edit-equipo]');
  if (edE) {
    const eq = ESTADO.equipos.find((x) => x.id == edE.dataset.editEquipo);
    const nombre = prompt('Nombre del equipo:', eq.nombre);
    if (nombre === null) return;
    const siglas = prompt('Sigla:', eq.sigla);
    if (siglas === null) return;
    const dt = prompt('Entrenador:', eq.entrenador || '');
    if (dt === null) return;
    const div = prompt('Division (D1 o D2):', eq.division);
    if (div === null) return;
    await put(`/api/admin/equipos/${eq.id}`, {
      nombre, sigla: siglas, division: div, entrenador: dt,
      ciudad: eq.ciudad, fundado: eq.fundado, escudo: eq.escudo
    });
    await cargarEquipos();
    toast('Equipo actualizado');
  }
});

$('#listaEquipos').addEventListener('submit', async (ev) => {
  const form = ev.target.closest('[data-form-jugador]');
  if (!form) return;
  ev.preventDefault();
  const fd = new FormData(form);
  fd.append('equipo_id', form.dataset.formJugador);
  try {
    await api('/api/admin/jugadores', { method: 'POST', body: fd });
    form.reset();
    await cargarEquipos();
    toast('Jugador agregado');
  } catch (e) { toast(e.message); }
});

/* ----------------------------------------------------------- FECHAS */
async function cargarFechas() {
  const r = await get('/api/admin/fechas');
  ESTADO.fechas = r.fechas || [];
  actualizarSelectFechas();

  $('#listaFechas').innerHTML = ESTADO.fechas.length ? ESTADO.fechas.map((f) => `
    <div class="fila ${f.goles_a === null ? '' : 'principal'}">
      <div class="fila-info">
        <strong>${esc(f.sigla_a)} vs ${esc(f.sigla_b)}</strong>
        <small>${fechaCorta(f.fecha)} ${String(f.hora || '').slice(0, 5)} · ${esc(f.jornada || '')} · ${esc(f.fase || '')}</small>
      </div>
      ${f.goles_a === null
        ? '<span class="fila-dato">PENDIENTE</span>'
        : `<span class="fila-dato">${f.goles_a} - ${f.goles_b}${(+f.cs_a || +f.cs_b) ? ' · CS' : ''}</span>`}
      <div class="fila-acciones">
        <button class="btn-ico ok" data-ir-resultado="${f.id}">RESULTADO</button>
        <button class="btn-ico" data-del-fecha="${f.id}">ELIMINAR</button>
      </div>
    </div>`).join('') : '<div class="vacio-mini">No hay fechas programadas.</div>';
}

function actualizarSelectFechas() {
  const s = $('#selFecha');
  if (!s) return;
  const previo = s.value;
  s.innerHTML = ESTADO.fechas.map((f) => `
    <option value="${f.id}">${fechaCorta(f.fecha)} · ${esc(f.sigla_a)} ${f.goles_a === null ? 'vs' : (f.goles_a + '-' + f.goles_b)} ${esc(f.sigla_b)}</option>
  `).join('') || '<option value="">Sin partidos programados</option>';
  if (previo) s.value = previo;
  mostrarInfoPartido();
}

$('#formFecha').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const d = Object.fromEntries(new FormData(ev.target));
  try {
    await post('/api/admin/fechas', d);
    ev.target.reset();
    await cargarFechas();
    toast('Fecha agregada al calendario');
  } catch (e) { toast(e.message); }
});

$('#listaFechas').addEventListener('click', async (ev) => {
  const delF = ev.target.closest('[data-del-fecha]');
  if (delF) {
    confirmar('Se eliminara la fecha y su resultado.', async () => {
      await del(`/api/admin/fechas/${delF.dataset.delFecha}`);
      await cargarFechas();
      toast('Fecha eliminada');
    });
    return;
  }
  const irR = ev.target.closest('[data-ir-resultado]');
  if (irR) {
    $('#selFecha').value = irR.dataset.irResultado;
    mostrarInfoPartido();
    irATab('resultados');
  }
});

/* -------------------------------------------------------- RESULTADOS */
function jsonLista(v) {
  if (Array.isArray(v)) return v;
  try {
    const x = JSON.parse(v || '[]');
    return Array.isArray(x) ? x : [];
  } catch (e) { return []; }
}

function mostrarInfoPartido() {
  const id = $('#selFecha').value;
  const f = ESTADO.fechas.find((x) => String(x.id) === String(id));
  $('#infoPartido').innerHTML = f
    ? `⚽ <b>${esc(f.sigla_a)} vs ${esc(f.sigla_b)}</b> · ${fechaCorta(f.fecha)} ${String(f.hora || '').slice(0, 5)}`
    : 'Selecciona un partido para registrar su resultado.';

  const form = $('#formResultado');
  if (!form || !f) return;

  const jugado = f.goles_a !== null && f.goles_a !== undefined;
  form.goles_a.value = jugado ? (+f.goles_a || 0) : 0;
  form.goles_b.value = jugado ? (+f.goles_b || 0) : 0;
  form.cs_a.value = jugado ? (+f.cs_a || 0) : 0;
  form.cs_b.value = jugado ? (+f.cs_b || 0) : 0;

  $('#listaGoleadores').innerHTML = jugado
    ? jsonLista(f.goleadores).map((g) => chipHTML('gol', 0, g)).join('') : '';
  $('#listaAsistencias').innerHTML = jugado
    ? jsonLista(f.asistencias).map((a) => chipHTML('asistencia', 0, a)).join('') : '';
}

$('#selFecha').addEventListener('change', mostrarInfoPartido);

function chipHTML(tipo, idx, item = {}) {
  const opc = (v, t) => `<option value="${v}" ${item.equipo === v ? 'selected' : ''}>${t}</option>`;
  if (tipo === 'gol') {
    return `<div class="chip" data-tipo="gol">
      <input placeholder="Jugador" name="jugador" value="${esc(item.jugador || '')}">
      <select name="equipo">${opc('a', 'Equipo A')}${opc('b', 'Equipo B')}</select>
      <input type="number" min="1" value="${item.goles || 1}" name="cantidad" title="Goles">
      <button class="chip-quitar" type="button">&times;</button>
    </div>`;
  }
  return `<div class="chip" data-tipo="asistencia">
    <input placeholder="Jugador" name="jugador" value="${esc(item.jugador || '')}">
    <select name="equipo">${opc('a', 'Equipo A')}${opc('b', 'Equipo B')}</select>
    <input type="number" min="1" value="${item.asistencias || 1}" name="cantidad" title="Asistencias">
    <button class="chip-quitar" type="button">&times;</button>
  </div>`;
}

$('#addGoleador').addEventListener('click', () => {
  $('#listaGoleadores').insertAdjacentHTML('beforeend', chipHTML('gol', 0));
});
$('#addAsistencia').addEventListener('click', () => {
  $('#listaAsistencias').insertAdjacentHTML('beforeend', chipHTML('asistencia', 0));
});

document.addEventListener('click', (ev) => {
  const q = ev.target.closest('.chip-quitar');
  if (q) q.closest('.chip').remove();
});

function leerChips(selector, tipo) {
  return $$(`${selector} .chip`).map((c) => {
    const v = (c.querySelector('[name=jugador]').value || '').trim();
    if (!v) return null;
    const cantidad = parseInt(c.querySelector('[name=cantidad]').value || '1', 10);
    const equipo = c.querySelector('[name=equipo]').value;
    return tipo === 'gol'
      ? { jugador: v, equipo, goles: cantidad }
      : { jugador: v, equipo, asistencias: cantidad };
  }).filter(Boolean);
}

$('#formResultado').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const d = Object.fromEntries(new FormData(f));
  d.goleadores = leerChips('#listaGoleadores', 'gol');
  d.asistencias = leerChips('#listaAsistencias', 'asistencia');
  try {
    await put(`/api/admin/resultados/${d.fecha_id}`, d);
    await cargarFechas();
    toast('Resultado guardado. La pagina ya lo muestra.');
  } catch (e) { toast(e.message); }
});

$('#btnBorrarResultado').addEventListener('click', () => {
  const id = $('#selFecha').value;
  if (!id) return toast('Selecciona un partido');
  confirmar('Se borrara el resultado de este partido.', async () => {
    await del(`/api/admin/resultados/${id}`);
    f_reiniciarResultado();
    await cargarFechas();
    toast('Resultado borrado');
  });
});

function f_reiniciarResultado() {
  const f = $('#formResultado');
  ['goles_a', 'goles_b', 'cs_a', 'cs_b'].forEach((n) => { if (f[n]) f[n].value = '0'; });
  $('#listaGoleadores').innerHTML = '';
  $('#listaAsistencias').innerHTML = '';
}

/* --------------------------------------------------------- CONTENIDOS */
const MODULOS_TODOS = ['anuncios', 'noticias', 'pubs', 'museo', 'alianzas', 'redes', 'equipo', 'donacion'];
let filtroModulo = 'anuncios';

async function cargarContenidos() {
  const r = await get('/api/admin/contenidos');
  ESTADO.contenidos = r.contenidos || [];

  $('#filtroContModulo').innerHTML = MODULOS_TODOS.map((m) =>
    `<button class="filtro ${m === filtroModulo ? 'activo' : ''}" data-filtro="${m}">${m.toUpperCase()}</button>`
  ).join('');

  pintarContenidos();
}

function pintarContenidos() {
  const items = ESTADO.contenidos.filter((c) => c.modulo === filtroModulo);
  $('#listaContenidos').innerHTML = items.length ? items.map((c) => `
    <div class="fila">
      <div class="fila-info">
        <strong>${esc(c.titulo)}</strong>
        <small>${esc(c.subtitulo || '')} · ${fechaCorta(c.fecha)}
          ${c.enlace ? ` · <a href="${esc(c.enlace)}" target="_blank" rel="noopener">enlace</a>` : ''}</small>
      </div>
      <span class="fila-dato">${c.visible ? 'VISIBLE' : 'OCULTO'}</span>
      <div class="fila-acciones">
        <button class="btn-ico" data-edit-cont="${c.id}">EDITAR</button>
        <button class="btn-ico peligro" data-del-cont="${c.id}">ELIMINAR</button>
      </div>
    </div>`).join('')
    : '<div class="vacio-mini">Sin publicaciones en este modulo.</div>';
}

$('#filtroContModulo').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-filtro]');
  if (!b) return;
  filtroModulo = b.dataset.filtro;
  cargarContenidos();
  $('#formAnuncio').modulo.value = filtroModulo;
  $('#tituloFormAnuncio').textContent = 'Nueva publicacion en ' + filtroModulo.toUpperCase();
});

$('#formAnuncio').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const d = Object.fromEntries(new FormData(f));
  try {
    if (d.id) { delete d.id; await put(`/api/admin/contenidos/${f.id.value}`, d); }
    else await post('/api/admin/contenidos', d);
    f.reset();
    f.id.value = '';
    await cargarContenidos();
    toast('Publicacion guardada. Ya aparece en la pagina.');
  } catch (e) { toast(e.message); }
});

$('#btnCancelarAnuncio').addEventListener('click', () => {
  const f = $('#formAnuncio');
  f.reset();
  f.id.value = '';
});

$('#listaContenidos').addEventListener('click', async (ev) => {
  const d = ev.target.closest('[data-del-cont]');
  if (d) {
    confirmar('Se eliminara esta publicacion de la pagina.', async () => {
      await del(`/api/admin/contenidos/${d.dataset.delCont}`);
      await cargarContenidos();
      toast('Publicacion eliminada');
    });
    return;
  }
  const e = ev.target.closest('[data-edit-cont]');
  if (e) { await editarContenido(e.dataset.editCont); }
});

async function editarContenido(id) {
  const c = ESTADO.contenidos.find((x) => x.id == id);
  const f = $('#formAnuncio');
  f.id.value = c.id;
  f.modulo.value = c.modulo;
  f.titulo.value = c.titulo || '';
  f.subtitulo.value = c.subtitulo || '';
  f.texto.value = c.texto || '';
  f.enlace.value = c.enlace || '';
  f.categoria.value = c.categoria || '';
  f.dato_extra.value = c.dato_extra || '';
  f.fecha.value = c.fecha ? String(c.fecha).slice(0, 10) : '';
  f.visible.value = c.visible ? '1' : '0';
  $('#tituloFormAnuncio').textContent = 'Editando: ' + c.titulo;
  f.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ------------------------------------------------------------ MODULOS */
let moduloEditando = null;

async function cargarModulos() {
  const r = await get('/api/admin/modulos');
  ESTADO.modulos = r.modulos || [];
  pintarModulos();
}

function pintarModulos() {
  $('#listaModulos').innerHTML = ESTADO.modulos.map((m) => {
    const editando = String(moduloEditando) === String(m.id);
    const fila = `
      <div class="fila ${m.activo ? 'principal' : ''}">
        <div class="fila-info">
          <strong>${esc(m.nombre)}</strong>
          <small>Titulo en la pagina: ${esc(m.titulo)} · Orden ${m.orden}</small>
          ${m.subtitulo ? `<small>${esc(m.subtitulo)}</small>` : ''}
        </div>
        <span class="fila-dato">${m.activo ? 'ACTIVO' : 'OCULTO'}</span>
        <div class="fila-acciones">
          <button class="btn-ico" data-edit-mod="${m.id}">${editando ? 'CERRAR' : 'EDITAR'}</button>
        </div>
      </div>`;

    if (!editando) return fila;

    return fila + `
      <form class="form-grid form-edicion" data-form-mod="${m.id}">
        <label>Boton en el header <input name="nombre" value="${esc(m.nombre)}" maxlength="60" required></label>
        <label>Titulo de la seccion <input name="titulo" value="${esc(m.titulo)}" maxlength="160" required></label>
        <label>Texto introductorio <input name="subtitulo" value="${esc(m.subtitulo || '')}" maxlength="300"></label>
        <label>Orden en el menu <input name="orden" type="number" min="1" max="50" value="${m.orden}"></label>
        <label>Visible en el header
          <select name="activo">
            <option value="1" ${m.activo ? 'selected' : ''}>Si</option>
            <option value="0" ${m.activo ? '' : 'selected'}>No</option>
          </select>
        </label>
        <div class="form-acciones">
          <button class="btn btn-primary" type="submit">GUARDAR CAMBIOS</button>
          <button class="btn btn-soft" type="button" data-cancel-mod>CANCELAR</button>
        </div>
      </form>`;
  }).join('');
}

$('#listaModulos').addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-edit-mod]');
  if (b) {
    moduloEditando = String(moduloEditando) === String(b.dataset.editMod) ? null : b.dataset.editMod;
    pintarModulos();
    return;
  }
  if (ev.target.closest('[data-cancel-mod]')) {
    moduloEditando = null;
    pintarModulos();
  }
});

$('#listaModulos').addEventListener('submit', async (ev) => {
  const form = ev.target.closest('[data-form-mod]');
  if (!form) return;
  ev.preventDefault();
  try {
    await put(`/api/admin/modulos/${form.dataset.formMod}`, Object.fromEntries(new FormData(form)));
    moduloEditando = null;
    await cargarModulos();
    toast('Modulo actualizado. La pagina ya lo muestra.');
  } catch (e) { toast(e.message); }
});

/* ----------------------------------------------------------- CONTENIDO */
let filtroTodo = 'todo';

async function cargarContenidoTodo() {
  await cargarContenidos();
  pintarContenidoTodo();
}

function pintarContenidoTodo() {
  const porModulo = {};
  MODULOS_TODOS.forEach((m) => { porModulo[m] = { total: 0, ocultos: 0 }; });
  ESTADO.contenidos.forEach((c) => {
    const d = porModulo[c.modulo] || (porModulo[c.modulo] = { total: 0, ocultos: 0 });
    d.total++;
    if (!c.visible) d.ocultos++;
  });
  const totalTodo = ESTADO.contenidos.length;

  $('#modTiles').innerHTML =
    `<button class="mod-tile ${filtroTodo === 'todo' ? 'activo' : ''}" data-todo type="button">
       <small>TODO</small><strong>${totalTodo}</strong><span>publicaciones</span>
     </button>` +
    MODULOS_TODOS.map((m) => `
      <button class="mod-tile ${filtroTodo === m ? 'activo' : ''}" data-tile="${m}" type="button">
        <small>${m.toUpperCase()}</small>
        <strong>${porModulo[m] ? porModulo[m].total : 0}</strong>
        <span>${porModulo[m] && porModulo[m].ocultos ? porModulo[m].ocultos + ' ocultas' : 'publicadas'}</span>
      </button>`).join('');

  $('#filtroTodoModulo').innerHTML = ['todo', ...MODULOS_TODOS].map((m) =>
    `<button class="filtro ${m === filtroTodo ? 'activo' : ''}" data-filtro-todo="${m}" type="button">${m.toUpperCase()}</button>`
  ).join('');

  pintarListaContenidoTodo();
}

function pintarListaContenidoTodo() {
  const items = ESTADO.contenidos.filter((c) => filtroTodo === 'todo' || c.modulo === filtroTodo);
  $('#listaContenidoTodo').innerHTML = items.length ? items.map((c) => `
    <div class="fila">
      <div class="fila-info">
        <strong>${esc(c.titulo)}</strong>
        <small>${c.modulo.toUpperCase()} · ${esc(c.subtitulo || '')} · ${fechaCorta(c.fecha)}
          ${c.enlace ? ` · <a href="${esc(c.enlace)}" target="_blank" rel="noopener">enlace</a>` : ''}</small>
      </div>
      <span class="fila-dato">${c.visible ? 'VISIBLE' : 'OCULTO'}</span>
      <div class="fila-acciones">
        <button class="btn-ico" data-edit-todo="${c.id}">EDITAR</button>
        <button class="btn-ico" data-vis-todo="${c.id}">${c.visible ? 'OCULTAR' : 'MOSTRAR'}</button>
        <button class="btn-ico peligro" data-del-todo="${c.id}">ELIMINAR</button>
      </div>
    </div>`).join('')
    : '<div class="vacio-mini">Sin publicaciones en este modulo.</div>';
}

function filtrarContenidoTodo(m) {
  filtroTodo = m;
  pintarContenidoTodo();
}

$('#modTiles').addEventListener('click', (ev) => {
  const todo = ev.target.closest('[data-todo]');
  if (todo) return filtrarContenidoTodo('todo');
  const t = ev.target.closest('[data-tile]');
  if (t) filtrarContenidoTodo(t.dataset.tile);
});

$('#filtroTodoModulo').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-filtro-todo]');
  if (b) filtrarContenidoTodo(b.dataset.filtroTodo);
});

$('#listaContenidoTodo').addEventListener('click', async (ev) => {
  const e = ev.target.closest('[data-edit-todo]');
  if (e) {
    await editarContenido(e.dataset.editTodo);
    irATab('anuncios');
    return;
  }
  const v = ev.target.closest('[data-vis-todo]');
  if (v) {
    const c = ESTADO.contenidos.find((x) => String(x.id) === String(v.dataset.visTodo));
    if (!c) return;
    try {
      await put(`/api/admin/contenidos/${c.id}`, { ...c, visible: c.visible ? 0 : 1 });
      await cargarContenidoTodo();
      toast(c.visible ? 'Publicacion oculta' : 'Publicacion visible en la pagina');
    } catch (err) { toast(err.message); }
    return;
  }
  const d = ev.target.closest('[data-del-todo]');
  if (d) {
    confirmar('Se eliminara esta publicacion de la pagina.', async () => {
      await del(`/api/admin/contenidos/${d.dataset.delTodo}`);
      await cargarContenidoTodo();
      toast('Publicacion eliminada');
    });
  }
});

/* --------------------------------------------------------------- FORO */
async function cargarForo() {
  const r = await get('/api/admin/foro');
  ESTADO.foro = r.foro || [];
  $('#listaForo').innerHTML = ESTADO.foro.length ? ESTADO.foro.map((m) => `
    <div class="fila">
      <div class="fila-info">
        <strong>${esc(m.nombre)}</strong>
        <small>${esc(String(m.mensaje).slice(0, 140))}</small>
      </div>
      <span class="fila-dato">${fechaCorta(m.fecha)}</span>
      <div class="fila-acciones">
        <button class="btn-ico peligro" data-del-foro="${m.id}">ELIMINAR</button>
      </div>
    </div>`).join('') : '<div class="vacio-mini">Todavia no hay mensajes en el foro.</div>';
}

$('#listaForo').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-del-foro]');
  if (!b) return;
  confirmar('Se eliminara este mensaje del foro.', async () => {
    await del(`/api/admin/foro/${b.dataset.delForo}`);
    await cargarForo();
    toast('Mensaje eliminado');
  });
});

/* ------------------------------------------------------------- SALIR */
$('#btnSalir').addEventListener('click', async () => {
  await post('/api/logout', {});
  window.location.href = '/';
});

/* ------------------------------------------------------------ INICIO */
(async function iniciar() {
  try {
    const s = await get('/api/sesion');
    if (!s.autenticado) { window.location.href = '/admin'; return; }
    $('#adminNombre').textContent = s.nombre || 'Admin';
    $('#adminRol').textContent = s.rol || 'ADMINISTRADOR';

    const cargas = await Promise.allSettled([
      cargarEquipos(), cargarFechas(), cargarResumen(),
      cargarContenidos(), cargarModulos(), cargarForo()
    ]);
    cargas.forEach((c) => { if (c.status === 'rejected') console.error(c.reason); });
  } catch (e) {
    console.error(e);
  } finally {
    ocultarPreloader();
  }
})();