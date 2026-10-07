/* =====================================================================
   THE DIAMONDS LEAGUE - Panel administrativo
   (c) 2026 Neptunzinho. Todos los derechos reservados.
   Uso y redistribucion prohibidos sin autorizacion del autor.
   ===================================================================== */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

const ESTADO = {
  equipos: [], fechas: [], contenidos: [], modulos: [], foro: [],
  ideales: [], jornadas: []
};

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
  equipos:    ['Equipos', 'Agrega equipos, colores, escudos, entrenadores y jugadores.'],
  fechas:     ['Fechas', 'Programa los partidos y el calendario.'],
  resultados: ['Resultados', 'Goles, asistencias y clean sheets por equipo.'],
  ideal:      ['X5 Ideal', 'El cinco ideal de cada jornada, por division.'],
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
  if (tab === 'ideal') cargarIdeales();
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
const POSICIONES = ['GK', 'Mid', 'Dfwd', 'Fwd'];
const EQUIPOS_DIVISION = ['D1', 'D2'];
let filtroDivEquipo = 'D1';

let fechaActual = null; // fecha seleccionada en el tab de resultados

function opcionEquipo(e) {
  return `<option value="${e.id}">${esc(e.nombre)} (${esc(e.sigla)}) · ${esc(e.division || 'D1')}</option>`;
}

function equipoIdPara(lado) {
  if (!fechaActual) return '';
  return lado === 'b' ? fechaActual.equipo_b_id : fechaActual.equipo_a_id;
}

function siglaEquipoLado(lado) {
  if (!fechaActual) return lado === 'b' ? 'EQUIPO B' : 'EQUIPO A';
  return lado === 'b' ? (fechaActual.sigla_b || 'B') : (fechaActual.sigla_a || 'A');
}

function opcionesJugadores(lado, selJugadorId) {
  const eid = equipoIdPara(lado);
  const eq = ESTADO.equipos.find((x) => String(x.id) === String(eid));
  const jugs = (eq && eq.jugadores) || [];
  const opt = jugs.map((j) =>
    `<option value="${j.id}"${String(selJugadorId) === String(j.id) ? ' selected' : ''}>${esc(j.nombre)}</option>`).join('');
  return opt || '<option value="">Sin jugadores</option>';
}
let jugadorEditando = null;

function opcionesPosicion(sel) {
  return POSICIONES.map((p) =>
    `<option value="${p}" ${sel === p ? 'selected' : ''}>${p}</option>`).join('');
}

function opcionesEquipo(sel) {
  return ESTADO.equipos.map((e) =>
    `<option value="${e.id}" ${String(sel) === String(e.id) ? 'selected' : ''}>` +
    `${esc(e.nombre)} (${esc(e.sigla)})</option>`).join('');
}

async function cargarEquipos() {
  const r = await get('/api/admin/equipos');
  ESTADO.equipos = r.equipos || [];
  llenarSelectEquipos();
  pintarFiltroDivision();
  pintarEquipos();
}

function pintarFiltroDivision() {
  const caja = $('#filtroDivEquipo');
  if (!caja) return;
  caja.innerHTML = EQUIPOS_DIVISION.map((d) => `
    <button class="filtro ${d === filtroDivEquipo ? 'activo' : ''}" data-div="${d}" type="button">
      ${d === 'D1' ? 'DIVISION 1' : 'DIVISION 2'}
    </button>`).join('');
}

function pintarEquipos() {
  const lista = ESTADO.equipos.filter((e) => (e.division || 'D1') === filtroDivEquipo);

  $('#listaEquipos').innerHTML = lista.map((e) => {
    const jugadores = (e.jugadores || []).map((j) => {
      if (String(jugadorEditando) === String(j.id)) {
        return `
          <div class="jug-chip form-editar">
            <form class="form-grid" data-form-jugador-edit="${j.id}">
              <label>Nombre <input name="nombre" required maxlength="80" value="${esc(j.nombre)}"></label>
              <label>Dorsal <input name="dorsal" maxlength="2" placeholder="10" value="${esc(j.dorsal || '')}"></label>
              <label>Posicion
                <select name="posicion">${opcionesPosicion(j.posicion)}</select>
              </label>
              <label>Equipo <select name="equipo_id">${opcionesEquipo(j.equipo_id)}</select></label>
              <div class="form-acciones">
                <button class="btn btn-primary" type="submit">GUARDAR</button>
                <button class="btn btn-soft" type="button" data-cancel-jugador>CANCELAR</button>
              </div>
            </form>
          </div>`;
      }
      return `
        <div class="jug-chip">
          <b>${esc(j.dorsal || '-')}</b>
          <span>${esc(j.nombre)}</span>
          <small>${esc(j.posicion || '')}</small>
          <button class="btn-ico" data-edit-jugador="${j.id}">EDITAR</button>
          <button class="btn-ico peligro" data-del-jugador="${j.id}">QUITAR</button>
        </div>`;
    }).join('') || '<div class="vacio-mini">Sin jugadores. Usa "+ JUGADOR" para agregar.</div>';

    return `
    <div class="fila principal">
      <div class="escudo" style="width:46px;height:46px;font-size:.9rem;
           background:${esc(e.color || '#0AFFD6')};color:#04121f">
        ${e.escudo ? `<img src="/static/${esc(e.escudo)}" alt="">` : esc(e.sigla.charAt(0))}
      </div>
      <div class="fila-info">
        <strong>${esc(e.nombre)} <span class="fila-dato">${esc(e.division)}</span></strong>
        <small>Sigla ${esc(e.sigla)} · DT. ${esc(e.entrenador || 'sin entrenador')} · ${esc(e.ciudad || 'sin ciudad')}</small>
      </div>
      <span class="equipo-color" style="background:${esc(e.color || '#0AFFD6')}" title="Color del equipo"></span>
      <div class="fila-acciones">
        <button class="btn-ico" data-add-jugador="${e.id}">+ JUGADOR</button>
        <button class="btn-ico" data-edit-equipo="${e.id}">EDITAR</button>
        <button class="btn-ico peligro" data-del-equipo="${e.id}">ELIMINAR</button>
      </div>
      <div class="fila-jugadores">
        ${jugadores}
        <form class="form-grid form-jugador" data-form-jugador="${e.id}">
          <label>Nombre <input name="nombre" required maxlength="80" placeholder="Nombre del jugador"></label>
          <label>Dorsal <input name="dorsal" maxlength="2" placeholder="10" pattern="[0-9A-Za-z]{1,2}"></label>
          <label>Posicion
            <select name="posicion">${opcionesPosicion('Mid')}</select>
          </label>
          <button class="btn btn-primary" type="submit">AGREGAR</button>
        </form>
      </div>
    </div>`;
  }).join('') ||
  `<div class="vacio-mini">No hay equipos en ${filtroDivEquipo}. Cambia de division o crea uno nuevo.</div>`;
}

function pintarEquiposB() {
  const a = document.querySelector('[name="equipo_a_id"]');
  const b = document.querySelector('[name="equipo_b_id"]');
  if (!a || !b) return;
  const div = (ESTADO.equipos.find((e) => String(e.id) === String(a.value)) || {}).division || 'D1';
  const previo = b.value;
  b.innerHTML = ESTADO.equipos
    .filter((e) => (e.division || 'D1') === div)
    .map(opcionEquipo).join('');
  if (previo && Array.from(b.options).some((o) => o.value === previo)) b.value = previo;
}

function llenarSelectEquipos() {
  const a = document.querySelector('[name="equipo_a_id"]');
  const b = document.querySelector('[name="equipo_b_id"]');
  if (a) a.innerHTML = ESTADO.equipos.map(opcionEquipo).join('');
  pintarEquiposB();
  if (!$('#selFecha').options.length) actualizarSelectFechas();
}

$('#filtroDivEquipo').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-div]');
  if (!b) return;
  filtroDivEquipo = b.dataset.div;
  pintarFiltroDivision();
  pintarEquipos();
});

function limpiarFormEquipo() {
  const f = $('#formEquipo');
  f.reset();
  f.elements.id.value = '';
  f.elements.color.value = '#7CF5FF';
  $('#tituloFormEquipo').textContent = 'Nuevo equipo';
}

$('#formEquipo').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const fd = new FormData(f);
  const id = f.elements.id.value;
  try {
    if (id) {
      await api(`/api/admin/equipos/${id}`, { method: 'PUT', body: fd });
      toast('Equipo actualizado');
    } else {
      await api('/api/admin/equipos', { method: 'POST', body: fd });
      toast('Equipo guardado');
    }
    limpiarFormEquipo();
    await cargarEquipos();
  } catch (e) { toast(e.message); }
});

$('#btnCancelarEquipo').addEventListener('click', limpiarFormEquipo);

$('#listaEquipos').addEventListener('click', async (ev) => {
  const addJ = ev.target.closest('[data-add-jugador]');
  if (addJ) {
    const fila = addJ.closest('.fila').querySelector('[data-form-jugador] input[name=nombre]');
    fila.focus();
    fila.closest('form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const edJ = ev.target.closest('[data-edit-jugador]');
  if (edJ) {
    jugadorEditando = edJ.dataset.editJugador;
    pintarEquipos();
    return;
  }
  if (ev.target.closest('[data-cancel-jugador]')) {
    jugadorEditando = null;
    pintarEquipos();
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
    const eq = ESTADO.equipos.find((x) => String(x.id) === String(edE.dataset.editEquipo));
    if (!eq) return;
    const f = $('#formEquipo');
    f.elements.id.value = eq.id;
    f.elements.nombre.value = eq.nombre || '';
    f.elements.sigla.value = eq.sigla || '';
    f.elements.division.value = eq.division || 'D1';
    f.elements.color.value = eq.color || '#7CF5FF';
    f.elements.entrenador.value = eq.entrenador || '';
    f.elements.ciudad.value = eq.ciudad || '';
    $('#tituloFormEquipo').textContent = 'Editando: ' + eq.nombre;
    f.scrollIntoView({ behavior: 'smooth', block: 'center' });
    f.nombre.focus();
  }
});

$('#listaEquipos').addEventListener('submit', async (ev) => {
  const crear = ev.target.closest('[data-form-jugador]');
  const editar = ev.target.closest('[data-form-jugador-edit]');
  const form = crear || editar;
  if (!form) return;
  ev.preventDefault();
  const fd = new FormData(form);
  if (crear) fd.append('equipo_id', crear.dataset.formJugador);
  try {
    if (crear) {
      await api('/api/admin/jugadores', { method: 'POST', body: fd });
      toast('Jugador agregado');
    } else {
      await api(`/api/admin/jugadores/${editar.dataset.formJugadorEdit}`,
        { method: 'PUT', body: fd });
      toast('Jugador actualizado');
    }
    jugadorEditando = null;
    form.reset();
    await cargarEquipos();
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
  const divA = (ESTADO.equipos.find((e) => String(e.id) === String(d.equipo_a_id)) || {}).division;
  const divB = (ESTADO.equipos.find((e) => String(e.id) === String(d.equipo_b_id)) || {}).division;
  if (divA && divB && divA !== divB) {
    toast(`No esta permitido jugar entre ${divA} y ${divB}. Elige dos equipos de la misma division.`);
    return;
  }
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
  const f = ESTADO.fechas.find((x) => String(x.id) === String(id)) || null;
  fechaActual = f;
  $('#infoPartido').innerHTML = f
    ? `⚽ <b>${esc(f.sigla_a)} vs ${esc(f.sigla_b)}</b> · ${fechaCorta(f.fecha)} ${String(f.hora || '').slice(0, 5)}`
    : 'Selecciona un partido para registrar su resultado.';

  const form = $('#formResultado');
  if (!form) return;
  if (!f) {
    form.goles_a.value = 0; form.goles_b.value = 0;
    form.minutos_cs_a.value = 0; form.minutos_cs_b.value = 0;
    form.arquero_a_id.innerHTML = '<option value="">Sin arquero</option>';
    form.arquero_b_id.innerHTML = '<option value="">Sin arquero</option>';
    $('#listaGoleadores').innerHTML = '';
    $('#listaAsistencias').innerHTML = '';
    return;
  }

  const jugado = f.goles_a !== null && f.goles_a !== undefined;
  form.goles_a.value = jugado ? (+f.goles_a || 0) : 0;
  form.goles_b.value = jugado ? (+f.goles_b || 0) : 0;
  form.minutos_cs_a.value = jugado ? (+f.minutos_cs_a || 0) : 0;
  form.minutos_cs_b.value = jugado ? (+f.minutos_cs_b || 0) : 0;

  form.arquero_a_id.innerHTML = '<option value="">Sin arquero</option>' + opcionesJugadores('a', f.portero_a);
  form.arquero_b_id.innerHTML = '<option value="">Sin arquero</option>' + opcionesJugadores('b', f.portero_b);

  $('#listaGoleadores').innerHTML = jugado
    ? jsonLista(f.goleadores).map((g) => chipHTML('gol', 0, g)).join('') : '';
  $('#listaAsistencias').innerHTML = jugado
    ? jsonLista(f.asistencias).map((a) => chipHTML('asistencia', 0, a)).join('') : '';
}

$('#selFecha').addEventListener('change', mostrarInfoPartido);

function chipHTML(tipo, idx, item = {}) {
  const opc = (v, t) => `<option value="${v}" ${item.equipo === v ? 'selected' : ''}>${t}</option>`;
  const equipoSel = item.equipo === 'b' ? 'b' : 'a';
  const cantidad = tipo === 'gol' ? (item.goles || 1) : (item.asistencias || 1);
  const jugadorSel = tipo === 'gol' ? (item.jugador_id || item.id) : (item.jugador_id || item.id);
  if (tipo === 'gol') {
    return `<div class="chip chip-resultado" data-tipo="gol">
      <select name="equipo">${opc('a', siglaEquipoLado('a'))}${opc('b', siglaEquipoLado('b'))}</select>
      <select name="jugador_id">${opcionesJugadores(equipoSel, jugadorSel)}</select>
      <input type="number" min="1" value="${cantidad}" name="cantidad" title="Goles">
      <button class="chip-quitar" type="button">&times;</button>
    </div>`;
  }
  return `<div class="chip chip-resultado" data-tipo="asistencia">
    <select name="equipo">${opc('a', siglaEquipoLado('a'))}${opc('b', siglaEquipoLado('b'))}</select>
    <select name="jugador_id">${opcionesJugadores(equipoSel, jugadorSel)}</select>
    <input type="number" min="1" value="${cantidad}" name="cantidad" title="Asistencias">
    <button class="chip-quitar" type="button">&times;</button>
  </div>`;
}

$('#addGoleador').addEventListener('click', () => {
  if (!fechaActual) return toast('Selecciona un partido primero');
  const chip = chipHTML('gol', 0);
  $('#listaGoleadores').insertAdjacentHTML('beforeend', chip);
});
$('#addAsistencia').addEventListener('click', () => {
  if (!fechaActual) return toast('Selecciona un partido primero');
  $('#listaAsistencias').insertAdjacentHTML('beforeend', chipHTML('asistencia', 0));
});

document.addEventListener('click', (ev) => {
  const q = ev.target.closest('.chip-quitar');
  if (q) q.closest('.chip').remove();
});

document.addEventListener('change', (ev) => {
  if (ev.target.matches('[name="equipo_a_id"]')) { pintarEquiposB(); return; }
  const chip = ev.target.closest('.chip-resultado');
  if (chip && ev.target.matches('[name="equipo"]')) {
    chip.querySelector('[name="jugador_id"]').innerHTML = opcionesJugadores(ev.target.value);
  }
});

function leerChips(selector, tipo) {
  return $$(`${selector} .chip`).map((c) => {
    const sel = c.querySelector('[name=jugador_id]');
    const jid = (sel && sel.value) || '';
    const nombre = (sel && sel.selectedOptions.length && sel.selectedOptions[0].textContent.trim()) || '';
    if (!jid) return null;
    const cantidad = parseInt(c.querySelector('[name=cantidad]').value || '1', 10);
    const equipo = c.querySelector('[name=equipo]').value;
    const base = { jugador_id: jid, nombre, equipo };
    return tipo === 'gol' ? { ...base, goles: cantidad } : { ...base, asistencias: cantidad };
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
  if (!f) return;
  ['goles_a', 'goles_b'].forEach((n) => { if (f[n]) f[n].value = '0'; });
  if (f.minutos_cs_a) f.minutos_cs_a.value = '0';
  if (f.minutos_cs_b) f.minutos_cs_b.value = '0';
  const a = $('#selFecha').value;
  const partido = ESTADO.fechas.find((x) => String(x.id) === String(a)) || null;
  if (f.arquero_a_id) f.arquero_a_id.innerHTML = '<option value="">Sin arquero</option>' + (partido ? opcionesJugadores('a') : '');
  if (f.arquero_b_id) f.arquero_b_id.innerHTML = '<option value="">Sin arquero</option>' + (partido ? opcionesJugadores('b') : '');
  $('#listaGoleadores').innerHTML = '';
  $('#listaAsistencias').innerHTML = '';
}

/* --------------------------------------------------------- X5 IDEAL */
const FORMACION = ['GK', 'Dfwd', 'Mid', 'Mid', 'Fwd'];

function todosJugadores() {
  return ESTADO.equipos.flatMap((e) =>
    (e.jugadores || []).map((j) => ({
      ...j, equipo: e.nombre, sigla: e.sigla, color: e.color
    })));
}

function opcionesJugadores(sel) {
  return '<option value="">-- Sin jugador --</option>' + todosJugadores().map((j) => `
    <option value="${j.id}" ${String(sel) === String(j.id) ? 'selected' : ''}>${esc(j.equipo)} · ${esc(j.nombre)}${j.dorsal ? ' (#' + esc(j.dorsal) + ')' : ''}</option>`
  ).join('');
}

function pintarSlots(items = []) {
  const actuales = [...items].sort((a, b) => a.orden - b.orden);
  $('#idealSlots').innerHTML = FORMACION.map((base, i) => {
    const slot = actuales[i];
    return `
      <div class="ideal-slot">
        <span>POSICION ${i + 1}</span>
        <select data-slot-pos aria-label="Posicion ${i + 1}">${opcionesPosicion(slot ? slot.posicion : base)}</select>
        <select data-slot-jug aria-label="Jugador ${i + 1}">${opcionesJugadores(slot && slot.jugador_id)}</select>
      </div>`;
  }).join('');
}

function prefillIdeal() {
  const f = $('#formIdeal');
  const jornada = (f.elements.jornada.value || '').trim().toUpperCase();
  const division = f.elements.division.value;
  pintarSlots(ESTADO.ideales.filter((i) =>
    i.jornada === jornada && i.division === division));
}

async function cargarIdeales() {
  if (!ESTADO.equipos.length) {
    try { await cargarEquipos(); } catch (e) { console.error(e); }
  }
  const r = await get('/api/admin/ideales');
  ESTADO.ideales = r.ideales || [];
  ESTADO.jornadas = (r.jornadas || []).map((j) => j.jornada);
  $('#listaJornadas').innerHTML = ESTADO.jornadas
    .map((j) => `<option value="${esc(j)}">`).join('');
  prefillIdeal();
  pintarIdeales();
}

function pintarIdeales() {
  const caja = $('#listaIdeales');
  if (!ESTADO.ideales.length) {
    caja.innerHTML = '<div class="vacio-mini">Todavia no hay cinco ideal guardado.</div>';
    return;
  }
  const jornadas = [...new Set(ESTADO.ideales.map((i) => i.jornada))];
  caja.innerHTML = jornadas.map((j) => `
    <div class="grupo-ideal">
      <h4 class="sub">${esc(j)}</h4>
      ${ESTADO.ideales.filter((i) => i.jornada === j).map((i) => `
        <div class="ideal-fila">
          <span class="pos">${esc(i.posicion)}</span>
          <div class="quien">
            <strong>${esc(i.jugador)}${i.dorsal ? ' <small>#' + esc(i.dorsal) + '</small>' : ''}</strong>
            <small>${esc(i.equipo)} · ${esc(i.equipo_sigla || '')}</small>
          </div>
          <span class="fila-dato">${esc(i.division)}</span>
        </div>`).join('')}
    </div>`).join('');
}

$('#idealJornada').addEventListener('change', prefillIdeal);
$('#idealDivision').addEventListener('change', prefillIdeal);

$('#formIdeal').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const slots = $$('#idealSlots .ideal-slot').map((s, i) => ({
    orden: i + 1,
    posicion: s.querySelector('[data-slot-pos]').value,
    jugador_id: s.querySelector('[data-slot-jug]').value
  })).filter((s) => s.jugador_id);

  try {
    const r = await post('/api/admin/ideales', {
      jornada: f.elements.jornada.value,
      division: f.elements.division.value,
      slots
    });
    await cargarIdeales();
    toast(r.guardados ? `Cinco ideal guardado con ${r.guardados} jugador(es)` : 'Jornada guardada vacia');
  } catch (e) { toast(e.message); }
});

$('#btnBorrarIdeal').addEventListener('click', () => {
  const f = $('#formIdeal');
  const jornada = (f.elements.jornada.value || '').trim();
  if (!jornada) return toast('Escribe la jornada');
  confirmar('Se borrara el cinco ideal de esta jornada y division.', async () => {
    await del(`/api/admin/ideales?jornada=${encodeURIComponent(jornada)}&division=${f.elements.division.value}`);
    await cargarIdeales();
    toast('Cinco ideal borrado');
  });
});

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
    if (d.id) { delete d.id; await put(`/api/admin/contenidos/${f.elements.id.value}`, d); }
    else await post('/api/admin/contenidos', d);
    f.reset();
    f.elements.id.value = '';
    await cargarContenidos();
    toast('Publicacion guardada. Ya aparece en la pagina.');
  } catch (e) { toast(e.message); }
});

$('#btnCancelarAnuncio').addEventListener('click', () => {
  const f = $('#formAnuncio');
  f.reset();
  f.elements.id.value = '';
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
  f.elements.id.value = c.id;
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