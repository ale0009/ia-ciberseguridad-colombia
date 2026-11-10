import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aHash, deHash } from '../js/enlace.js';
import { escenario } from '../js/reglas.js';

test('ida y vuelta del escenario por el hash', () => {
  const e = escenario({ datos: ['personales', 'salud'], tamano: 'mediana', caso: 'dlp', despliegue: 'hibrido', controles: ['humano', 'politica'] });
  const r = deHash(aHash(e, 'gpu12'));
  assert.deepEqual(r.escenario, e);
  assert.equal(r.equipo, 'gpu12');
});

test('hash vacío o ajeno → null; valores raros se limpian', () => {
  assert.equal(deHash(''), null);
  assert.equal(deHash('#buscar'), null);
  const r = deHash('#c=malware&x=otra&g=nasa&d=salud,xx');
  assert.equal(r.escenario.caso, 'malware');
  assert.equal(r.escenario.despliegue, 'local');
  assert.equal(r.equipo, null);
  assert.deepEqual(r.escenario.datos, ['personales', 'salud']);
});
