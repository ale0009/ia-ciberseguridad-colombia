// Motor de reglas (sin IA, sin red): a partir del escenario devuelve el marco legal colombiano aplicable,
// los riesgos, el semáforo legal, el nivel de madurez y la recomendación de arquitectura.
// Divulgación, NO asesoría legal.
//
// origen de cada norma:
//   'investigacion' → la cita la investigación de Mario y David (fuente del proyecto)
//   'verificado'    → añadido aquí y contrastado con el texto oficial (Secretaría del Senado, 10 nov 2026)
//   'por-verificar' → la fuente no la cita o no pudimos abrir el texto oficial: hay que confirmarla

const SENADO = 'http://www.secretariasenado.gov.co/senado/basedoc/';

export const DATOS = {
  personales: 'Datos personales (nombres, correos, IP de usuarios)',
  sensibles: 'Datos sensibles (biométricos, religión, política…)',
  financieros: 'Datos financieros o crediticios',
  salud: 'Datos de salud',
};

export const TAMANOS = {
  micro: 'Micro (menos de 10 personas)',
  pequena: 'Pequeña (10 a 50)',
  mediana: 'Mediana (51 a 200)',
  grande: 'Grande (más de 200)',
};

export const DESPLIEGUES = {
  local: 'Local: modelo de pesos abiertos en tus equipos',
  hibrido: 'Híbrido: lo personal en local, a la nube solo datos anonimizados',
  nube: 'Nube: API de un proveedor externo',
};

/** Equipo sugerido por tamaño de empresa (el visitante lo puede cambiar). */
export const EQUIPO_POR_TAMANO = { micro: 'cpu', pequena: 'gpu8', mediana: 'gpu24', grande: 'servidor' };

export const NORMAS = {
  conpes3854: { ley: 'CONPES 3854 de 2016', art: 'Política Nacional de Seguridad Digital', origen: 'investigacion',
    url: 'https://colaboracion.dnp.gov.co/CDT/Conpes/Econ%C3%B3micos/3854.pdf',
    porque: 'Marco de política pública: la seguridad digital como gestión de riesgos, con cinco dimensiones según la investigación.' },
  conpes3995: { ley: 'CONPES 3995 de 2020', art: 'Política de confianza y seguridad digital', origen: 'por-verificar',
    url: 'https://www.dnp.gov.co/',
    porque: 'La investigación no la cita: confirmar su vigencia y alcance antes de usarla.' },
  sicIA: { ley: 'SIC: instrucciones sobre IA y datos personales', art: 'Circular o guía de la SIC', origen: 'por-verificar',
    url: 'https://www.sic.gov.co/',
    porque: 'La fuente no cita una guía de IA de la SIC. Busca en sic.gov.co si hay instrucciones vigentes antes de desplegar.' },
  '1581-4': { ley: 'Ley 1581 de 2012', art: 'Art. 4: principios', origen: 'investigacion', url: `${SENADO}ley_1581_2012.html`,
    porque: 'Finalidad, acceso y circulación restringida, seguridad y confidencialidad también rigen lo que procesa una IA.' },
  '1581-9': { ley: 'Ley 1581 de 2012', art: 'Art. 9: autorización del titular', origen: 'verificado', url: `${SENADO}ley_1581_2012.html`,
    porque: 'Usar datos personales para entrenar o consultar una IA es tratamiento: necesita autorización previa e informada para esa finalidad.' },
  '1581-5-6': { ley: 'Ley 1581 de 2012', art: 'Arts. 5 y 6: datos sensibles', origen: 'verificado', url: `${SENADO}ley_1581_2012.html`,
    porque: 'La salud y los biométricos son datos sensibles: su tratamiento está prohibido salvo excepciones, como la autorización explícita.' },
  '1581-17-18': { ley: 'Ley 1581 de 2012', art: 'Arts. 17 y 18: deberes de responsable y encargado', origen: 'verificado', url: `${SENADO}ley_1581_2012.html`,
    porque: 'Si un proveedor de IA procesa tus datos actúa como encargado: tú respondes por elegirlo y vigilarlo.' },
  '1581-26': { ley: 'Ley 1581 de 2012', art: 'Art. 26: transferencia internacional', origen: 'verificado', url: `${SENADO}ley_1581_2012.html`,
    porque: 'Prohíbe enviar datos a países sin nivel adecuado de protección, salvo excepciones como la autorización expresa e inequívoca.' },
  '1581-23': { ley: 'Ley 1581 de 2012', art: 'Art. 23: sanciones de la SIC', origen: 'verificado', url: `${SENADO}ley_1581_2012.html`,
    porque: 'Multas de hasta 2.000 SMMLV, suspensión hasta 6 meses y cierre inmediato si hay datos sensibles.' },
  d1377: { ley: 'Decreto 1377 de 2013', art: 'Autorización, políticas y transferencias', origen: 'investigacion',
    url: 'https://www.suin-juriscol.gov.co/',
    porque: 'Exige una política de tratamiento pública y regula cómo se pide la autorización y cómo salen los datos del país.' },
  ce0072018: { ley: 'Circular Externa 007 de 2018', art: 'Reporte de incidentes (según la investigación)', origen: 'por-verificar',
    url: 'https://www.sic.gov.co/',
    porque: 'La investigación indica reportar a la SIC las brechas con datos personales en máximo 15 días hábiles. Ver fe de erratas.' },
  '1266-7-9': { ley: 'Ley 1266 de 2008', art: 'Arts. 7, 8 y 9: deberes de operadores, fuentes y usuarios', origen: 'verificado', url: `${SENADO}ley_1266_2008.html`,
    porque: 'La información crediticia solo se usa para fines autorizados y con reserva: no la mandes a un servicio externo sin base.' },
  '1266-18': { ley: 'Ley 1266 de 2008', art: 'Art. 18: sanciones', origen: 'verificado', url: `${SENADO}ley_1266_2008.html`,
    porque: 'La SIC y la Superfinanciera pueden multar hasta 2.000 SMMLV (texto modificado por la Ley 2157 de 2021).' },
  '269A': { ley: 'Ley 1273 de 2009', art: 'Art. 269A: acceso abusivo', origen: 'investigacion', url: `${SENADO}ley_1273_2009.html`,
    porque: 'Un agente de IA que entra a sistemas «por fuera de lo acordado» puede configurar el delito: 48 a 96 meses de prisión.' },
  '269C': { ley: 'Ley 1273 de 2009', art: 'Art. 269C: interceptación de datos', origen: 'investigacion', url: `${SENADO}ley_1273_2009.html`,
    porque: 'Inspeccionar comunicaciones ajenas sin base legal es riesgoso: interceptar sin orden judicial tiene 36 a 72 meses de prisión.' },
  '269E': { ley: 'Ley 1273 de 2009', art: 'Art. 269E: uso de software malicioso', origen: 'verificado', url: `${SENADO}ley_1273_2009.html`,
    porque: 'Adquirir, distribuir o enviar malware «sin estar facultado» es delito: las muestras se guardan en un laboratorio aislado y autorizado.' },
  '269F': { ley: 'Ley 1273 de 2009', art: 'Art. 269F: violación de datos personales', origen: 'verificado', url: `${SENADO}ley_1273_2009.html`,
    porque: 'Enviar o emplear datos personales sin estar facultado, con provecho propio o de un tercero, es delito: 48 a 96 meses.' },
  '269G': { ley: 'Ley 1273 de 2009', art: 'Art. 269G: suplantación de sitios web', origen: 'investigacion', url: `${SENADO}ley_1273_2009.html`,
    porque: 'Es el delito que tu IA ayuda a detectar. Si haces simulacros de phishing internos, que sean autorizados y documentados.' },
};

export const ORIGENES = { investigacion: 'De la investigación', verificado: 'Verificado en el texto oficial', 'por-verificar': 'Por verificar' };

/** Controles que suben el nivel de madurez. `aplica(e)` dice si cuentan en este escenario. */
export const CONTROLES = [
  { id: 'inventario', nombre: 'Inventario de datos y flujos hacia la IA', xp: 10, aplica: () => true },
  { id: 'politica', nombre: 'Política de tratamiento publicada', xp: 10, aplica: (e) => tienePersonales(e) },
  { id: 'autorizacion', nombre: 'Autorizaciones de los titulares guardadas', xp: 15, aplica: (e) => tienePersonales(e) },
  { id: 'contrato', nombre: 'Contrato de tratamiento con el proveedor de IA', xp: 15, aplica: (e) => e.despliegue !== 'local' && tienePersonales(e) },
  { id: 'monitoreo', nombre: 'Política de monitoreo conocida por el equipo', xp: 10, aplica: (e) => ['soc', 'dlp'].includes(e.caso) },
  { id: 'laboratorio', nombre: 'Laboratorio aislado y autorizado para muestras', xp: 15, aplica: (e) => e.caso === 'malware' },
  { id: 'humano', nombre: 'Una persona revisa antes de bloquear o sancionar', xp: 15, aplica: () => true },
  { id: 'redteam', nombre: 'Pruebas de inyección de instrucciones', xp: 10, aplica: () => true },
  { id: 'registro', nombre: 'Registro de lo que pregunta y responde la IA', xp: 10, aplica: () => true },
  { id: 'incidentes', nombre: 'Plan de incidentes y de reporte a la SIC', xp: 10, aplica: (e) => tienePersonales(e) },
  { id: 'evaluacion', nombre: 'Evaluación de impacto antes de desplegar', xp: 10, aplica: () => true },
];

export const NIVELES = [
  { n: 1, nombre: 'Novato', desde: 0 },
  { n: 2, nombre: 'Aprendiz', desde: 20 },
  { n: 3, nombre: 'Guardián', desde: 40 },
  { n: 4, nombre: 'Centinela', desde: 60 },
  { n: 5, nombre: 'Maestro del dojo', desde: 80 },
];

export function tienePersonales(e) {
  return (e.datos ?? []).length > 0;
}
const tieneSensibles = (e) => (e.datos ?? []).some((d) => d === 'sensibles' || d === 'salud');

/** Normaliza el escenario: listas únicas, valores válidos y valores por defecto. */
export function escenario(entrada = {}) {
  const datos = [...new Set((entrada.datos ?? []).filter((d) => d in DATOS))];
  // datos sensibles, de salud o financieros también son datos personales
  if (datos.some((d) => d !== 'personales') && !datos.includes('personales')) datos.unshift('personales');
  return {
    datos,
    tamano: entrada.tamano in TAMANOS ? entrada.tamano : 'pequena',
    caso: ['phishing', 'soc', 'malware', 'dlp', 'chat'].includes(entrada.caso) ? entrada.caso : 'phishing',
    despliegue: entrada.despliegue in DESPLIEGUES ? entrada.despliegue : 'local',
    controles: [...new Set((entrada.controles ?? []).filter((c) => CONTROLES.some((k) => k.id === c)))],
  };
}

/** Lista de normas aplicables (ids de NORMAS) en orden de lectura. */
export function marcoLegal(entrada) {
  const e = escenario(entrada);
  const ids = ['conpes3854'];
  const nube = e.despliegue !== 'local';
  if (tienePersonales(e)) {
    ids.push('1581-4', '1581-9');
    if (tieneSensibles(e)) ids.push('1581-5-6');
    if (nube) ids.push('1581-17-18');
    if (e.despliegue === 'nube') ids.push('1581-26');
    ids.push('d1377', '1581-23', '269F', 'ce0072018');
  }
  if (e.datos.includes('financieros')) ids.push('1266-7-9', '1266-18');
  if (e.caso === 'phishing') ids.push('269G');
  if (e.caso === 'soc') ids.push('269A', '269C');
  if (e.caso === 'dlp') ids.push('269C');
  if (e.caso === 'malware') ids.push('269E', '269A');
  ids.push('sicIA', 'conpes3995');
  return [...new Set(ids)].map((id) => ({ id, ...NORMAS[id] }));
}

/**
 * Semáforo legal: suma de factores de riesgo menos mitigaciones (cada uno explicado).
 * 0–2 verde · 3–4 amarillo · 5 o más rojo.
 */
export function semaforo(entrada) {
  const e = escenario(entrada);
  const c = new Set(e.controles);
  const f = [];
  const suma = (p, texto) => f.push({ puntos: p, texto });
  const personales = tienePersonales(e);
  const sensibles = tieneSensibles(e);
  if (personales) suma(1, 'Hay datos personales: rige la Ley 1581.');
  if (sensibles) suma(2, 'Datos sensibles o de salud: tratamiento prohibido salvo excepciones.');
  if (e.datos.includes('financieros')) suma(1, 'Datos financieros: suma la Ley 1266.');
  if (personales && e.despliegue === 'nube') suma(2, 'Los datos salen hacia un proveedor externo, a menudo fuera del país.');
  if (personales && e.despliegue === 'hibrido') suma(1, 'Algo sale a la nube, aunque anonimizado: hay que demostrar que no se puede reidentificar.');
  if (sensibles && e.despliegue === 'nube') suma(1, 'Datos sensibles en servidores ajenos.');
  if (['soc', 'dlp'].includes(e.caso)) suma(1, 'Vigila comunicaciones y actividad del equipo (cuidado con el art. 269C).');
  if (e.caso === 'malware') suma(1, 'Manipula software malicioso (art. 269E).');
  if (e.caso === 'chat' && e.despliegue !== 'local') suma(1, 'Lo que el equipo escribe en el chat puede salir de la empresa.');
  if (personales && c.has('autorizacion') && c.has('politica')) suma(-1, 'Autorización y política de tratamiento al día.');
  if (personales && e.despliegue !== 'local' && c.has('contrato')) suma(-1, 'Contrato de tratamiento firmado con el proveedor.');
  if (['soc', 'dlp'].includes(e.caso) && c.has('monitoreo')) suma(-1, 'El equipo conoce la política de monitoreo.');
  if (e.caso === 'malware' && c.has('laboratorio')) suma(-1, 'Muestras en un laboratorio aislado y autorizado.');
  const puntos = Math.max(0, f.reduce((s, x) => s + x.puntos, 0));
  const color = puntos <= 2 ? 'verde' : puntos <= 4 ? 'amarillo' : 'rojo';
  const titulo = { verde: 'Vía libre con buenas prácticas', amarillo: 'Avanza con condiciones', rojo: 'Alto: revisa antes de desplegar' }[color];
  return { puntos, color, titulo, factores: f };
}

/** Nivel de madurez tipo videojuego: % de XP de los controles que aplican a este escenario. */
export function madurez(entrada) {
  const e = escenario(entrada);
  const aplican = CONTROLES.filter((k) => k.aplica(e));
  const total = aplican.reduce((s, k) => s + k.xp, 0);
  const ganada = aplican.filter((k) => e.controles.includes(k.id)).reduce((s, k) => s + k.xp, 0);
  const pct = total ? Math.round((ganada / total) * 100) : 0;
  const nivel = [...NIVELES].reverse().find((n) => pct >= n.desde);
  const siguiente = NIVELES.find((n) => n.desde > pct) ?? null;
  const faltan = aplican.filter((k) => !e.controles.includes(k.id));
  const logros = [];
  const has = (id) => e.controles.includes(id);
  if (has('politica') && has('autorizacion')) logros.push('Dato con permiso');
  if (has('humano')) logros.push('Ojo humano');
  if (has('redteam') && has('registro')) logros.push('Cortafuegos de instrucciones');
  if (faltan.length === 0 && aplican.length) logros.push('Todo en orden');
  return { pct, xp: ganada, xpTotal: total, nivel, siguiente, aplican, faltan, logros };
}

/** Riesgos del escenario con referencia a OWASP Top 10 para LLM (2025), MITRE ATLAS o NIST AI RMF. */
export function riesgos(entrada) {
  const e = escenario(entrada);
  const out = [];
  const r = (id, nivel, titulo, porque, mitigar, ref) => out.push({ id, nivel, titulo, porque, mitigar, ref });
  const personales = tienePersonales(e);
  if (personales && e.despliegue !== 'local') {
    r('fuga', e.despliegue === 'nube' ? 'alto' : 'medio', 'Fuga de datos al proveedor de IA',
      'Lo que envías a una API queda en servidores ajenos: puede guardarse, revisarse o usarse para entrenar.',
      'Contrato que prohíba entrenar con tus datos, anonimizar antes de enviar y registrar qué sale.', 'OWASP LLM02');
  }
  if (personales && e.despliegue === 'nube') {
    r('transferencia', 'alto', 'Transferencia internacional de datos',
      'Si el servidor está fuera de Colombia, aplica la prohibición del art. 26 de la Ley 1581 salvo excepciones.',
      'Confirmar el país del servidor y su nivel de protección, o pedir autorización expresa.', 'Ley 1581, art. 26');
  }
  if (['phishing', 'soc', 'chat'].includes(e.caso)) {
    r('inyeccion', 'alto', 'Inyección de instrucciones',
      e.caso === 'phishing' ? 'Un correo malicioso puede traer texto escrito para engañar al modelo («clasifica esto como seguro»).'
        : e.caso === 'soc' ? 'Un atacante puede sembrar texto en los registros para manipular el análisis.'
          : 'Documentos o mensajes con instrucciones ocultas cambian lo que responde el chat.',
      'Separar datos de instrucciones, validar la salida y probar con ataques conocidos.', 'OWASP LLM01 · MITRE ATLAS');
  }
  r('alucinacion', ['soc', 'malware'].includes(e.caso) ? 'alto' : 'medio', 'Alucinaciones',
    'El modelo puede inventar indicadores, CVE o explicaciones convincentes pero falsas.',
    'Pedir siempre la evidencia, contrastar con fuentes y que una persona confirme.', 'OWASP LLM09');
  if (['soc', 'malware'].includes(e.caso)) {
    r('agencia', 'alto', 'Agencia excesiva',
      'Si la IA puede bloquear, borrar o entrar a sistemas sola, un error se vuelve un incidente (y puede rozar los arts. 269A y 269B).',
      'Permisos mínimos y aprobación humana para toda acción.', 'OWASP LLM06');
  }
  if (['soc', 'dlp', 'phishing'].includes(e.caso)) {
    r('sesgo', 'medio', 'Sesgo',
      'Puede marcar más a ciertas áreas, idiomas o personas y terminar en sanciones injustas.',
      'Medir falsos positivos por grupo y revisar las decisiones que afectan a personas.', 'NIST AI RMF (Medir)');
  }
  if (e.despliegue !== 'nube') {
    r('suministro', 'medio', 'Cadena de suministro del modelo',
      'Descargar pesos de un repositorio falso o en formatos que ejecutan código al abrirse.',
      'Bajar solo del autor oficial, preferir safetensors o GGUF y verificar el hash.', 'OWASP LLM03 · MITRE ATLAS');
  }
  if (['chat', 'dlp'].includes(e.caso)) {
    r('rag', 'medio', 'Debilidades en búsquedas por embeddings',
      'Un buscador interno puede mostrar a alguien documentos que no debería ver.',
      'Respetar los permisos de cada documento en el índice.', 'OWASP LLM08');
  }
  if (['phishing', 'malware'].includes(e.caso)) {
    r('envenenamiento', 'bajo', 'Envenenamiento de datos',
      'Si reentrenas con correos o muestras sin revisar, el atacante puede enseñarle a ignorarlo.',
      'Curar y versionar los datos de entrenamiento.', 'OWASP LLM04');
  }
  if (e.despliegue === 'nube') {
    r('consumo', 'bajo', 'Consumo sin límite',
      'Un volumen alto de registros o un ataque dispara la factura de la API.',
      'Cuotas, límites por usuario y alertas de costo.', 'OWASP LLM10');
  }
  const orden = { alto: 0, medio: 1, bajo: 2 };
  return out.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
}

/** Arquitectura recomendada para el escenario (independiente de lo que eligió el visitante). */
export function recomendarDespliegue(entrada, equipo = 'gpu3') {
  const e = escenario(entrada);
  const razones = [];
  let despliegue;
  if (tieneSensibles(e) || e.datos.includes('financieros')) {
    despliegue = 'local';
    razones.push('Hay datos sensibles, de salud o financieros: que no salgan de tus equipos.');
  } else if (tienePersonales(e)) {
    despliegue = equipo === 'cpu' ? 'hibrido' : 'local';
    razones.push(equipo === 'cpu'
      ? 'Sin GPU, un modelo pequeño local anonimiza y la nube solo ve datos sin identificar.'
      : 'Con datos personales y una GPU disponible, lo más simple de defender ante la SIC es procesar en casa.');
  } else {
    despliegue = equipo === 'cpu' ? 'nube' : 'local';
    razones.push('Sin datos personales el riesgo legal baja; elige por costo y control.');
    if (['soc', 'dlp', 'chat'].includes(e.caso)) razones.push('Ojo: los registros y chats casi siempre traen usuarios e IP, que son datos personales.');
  }
  if (e.caso === 'malware') razones.push('El análisis de malware va en un laboratorio aislado: un modelo local no expone las muestras.');
  if (e.caso === 'chat') razones.push('Pon un modelo guardián delante del chat para filtrar entradas y salidas.');
  return { despliegue, razones, coincide: despliegue === e.despliegue };
}

/** Todo junto, para la interfaz. */
export function evaluar(entrada, equipo) {
  const e = escenario(entrada);
  return { escenario: e, normas: marcoLegal(e), semaforo: semaforo(e), madurez: madurez(e), riesgos: riesgos(e), recomendacion: recomendarDespliegue(e, equipo) };
}
