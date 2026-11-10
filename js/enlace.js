// El escenario viaja en el #hash para compartirlo (nunca en el servidor: el hash no se envía).
import { escenario } from './reglas.js';
import { EQUIPOS } from './modelos.js';

export function aHash(e, equipo) {
  const p = new URLSearchParams();
  p.set('d', e.datos.join(','));
  p.set('t', e.tamano);
  p.set('c', e.caso);
  p.set('x', e.despliegue);
  if (equipo) p.set('g', equipo);
  if (e.controles.length) p.set('k', e.controles.join(','));
  return `#${p.toString()}`;
}

/** Devuelve { escenario, equipo } o null si el hash no trae un escenario. */
export function deHash(hash) {
  const h = String(hash ?? '').replace(/^#/, '');
  if (!h.includes('c=')) return null;
  const p = new URLSearchParams(h);
  const lista = (k) => (p.get(k) ?? '').split(',').filter(Boolean);
  const e = escenario({ datos: lista('d'), tamano: p.get('t'), caso: p.get('c'), despliegue: p.get('x'), controles: lista('k') });
  const g = p.get('g');
  return { escenario: e, equipo: g in EQUIPOS ? g : null };
}
