# Learn AI

A private, presentation-style AI school that runs entirely in the browser. Pick a system you want to understand (a chatbot, an image generator, a robot, a recommender, and so on), learn the foundations it needs, and carry what you have shown you understand into the next path.

## Run locally

Requires Node.js 22.12 or later.

```bash
npm ci
npm run dev
```

Open the local address Vite prints. No account, API key, model download or paid service is needed. The runnable Python examples download Pyodide and NumPy from a CDN the first time a learner presses **Run**.

```bash
npm run check          # Svelte and TypeScript
npm test               # unit and content tests
npm run lessons        # lesson checker: errors, compatibility, prose lint
npm run build          # static site in build/
npx playwright install chromium --only-shell
npm run test:e2e       # browser tests
```

`npm run preview` serves the production build. The app assumes deployment at the domain root.

## What the course contains

- **337 lessons**: 313 main lessons across 38 modules, 23 mathematics and programming bridges, and one advanced preview. They are organized into **15 guided paths**: language, images, video, speech and audio, robotics, vision, agents, retrieval, prediction, forecasting, recommendation, games and planning, scientific AI, multimodal systems, and edge computing. Each path states its outcome, required core, and optional extensions; evidence of understanding carries across paths.
- **Coverage.** Every lesson was rewritten in the September 2026 revision. Topics run from history and symbolic AI through search, probability, classical ML, neural networks, vision, sequences, language, transformers, pretraining, training infrastructure, mixture-of-experts, efficient architectures, post-training, reasoning, generative models, multimodality, reinforcement learning, agents, retrieval, serving, evaluation and interpretability, safety and society, robotics, causality, hybrid methods, applied systems, scientific AI, dated model case studies, projects, and alternative neural models.
- **Teaching shape.** Lessons open with a concrete situation and carry one running example. Each one teaches with worked numbers, shows the formula as papers write it with every symbol mapped, and ends with a takeaway. The median lesson has about 980 teaching words, up from about 300 before the revision; none is under 400. Across the course there are:
  - 363 runnable Python/NumPy examples, editable in the page
  - 170 diagrams, each with a full text description
  - 409 predict-then-reveal checks
  - 329 "common mix-up" callouts
  - short, sourced stories of the people and events behind the ideas
- **Assessment.** There are 916 question families with 4,097 active variants, and every module includes numeric calculation families. Mastery needs one independent correct answer per family at the current objective version. Hints, viewed answers and repeated variants never count. Earlier variants are retired rather than deleted, so saved progress and backups stay valid.
- **Daily review** brings back ideas you have already mastered, as practice, at spaced intervals of 1, 3, 7, 16, 35 and 90 days.
- **Glossary.** 599 terms are linked to the lessons that teach them, and every scene has a "Need a word explained?" panel.
- **Interactive figures.** About 40 interactive figures and simulations cover attention, sampling, gradient descent, tokenizers, networks, cache memory, denoising, video, audio and robot control, among others. All have keyboard controls and text equivalents.
- **Library and progress.** The library has module, time, type and evidence filters. Learners can read in presentation or continuous mode, keep saved positions and bookmarks, and take side lessons that return to the exact slide. Progress lives in IndexedDB, syncs across tabs, and can be backed up and restored as JSON.

## Content and code

- `content/lessons/*.yaml`: the lessons. Each holds scenes, objectives, assessment families, sources and routes. [Teaching standards](content/AUTHORING.md) describe lesson shapes, the lesson markdown features, the lesson checker, and assessment revision rules.
- `content/curriculum.yaml`: paths, extensions and the catalog. `content/glossary.yaml`: vocabulary.
- `scripts/lesson-markdown.ts`: compiles lesson Markdown, covering KaTeX math, callouts, highlighted and runnable code, and tables, then sanitizes it.
- `scripts/compile-lesson.ts` and `scripts/build-content.ts`: validate the YAML against the runtime contract, check references and dependency cycles, and generate `src/lib/generated/`.
- `scripts/check-lessons.ts`: the per-lesson checker. It runs compatibility checks against `HEAD` (no deleted ids, no silently changed answers, version bumps when evidence changes) plus prose and question lint.
- `scripts/content-audit.ts`: enforces complete slot coverage and regenerates the coverage reports.
- `src/lib/engine.ts`: the planner, evidence rules and backup handling.
- `src/lib/review.ts`: the daily review scheduler.
- `src/lib/python-runtime.ts`: the in-browser Python worker.
- `src/lib/components/`: the player, diagrams, code runner and interactive figures.

## Status and limits

This is draft content and personal-study software. Every lesson has been rewritten. Each one was then checked by a separate reviewer that recomputed the numbers, ran the code, checked sources and repaired questions. That is still an editorial process, not independent expert review or learner testing. Before calling any lesson finished, it still needs:

- subject-expert review
- assessment calibration
- learner pilots
- a manual screen-reader pass
- Firefox and Safari checks

A few lessons cite legal cases and regulations whose status changes over time, such as AI copyright suits and the EU AI Act's deepfake rules. Re-check those before publishing.

Browser progress belongs to the learner and is not an authoritative grade. There is no account, server, certificate or automated tutor. Clearing site data erases progress, so export backups.
