import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGO, CASOS, ROLES, memoriaGB, encaje, normalizarHF, tipoLicencia, fichaModelo, recomendarModelos, textoParametros } from '../js/modelos.js';
import { RESPALDO, FECHA_RESPALDO } from '../js/respaldo-modelos.js';
import { urlModelo } from '../js/hf.js';

test('catálogo: IDs únicos con autor/nombre, roles y casos válidos', () => {
  const ids = CATALOGO.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const m of CATALOGO) {
    assert.match(m.id, /^[\w.-]+\/[\w.-]+$/, m.id);
    assert.ok(m.rol in ROLES, m.id);
    assert.ok(m.casos.length && m.casos.every((c) => c in CASOS), m.id);
  }
});

test('catálogo: incluye las familias pedidas (Llama, Mistral, Qwen, Gemma, DeepSeek, Granite)', () => {
  for (const f of ['meta-llama/', 'mistralai/', 'Qwen/', 'google/gemma', 'deepseek-ai/', 'ibm-granite/']) {
    assert.ok(CATALOGO.some((m) => m.id.startsWith(f)), f);
  }
});

test('cada caso tiene al menos 4 modelos', () => {
  for (const c of Object.keys(CASOS)) assert.ok(CATALOGO.filter((m) => m.casos.includes(c)).length >= 4, c);
});

test('respaldo: fechado y con todos los modelos del catálogo, con parámetros y descargas', () => {
  assert.match(FECHA_RESPALDO, /^\d{4}-\d{2}-\d{2}$/);
  for (const m of CATALOGO) {
    const d = RESPALDO[m.id];
    assert.ok(d, m.id);
    assert.ok(d.parametros > 1e7, m.id);
    assert.ok(Number.isInteger(d.descargas30d), m.id);
  }
});

test('memoriaGB: Q4 ≈ 4,5 bits más motor y contexto', () => {
  assert.equal(memoriaGB(2_031_739_904), 2.1); // Qwen3-1.7B
  assert.equal(memoriaGB(8_000_000_000), 5.8);
  assert.equal(memoriaGB(136_731_648), 0.4); // embeddings: contexto pequeño
  assert.equal(memoriaGB(null), null);
  assert.equal(memoriaGB(-1), null);
});

test('encaje: coincide con lo medido en nuestro laboratorio de 3 GB', () => {
  // Qwen3-1.7B cabe entero; granite-4.0-h-tiny y Qwen3-8B corren con parte en RAM
  assert.equal(encaje(memoriaGB(RESPALDO['Qwen/Qwen3-1.7B'].parametros), 3), 'cabe');
  assert.equal(encaje(memoriaGB(RESPALDO['ibm-granite/granite-4.0-h-tiny'].parametros), 3), 'parcial');
  assert.equal(encaje(memoriaGB(RESPALDO['Qwen/Qwen3-8B'].parametros), 3), 'parcial');
  assert.equal(encaje(memoriaGB(RESPALDO['deepseek-ai/DeepSeek-V3'].parametros), 80), 'no');
  assert.equal(encaje(2, 0), 'parcial'); // solo CPU
  assert.equal(encaje(null, 8), 'desconocido');
});

test('normalizarHF: licencia de cardData o de la etiqueta; gated manual = condiciones', () => {
  const a = normalizarHF({ id: 'x/y', downloads: 5, likes: 2, cardData: { license: 'apache-2.0' }, safetensors: { total: 10 }, gated: false });
  assert.deepEqual(a, { id: 'x/y', descargas30d: 5, likes: 2, licencia: 'apache-2.0', parametros: 10, condiciones: false });
  const b = normalizarHF({ id: 'm/l', tags: ['license:llama3.2'], gated: 'manual' });
  assert.equal(b.licencia, 'llama3.2');
  assert.equal(b.condiciones, true);
  assert.equal(b.parametros, null);
  assert.equal(normalizarHF({ error: 'Repository not found' }), null);
  assert.equal(normalizarHF(null), null);
});

test('tipoLicencia: Apache y MIT son permisivas; Llama, Gemma, other y vacía son propias', () => {
  assert.equal(tipoLicencia('apache-2.0'), 'permisiva');
  assert.equal(tipoLicencia('MIT'), 'permisiva');
  for (const l of ['llama3.1', 'gemma', 'other', null]) assert.equal(tipoLicencia(l), 'propia');
});

test('fichaModelo y recomendarModelos: primero los que caben y sirven al caso', () => {
  const f = fichaModelo(CATALOGO[0], RESPALDO[CATALOGO[0].id], 'gpu8');
  assert.equal(f.url, `https://huggingface.co/${CATALOGO[0].id}`);
  const lista = recomendarModelos({ caso: 'phishing', equipo: 'gpu3', datos: RESPALDO });
  assert.ok(lista.every((m) => m.casos.includes('phishing')));
  assert.equal(lista[0].encaje, 'cabe');
  for (let i = 1; i < lista.length; i++) assert.ok(lista[i - 1].puntaje >= lista[i].puntaje);
  const todos = recomendarModelos({ caso: 'malware', equipo: 'gpu24', datos: RESPALDO, todos: true });
  assert.equal(todos.length, CATALOGO.length);
  assert.ok(todos[0].delCaso);
  assert.ok(todos.slice(0, 3).some((m) => m.rol === 'seguridad'));
});

test('sin datos en vivo ni respaldo la ficha no rompe', () => {
  const f = fichaModelo(CATALOGO[1], undefined, 'gpu3');
  assert.equal(f.memoria, null);
  assert.equal(f.encaje, 'desconocido');
});

test('urlModelo pide solo los campos usados y escapa el id', () => {
  const u = urlModelo('Qwen/Qwen3-4B');
  assert.ok(u.startsWith('https://huggingface.co/api/models/Qwen/Qwen3-4B?'));
  assert.ok(u.includes('expand%5B%5D=safetensors'));
});

test('textoParametros', () => {
  assert.equal(textoParametros(278_043_648), '278 M');
  assert.equal(textoParametros(1_700_000_000), '1,7 mil M');
  assert.equal(textoParametros(999_885_952), '1 mil M');
  assert.equal(textoParametros(undefined), '¿?');
});

import { kitDelCaso, ROLES_POR_CASO } from '../js/modelos.js';
test('kitDelCaso: un modelo por rol, en el orden del caso, sin modelos que no caben', () => {
  for (const caso of Object.keys(CASOS)) {
    for (const equipo of ['cpu', 'gpu3', 'servidor']) {
      const kit = kitDelCaso({ caso, equipo, datos: RESPALDO });
      assert.ok(kit.length >= 2, `${caso} ${equipo}`);
      const roles = kit.map((k) => k.rol);
      assert.deepEqual(roles, ROLES_POR_CASO[caso].filter((r) => roles.includes(r)));
      assert.ok(kit.every((k) => k.modelo.encaje !== 'no' && k.modelo.rol === k.rol));
    }
  }
  const lab = kitDelCaso({ caso: 'phishing', equipo: 'gpu3', datos: RESPALDO });
  assert.equal(lab[0].modelo.encaje, 'cabe');
});
