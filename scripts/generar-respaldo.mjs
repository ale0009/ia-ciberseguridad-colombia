// Regenera js/respaldo-modelos.js con los datos actuales de Hugging Face.
// Uso: node scripts/generar-respaldo.mjs
import { writeFileSync } from 'node:fs';
import { traerModelos } from '../js/hf.js';

const { datos, fallos } = await traerModelos();
if (fallos.length) { console.error('Fallaron:', fallos); process.exit(1); }
const fecha = new Date().toISOString().slice(0, 10);
const txt = `// Respaldo generado por scripts/generar-respaldo.mjs desde la API pública de Hugging Face.
// Se muestra cuando no hay conexión. «descargas30d» = descargas de los últimos 30 días a esa fecha.
export const FECHA_RESPALDO = '${fecha}';
export const RESPALDO = ${JSON.stringify(datos, null, 2)};
`;
writeFileSync(new URL('../js/respaldo-modelos.js', import.meta.url), txt);
console.log(`OK: ${Object.keys(datos).length} modelos, ${fecha}`);
