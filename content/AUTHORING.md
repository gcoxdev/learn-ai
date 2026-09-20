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

For revised banks, retire old variants and preserve their response contracts for backups. Bump the objective version when its evidence standard changes; do not relabel old responses as proof of the new standard. Supply at least four fresh variants per family in revised foundational banks. Variants within a family must demonstrate equivalent skills: putting a missing step in a retake does not make it required for first-pass mastery. Use numeric input where a calculation is the intended evidence; collect intermediate fields when a final number could hide an error, such as a reversed residual sign or an incorrect negative value before ReLU. Choose distractors reflecting plausible errors, give explanatory feedback, and inspect answer lengths without padding options to hit a statistical target.

Vary correct-option positions independently between question families; a repeated position should not reveal the next answer. Keep option IDs stable for saved response contracts.

Link the relevant chapter, section, or paper when available. A generic book page can be a supplemental reference, but should not be the only further-reading destination. New vocabulary entries require a short contextual definition and a valid teaching-lesson link. Use `matchPhrases` to override broad term matching for ambiguous everyday words (for example, “mean” or “value”). Definitions remain searchable in the full glossary even when a scene has no contextual match.

Non-project runtime estimates are derived from visible core teaching words at 120 words/minute, two minutes per active assessment family, and three minutes per interactive scene, rounded to minutes with a five-minute minimum. Omit `lesson.minutes` for non-project lessons; the build rejects this overridden metadata. Projects retain positive explicit work estimates. Neither is a measured learner duration; retakes, note-taking, and side lessons can add time.

Keep the current fifteen paths and modules stable while deepening the language core and its shared prerequisites. Use the per-path depth table in the editorial report to expose unfinished stretches. Chapters are presentation groups around the existing order, not new prerequisite nodes or extra mastery awards. Merge lessons only when reviewing their teaching and evidence reveals a coherent combined outcome; preserve saved scene aliases and retired response contracts during any merge.

Make practice playful through useful decisions: predict a change, move a control, catch a mistaken claim, or repair a small example. A formative reveal explains the result but does not award mastery. Use a short memory cue after teaching the mechanism, not instead of teaching it. Clearly distinguish a deterministic toy from a trained model and a repeatable draw comparison from random trials.

## Interactive figures

Attach a figure to the existing scene that teaches its idea. Keep one main teaching question per figure; start with a useful example, invite a prediction, expose a meaningful control, and explain the result. Put detailed arithmetic behind an optional reveal when the diagram already communicates the first idea. Define the controls and symbols before expecting learners to interpret them. Mathematical derivations should link to the appropriate bridge through `bridge_refs` so a detour preserves the experiment.

```yaml
figure:
  kind: derivative
  caption: Bring the two points closer to compare an average slope with a local slope.
  description: On the curve y equals x squared, the local slope is twice x. Comparing points separated by h gives a slope of two x plus h.
```

`figure.kind` is validated against the registry in `src/lib/visual-state.ts`; `caption` is always shown, and `description` supplies a meaningful fallback while the component loads or if loading fails. The current kinds are `input-output`, `training-inference`, `data-splits`, `neural-network`, `bias`, `derivative`, `chain-rule`, `parameter-training`, `tokenizer`, `video`, `audio`, `robot`, `lifecycle`, `history`, `evaluation`, and `image-noise`. This metadata is separate from the original gradient specimen's `visual` authoring block and the existing `simulation` field. A scene with either a figure or simulation receives one interactive-scene time allowance, not two.

Components live in `src/lib/components/visuals/` and load when needed. Reuse `VisualFrame` and the scoped `visual.css`. A component receives `values` and emits its complete new control state with `onupdate`. Restore each control through the bounded `visualNumber`, `visualChoice`, or `visualBoolean` helpers; restored primitive values are not necessarily valid control values. The player stores the figure kind and values by scene in the existing lesson position. Backup imports validate the scene/kind pairing. Old backups without figures remain valid. These settings follow existing backup, reset, and tab synchronization rules and never create assessment evidence. Preserve stable scene IDs and figure meanings when revising saved activities.

Use the same numerical helper for the plot, readout, and calculation table. Verify gradients independently with finite differences and verify updates using changed inputs, including simultaneous updates for multiple parameters. If a map is a slice with a parameter held fixed, say so; if it spans two parameters, calculate both. State clipping, rescaling, rounding, and fixture limits. Label invented image/noise patterns, sequences, and answers as teaching examples. Do not depict them as historical artifacts, measured model outputs, or realistic training runs. New external images and recordings need source, creator/license, and a caption that explains their relevance.

Use native keyboard/touch controls and text equivalents for every graph; do not require dragging, color perception, sound, or motion alone. Keep animation under learner control and respect reduced motion. Audio starts only on a deliberate click and stops on leaving the activity. Check mobile overflow, focus, selected accessibility rules, restored state, and numerical behavior in the actual lesson. Figures are selective teaching aids, not mandatory decorations on every slide.
