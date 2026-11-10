// /proceso/: tema y gráficas SVG calculadas con el mismo motor que la herramienta.
import { iniciarTema } from './tema.js';
import { svgMemoria, svgMatriz, svgSemaforos } from './graficas.js';
import { RESPALDO, FECHA_RESPALDO } from './respaldo-modelos.js';

iniciarTema(document.getElementById('tema'));
document.getElementById('g-memoria').innerHTML = svgMemoria(RESPALDO);
document.getElementById('g-semaforos').innerHTML = svgSemaforos();
document.getElementById('g-matriz').innerHTML = svgMatriz();
document.getElementById('fecha-resp').textContent = new Date(`${FECHA_RESPALDO}T12:00:00`)
  .toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
