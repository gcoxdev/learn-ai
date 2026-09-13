# Learn AI

A private presentation-style AI school prototype with a complete initial curriculum draft. Choose a system, learn its foundations, and carry demonstrated understanding into another path.

## Run locally

Requires Node.js 22.12 or later.

```bash
npm ci
npm run dev
```

Open the local address printed by Vite. No account, API key, model download, or paid service is required. JavaScript and a current browser are needed for the interactive classroom.

```bash
npm run check
npm test
npm run build
npx playwright install chromium --only-shell
npm run test:e2e
```

The production build writes a static site to `build/`. `npm run preview` serves that build locally. The current app assumes deployment at the domain root; a hosting provider has not been selected and nothing has been deployed.

## Current implementation

- Two guided draft courses: language models (184 lessons) and image generation (143 lessons). Their prerequisite closures share 108 lessons; demonstrated objectives carry across paths. Paths begin with foundations and extend through modern architectures, training, evaluation, and inference.
- The opening module has eleven lessons: tasks, inputs/outputs, examples, models/products, and weights come before training and inference. Everyday snack and delivery examples introduce terms before compact notation. Six additional foundational lessons have expanded worked instruction. Definitions are also available within each scene; linked side lessons keep the learner’s place.
- All 308 main lessons across 38 modules have initial drafts, plus 23 mathematics/programming bridge overviews and the preserved A01 advanced MoE preview: 332 authored assets with 334 scoped objectives. See [coverage](content/COVERAGE.md).
- The curriculum spans history, symbolic reasoning, search, probability, classical learning, neural and alternative neural models, vision, language/audio, transformers, pretraining, distributed training, MoE, state-space models, post-training, reasoning, diffusion/flow models, multimodality, RL, agents, retrieval, serving, evaluation, interpretability, social/security questions, robotics, causality, hybrid methods, operations, and scientific AI.
- Dated model studies connect Llama 3.1, Qwen3, DeepSeek-V3/R1, and Olmo 3 to their published lifecycle evidence. Additional comparisons cover image/audio/state-space systems and the limits of proprietary disclosures. These are historical mechanism anchors, not a live model ranking.
- Nine synthesis projects include supplied toy data, worked calculations or reference fragments, no-code/manual options, and self/peer-review rubrics. Project quizzes check concepts; they do not grade unseen artifacts.
- Presentation and continuous reading modes, saved positions and bookmarks, math detours, spoken equation descriptions, and exact numerical tables.
- The takeaway, quiz, result, and return links share one closing page; there is no separate final-thought slide. Returns preserve the originating curriculum module, library/glossary filter, path, or progress page across reloads. Curriculum lessons offer the next available lesson; assessed paths recommend the next unmet dependency.
- An introductory weight-and-input activity, interactive scalar gradient descent and attention experiments, a top-k expert routing example in the core MoE course, and clearly labeled illustrative token and denoising activities. The attention experiment exposes scores, scaling, masking, normalized weights, and the resulting value mixture.
- Objective-based personal-study mastery, fresh retakes, hints and answer feedback. Two varied unassisted checks are required per critical core objective. Viewing material, using hints, or repeating exposed variants cannot award mastery.
- Shared objective evidence across paths. Compatible mastery stops prerequisite expansion without granting evidence for ancestors. Separately required foundations remain required; a mastered alternative is preferred.
- **My progress → Start over → Reset all progress** clears the learning record for all paths in this browser after confirmation. The dialog offers a backup download first. Reset includes answers, mastery, hints/exposures, bookmarks, reading/activity positions, selected path, and study history. A saved reset boundary prevents older tabs or queued saves from restoring the cleared record; a confirmed backup import can still restore it.
- IndexedDB persistence, synchronization of evidence and positions across tabs, and validated JSON backup import/export with a review step. Evidence records merge once, conflicting IDs are rejected, and newer positions are preserved. Backup reminders follow first mastery and seven distinct study days (UTC dates) since export or dismissal.
- Search, 111 vocabulary definitions linked to teaching lessons, and a complete browsable catalog of 38 modules / 308 main lessons. All catalog entries open draft lessons; side lessons and the advanced preview are also available in the library.

Formal mathematics extension checks and the older A01 MoE preview remain uncredited practice; the eight new M18 core MoE lessons and 23 bridges have scoped knowledge checks. Historical lesson/scene IDs and question response contracts remain readable. Revised foundation objectives use new evidence versions and retire earlier questions; old attempts remain historical records and do not silently satisfy the revised standard. Old recap positions resolve to the combined closing page. Reference reading and placement checks remain available throughout the library.

## Content and code

[Teaching standards](content/AUTHORING.md) describe lesson shapes, vocabulary scaffolding, assessment revision, and source specificity. [Editorial signals](content/EDITORIAL_REVIEW.md) are regenerated during content builds and flag thin mechanism drafts, generic reading links, and answer-shape patterns. These are review prompts, not learner-validation results.

`content/lessons/*.yaml` contains original draft explanations, sources, scenes, objective mappings, and assessment variants. `content/curriculum.yaml` declares path roots and the authored catalog.

`scripts/build-content.ts` validates YAML and the runtime Zod contract, checks references and graph cycles, compiles sanitized Markdown, and generates the runtime curriculum and exact draft path closures in `src/lib/generated/`. Runtime generated files are ignored and rebuilt by the application/check/test commands. `scripts/content-audit.ts` additionally enforces complete slot coverage, unique assignments and question prompts, and combined closing-page ordering; it regenerates the tracked coverage report. The gradient asset adapts the reviewed authoring specimen; the source contract is still a draft, and this adapter is not a claim to implement every proposed authoring feature.

`src/lib/engine.ts` contains the planner, evidence rules, and backup validation/merge logic. `src/lib/simulations.ts` provides deterministic numerical mechanisms. `src/lib/learner.svelte.ts` scopes reactive learner state to each application layout, and `src/lib/storage.ts` performs transactional browser persistence. Reusable interaction components live in `src/lib/components/`.

The original dependency map, plan, assessments, and review responses remain local in gitignored `internal/`, as requested. Building the app does not require those private files.

## Boundaries and next work

Most later lessons still need deeper explanations and better assessment banks; filling the catalog was an initial drafting milestone. Both guided paths now include evaluation, social/privacy questions, and relevant project work. Robotics, causality, evolutionary methods, scientific AI, and other catalog topics remain available for exploration rather than having separate guided destinations yet.

This is draft content and personal-study software. Independent subject review, assessment calibration, learner pilots, a non-author editing trial, and manual screen-reader review remain open. Automated accessibility checks do not establish WCAG conformance. Only Chromium has been exercised so far; Firefox and Safari verification remains outstanding.

The revised banks in 15 foundation lessons have four active variants per family; most later draft banks still have two. An exhausted bank stays exhausted for fresh-credit purposes; reading and worked examples remain available. Broader remediation banks, spaced retention checks, calibrated mastery thresholds, and reviewed capstones are future work. Current critical checks must all pass; the planned aggregate 80% policy has not yet been calibrated for a larger assessment mix.

Browser evidence is editable by its owner and is not an authoritative school grade. There is no cloud account, server verification, cohort administration, certificate system, or automated tutor. Clearing site data can erase local progress. Export and retain backups; a download-start timestamp does not prove the file was kept. Only `prototype-1` backups are supported; cross-curriculum migrations are not implemented.

The introductory weight/token/denoising illustrations do not run trained models. Their transient controls are not saved; gradient and attention experiments, reading state, return destinations, drafts, and committed formative reveals are saved. A static production build is not an offline-installable PWA.

Continue against the staged plan: independently review every draft and assessment, try the authoring contract with a non-author editor, deepen worked examples and mathematical treatments, expand bridge micro-lessons and assessment banks, and finish accessibility/learner trials. The initial draft fills the agreed catalog; it does not imply that every topic has exhaustive treatment or that the full planned school platform is implemented.

The remote Svelte autofixer was attempted, but its source-disclosure step was blocked by automatic approval review. Validation uses local Svelte compiler/type checks, numerical and learning-rule tests, and local Chromium/axe checks instead.

The verification suites cover learning rules, graph dependencies, numerical experiments, backups, combined closing-page navigation, saved return destinations, math detours, keyboard/mobile use, and selected axe WCAG A/AA rules. Independent review and the remaining browser/screen-reader matrix are still open.

The revision adds compatibility checks for retired question banks and old recap positions, vocabulary detour/focus checks, structured calculation grading, and keyboard control of the introductory weight example. Verification results are recorded in the local implementation status; selected accessibility assertions do not cover the whole course.

Current verification: 68 logic/content tests and 21 Chromium flows pass; Svelte/TypeScript reports zero errors or warnings; the production build generates 332 lesson pages. The browser suite includes selected accessibility checks on the combined ending, feedback, and expanded vocabulary, plus saved-progress and intermediate-calculation regressions. Reset checks cover cancel/Escape, backup restoration, persistence after reload, synchronized tabs, stale writes, and storage failure.
