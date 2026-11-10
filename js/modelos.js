// Catálogo de modelos de pesos abiertos REALES (IDs verificados en la API pública de Hugging Face el 10 nov 2026)
// y la estimación de memoria para correrlos en local. Todo son funciones puras: se prueban con node --test.

/** Casos de uso de la herramienta. */
export const CASOS = {
  phishing: 'Detección de phishing',
  soc: 'Análisis de registros (SOC)',
  malware: 'Clasificación de malware',
  dlp: 'Prevención de fuga de datos (DLP)',
  chat: 'Chat interno de la empresa',
};

/** Rol de cada modelo (sale de su tarjeta en Hugging Face: «Guard», «embedding», «Coder», «Sec»…). */
export const ROLES = {
  seguridad: 'Especializado en ciberseguridad',
  guardian: 'Guardián: filtra entradas y salidas',
  embeddings: 'Embeddings: búsqueda y clasificación',
  generalista: 'Generalista de texto',
  codigo: 'Código y scripts',
  razonamiento: 'Razonamiento paso a paso',
  vision: 'Texto e imagen',
};

/** Qué roles sirven primero en cada caso (orden = prioridad). */
export const ROLES_POR_CASO = {
  phishing: ['embeddings', 'seguridad', 'vision', 'generalista'],
  soc: ['seguridad', 'razonamiento', 'generalista', 'embeddings'],
  malware: ['seguridad', 'codigo', 'razonamiento'],
  dlp: ['embeddings', 'guardian', 'generalista'],
  chat: ['generalista', 'guardian', 'embeddings'],
};

const F = { granite: 'IBM Granite', qwen: 'Qwen (Alibaba)', gemma: 'Gemma (Google)', llama: 'Llama (Meta)', mistral: 'Mistral', deepseek: 'DeepSeek', phi: 'Phi (Microsoft)', gptoss: 'gpt-oss (OpenAI)', fsec: 'Foundation-sec (Cisco)', nomic: 'Nomic' };

/** id: repo en Hugging Face · lab: probado en nuestro laboratorio (Ollama, GTX 1050 de 3 GB). */
export const CATALOGO = [
  { id: 'fdtn-ai/Foundation-Sec-8B-Instruct', familia: F.fsec, rol: 'seguridad', casos: ['soc', 'malware', 'phishing'] },
  { id: 'fdtn-ai/Foundation-Sec-8B', familia: F.fsec, rol: 'seguridad', casos: ['soc', 'malware'], nota: 'Modelo base: hay que ajustarlo o darle ejemplos; no es un chat.' },
  { id: 'ibm-granite/granite-guardian-3.3-8b', familia: F.granite, rol: 'guardian', casos: ['chat', 'dlp'] },
  { id: 'meta-llama/Llama-Guard-3-1B', familia: F.llama, rol: 'guardian', casos: ['chat', 'dlp'] },
  { id: 'ibm-granite/granite-embedding-278m-multilingual', familia: F.granite, rol: 'embeddings', casos: ['phishing', 'dlp', 'chat'] },
  { id: 'nomic-ai/nomic-embed-text-v1.5', familia: F.nomic, rol: 'embeddings', casos: ['phishing', 'dlp', 'chat', 'soc'], lab: true },
  { id: 'ibm-granite/granite-4.0-h-micro', familia: F.granite, rol: 'generalista', casos: ['phishing', 'soc', 'dlp', 'chat'] },
  { id: 'ibm-granite/granite-4.0-h-tiny', familia: F.granite, rol: 'generalista', casos: ['soc', 'chat', 'phishing', 'dlp'], lab: true, nota: 'Mezcla de expertos: activa una parte de sus parámetros por palabra, por eso corre ágil aunque no quepa entero.' },
  { id: 'Qwen/Qwen3-1.7B', familia: F.qwen, rol: 'generalista', casos: ['phishing', 'chat', 'dlp'], lab: true },
  { id: 'Qwen/Qwen3-4B', familia: F.qwen, rol: 'generalista', casos: ['phishing', 'soc', 'dlp', 'chat'], lab: true },
  { id: 'Qwen/Qwen3-8B', familia: F.qwen, rol: 'generalista', casos: ['soc', 'malware', 'chat'], lab: true },
  { id: 'Qwen/Qwen2.5-Coder-7B-Instruct', familia: F.qwen, rol: 'codigo', casos: ['malware', 'soc'], lab: true },
  { id: 'Qwen/Qwen3-VL-2B-Instruct', familia: F.qwen, rol: 'vision', casos: ['phishing'], lab: true, nota: 'Lee capturas de pantalla de páginas sospechosas.' },
  { id: 'google/gemma-3-1b-it', familia: F.gemma, rol: 'generalista', casos: ['phishing', 'dlp'] },
  { id: 'google/gemma-3-4b-it', familia: F.gemma, rol: 'vision', casos: ['phishing', 'dlp', 'chat'] },
  { id: 'google/gemma-3-12b-it', familia: F.gemma, rol: 'generalista', casos: ['chat', 'soc'] },
  { id: 'meta-llama/Llama-3.2-3B-Instruct', familia: F.llama, rol: 'generalista', casos: ['phishing', 'chat'] },
  { id: 'meta-llama/Llama-3.1-8B-Instruct', familia: F.llama, rol: 'generalista', casos: ['soc', 'chat'] },
  { id: 'mistralai/Mistral-7B-Instruct-v0.3', familia: F.mistral, rol: 'generalista', casos: ['chat', 'phishing'] },
  { id: 'mistralai/Mistral-Small-3.2-24B-Instruct-2506', familia: F.mistral, rol: 'generalista', casos: ['soc', 'chat'] },
  { id: 'microsoft/Phi-4-mini-instruct', familia: F.phi, rol: 'generalista', casos: ['phishing', 'dlp'] },
  { id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B', familia: F.deepseek, rol: 'razonamiento', casos: ['malware', 'soc'] },
  { id: 'deepseek-ai/DeepSeek-V3', familia: F.deepseek, rol: 'generalista', casos: ['soc', 'chat'], nota: 'Solo en servidores con varias GPU.' },
  { id: 'openai/gpt-oss-20b', familia: F.gptoss, rol: 'razonamiento', casos: ['soc', 'malware', 'chat'] },
];

/** Equipos de referencia: VRAM de la GPU en GB. «gpu3» es nuestro laboratorio. */
export const EQUIPOS = {
  cpu: { vram: 0, nombre: 'Sin GPU (solo CPU)' },
  gpu3: { vram: 3, nombre: 'GPU de 3 GB (nuestro laboratorio)' },
  gpu8: { vram: 8, nombre: 'GPU de 8 GB' },
  gpu12: { vram: 12, nombre: 'GPU de 12 GB' },
  gpu24: { vram: 24, nombre: 'GPU de 24 GB' },
  servidor: { vram: 80, nombre: 'Servidor con GPU de 80 GB' },
};
/** RAM del sistema que se asume libre para «descargar» capas del modelo (equipo de 16 GB). */
export const RAM_LIBRE_GB = 12;

const r1 = (x) => Math.round(x * 10) / 10;

/**
 * Memoria aproximada (GB) para correr el modelo cuantizado (calculado aquí, ESTIMACIÓN):
 * pesos = parámetros × bits / 8, +10 % del motor de inferencia, + contexto (0,8 GB; 0,3 GB si es un modelo de embeddings).
 * 4,5 bits ≈ cuantización Q4 típica de llama.cpp/Ollama.
 */
export function memoriaGB(parametros, bits = 4.5) {
  if (!Number.isFinite(parametros) || parametros <= 0) return null;
  const pesos = (parametros * bits) / 8 / 1e9;
  const extra = parametros < 1e9 ? 0.3 : 0.8;
  return r1(pesos * 1.1 + extra);
}

/** 'cabe' en la GPU · 'parcial' (parte en RAM, más lento) · 'no'. */
export function encaje(memoria, vram) {
  if (memoria == null) return 'desconocido';
  if (vram > 0 && memoria <= vram * 0.92) return 'cabe';
  if (memoria <= vram + RAM_LIBRE_GB) return 'parcial';
  return 'no';
}

/** «3,2 mil M» → texto corto de parámetros: 278 M, 1,7 mil M, 685 mil M. */
export function textoParametros(n) {
  if (!Number.isFinite(n) || n <= 0) return '¿?';
  if (Math.round(n / 1e6) < 1000) return `${Math.round(n / 1e6)} M`;
  return `${(n / 1e9).toLocaleString('es-CO', { maximumFractionDigits: 1 })} mil M`;
}

const PERMISIVAS = new Set(['apache-2.0', 'mit', 'bsd-3-clause']);
/** Tipo de licencia: 'permisiva' (OSI) o 'propia' (pesos abiertos con condiciones del fabricante). */
export function tipoLicencia(lic) {
  const l = String(lic ?? '').toLowerCase();
  if (PERMISIVAS.has(l)) return 'permisiva';
  return 'propia';
}

/**
 * Normaliza la respuesta de https://huggingface.co/api/models/<id>?expand[]=… a los campos que usamos.
 * `downloads` de Hugging Face cuenta los últimos 30 días.
 */
export function normalizarHF(json) {
  if (!json || typeof json !== 'object' || !json.id) return null;
  const tagLic = (json.tags ?? []).find((t) => String(t).startsWith('license:'));
  const licencia = json.cardData?.license ?? (tagLic ? tagLic.slice(8) : null);
  return {
    id: json.id,
    descargas30d: Number.isFinite(json.downloads) ? json.downloads : null,
    likes: Number.isFinite(json.likes) ? json.likes : null,
    licencia: licencia ? String(licencia) : null,
    parametros: Number.isFinite(json.safetensors?.total) ? json.safetensors.total : null,
    condiciones: json.gated === 'manual' || json.gated === 'auto' || json.gated === true,
  };
}

/** Une el catálogo con los datos (en vivo o de respaldo) y calcula memoria y encaje para un equipo. */
export function fichaModelo(base, datos, equipo = 'gpu3') {
  const d = datos ?? {};
  const vram = EQUIPOS[equipo]?.vram ?? 0;
  const memoria = memoriaGB(d.parametros);
  return {
    ...base,
    nombre: base.id.split('/')[1],
    autor: base.id.split('/')[0],
    descargas30d: d.descargas30d ?? null,
    likes: d.likes ?? null,
    licencia: d.licencia ?? null,
    tipoLicencia: tipoLicencia(d.licencia),
    condiciones: Boolean(d.condiciones),
    parametros: d.parametros ?? null,
    memoria,
    encaje: encaje(memoria, vram),
    url: `https://huggingface.co/${base.id}`,
  };
}

const PUNTOS_ENCAJE = { cabe: 30, parcial: 12, no: 0, desconocido: 0 };

/** Puntaje para ordenar (transparente, se explica en /proceso/): encaje > rol adecuado > licencia > popularidad. */
export function puntaje(ficha, caso) {
  const roles = ROLES_POR_CASO[caso] ?? [];
  const i = roles.indexOf(ficha.rol);
  const rol = i < 0 ? 0 : 12 - i * 3;
  const lic = ficha.tipoLicencia === 'permisiva' ? 4 : 0;
  const pop = ficha.descargas30d ? Math.log10(ficha.descargas30d + 1) / 2 : 0;
  return PUNTOS_ENCAJE[ficha.encaje] + rol + lic + pop;
}

/** Modelos para un caso y un equipo, ordenados de mejor a peor. `todos` incluye los de otros casos al final. */
export function recomendarModelos({ caso, equipo = 'gpu3', datos = {}, todos = false }) {
  const fichas = CATALOGO.map((m) => fichaModelo(m, datos[m.id], equipo))
    .map((f) => ({ ...f, delCaso: f.casos.includes(caso), puntaje: puntaje(f, caso) }));
  const lista = todos ? fichas : fichas.filter((f) => f.delCaso);
  return lista.sort((a, b) => (b.delCaso - a.delCaso) || (b.puntaje - a.puntaje) || a.id.localeCompare(b.id));
}

/**
 * «Equipo de IA» del caso: el mejor modelo de cada rol útil (en el orden de ROLES_POR_CASO),
 * prefiriendo los que caben en la GPU. Devuelve [{rol, modelo}] sin roles vacíos.
 */
export function kitDelCaso({ caso, equipo = 'gpu3', datos = {} }) {
  const lista = recomendarModelos({ caso, equipo, datos });
  return (ROLES_POR_CASO[caso] ?? [])
    .map((rol) => ({ rol, modelo: lista.find((m) => m.rol === rol && m.encaje !== 'no') ?? null }))
    .filter((x) => x.modelo);
}
