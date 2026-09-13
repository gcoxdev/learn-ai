# Learn AI

A private prototype of a presentation-style AI school. Choose a system, learn its foundations, and carry demonstrated understanding into another path.

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

- Two introductory paths: language models and image generation. Their complete prerequisite routes contain 25 and 19 lessons respectively; sixteen lessons overlap and demonstrated objectives carry across paths.
- Thirty-one authored draft lessons, including math bridges and an advanced MoE preview. The latest twelve cover vectors, probability, powers and logs, tokenization, embeddings, attention, softmax and causal masking, a decoder transformer trace, the training loop, cached inference, generative modeling, and latent diffusion.
- Presentation and continuous reading modes, saved positions and bookmarks, math detours, spoken equation descriptions, and exact numerical tables.
- Quiz results lead to the final thought, with return links on that final slide. Returns preserve the originating curriculum module, library/glossary filter, path, or progress page across reloads. Curriculum lessons offer the next available lesson; assessed paths recommend the next unmet dependency.
- Interactive scalar gradient descent and attention experiments, a top-k expert routing example, and clearly labeled illustrative token and denoising activities. The attention experiment exposes scores, scaling, masking, normalized weights, and the resulting value mixture.
- Objective-based personal-study mastery, fresh retakes, hints and answer feedback. Two varied unassisted checks are required per critical core objective. Viewing material, using hints, or repeating exposed variants cannot award mastery.
- Shared objective evidence across paths. Compatible mastery stops prerequisite expansion without granting evidence for ancestors. Separately required foundations remain required; a mastered alternative is preferred.
- IndexedDB persistence, synchronization of evidence and positions across tabs, and validated JSON backup import/export with a review step. Evidence records merge once, conflicting IDs are rejected, and newer positions are preserved. Backup reminders follow first mastery and seven distinct study days (UTC dates) since export or dismissal.
- Search, a starting glossary, and a roadmap of 38 modules / 304 main lesson slots. Roadmap entries are explicitly marked as planned.

Formal mathematics extensions and MoE checks are uncredited practice in this scope; the core math bridges have scoped checks. Existing core evidence remains intact. Live paths explain selected core mechanisms through transformer training/inference and latent diffusion; full architecture families, post-training, and production-system courses remain unfinished. Reference reading and placement checks remain available throughout the library.

## Content and code

`content/lessons/*.yaml` contains original draft explanations, sources, scenes, objective mappings, and assessment variants. `content/curriculum.yaml` declares path roots and the future catalog.

`scripts/build-content.ts` validates YAML and the runtime Zod contract, checks references and graph cycles, compiles sanitized Markdown, and generates the runtime curriculum and exact prototype path closures in `src/lib/generated/`. Generated files are ignored and rebuilt by the application/check/test commands. The gradient asset adapts the reviewed authoring specimen; the source contract is still a draft, and this adapter is not a claim to implement every proposed authoring feature.

`src/lib/engine.ts` contains the planner, evidence rules, and backup validation/merge logic. `src/lib/simulations.ts` provides deterministic numerical mechanisms. `src/lib/learner.svelte.ts` scopes reactive learner state to each application layout, and `src/lib/storage.ts` performs transactional browser persistence. Reusable interaction components live in `src/lib/components/`.

The original dependency map, plan, assessments, and review responses remain local in gitignored `internal/`, as requested. Building the app does not require those private files.

## Boundaries and next work

This is draft content and personal-study software. Independent subject review, assessment calibration, learner pilots, a non-author editing trial, and manual screen-reader review remain open. Automated accessibility checks do not establish WCAG conformance. Only Chromium has been exercised so far; Firefox and Safari verification remains outstanding.

The small fixed assessment bank has two variants per family. An exhausted bank stays exhausted for fresh-credit purposes; reading and worked examples remain available. Broader remediation banks, spaced retention checks, calibrated mastery thresholds, and reviewed capstones are future work. Current critical checks must all pass; the planned aggregate 80% policy has not yet been calibrated for a larger assessment mix.

Browser evidence is editable by its owner and is not an authoritative school grade. There is no cloud account, server verification, cohort administration, certificate system, or automated tutor. Clearing site data can erase local progress. Export and retain backups; a download-start timestamp does not prove the file was kept. Only `prototype-1` backups are supported; cross-curriculum migrations are not implemented.

The introductory token/denoising illustrations do not run trained models. Their transient controls are not saved; gradient and attention experiments, reading state, return destinations, drafts, and committed formative reveals are saved. A static production build is not an offline-installable PWA.

Continue against the staged plan: validate the authoring contract with an independent editor, independently review all authored lessons and assessments, finish accessibility/learner trials, and expand complete destination closures toward modern architecture families, pretraining, post-training, evaluation, and inference systems. Expanded content remains draft while those review gates are open.

The remote Svelte autofixer was attempted, but its source-disclosure step was blocked by automatic approval review. Validation uses local Svelte compiler/type checks, numerical and learning-rule tests, and local Chromium/axe checks instead.

The verification suites cover learning rules, graph dependencies, numerical experiments, backups, final-slide navigation, saved return destinations, math detours, keyboard/mobile use, and selected axe WCAG A/AA rules. Independent review and the remaining browser/screen-reader matrix are still open.

Current checkpoint: 54 logic tests and 12 Chromium tests pass, with no findings in the eight tested axe states. The final build and local Svelte/TypeScript checks pass; the three navigation flows were rechecked after the final return-link handling change.
