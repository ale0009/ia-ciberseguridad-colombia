// Interfaz de la herramienta: lee el formulario, llama al motor de reglas y pinta los resultados.
import { DATOS, TAMANOS, DESPLIEGUES, EQUIPO_POR_TAMANO, CONTROLES, ORIGENES, escenario, evaluar } from './reglas.js';
import { CASOS, ROLES, EQUIPOS, CATALOGO, recomendarModelos, kitDelCaso, textoParametros } from './modelos.js';
import { traerModelos } from './hf.js';
import { RESPALDO, FECHA_RESPALDO } from './respaldo-modelos.js';
import { aHash, deHash } from './enlace.js';
import { iniciarTema } from './tema.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const miles = (n) => (Number.isFinite(n) ? n.toLocaleString('es-CO') : '–');

const EJEMPLO = { datos: ['personales', 'salud'], tamano: 'pequena', caso: 'phishing', despliegue: 'nube', controles: [] };
const EQUIPO_EJEMPLO = 'gpu8';
const CASOS_CORTOS = { phishing: 'Phishing', soc: 'Registros / SOC', malware: 'Malware', dlp: 'Fuga de datos (DLP)', chat: 'Chat interno' };
const DATOS_CORTOS = { personales: 'Personales', sensibles: 'Sensibles', financieros: 'Financieros', salud: 'Salud' };
const ONOMA = { rojo: '¡ALTO!', amarillo: '¡OJO!', verde: '¡VAMOS!' };
const ENCAJE = { cabe: 'Cabe en la GPU', parcial: 'Parcial (GPU + RAM)', no: 'No cabe', desconocido: 'Sin dato' };

const estado = {
  e: escenario(EJEMPLO),
  equipo: EQUIPO_EJEMPLO,
  equipoTocado: false,
  esEjemplo: true,
  datosHF: RESPALDO,
  verTodos: false,
};

/* ---------- construir controles ---------- */
function chips(cont, nombre, tipo, opciones) {
  cont.innerHTML = Object.entries(opciones).map(([v, txt]) =>
    `<label class="chip-op"><input type="${tipo}" name="${nombre}" value="${v}"><span>${esc(txt)}</span></label>`).join('');
}
function opciones(sel, mapa) {
  sel.innerHTML = Object.entries(mapa).map(([v, o]) => `<option value="${v}">${esc(typeof o === 'string' ? o : o.nombre)}</option>`).join('');
}

function construir() {
  chips($('#f-datos'), 'datos', 'checkbox', DATOS_CORTOS);
  $('#f-datos').querySelectorAll('label').forEach((l) => { l.title = DATOS[l.querySelector('input').value]; });
  chips($('#f-caso'), 'caso', 'radio', CASOS_CORTOS);
  chips($('#f-despliegue'), 'despliegue', 'radio', DESPLIEGUES);
  opciones($('#f-tamano'), TAMANOS);
  opciones($('#f-equipo'), EQUIPOS);
  $('#ver-todos').parentElement.lastChild.textContent = ` Ver los ${CATALOGO.length} modelos, no solo los del caso`;
}

function volcarAlFormulario() {
  const { e, equipo } = estado;
  document.querySelectorAll('input[name="datos"]').forEach((i) => { i.checked = e.datos.includes(i.value); });
  document.querySelectorAll('input[name="caso"]').forEach((i) => { i.checked = i.value === e.caso; });
  document.querySelectorAll('input[name="despliegue"]').forEach((i) => { i.checked = i.value === e.despliegue; });
  $('#f-tamano').value = e.tamano;
  $('#f-equipo').value = equipo;
}

function leerFormulario() {
  const marcados = (n) => [...document.querySelectorAll(`input[name="${n}"]:checked`)].map((i) => i.value);
  return escenario({
    datos: marcados('datos'),
    caso: marcados('caso')[0],
    despliegue: marcados('despliegue')[0],
    tamano: $('#f-tamano').value,
    controles: marcados('control'),
  });
}

/* ---------- pintar ---------- */
function pintarSemaforo(s) {
  const sem = $('#semaforo');
  sem.dataset.color = s.color;
  sem.setAttribute('aria-label', `Semáforo en ${s.color}`);
  $('#onoma').textContent = ONOMA[s.color];
  $('#onoma').dataset.color = s.color;
  $('#sem-titulo').textContent = s.titulo;
  $('#sem-puntos').textContent = s.puntos;
  $('#mini-hud').dataset.color = s.color;
  $('#mh-txt').textContent = `${ONOMA[s.color]} ${s.puntos} pts`;
  $('#factores').innerHTML = s.factores.length
    ? s.factores.map((f) => `<li class="${f.puntos < 0 ? 'resta' : 'suma'}"><b>${f.puntos > 0 ? '+' : '−'}${Math.abs(f.puntos)}</b> ${esc(f.texto)}</li>`).join('')
    : '<li class="resta"><b>0</b> Sin datos personales ni actividades delicadas.</li>';
}

function pintarMadurez(m) {
  $('#nivel-n').textContent = `Nv. ${m.nivel.n}`;
  $('#nivel-nombre').textContent = m.nivel.nombre;
  $('#mh-nivel').textContent = `Nv. ${m.nivel.n} · ${m.nivel.nombre}`;
  $('#xp').textContent = `${m.xp} / ${m.xpTotal} XP`;
  $('#barra-xp').setAttribute('aria-valuenow', m.pct);
  $('#barra-xp').setAttribute('aria-valuetext', `${m.pct} %, nivel ${m.nivel.n} ${m.nivel.nombre}`);
  $('#barra-xp-r').style.width = `${m.pct}%`;
  $('#nivel-sig').textContent = m.siguiente
    ? `${m.pct} % · llega al ${m.siguiente.desde} % para subir a «${m.siguiente.nombre}».`
    : `${m.pct} % · nivel máximo.`;
  $('#logros').innerHTML = m.logros.length
    ? `Logros: ${m.logros.map((l) => `<span class="logro">${esc(l)}</span>`).join(' ')}`
    : 'Logros: ninguno todavía. Completa misiones abajo.';
}

function pintarMisiones(e, m) {
  const ul = $('#misiones');
  const aplican = new Set(m.aplican.map((k) => k.id));
  ul.innerHTML = CONTROLES.filter((k) => aplican.has(k.id)).map((k) => `
    <li><label class="mision${e.controles.includes(k.id) ? ' hecha' : ''}">
      <input type="checkbox" name="control" value="${k.id}"${e.controles.includes(k.id) ? ' checked' : ''}>
      <span class="mis-nom">${esc(k.nombre)}</span><span class="mis-xp">+${k.xp} XP</span>
    </label></li>`).join('');
}

function pintarNormas(normas) {
  $('#normas').innerHTML = normas.map((n) => `
    <li class="norma">
      <p class="norma-cab"><span class="ley">${esc(n.ley)}</span> <span class="tag o-${n.origen}" title="${esc(ORIGENES[n.origen])}">${esc(ORIGENES[n.origen])}</span></p>
      <p class="norma-art"><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.art)}</a></p>
      <p class="norma-por">${esc(n.porque)}</p>
    </li>`).join('');
}

function pintarRiesgos(rs) {
  $('#riesgos').innerHTML = rs.map((r) => `
    <li class="riesgo r-${r.nivel}">
      <p class="riesgo-cab"><span class="nivel-tag">${r.nivel}</span> <strong>${esc(r.titulo)}</strong> <span class="ref">${esc(r.ref)}</span></p>
      <p>${esc(r.porque)}</p>
      <p class="mitigar"><span class="et">Mitiga</span> ${esc(r.mitigar)}</p>
    </li>`).join('');
}

const CAJAS = {
  local: [['Tus datos', ''], ['Modelo de pesos abiertos', 'en tus equipos'], ['Alerta', 'a una persona']],
  hibrido: [['Tus datos', ''], ['Anonimizador local', 'quita nombres e IDs'], ['API en la nube', 'solo ve datos sin identificar']],
  nube: [['Tus datos', 'tal cual'], ['Internet', 'a otro país, a menudo'], ['API en la nube', 'el proveedor los procesa']],
};
function pintarArquitectura(rec, e) {
  const d = rec.despliegue;
  $('#flujo').innerHTML = CAJAS[d].map(([t, s], i) =>
    `<div class="caja${i === 1 && d === 'local' ? ' clave' : ''}${d === 'nube' && i > 0 ? ' afuera' : ''}"><b>${esc(t)}</b>${s ? `<small>${esc(s)}</small>` : ''}</div>`).join('<span class="flecha">→</span>');
  const nombre = { local: 'Local con pesos abiertos', hibrido: 'Híbrido', nube: 'API en la nube' }[d];
  $('#reco').innerHTML = rec.coincide
    ? `<span class="tag ok">Coincide con tu elección</span> <strong>${nombre}</strong>`
    : `<span class="tag no-ok">Elegiste: ${esc({ local: 'local', hibrido: 'híbrido', nube: 'nube' }[e.despliegue])}</span> Recomendamos <strong>${nombre}</strong>`;
  $('#razones').innerHTML = rec.razones.map((r) => `<li>${esc(r)}</li>`).join('');
  const b = $('#aplicar');
  b.hidden = rec.coincide;
  b.dataset.despliegue = d;
}

function encajeTxt(m) {
  if (m.encaje === 'parcial' && EQUIPOS[estado.equipo].vram === 0) return 'Solo CPU (lento)';
  return ENCAJE[m.encaje];
}

function pintarKit() {
  const kit = kitDelCaso({ caso: estado.e.caso, equipo: estado.equipo, datos: estado.datosHF });
  $('#kit').innerHTML = kit.length ? kit.map(({ rol, modelo: m }) => `
    <li class="pieza">
      <span class="pieza-rol">${esc(ROLES[rol])}</span>
      <a class="pieza-nom" href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.nombre)}</a>
      <span class="pieza-dat">${esc(m.familia)} · ${textoParametros(m.parametros)} parám. · ~${m.memoria ?? '¿?'} GB</span>
      <span class="encaje e-${m.encaje}">${encajeTxt(m)}</span>${m.lab ? ' <span class="tag lab">Lab</span>' : ''}
    </li>`).join('') : '<li class="vacio">Ningún modelo del catálogo corre en este equipo.</li>';
}

function pintarTabla() {
  const lista = recomendarModelos({ caso: estado.e.caso, equipo: estado.equipo, datos: estado.datosHF, todos: estado.verTodos });
  $('#tbody').innerHTML = lista.map((m) => `
    <tr class="${m.delCaso ? '' : 'otro'}">
      <th scope="row"><a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.nombre)}</a><small>${esc(m.familia)}</small>${m.lab ? '<span class="tag lab">Lab</span>' : ''}${m.nota ? `<small class="mnota">${esc(m.nota)}</small>` : ''}</th>
      <td>${esc(ROLES[m.rol])}</td>
      <td class="num">${textoParametros(m.parametros)}</td>
      <td class="num">${m.memoria != null ? `~${m.memoria.toLocaleString('es-CO')} GB` : '–'}</td>
      <td><span class="encaje e-${m.encaje}">${encajeTxt(m)}</span></td>
      <td><span class="lic l-${m.tipoLicencia}">${esc(m.licencia ?? 'ver tarjeta')}</span>${m.condiciones ? '<small>pide aceptar condiciones</small>' : ''}</td>
      <td class="num">${miles(m.descargas30d)}</td>
      <td class="num">${miles(m.likes)}</td>
    </tr>`).join('');
}

function pintar() {
  const r = evaluar(estado.e, estado.equipo);
  estado.e = r.escenario;
  $('#ejemplo').hidden = !estado.esEjemplo;
  $('#ayuda-datos').hidden = r.escenario.datos.length > 0;
  pintarSemaforo(r.semaforo);
  pintarMadurez(r.madurez);
  pintarMisiones(r.escenario, r.madurez);
  pintarNormas(r.normas);
  pintarRiesgos(r.riesgos);
  pintarArquitectura(r.recomendacion, r.escenario);
  pintarKit();
  pintarTabla();
  if (!estado.esEjemplo) history.replaceState(null, '', aHash(estado.e, estado.equipo));
}

/* ---------- Hugging Face en vivo ---------- */
function chipEstado(html) { $('#estado').innerHTML = html; }

async function cargarHF() {
  const fecha = new Date(`${FECHA_RESPALDO}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const respaldo = (motivo) => chipEstado(`<span class="chip chip-error">Sin conexión: datos de ejemplo del ${fecha}</span>
    <span class="motivo">${esc(motivo)}</span> <button type="button" class="enlace" id="reintentar">Reintentar</button>`);
  if (new URLSearchParams(location.search).has('sin-conexion')) {
    respaldo('Modo sin conexión forzado (?sin-conexion).');
    return;
  }
  chipEstado('<span class="chip chip-carga">Consultando Hugging Face…</span>');
  try {
    const { datos, fallos } = await traerModelos();
    const n = Object.keys(datos).length;
    if (!n) throw new Error(fallos[0]?.motivo ?? 'sin respuesta');
    estado.datosHF = { ...RESPALDO, ...datos };
    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    chipEstado(`<span class="chip chip-vivo">En vivo · ${hora}</span> <span class="motivo">${n} de ${CATALOGO.length} modelos desde la API pública de Hugging Face${fallos.length ? `; ${fallos.length} con datos del ${fecha}` : ''}. Descargas = últimos 30 días.</span>`);
    pintarKit();
    pintarTabla();
  } catch (err) {
    respaldo(`No se pudo consultar huggingface.co (${err.message}). Se muestran los datos guardados.`);
  }
}

/* ---------- eventos ---------- */
function alCambiar(ev) {
  const t = ev.target;
  estado.esEjemplo = false;
  if (t.id === 'f-equipo') estado.equipoTocado = true;
  estado.equipo = $('#f-equipo').value;
  estado.e = leerFormulario();
  if (t.id === 'f-tamano' && !estado.equipoTocado) {
    estado.equipo = EQUIPO_POR_TAMANO[estado.e.tamano];
    $('#f-equipo').value = estado.equipo;
  }
  pintar();
}

function iniciar() {
  iniciarTema($('#tema'));
  construir();
  const desdeHash = deHash(location.hash);
  if (desdeHash) {
    estado.e = desdeHash.escenario;
    estado.equipo = desdeHash.equipo ?? EQUIPO_POR_TAMANO[desdeHash.escenario.tamano];
    estado.equipoTocado = Boolean(desdeHash.equipo);
    estado.esEjemplo = false;
  }
  volcarAlFormulario();
  pintar();
  $('#form').addEventListener('change', alCambiar);
  $('#misiones').addEventListener('change', alCambiar);
  $('#aplicar').addEventListener('click', (ev) => {
    estado.e = escenario({ ...estado.e, despliegue: ev.currentTarget.dataset.despliegue });
    estado.esEjemplo = false;
    volcarAlFormulario();
    pintar();
    $('#semaforo').scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  $('#ver-todos').addEventListener('change', (ev) => { estado.verTodos = ev.target.checked; pintarTabla(); });
  $('#reiniciar').addEventListener('click', () => {
    Object.assign(estado, { e: escenario(EJEMPLO), equipo: EQUIPO_EJEMPLO, equipoTocado: false, esEjemplo: true });
    history.replaceState(null, '', location.pathname + location.search);
    volcarAlFormulario();
    pintar();
  });
  $('#copiar').addEventListener('click', async () => {
    const url = location.href.split('#')[0] + aHash(estado.e, estado.equipo);
    try { await navigator.clipboard.writeText(url); $('#aviso-copia').textContent = 'Enlace copiado.'; } catch { $('#aviso-copia').textContent = url; }
  });
  $('#estado').addEventListener('click', (ev) => { if (ev.target.id === 'reintentar') cargarHF(); });
  cargarHF();
}

iniciar();
