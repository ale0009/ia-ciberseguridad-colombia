import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenario, marcoLegal, semaforo, madurez, riesgos, recomendarDespliegue, evaluar, NORMAS, CONTROLES } from '../js/reglas.js';

const ids = (e) => marcoLegal(e).map((n) => n.id);
const EJEMPLO = { datos: ['personales', 'salud'], tamano: 'pequena', caso: 'phishing', despliegue: 'nube' };

test('escenario: limpia valores y agrega «personales» si hay sensibles', () => {
  const e = escenario({ datos: ['salud', 'salud', 'inventado'], caso: 'x', despliegue: 'marte', controles: ['humano', 'nada'] });
  assert.deepEqual(e.datos, ['personales', 'salud']);
  assert.equal(e.caso, 'phishing');
  assert.equal(e.despliegue, 'local');
  assert.deepEqual(e.controles, ['humano']);
});

test('todas las normas tienen ley, artículo, origen válido y URL', () => {
  for (const [id, n] of Object.entries(NORMAS)) {
    assert.ok(n.ley && n.art && n.porque, id);
    assert.ok(['investigacion', 'verificado', 'por-verificar'].includes(n.origen), id);
    assert.match(n.url, /^https?:\/\//, id);
  }
});

test('marco legal: sin datos personales no aparece la Ley 1581', () => {
  const l = ids({ datos: [], caso: 'soc', despliegue: 'nube' });
  assert.ok(!l.some((x) => x.startsWith('1581')));
  assert.ok(l.includes('269A') && l.includes('269C'));
});

test('marco legal: salud en la nube trae datos sensibles, encargado y transferencia internacional', () => {
  const l = ids(EJEMPLO);
  for (const x of ['1581-4', '1581-9', '1581-5-6', '1581-17-18', '1581-26', 'd1377', '1581-23', '269F', '269G']) assert.ok(l.includes(x), x);
});

test('marco legal: en local no hay transferencia internacional ni encargado', () => {
  const l = ids({ ...EJEMPLO, despliegue: 'local' });
  assert.ok(!l.includes('1581-26'));
  assert.ok(!l.includes('1581-17-18'));
});

test('marco legal: híbrido trae al encargado pero no la transferencia', () => {
  const l = ids({ ...EJEMPLO, despliegue: 'hibrido' });
  assert.ok(l.includes('1581-17-18'));
  assert.ok(!l.includes('1581-26'));
});

test('marco legal: financieros suma la Ley 1266; malware suma el 269E', () => {
  assert.ok(ids({ datos: ['financieros'], caso: 'malware' }).includes('1266-7-9'));
  assert.ok(ids({ datos: [], caso: 'malware' }).includes('269E'));
});

test('marco legal: siempre marca como «por verificar» lo que la fuente no cita (guía IA SIC, CONPES 3995)', () => {
  const l = marcoLegal({ datos: [] });
  assert.equal(l.find((n) => n.id === 'sicIA').origen, 'por-verificar');
  assert.equal(l.find((n) => n.id === 'conpes3995').origen, 'por-verificar');
});

test('semáforo: el ejemplo (clínica, salud, nube) sale en rojo con 6 puntos', () => {
  const s = semaforo(EJEMPLO);
  assert.equal(s.puntos, 6);
  assert.equal(s.color, 'rojo');
  assert.equal(s.factores.reduce((a, f) => a + f.puntos, 0), 6);
});

test('semáforo: pasar a local baja a amarillo y con autorización + política a verde', () => {
  assert.equal(semaforo({ ...EJEMPLO, despliegue: 'local' }).color, 'amarillo');
  const s = semaforo({ ...EJEMPLO, despliegue: 'local', controles: ['autorizacion', 'politica'] });
  assert.equal(s.puntos, 2);
  assert.equal(s.color, 'verde');
});

test('semáforo: sin datos personales y en local es verde; nunca baja de 0', () => {
  const s = semaforo({ datos: [], caso: 'phishing', despliegue: 'local', controles: CONTROLES.map((c) => c.id) });
  assert.equal(s.puntos, 0);
  assert.equal(s.color, 'verde');
});

test('semáforo: el contrato con el proveedor solo resta si hay nube', () => {
  const base = { datos: ['personales'], caso: 'phishing' };
  assert.equal(semaforo({ ...base, despliegue: 'local', controles: ['contrato'] }).puntos, 1);
  assert.equal(semaforo({ ...base, despliegue: 'nube', controles: ['contrato'] }).puntos, 2);
});

test('madurez: 0 % es Novato y todo lo aplicable es Maestro del dojo con logro', () => {
  assert.equal(madurez(EJEMPLO).nivel.nombre, 'Novato');
  const todos = CONTROLES.map((c) => c.id);
  const m = madurez({ ...EJEMPLO, controles: todos });
  assert.equal(m.pct, 100);
  assert.equal(m.nivel.n, 5);
  assert.equal(m.siguiente, null);
  assert.ok(m.logros.includes('Todo en orden'));
});

test('madurez: el laboratorio de malware solo cuenta en el caso malware', () => {
  assert.ok(!madurez({ caso: 'phishing' }).aplican.some((c) => c.id === 'laboratorio'));
  assert.ok(madurez({ caso: 'malware' }).aplican.some((c) => c.id === 'laboratorio'));
});

test('madurez: los niveles se cortan en 20/40/60/80 %', () => {
  // sin datos personales, phishing, local: aplican inventario 10, humano 15, redteam 10, registro 10, evaluacion 10 = 55 XP
  const e = { datos: [], caso: 'phishing', despliegue: 'local' };
  assert.equal(madurez(e).xpTotal, 55);
  assert.equal(madurez({ ...e, controles: ['humano'] }).nivel.nombre, 'Aprendiz'); // 27 %
  assert.equal(madurez({ ...e, controles: ['humano', 'redteam', 'registro'] }).nivel.nombre, 'Centinela'); // 64 %
});

test('riesgos: la nube trae fuga y transferencia; local trae cadena de suministro', () => {
  const nube = riesgos(EJEMPLO).map((r) => r.id);
  assert.ok(nube.includes('fuga') && nube.includes('transferencia') && nube.includes('inyeccion'));
  assert.ok(!nube.includes('suministro'));
  const local = riesgos({ ...EJEMPLO, despliegue: 'local' }).map((r) => r.id);
  assert.ok(!local.includes('fuga') && local.includes('suministro'));
});

test('riesgos: vienen ordenados alto → medio → bajo y con referencia', () => {
  const r = riesgos({ datos: ['personales'], caso: 'malware', despliegue: 'nube' });
  const orden = { alto: 0, medio: 1, bajo: 2 };
  for (let i = 1; i < r.length; i++) assert.ok(orden[r[i - 1].nivel] <= orden[r[i].nivel]);
  assert.ok(r.every((x) => x.ref && x.mitigar));
});

test('recomendación: salud → local; personales sin GPU → híbrido; sin datos sin GPU → nube', () => {
  assert.equal(recomendarDespliegue(EJEMPLO, 'gpu8').despliegue, 'local');
  assert.equal(recomendarDespliegue(EJEMPLO, 'gpu8').coincide, false);
  assert.equal(recomendarDespliegue({ datos: ['personales'] }, 'cpu').despliegue, 'hibrido');
  assert.equal(recomendarDespliegue({ datos: [] }, 'cpu').despliegue, 'nube');
  assert.equal(recomendarDespliegue({ datos: [] }, 'gpu3').despliegue, 'local');
});

test('evaluar devuelve todas las piezas', () => {
  const r = evaluar(EJEMPLO, 'gpu8');
  for (const k of ['escenario', 'normas', 'semaforo', 'madurez', 'riesgos', 'recomendacion']) assert.ok(r[k], k);
});

test('fe de erratas: el plazo de 15 días hábiles se cita a la Circular Única de la SIC, no a la CE 007 de 2018', () => {
  const l = ids({ datos: ['personales'], caso: 'soc' });
  assert.ok(l.includes('sicIncidentes'));
  assert.ok(!l.includes('ce0072018'));
});
