# Teaching and assessment standards

Start with a concrete task. Explain a new term in ordinary words where it first becomes necessary, then show its role in the example. The glossary is a reference, not a substitute for teaching. Avoid putting unexplained terms in an opening summary or check. An unfamiliar everyday analogy should not become an extra prerequisite.

Use the appropriate lesson shape:

- **Foundation:** introduce a small number of related words, trace an everyday example, contrast easily confused roles, and offer supported practice. Define before using; spell out symbols before compact notation.
- **Mechanism:** explain inputs and operations, trace intermediate values, show a useful counterexample, and check changed numbers or a changed situation. Use a simulation where changing a control exposes the mechanism.
- **Comparison:** state common criteria, inspect relevant artifacts, distinguish evidence from inference, and make a bounded comparison. Date model-specific claims and link exact report revisions.
- **Project:** provide a task, accessible inputs, expected deliverable, reproducible reference, and review rubric. A small quiz cannot grade an unseen artifact.
- **Perspective:** develop a historical, social, or research question through concrete cases and evidence. Do not force numerical calculation when it would obscure the question.

Module lengths and scene counts follow the topic. Split overloaded mechanisms before increasing information density; keep stable lesson IDs when moving catalog slots. A few short paragraphs remain an outline even when every slot is occupied. The generated editorial report identifies unfinished depth work without treating a word count as a teaching credential.

System paths describe an observable endpoint and a stated reference design, or an explicitly bounded comparison. Their required roots should include the endpoint objective and only the foundations and mechanisms needed for that outcome. Architectural alternatives, historical influences, and useful comparisons belong in optional extensions or connected paths unless the outcome actually assesses them. A dependency map’s connection is not automatically a prerequisite. Check the teaching scenes and every active assessment variant before removing or adding a gate; define locally any vocabulary exposed by its removal.

Keep path IDs stable because saved progress and lesson return destinations use them. New paths need a unique slug, group, motivating question, reference scope, outcome, endpoint, extension reasons, and valid related-path IDs. An extension already required by the core should not also be listed as optional. The generated [path coverage report](PATH_COVERAGE.md) shows core and extension preparation for every asset; investigate any unassigned lesson, but do not force it into an unrelated core merely to increase coverage. Shared objectives reuse compatible evidence. Path completion does not certify an optional branch, an unassessed depth, or an unseen project artifact.

Write the summary as an invitation, the objective as an assessable ability, and the closing takeaway as a useful consequence. The final visible page combines takeaway, quiz, and continuation choices. Removed recap IDs remain as aliases so saved positions still open the closing page.

## Prose and lesson flow

Write for an intelligent reader encountering the subject for the first time. Use familiar words without talking down to them. Introduce a technical name or acronym beside its meaning, before relying on it in an explanation. A prerequisite can supply the deeper mathematics; briefly identify what a symbol means in the current calculation.

Use US customary units for worked examples: feet and inches, miles, pounds and ounces, gallons, and degrees Fahrenheit. Choose plausible values that keep the teaching arithmetic clear, and update every related table, diagram, code block, question, and feedback explanation together. Label units at input and output boundaries, including squared units and rates. Keep original units when describing a historical incident or a technical convention whose meaning depends on them; explain the distinction from the worked example. Seconds, milliseconds, angles, and standard computing units need no conversion.

Give each scene one teaching job. Start with a situation or question, explain the operation, and show what follows. Carry a useful example across scenes so the learner can build on what they just understood. When changing examples, say what changed and why. Place a worked calculation beside the concept it illustrates, rather than attaching an unrelated example to the end of a scene.

Integrate new definitions and worked steps into the explanation. Do not leave an older dense paragraph in place and append an easier version that repeats it afterward. Split a scene when it introduces two substantial mechanisms; preserve existing scene IDs and saved-position compatibility. Use short paragraphs or a small list when the reader needs to compare roles or follow distinct steps.

Keep analogies consistent and limited to the relationship they explain. Prefer a concrete counterexample to repeated abstract cautions. Include qualifications where they change how a learner should interpret or use the idea; avoid interrupting every explanation with unrelated claims about what AI cannot prove. Memory cues are optional and should help recall an already taught mechanism, without forced slogans or new metaphors.

End with one or two useful sentences a learner could explain in their own words. Do not copy the formal objective or list every technical term as the takeaway. Closing instructions should tell learners what to do next; text mode needs the same teaching guidance, not a description of radio buttons or other implementation details. Project checks must remain distinct from review of the project artifact.

Record editorial decisions separately from independent subject review, assessment-bank validation, and learner trials. The [prose and flow review](PROSE_REVIEW.md) records a complete reading pass and its limits; a wording improvement alone does not justify changing evidence standards or declaring a lesson ready for release.

For revised banks, retire old variants and preserve their response contracts for backups. Bump the objective version when its evidence standard changes; do not relabel old responses as proof of the new standard. Supply at least four fresh variants per family in revised foundational banks. Variants within a family must demonstrate equivalent skills: putting a missing step in a retake does not make it required for first-pass mastery. Use numeric input where a calculation is the intended evidence; collect intermediate fields when a final number could hide an error, such as a reversed residual sign or an incorrect negative value before ReLU. Choose distractors reflecting plausible errors, give explanatory feedback, and inspect answer lengths without padding options to hit a statistical target.

Vary correct-option positions independently between question families; a repeated position should not reveal the next answer. Keep option IDs stable for saved response contracts.

Link the relevant chapter, section, or paper when available. A generic book page can be a supplemental reference, but should not be the only further-reading destination. New vocabulary entries require a short contextual definition and a valid teaching-lesson link. Use `matchPhrases` to override broad term matching for ambiguous everyday words (for example, “mean” or “value”). Definitions remain searchable in the full glossary even when a scene has no contextual match.

Non-project runtime estimates are derived from visible core teaching words at 120 words/minute, two minutes per active assessment family, and three minutes per interactive scene, rounded to minutes with a five-minute minimum. Omit `lesson.minutes` for non-project lessons; the build rejects this overridden metadata. Projects retain positive explicit work estimates. Neither is a measured learner duration; retakes, note-taking, and side lessons can add time.

Keep the current fifteen paths and modules stable while improving instruction and assessment across their existing scope. Use the per-path depth table in the editorial report to expose unfinished stretches. Chapters are presentation groups around the existing order, not new prerequisite nodes or extra mastery awards. Merge lessons only when reviewing their teaching and evidence reveals a coherent combined outcome; preserve saved scene aliases and retired response contracts during any merge.

Make practice playful through useful decisions: predict a change, move a control, catch a mistaken claim, or repair a small example. A formative reveal explains the result but does not award mastery. Use a short memory cue after teaching the mechanism, not instead of teaching it. Clearly distinguish a deterministic toy from a trained model and a repeatable draw comparison from random trials.

The eleven M00 beginner lessons now provide six active variants per family. Adding equivalent practice examples keeps objective versions and existing response contracts unchanged; changing the evidence standard still requires versioning. Do not treat six variants as enough for unlimited fresh retakes, and do not pad other banks with superficial rewordings to meet a quota.

## Lesson markdown

Scene `markdown` is ordinary Markdown with a few additions, compiled by `scripts/lesson-markdown.ts`.

- **Math.** `$…$` inline and `$$…$$` on its own lines render with KaTeX. Write a literal dollar sign as `\$` (prices are common in worked examples).
- **Callouts.** Open with `:::kind Title` on its own line and close with `:::`. Kinds: `predict` (the body stays hidden behind *Reveal the answer*; ask the question in the title), `mixup` (a common confusion and its fix), `story` (a short, accurate, sourced history or case), `papers` (the formula as the literature writes it, with every symbol mapped to the worked example), `try`, `key`, `deeper`, and `example`.
- **Code.** A fence tagged `` ```python run `` becomes an editable block with a **Run** button. It executes in the learner's browser with Pyodide and NumPy, loaded only on first run, with a fresh namespace each time. Plain `` ```python `` is highlighted but not runnable. Every number the prose quotes from a runnable block must match what the block prints; if you suggest a change to try, run that too.
- **Tables** use GitHub table syntax. Keep them small enough for a phone.
- **Diagrams.** Add a scene-level `diagram:` with `caption`, `description` (a complete text version that names every connection), `nodes` (`id`, `label`, optional `note`, `col` 0–5, `row` 0–6, `tone` plain/accent/data/warn/muted) and `edges` (`from`, `to`, optional `label`, `dashed`, `bend`). The renderer wraps labels to two lines and notes to three; keep labels to a few words. Check that no arrow passes through a box.

Refer to other lessons by title or topic ("the lesson on stable training", "module 6"), never by file id.

## Checking lessons

Run `node --import tsx scripts/check-lessons.ts <files>` after every edit, and `npm run lessons` (every lesson; add `-- --summary` for counts only) before committing. It reports:

- **Errors** (must be zero): YAML or compile failures, route and reference problems, fewer than two active variants in a family, duplicate prompts, broken answer keys, and compatibility breaks against `HEAD`. Compatibility breaks include a deleted scene, objective or variant; a changed option id or answer; a changed figure kind; and retiring variants or changing evidence families without bumping the objective version.
- **Warnings** (aim for zero): thin teaching text (under 350 words, or 300 for bridges), authoring or product language in learner-facing text, stacked disclaimers, a summary that copies the objective, a bold term used before it is defined, a correct option that is much the longest or the only non-absolute one, yes/no questions, feedback that just repeats the answer, and generic hints.

`npm run lessons:normalize -- <files>` rewrites prose fields as literal blocks without changing compiled content. Recap scenes are kept only as aliases for old saved positions; learners never see them, so they are exempt from prose lint.

## Interactive figures

Attach a figure to the existing scene that teaches its idea. Keep one main teaching question per figure; start with a useful example, invite a prediction, expose a meaningful control, and explain the result. Put detailed arithmetic behind an optional reveal when the diagram already communicates the first idea. Define the controls and symbols before expecting learners to interpret them. Mathematical derivations should link to the appropriate bridge through `bridge_refs` so a detour preserves the experiment.

```yaml
figure:
  kind: derivative
  caption: Bring the two points closer to compare an average slope with a local slope.
  description: On the curve y equals x squared, the local slope is twice x. Comparing points separated by h gives a slope of two x plus h.
```

`figure.kind` is validated against the registry in `src/lib/visual-state.ts`; `caption` is always shown, and `description` supplies a meaningful fallback while the component loads or if loading fails. The current kinds are `input-output`, `training-inference`, `data-splits`, `neural-network`, `network-layers`, `clustering`, `beam-search`, `kv-cache`, `learning-rate`, `bayes`, `threshold`, `convolution`, `bias`, `derivative`, `chain-rule`, `parameter-training`, `tokenizer`, `video`, `audio`, `robot`, `lifecycle`, `history`, `evaluation`, `image-noise`, `answer-tray`, `confidence-dial`, and `help-desk`. This metadata is separate from the original gradient specimen's `visual` authoring block and the existing `simulation` field. A scene with either a figure or simulation receives one interactive-scene time allowance, not two.

The `network-layers` figure is a hand-chosen 2 → 3 → 2 → 1 network with layer stepping and unit inspection. Its controls persist inputs, one adjustable connection weight, stage, and selected unit; all intermediate values are derived. It is a separate numerical fixture from `neural-network`, the smaller 1 → 2 → 1 worked example. If a lesson uses both, explain the change of example before asking learners to compare values. Layer stepping reveals a forward calculation; editing a weight manually is not training.

Components live in `src/lib/components/visuals/` and load when needed. Reuse `VisualFrame` and the scoped `visual.css`. A component receives `values` and emits its complete new control state with `onupdate`. Restore each control through the bounded `visualNumber`, `visualChoice`, or `visualBoolean` helpers; restored primitive values are not necessarily valid control values. The player stores the figure kind and values by scene in the existing lesson position. Backup imports validate the scene/kind pairing. Old backups without figures remain valid. These settings follow existing backup, reset, and tab synchronization rules and never create assessment evidence. Preserve stable scene IDs and figure meanings when revising saved activities.

Use the same numerical helper for the plot, readout, and calculation table. Verify gradients independently with finite differences and verify updates using changed inputs, including simultaneous updates for multiple parameters. If a map is a slice with a parameter held fixed, say so; if it spans two parameters, calculate both. State clipping, rescaling, rounding, and fixture limits. Label invented image/noise patterns, sequences, and answers as teaching examples. Do not depict them as historical artifacts, measured model outputs, or realistic training runs. New external images and recordings need source, creator/license, and a caption that explains their relevance.

Use native keyboard/touch controls and text equivalents for every graph; do not require dragging, color perception, sound, or motion alone. Keep animation under learner control and respect reduced motion. Audio starts only on a deliberate click and stops on leaving the activity. Check mobile overflow, focus, selected accessibility rules, restored state, and numerical behavior in the actual lesson. Figures are selective teaching aids, not mandatory decorations on every slide.


The clustering, beam-search, cache-memory, and learning-rate activities ask learners to predict before revealing a calculated result. Their predictions are formative and never award independent evidence. Changing the relevant inputs resets the prediction; save the control values and derive results rather than persisting duplicate calculated outputs. State fixture limits: the clustering example is one-dimensional; beam candidates have equal length; the cache figure measures dense K/V payload rather than total device memory; the schedule activity uses plain gradient descent on a scalar quadratic, not Adam.

Project lessons expose a downloadable review worksheet assembled from their non-assessment scenes in route order, including authored tables and rubric prose. Keep deliverables and review criteria explicit in those scenes. The worksheet is ungraded and excludes question payloads and saved progress. Correction exports identify the scene and current objective versions; they are files for the learner to share, not a submission service.

The `bayes`, `threshold`, and `convolution` figures add numerical practice to probability, classification evaluation, and vision. Each resets its prediction/reveal when relevant controls change and saves only bounded control state. Bayes counts are expected counts for a hypothetical population of 10,000; zero flags make the posterior undefined. Threshold scores are fixed, invented, and uncalibrated; zero flags make precision undefined. The filter performs unflipped one-dimensional cross-correlation with explicit stride and zero padding, without bias, activation, or training. Do not reuse these fixtures as measured production results.

The `answer-tray`, `confidence-dial`, and `help-desk` figures serve the System One decision-model module (M38); their fixtures live in `src/lib/system-one-visuals.ts`, and lesson prose must quote only numbers that file produces (its unit tests pin the quoted ones). The answer tray renormalizes one fixed set of scores over the candidates left in the tray; say that a real model would rescore the new list. The confidence dial divides fixed scores by a temperature, so the ranking never changes, and it shows top probability and a provider-style confidence, (p_max − 1/n)/(1 − 1/n), as separate numbers. The help desk is a fixed, invented sample of 200 roughly calibrated messages plus an optional batch of 40 confident, often-wrong messages in a new language; with nothing automated, its error rate is reported as not measurable rather than zero.

## When a lesson leaves draft

`lesson.state: draft` is publication status, not a measure of reading progress or a claim that the lesson is an empty outline. Catalog coverage, an editorial pass, independent review, and validated learning are separate milestones. The [dated review record](LESSON_REVIEW.md) records the editorial pass; it does not award the later milestones.

A lesson is ready for release only when all of the following have recorded evidence:

1. **Clear scope and preparation:** a specific outcome; necessary prerequisites; new terms and symbols explained locally before use; optional depth and bridges identified.
2. **A teachable explanation:** a complete worked mechanism or concrete evidence-based case, intelligible transitions, useful limits or counterexamples, and a short takeaway. Beginners can explain the idea in ordinary words. Advanced detail is connected to that same example.
3. **Accuracy:** an independent subject reviewer checks claims, calculations, assumptions, and relevant primary sources. Named releases identify exact versions; unknowns remain unknown. Record reviewer, date, lesson revision, findings, and resolution.
4. **Aligned assessment:** every active variant is solvable from the taught material or stated prerequisites, keys are correct, distractors reflect plausible errors, feedback explains the mechanism without referring to shuffled positions, and fresh retakes test equivalent skills. Record bank review separately. Changed evidence standards require new objective versions and preserved retired contracts.
5. **Usable delivery:** the same explanation works in presentation and continuous reading; keyboard/text alternatives cover visuals; examples fit small screens; side-lesson returns and the combined closing page work. Record actual browser and accessibility checks, including their limits.
6. **Learner evidence:** representative beginners try the lesson, explain it without copying, and apply it to a fresh case. Review confusing points and incorrect transfers; resolve blockers to the stated outcome. Record observed results rather than inferring comprehension from length, completion clicks, or automated scores.

Record each requirement as pending, changes requested, or passed with evidence for a specific revision. An author or automated editor cannot count its own reading pass as independent subject review. Significant later edits reopen affected checks. A project additionally needs a usable artifact rubric and reviewed examples; its concept quiz cannot grade work the app never receives.

No minimum word count, number of slides, or third-party assessment score automatically makes a lesson complete. A lesson can remain short when its scope is narrow. Split a crowded scene or add a worked step when learners cannot follow it. Do not mark all lessons complete merely because the catalog is filled or the build passes.
