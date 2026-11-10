// Gráficas SVG propias para /proceso/ (cadenas de texto: se prueban en Node sin navegador).
import { CASOS, CATALOGO, memoriaGB, encaje, textoParametros } from './modelos.js';
import { marcoLegal, semaforo, NORMAS } from './reglas.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n1 = (x) => x.toLocaleString('es-CO', { maximumFractionDigits: 1 });

/** Barras horizontales de memoria estimada (Q4) con líneas de 3 GB (nuestro laboratorio) y 8 GB. */
export function svgMemoria(datos, { tope = 16 } = {}) {
  const filas = CATALOGO.map((m) => ({ nombre: m.id.split('/')[1], mem: memoriaGB(datos[m.id]?.parametros), lab: m.lab }))
    .filter((f) => f.mem != null).sort((a, b) => a.mem - b.mem);
  const alto = 18, x0 = 250, ancho = 900, y0 = 24;
  const escala = (gb) => x0 + (Math.min(gb, tope) / tope) * (ancho - x0 - 50);
  const h = y0 + filas.length * alto + 30;
  const barras = filas.map((f, i) => {
    const y = y0 + i * alto;
    const clase = encaje(f.mem, 3) === 'cabe' ? 'g-barra' : 'g-barra g-dest';
    const corte = f.mem > tope ? `<text class="g-num g-dentro" x="${escala(tope) - 6}" y="${y + 12}" text-anchor="end">${n1(f.mem)} GB →</text>`
      : `<text class="g-num" x="${escala(f.mem) + 4}" y="${y + 12}">${n1(f.mem)}</text>`;
    return `<text class="g-eti" x="${x0 - 6}" y="${y + 12}" text-anchor="end">${esc(f.nombre)}${f.lab ? ' ★' : ''}</text>
<rect class="${clase}" x="${x0}" y="${y + 2}" width="${Math.max(1, escala(f.mem) - x0)}" height="${alto - 5}"/>${corte}`;
  }).join('\n');
  const linea = (gb, txt) => `<line class="g-base" x1="${escala(gb)}" x2="${escala(gb)}" y1="${y0 - 6}" y2="${h - 24}" stroke-dasharray="5 4"/>
<text class="g-eje" x="${escala(gb)}" y="${y0 - 10}" text-anchor="middle">${txt}</text>`;
  const ticks = [0, 4, 8, 12, 16].map((g) => `<text class="g-eje" x="${escala(g)}" y="${h - 8}" text-anchor="middle">${g} GB</text>`).join('');
  return `<svg class="grafica" viewBox="0 0 ${ancho} ${h}" role="img" aria-labelledby="gm-t"><title id="gm-t">Memoria estimada por modelo en cuantización Q4 frente a GPU de 3 y 8 GB</title>
${linea(3, '3 GB (lab)')}${linea(8, '8 GB')}
${barras}
${ticks}</svg>`;
}

/** Matriz caso × norma (escenario: datos personales, nube). Celda llena = la norma aplica. */
export function svgMatriz() {
  const casos = Object.keys(CASOS);
  const porCaso = casos.map((c) => new Set(marcoLegal({ datos: ['personales'], caso: c, despliegue: 'nube' }).map((n) => n.id)));
  const ids = Object.keys(NORMAS).filter((id) => porCaso.some((s) => s.has(id)));
  const x0 = 330, c = 74, f = 22, y0 = 50;
  const w = x0 + casos.length * c + 10, h = y0 + ids.length * f + 10;
  const cab = casos.map((k, i) => `<text class="g-eje" x="${x0 + i * c + c / 2}" y="${y0 - 12}" text-anchor="middle">${esc(k.toUpperCase())}</text>`).join('');
  const filas = ids.map((id, j) => {
    const n = NORMAS[id];
    const y = y0 + j * f;
    const celdas = casos.map((k, i) => `<rect x="${x0 + i * c + 4}" y="${y + 2}" width="${c - 8}" height="${f - 5}" class="${porCaso[i].has(id) ? (n.origen === 'por-verificar' ? 'g-celda-pv' : 'g-celda') : 'g-vacia'}"/>`).join('');
    return `<text class="g-eti" x="${x0 - 8}" y="${y + 15}" text-anchor="end">${esc(`${n.ley.replace(' de ', ' ')} · ${n.art.split(':')[0]}`
      .replace(/^(.{44}).+$/, '$1…'))}</text>${celdas}`;
  }).join('\n');
  return `<svg class="grafica" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="gx-t"><title id="gx-t">Qué normas aplica el motor en cada caso de uso, con datos personales y API en la nube</title>${cab}\n${filas}</svg>`;
}

/** Puntos del semáforo por caso y despliegue (datos personales + salud): cómo baja el riesgo al correr en local. */
export function svgSemaforos() {
  const casos = Object.keys(CASOS);
  const desp = ['nube', 'hibrido', 'local'];
  const x0 = 40, grupo = 110, b = 26, y0 = 20, alto = 180, max = 8;
  const y = (p) => y0 + alto - (p / max) * alto;
  const color = (p) => (p <= 2 ? 'g-verde' : p <= 4 ? 'g-ambar' : 'g-dest');
  const barras = casos.map((caso, i) => desp.map((d, j) => {
    const p = semaforo({ datos: ['personales', 'salud'], caso, despliegue: d }).puntos;
    const x = x0 + i * grupo + j * (b + 4) + 6;
    return `<rect class="g-barra ${color(p)}" x="${x}" y="${y(p)}" width="${b}" height="${y0 + alto - y(p)}"/><text class="g-num" x="${x + b / 2}" y="${y(p) - 4}" text-anchor="middle">${p}</text><text class="g-eje" x="${x + b / 2}" y="${y0 + alto + 14}" text-anchor="middle">${d[0].toUpperCase()}</text>`;
  }).join('') + `<text class="g-eti" x="${x0 + i * grupo + 52}" y="${y0 + alto + 32}" text-anchor="middle">${esc(caso)}</text>`).join('\n');
  const guias = [3, 5].map((p) => `<line class="g-reji" x1="${x0}" x2="${x0 + casos.length * grupo}" y1="${y(p) + 0.5}" y2="${y(p) + 0.5}" stroke-dasharray="4 4" style="stroke-opacity:.5"/><text class="g-eje" x="${x0 - 6}" y="${y(p) + 4}" text-anchor="end">${p}</text>`).join('');
  const w = x0 + casos.length * grupo + 10;
  return `<svg class="grafica" viewBox="0 0 ${w} ${y0 + alto + 44}" role="img" aria-labelledby="gs-t"><title id="gs-t">Puntos de riesgo legal por caso de uso: nube, híbrido y local, con datos de salud</title>
<line class="g-base" x1="${x0}" x2="${w - 10}" y1="${y0 + alto}" y2="${y0 + alto}"/>${guias}
${barras}</svg>`;
}

export { textoParametros };
