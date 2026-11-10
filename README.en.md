# Which AI can defend your company without breaking Colombian law?

[Español](README.md)

Describe your scenario (what data the AI will touch, what you want it for, where it will run and what hardware you have) and the tool instantly shows:

- a **legal traffic light** that explains every point added or removed;
- the applicable **Colombian legal framework**, article by article (Law 1273 on computer crimes, Law 1581 and Decree 1377 on personal data, Law 1266 on Habeas Data, CONPES 3854), labelled as coming from our research, verified against the official text, or **to be verified**;
- the **risks** of using AI in that case, referenced to the OWASP Top 10 for LLM Applications (2025), MITRE ATLAS or the NIST AI RMF;
- the **recommended architecture** (local open-weight model, hybrid, or cloud API) and your "AI team";
- a **table of 24 real open-weight models** (Llama, Mistral, Qwen, Gemma, DeepSeek, IBM Granite, Phi, gpt-oss, Foundation-sec, Nomic) with downloads, likes, licence and parameter count fetched **live** from the public Hugging Face API, plus estimated memory and whether they fit your GPU;
- a video-game style **maturity level**: missions with XP, levels and achievements.

The rules run in the browser, with no cloud AI. **Educational content, not legal advice.** The interface is in Spanish.

`/proceso/` explains the research, the state of the art of AI for cybersecurity, how the decision tree was built, charts, design decisions, limitations and an errata of the source material.

## Usage

Static page, no build step:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
node --test                   # tests for the rules engine, models, charts and links
node scripts/generar-respaldo.mjs   # refresh the Hugging Face fallback data
```

`?sin-conexion` forces the dated fallback data. The scenario is stored in the URL `#` so it can be shared.

## Origin

Based on the research "Prevention of Computer Crimes. Legal liability in ICT" and coursework on ICT law in Colombia (Law 1266 of 2008) by Mario Puerta and David Rincón. Models were tested in our own lab with Ollama on a 3 GB GPU.

## Credits

[Mario Puerta «ale0009»](https://github.com/ale0009) × [David Rincón «Kuronoma»](https://www.linkedin.com/in/davidalexanderrinconcorredorkuronoma/)

MIT licence. Model data: Hugging Face Hub. Legal texts: Colombian Senate (Secretaría del Senado).
