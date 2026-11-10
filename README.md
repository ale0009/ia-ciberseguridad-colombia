# ¿Qué IA defiende tu empresa sin romper la ley?

[English](README.en.md)

Describe tu escenario (qué datos tocará la IA, para qué la quieres, dónde correrá y qué equipo tienes) y la herramienta te muestra al instante:

- un **semáforo legal** que explica cada punto que suma o resta;
- el **marco legal colombiano** aplicable, artículo por artículo (Ley 1273 de delitos informáticos, Ley 1581 y Decreto 1377 de datos personales, Ley 1266 de Habeas Data, CONPES 3854), marcando qué viene de nuestra investigación, qué verificamos en el texto oficial y qué está **por verificar**;
- los **riesgos** de usar IA en ese caso, con su referencia en OWASP Top 10 para LLM (2025), MITRE ATLAS o NIST AI RMF;
- la **arquitectura recomendada** (local con pesos abiertos, híbrida o API en la nube) y tu «equipo de IA»;
- una **tabla de 24 modelos de pesos abiertos reales** (Llama, Mistral, Qwen, Gemma, DeepSeek, IBM Granite, Phi, gpt-oss, Foundation-sec, Nomic) con descargas, likes, licencia y parámetros traídos **en vivo** de la API pública de Hugging Face, más la memoria estimada y si caben en tu GPU;
- un **nivel de madurez** tipo videojuego: misiones con XP, niveles y logros.

Las reglas corren en el navegador, sin IA en la nube. **Divulgación, no asesoría legal.**

La página `/proceso/` cuenta la investigación, el estado del arte de la IA para ciberseguridad, cómo se decidió el árbol, gráficas, decisiones de diseño, limitaciones y una fe de erratas de la fuente.

## Cómo usarlo

Es una página estática sin compilación:

```bash
python3 -m http.server 8000   # y abre http://localhost:8000
node --test                   # pruebas del motor de reglas, modelos, gráficas y enlaces
node scripts/generar-respaldo.mjs   # regenera los datos de respaldo de Hugging Face
```

- `?sin-conexion` fuerza los datos de respaldo (fechados).
- El escenario se guarda en el `#` de la URL para compartirlo.

## Estructura

| Archivo | Qué hace |
|---|---|
| `js/reglas.js` | Motor de reglas: normas, semáforo, madurez, riesgos y recomendación (funciones puras). |
| `js/modelos.js` | Catálogo de modelos, estimación de memoria, encaje en la GPU y orden. |
| `js/hf.js` | Consulta a `huggingface.co/api/models/<id>` (sin clave, con CORS). |
| `js/respaldo-modelos.js` | Datos de respaldo del 10 nov 2026. |
| `js/graficas.js` | Gráficas SVG de `/proceso/`. |

## De qué trabajo sale

De la investigación «Prevención frente a los Delitos Informáticos. Responsabilidad legal en TIC» y de trabajos del curso de legislación TIC (responsabilidad legal en TIC en Colombia y Ley 1266 de 2008), de Mario Puerta y David Rincón. Los modelos se probaron en nuestro laboratorio con Ollama y una GPU de 3 GB.

## Créditos

[Mario Puerta «ale0009»](https://github.com/ale0009) × [David Rincón «Kuronoma»](https://www.linkedin.com/in/davidalexanderrinconcorredorkuronoma/)

Licencia MIT. Datos de modelos: Hugging Face Hub. Textos legales: Secretaría del Senado de Colombia.
