/* =====================================================================
   THE DIAMONDS LEAGUE - Frontend publico
   (c) 2026 Neptunzinho. Todos los derechos reservados.
   Uso y redistribucion prohibidos sin autorizacion del autor.
   ===================================================================== */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const DATOS = { modulos: [], contenidos: {}, equipos: [], fechas: [], ideales: [], foro: [] };

/* Estado de la seccion LIGA (division seleccionada + vista activa) */
const LIGA = { division: 'D1', vista: 'equipos' };

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

function toast(texto) {
  const t = $('#toast');
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

/* -------------------------------------------------------------- HEADER */
function pintarHeader() {
  DATOS.modulos.forEach((m) => {
    $('#navPrincipal').insertAdjacentHTML('beforeend',
      `<a href="#${esc(m.clave)}" data-nav="${esc(m.clave)}">${esc(m.nombre)}</a>`);
  });

  // Textos editables de cada modulo
  DATOS.modulos.forEach((m) => {
    const t = $(`[data-titulo="${m.clave}"]`);
    const s = $(`[data-subtitulo="${m.clave}"]`);
    if (t && m.titulo) t.textContent = m.titulo;
    if (s) s.textContent = m.subtitulo || '';
  });

  // Enlaces moviles + boton de salir si hay sesion
  $('#mobileMenu').innerHTML =
    DATOS.modulos.map((m) => `<a href="#${esc(m.clave)}">${esc(m.nombre)}</a>`).join('');
}

/* ---------------------------------------------------------------- HERO */
function pintarHero() {
  $('#statEquipos').textContent = String(DATOS.equipos.length).padStart(2, '0');
  $('#statSalas').textContent = String(cont('pubs').length).padStart(2, '0');
}

/* ------------------------------------------------------------- EQUIPOS */
function equiposDivision(div = LIGA.division) {
  return DATOS.equipos.filter((e) => e.division === div);
}

function fechasDivision(div = LIGA.division) {
  return DATOS.fechas.filter((f) => {
    if (!f.division_a && !f.division_b) return true;
    return f.division_a === div || f.division_b === div;
  });
}

function tarjetaEquipo(eq) {
  const color = eq.color || 'var(--cian)';
  const escudo = eq.escudo
    ? `<img src="/static/${esc(eq.escudo)}" alt="Escudo de ${esc(eq.nombre)}">`
    : iniciales(eq.sigla);

  const meta = [
    eq.division && `Division ${esc(eq.division)}`,
    eq.ciudad && esc(eq.ciudad),
    eq.fundado && `Fundado en ${esc(eq.fundado)}`
  ].filter(Boolean).map((t) => `<span>${t}</span>`).join('');

  const jugadores = (eq.jugadores || []).map((j) => `
    <div class="jugador-fila">
      <span class="jugador-num">${j.dorsal ?? '-'}</span>
      <span class="jugador-nom">${esc(j.nombre)}</span>
      <span class="jugador-pos">${esc(j.posicion || '')}</span>
      <span class="jugador-stats">
        <i title="Goles">${j.goles || 0}G</i>
        <i title="Asistencias">${j.asistencias || 0}A</i>
        ${j.cs ? `<i title="Clean sheets">${j.cs}CS</i>` : ''}
      </span>
    </div>`).join('') || '<p class="partido-detalle">Sin jugadores registrados.</p>';

  return `
    <article class="equipo-card reveal" style="--eq:${esc(color)}">
      <div class="equipo-topo">
        <div class="escudo">${escudo}</div>
        <div class="equipo-nombre">
          <h4>${esc(eq.nombre)}</h4>
          <small>${esc(eq.sigla)}</small>
        </div>
      </div>
      <div class="equipo-meta">
        ${eq.entrenador ? `<span>DT. ${esc(eq.entrenador)}</span>` : ''}
        ${meta}
      </div>
      ${jugadores}
    </article>`;
}

function pintarEquipos() {
  const grid = $('#equiposGrid');
  if (!grid) return;
  const lista = equiposDivision();
  grid.innerHTML = lista.map(tarjetaEquipo).join('')
    || vacio(`Sin equipos en la division ${LIGA.division}.`);
}

/* ----------------------------------------------------------- CALENDARIO */
function tarjetaPartido(f) {
  const juga = !!f.jugado;
  const marcador = juga
    ? `<div class="partido-marcador">${f.equipo_a} <b>${f.goles_a}</b> - <b>${f.goles_b}</b> ${f.equipo_b}</div>`
    : `<div class="partido-marcador"><small>PENDIENTE</small></div>`;

  let detalle = '';
  if (juga) {
    const goals = (f.goleadores || []).map((g) =>
      `${esc(g.jugador)} (${g.equipo === 'a' ? f.sigla_a : f.sigla_b}) x${g.goles || 1}`).join(' · ');
    const asist = (f.asistencias || []).map((a) => esc(a.jugador)).join(' · ');
    const tags = [];
    const csA = Number(f.cs_a) || 0;
    const csB = Number(f.cs_b) || 0;
    if (csA > 0) tags.push(`CS ${esc(f.sigla_a)}${csA > 1 ? ` x${csA}` : ''}`);
    if (csB > 0) tags.push(`CS ${esc(f.sigla_b)}${csB > 1 ? ` x${csB}` : ''}`);
    detalle = `<div class="partido-detalle">
        ${goals ? `Goles: <b>${goals}</b><br>` : ''}
        ${asist ? `Asistencias: ${asist}` : ''}
        ${tags.length ? `<div class="partido-tags">${tags.map((t) => `<span>${t}</span>`).join('')}</div>` : ''}
      </div>`;
  }

  const boton = f.sala
    ? (juga
        ? `<span class="link-sala finalizado">FINALIZADO</span>`
        : `<a class="link-sala" href="${esc(f.sala)}" target="_blank" rel="noopener">ABRIR SALA</a>`)
    : '';

  return `
    <article class="partido reveal">
      <div class="partido-info">
        <span class="partido-fecha">${fechaLarga(f.fecha)}</span>
        <span class="partido-meta">${horaCorta(f.hora)} · ${esc(f.jornada || '')} · ${esc(f.fase || '')}</span>
        ${f.division_a ? `<span class="partido-division">${esc(f.division_a)}</span>` : ''}
      </div>
      <div>
        <div class="partido-lado"><i class="equipo-punto" style="background:${esc(f.color_a || 'var(--cian)')}"></i>${esc(f.equipo_a)}</div>
        ${detalle}
      </div>
      <div>
        ${marcador}
        <div class="partido-lado b" style="justify-content:flex-end;margin-top:8px"><i class="equipo-punto" style="background:${esc(f.color_b || 'var(--cian)')}"></i>${esc(f.equipo_b)}</div>
        ${boton ? `<div style="margin-top:12px;text-align:center">${boton}</div>` : ''}
      </div>
    </article>`;
}

function pintarCalendario() {
  const caja = $('#calendario');
  if (!caja) return;
  const fechas = fechasDivision();
  caja.innerHTML = fechas.length
    ? fechas.map(tarjetaPartido).join('')
    : vacio(`Todavia no hay fechas programadas en la division ${LIGA.division}.`);
}

/* --------------------------------------------------------------- TABLA */
function standings() {
  const tabla = new Map();
  equiposDivision().forEach((e) => tabla.set(e.id, {
    eq: e, pj: 0, gf: 0, gc: 0, pts: 0
  }));

  fechasDivision().filter((f) => f.jugado).forEach((f) => {
    const a = tabla.get(f.equipo_a_id), b = tabla.get(f.equipo_b_id);
    if (!a || !b) return;
    a.pj++; b.pj++;
    a.gf += f.goles_a; a.gc += f.goles_b;
    b.gf += f.goles_b; b.gc += f.goles_a;
    if (f.goles_a > f.goles_b) a.pts += 3;
    else if (f.goles_b > f.goles_a) b.pts += 3;
    else { a.pts += 1; b.pts += 1; }
  });

  return Array.from(tabla.values())
    .sort((x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf);
}

function pintarTabla() {
  const cuerpo = $('#tablaPosiciones tbody');
  if (!cuerpo) return;
  const filas = standings();
  cuerpo.innerHTML = filas.map((f, i) => `
    <tr>
      <td class="pos">${i + 1}</td>
      <td><i class="equipo-punto" style="background:${esc(f.eq.color || 'var(--cian)')}"></i>${esc(f.eq.nombre)}</td>
      <td>${f.pj}</td><td>${f.gf}</td><td>${f.gc}</td>
      <td>${f.gf - f.gc}</td>
      <td class="pos">${f.pts}</td>
    </tr>`).join('') || `<tr><td colspan="7">${vacio('Sin resultados aun.')}</td></tr>`;
}

/* ----------------------------------------------------- ESTADISTICAS */
function listaRanking(destino, campo, titulo) {
  const box = $(destino);
  if (!box) return;
  const datos = equiposDivision().flatMap((e) => (e.jugadores || []).map((j) => ({
    nombre: j.nombre, equipo: e.nombre, color: e.color, valor: j[campo] || 0
  }))).filter((j) => j.valor > 0)
    .sort((a, b) => b.valor - a.valor).slice(0, 8);

  box.innerHTML = datos.length ? datos.map((j, i) => `
    <div class="rank-fila">
      <span class="rank-pos">${i + 1}</span>
      <span class="rank-nom"><i class="equipo-punto" style="background:${esc(j.color || 'var(--cian)')}"></i>${esc(j.nombre)}<small>${esc(j.equipo)}</small></span>
      <span class="rank-val">${j.valor}</span>
    </div>`).join('') : vacio(titulo);
}

function pintarEstadisticas() {
  listaRanking('#listaGoles', 'goles', 'Aun no hay goles en esta division.');
  listaRanking('#listaAsistencias', 'asistencias', 'Aun no hay asistencias en esta division.');
  listaRanking('#listaCs', 'cs', 'Aun no hay clean sheets en esta division.');
}

/* ---------------------------------------------------------- X5 IDEAL */
function jornadasIdeal() {
  const lista = DATOS.ideales.filter((i) => i.division === LIGA.division);
  return Array.from(new Set(lista.map((i) => i.jornada)));
}

function pintarX5() {
  const sel = $('#x5Jornada');
  if (!sel) return;
  const jornadas = jornadasIdeal();
  const actual = jornadas.includes(sel.value) ? sel.value : (jornadas[0] || '');
  sel.innerHTML = jornadas.length
    ? jornadas.map((j) => `<option value="${esc(j)}"${j === actual ? ' selected' : ''}>${esc(j)}</option>`).join('')
    : '<option value="">SIN JORNADAS</option>';
  sel.disabled = !jornadas.length;
  pintarX5Cancha();
}

function pintarX5Cancha() {
  const caja = $('#x5Cancha');
  if (!caja) return;
  const jornada = $('#x5Jornada').value;
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

/* ------------------------------------------------------------ PUBS */
function pintarPubs() {
  const iconos = ['1', '2', '3', '4', '5', '6', '7', '8'];
  $('#salasGrid').innerHTML = cont('pubs').map((s, i) => {
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
  const items = cont('museo');
  const cats = Array.from(new Set(items.map((i) => i.categoria).filter(Boolean)));
  const iconos = { PREMIOS: '🏆', RANKINGS: '📊', CAMPEONES: '👑' };

  $('#museoFiltros').innerHTML = ['TODO', ...cats].map((c, i) =>
    `<button class="filtro ${i === 0 ? 'activo' : ''}" type="button" data-cat="${esc(c)}">${esc(c)}</button>`
  ).join('');

  const malla = $('#museoGrid');
  const filtro = (cat) => items.filter((i) => cat === 'TODO' || i.categoria === cat);

  const pintar = (cat) => {
    malla.innerHTML = filtro(cat).map((i) => `
      <article class="museo-card reveal">
        <div class="icono">${iconos[i.categoria] || '🏅'}</div>
        <small>${esc(i.categoria || 'PREMIO')}</small>
        <strong>${esc(i.titulo)}</strong>
        <p>${esc(i.subtitulo || '')}</p>
        ${i.texto ? `<p style="margin-top:6px">${esc(i.texto)}</p>` : ''}
      </article>`).join('') || vacio('Sin premios en esta categoria.');
    revelar();
  };

  pintar('TODO');

  $('#museoFiltros').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-cat]');
    if (!btn) return;
    $$('#museoFiltros .filtro').forEach((b) => b.classList.remove('activo'));
    btn.classList.add('activo');
    pintar(btn.dataset.cat);
  });
}

/* --------------------------------------------------------- NOTICIAS */
function pintarNoticias() {
  const items = cont('noticias');
  $('#noticiasGrid').innerHTML = items.map((n) => `
    <article class="noticia reveal">
      <span>${esc(n.subtitulo || 'NOTICIA')}</span>
      <h4>${esc(n.titulo)}</h4>
      <p>${esc(n.texto || '')}</p>
      ${n.fecha ? `<time>${fechaLarga(n.fecha)}</time>` : ''}
    </article>`).join('') || vacio('No hay noticias publicadas.');
}

/* --------------------------------------------------------- ANUNCIOS */
function pintarAnuncios() {
  const items = cont('anuncios');
  $('#anunciosGrid').innerHTML = items.map((a, i) => `
    <article class="anuncio reveal ${i % 2 ? 'aceptado' : ''}">
      <div class="anuncio-cab">
        <span>COMUNICADO ${String(i + 1).padStart(2, '0')}</span>
        ${a.dato_extra ? `<b class="anuncio-dato">${esc(a.dato_extra)}</b>` : ''}
      </div>
      <h4>${esc(a.titulo)}</h4>
      <p>${esc(a.texto || '')}</p>
      ${a.fecha ? `<time style="font-size:.74rem;color:var(--texto-suave)">${fechaLarga(a.fecha)}</time>` : ''}
    </article>`).join('') || vacio('No hay anuncios publicados.');
}

/* --------------------------------------------------------- ALIANZAS */
function pintarAlianzas() {
  const items = cont('alianzas');
  $('#alianzasGrid').innerHTML = items.map((a) => {
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
  const iconos = {
    OWNER: '👑', FUNDADOR: '👑', FUNDADORA: '👑', DESARROLLADOR: '💻',
    MASTER: '🛡️', COACH: '📋', STAFF: '🎬'
  };
  $('#equipoGrid').innerHTML = cont('equipo').map((p) => {
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
  $('#redesGrid').innerHTML = cont('redes').map((r) => {
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
  const iconos = { PAYPAL: '🅿️', NEQUI: '📱', BTC: '₿', DISCORD: '💜' };
  $('#donacionGrid').innerHTML = cont('donacion').map((d) => {
    const inner = `
      <div class="donacion-icon">${iconos[(d.subtitulo || '').toUpperCase()] || '💛'}</div>
      <small>${esc(d.subtitulo || 'METODO')}</small>
      <strong>${esc(d.titulo)}</strong>
      <p>${esc(d.texto || '')}</p>`;
    return d.enlace
      ? `<a class="donacion-card reveal" href="${esc(d.enlace)}" target="_blank" rel="noopener">${inner}</a>`
      : `<div class="donacion-card reveal">${inner}</div>`;
  }).join('') || vacio('No hay metodos de donacion.');
}

/* -------------------------------------------------------------- FORO */
function pintarForo() {
  $('#foroLista').innerHTML = DATOS.foro.length
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

$('#foroForm').addEventListener('submit', async (ev) => {
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

/* ---------------------------------------------------------- UTILIDADES UI */
function vacio(txt) {
  return `<p style="grid-column:1/-1;padding:44px;text-align:center;color:var(--texto-suave)">${esc(txt)}</p>`;
}

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

function scrollSpy() {
  const enlaces = $$('[data-nav]');
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      enlaces.forEach((a) => a.classList.toggle('activo', a.dataset.nav === e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  DATOS.modulos.forEach((m) => {
    const sec = document.getElementById(m.clave);
    if (sec) obs.observe(sec);
  });
}

/* --------------------------------------------------------------- LOGIN */
function abrirLogin() {
  $('#loginModal').classList.add('abierto');
  $('#loginModal').setAttribute('aria-hidden', 'false');
  setTimeout(() => $('input', $('#loginForm')).focus(), 100);
}

function cerrarLogin() {
  $('#loginModal').classList.remove('abierto');
  $('#loginModal').setAttribute('aria-hidden', 'true');
  $('#loginError').textContent = '';
}

$('#btnAdmin').addEventListener('click', abrirLogin);
$('[data-close-login]').addEventListener('click', cerrarLogin);
$('#loginModal').addEventListener('click', (e) => {
  if (e.target === $('#loginModal')) cerrarLogin();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { cerrarLogin(); $('#mobileMenu').classList.remove('abierto'); }
});

$('#loginForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const err = $('#loginError');
  err.textContent = '';
  try {
    await pedir('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: f.usuario.value.trim(), clave: f.clave.value })
    });
    window.location.href = '/admin';
  } catch (e2) {
    err.textContent = e2.message;
  }
});

/* ------------------------------------------------------------- PESTANAS */
function mostrarVista(vista) {
  LIGA.vista = vista;
  $$('.panel-panel').forEach((p) => p.classList.toggle('activo', p.dataset.panel === vista));
  revelar();
}

function pintarLiga() {
  pintarEquipos();
  pintarCalendario();
  pintarTabla();
  pintarEstadisticas();
  pintarX5();
  revelar();
}

$('#ligaDivision').addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-division]');
  if (!btn) return;
  LIGA.division = btn.dataset.division;
  $$('#ligaDivision .pestana').forEach((b) => b.classList.toggle('activa', b === btn));
  pintarLiga();
});

$('#ligaVista').addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-vista]');
  if (!btn) return;
  $$('#ligaVista .pestana').forEach((b) => b.classList.toggle('activa', b === btn));
  mostrarVista(btn.dataset.vista);
});

const selJornada = $('#x5Jornada');
if (selJornada) selJornada.addEventListener('change', pintarX5Cancha);

/* ----------------------------------------------------------- MENU MOVIL */
$('#menuToggle').addEventListener('click', () => {
  const abierto = $('#mobileMenu').classList.toggle('abierto');
  $('#menuToggle').setAttribute('aria-expanded', String(abierto));
});

$('#mobileMenu').addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    $('#mobileMenu').classList.remove('abierto');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
  }
});

/* --------------------------------------------------------------- INICIO */
async function iniciar() {
  configBotonSubir();

  try {
    const r = await pedir('/api/sitio');
    Object.assign(DATOS, {
      modulos: r.modulos || [], contenidos: r.contenidos || {},
      equipos: r.equipos || [], fechas: r.fechas || [],
      ideales: r.ideales || [], foro: r.foro || []
    });

    pintarHeader();
    pintarHero();
    pintarLiga();
    pintarPubs();
    pintarMuseo();
    pintarNoticias();
    pintarAnuncios();
    pintarAlianzas();
    pintarEquipo();
    pintarRedes();
    pintarDonacion();
    pintarForo();
    revelar();
    scrollSpy();

    // Si el admin ya tiene sesion, el boton abre el panel
    const s = await pedir('/api/sesion');
    if (s.autenticado) {
      $('#btnAdmin').textContent = 'IR AL PANEL';
      $('#btnAdmin').onclick = () => (window.location.href = '/admin');
    }
  } catch (err) {
    console.error(err);
    toast('No se pudo conectar con la base de datos');
  } finally {
    revelar();
    requestAnimationFrame(ocultarPreloader);
  }
}

document.addEventListener('DOMContentLoaded', iniciar);