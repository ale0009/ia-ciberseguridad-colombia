// Consulta en vivo a la API pública de Hugging Face (sin clave; admite CORS desde cualquier origen).
import { CATALOGO, normalizarHF } from './modelos.js';

export const API_HF = 'https://huggingface.co/api/models/';
const CAMPOS = ['downloads', 'likes', 'cardData', 'safetensors', 'gated', 'tags'];

/** URL de la ficha de un modelo, pidiendo solo los campos que usamos. */
export function urlModelo(id) {
  const q = CAMPOS.map((c) => `expand%5B%5D=${c}`).join('&');
  return `${API_HF}${id.split('/').map(encodeURIComponent).join('/')}?${q}`;
}

async function pedir(id, { timeout = 9000, fetchFn = fetch } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetchFn(urlModelo(id), { signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = normalizarHF(await r.json());
    if (!d) throw new Error('respuesta sin id');
    return d;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Trae todos los modelos del catálogo con un máximo de `paralelo` peticiones a la vez.
 * Devuelve { datos: {id: …}, fallos: [{id, motivo}] }: si algunos fallan, el resto sigue en vivo.
 */
export async function traerModelos({ paralelo = 6, ...opc } = {}) {
  const ids = CATALOGO.map((m) => m.id);
  const datos = {};
  const fallos = [];
  let i = 0;
  async function obrero() {
    while (i < ids.length) {
      const id = ids[i++];
      try { datos[id] = await pedir(id, opc); } catch (e) {
        fallos.push({ id, motivo: e.name === 'AbortError' ? 'tardó demasiado' : e.message });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(paralelo, ids.length) }, obrero));
  return { datos, fallos };
}
