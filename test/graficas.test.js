import { test } from 'node:test';
import assert from 'node:assert/strict';
import { svgMemoria, svgMatriz, svgSemaforos } from '../js/graficas.js';
import { RESPALDO } from '../js/respaldo-modelos.js';
import { CATALOGO } from '../js/modelos.js';

test('svgMemoria: una barra por modelo, con título y las líneas de 3 y 8 GB', () => {
  const s = svgMemoria(RESPALDO);
  assert.ok(s.startsWith('<svg') && s.includes('<title'));
  assert.equal((s.match(/<rect /g) || []).length, CATALOGO.length);
  assert.ok(s.includes('3 GB (lab)') && s.includes('8 GB'));
  assert.ok(s.includes('GB →')); // DeepSeek-V3 se sale de la escala
  assert.ok(!/NaN|undefined/.test(s));
});

test('svgMatriz: 5 columnas y sin valores rotos', () => {
  const s = svgMatriz();
  for (const c of ['PHISHING', 'SOC', 'MALWARE', 'DLP', 'CHAT']) assert.ok(s.includes(c));
  assert.ok(s.includes('g-celda') && s.includes('g-vacia'));
  assert.ok(!/NaN|undefined/.test(s));
});

test('svgSemaforos: 15 barras (5 casos × 3 despliegues)', () => {
  const s = svgSemaforos();
  assert.equal((s.match(/<rect /g) || []).length, 15);
  assert.ok(!/NaN|undefined/.test(s));
});
