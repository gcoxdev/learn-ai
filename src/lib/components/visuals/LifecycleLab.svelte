<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (v: VisualValues) => void } = $props();
  const stages = [
    {
      title: "Prepare examples",
      tag: "DATA",
      artifact: "Source records → documented training examples",
      detail:
        "Collect examples, check their origin, remove unwanted repeats, and define token and target rules. This prepares what learning will consume; it does not itself adjust the model's weights.",
      weights: "Weights unchanged",
      color: "#dce8ee",
    },
    {
      title: "Pretrain",
      tag: "LEARN",
      artifact: "Examples + starting weights → a base checkpoint",
      detail:
        "Predict targets, measure a loss, and adjust weights. A checkpoint saves a particular learned state, together with the configuration needed to interpret it.",
      weights: "Weights change",
      color: "#dbe8cd",
    },
    {
      title: "Adapt, if needed",
      tag: "LEARN",
      artifact:
        "A checkpoint + demonstrations or feedback → an adapted checkpoint",
      detail:
        "A team may use demonstrations, comparisons, scored behavior, or a combination. This is one possible branch; every model does not follow the same post-training sequence.",
      weights: "Weights change during fitting",
      color: "#dbe8cd",
    },
    {
      title: "Evaluate and release",
      tag: "CHECK",
      artifact: "A tested artifact set → a version ready for use",
      detail:
        "Check the actual model, tokenizer, prompts, and supporting data together. Keep a compatible previous set for recovery. Evaluation computes evidence; choosing a release is not itself a gradient update.",
      weights: "Evaluation keeps the tested weights fixed",
      color: "#efe0c9",
    },
    {
      title: "Use the model",
      tag: "INFERENCE",
      artifact: "A request + the released system → a response",
      detail:
        "The model computes with its current weights. A prompt, retrieved document, or tool result can change the answer without changing those weights. A conversation is not automatically a training run.",
      weights: "Weights fixed for this example",
      color: "#dce8ee",
    },
    {
      title: "Observe and investigate",
      tag: "FEEDBACK",
      artifact: "Reviewed outcomes → a diagnosis or proposed change",
      detail:
        "Inspect failures and changing inputs. The repair might be a source update, a software fix, or a separately evaluated training run. Monitoring does not automatically mean retraining.",
      weights: "A new training run would be a separate choice",
      color: "#efe0c9",
    },
  ];
  const stage = $derived(
    visualNumber(values, "stage", 0, 0, stages.length - 1, true),
  );
  const current = $derived(stages[stage]);
</script>

<VisualFrame
  title="Where do the weights actually change?"
  label="Model lifecycle explorer"
  prompt="Pick a stage. Predict whether it changes the learned numbers or uses the model as it stands."
>
  <div
    class="stage-map"
    role="group"
    aria-label="Stages of a representative model lifecycle"
  >
    {#each stages as item, i (item.title)}<button
        class:chosen={i === stage}
        style:--stage-color={item.color}
        aria-pressed={i === stage}
        onclick={() => onupdate({ stage: i })}
        ><span>{i + 1} · {item.tag}</span><strong>{item.title}</strong></button
      >{/each}
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    <strong>{current.artifact}</strong><span>{current.weights}</span><span
      >{current.detail}</span
    >
  </div>
  <div class="visual-actions">
    <button
      class="button"
      disabled={stage === 0}
      onclick={() => onupdate({ stage: stage - 1 })}>Previous stage</button
    ><button
      class="button"
      disabled={stage === stages.length - 1}
      onclick={() => onupdate({ stage: stage + 1 })}>Next stage</button
    >
  </div>
  <p class="visual-note">
    This is a representative lifecycle map. Real projects can loop back, skip
    adaptation, or compare branches. Selecting a stage explores the explanation;
    it does not run a model.
  </p>
</VisualFrame>

<style>
  .stage-map {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.65rem;
    margin: 1rem 0;
  }
  .stage-map button {
    text-align: left;
    border: 1px solid #b3c0aa;
    border-radius: 9px;
    background: #fffefa;
    padding: 0.85rem;
    min-height: 90px;
    color: #29402f;
    cursor: pointer;
    line-height: 1.45;
  }
  .stage-map button span {
    display: block;
    font-size: 0.67rem;
    letter-spacing: 0.04em;
    margin-bottom: 0.45rem;
  }
  .stage-map button strong {
    font-size: 0.85rem;
  }
  .stage-map button.chosen {
    background: var(--stage-color);
    outline: 2px solid #35543b;
    outline-offset: 1px;
  }
  @media (max-width: 520px) {
    .stage-map {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .stage-map button {
      padding: 0.7rem;
    }
  }
</style>
