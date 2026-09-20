<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { beamBranches, beamSearch } from "$lib/mechanism-visuals";
  import { fmt } from "$lib/simulations";
  import {
    visualBoolean,
    visualChoice,
    visualNumber,
    type VisualValues,
  } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const width = $derived(visualNumber(values, "width", 2, 1, 2, true));
  const prediction = $derived(
    visualChoice(values, "prediction", ["", "same", "different"] as const, ""),
  );
  const revealed = $derived(visualBoolean(values, "revealed"));
  const result = $derived(beamSearch(width));
  const greedy = beamSearch(1);
  const answer = $derived(
    result.winner.sequence === greedy.winner.sequence ? "same" : "different",
  );
  function update(next: VisualValues) {
    onupdate({ width, prediction, revealed, ...next });
  }
</script>

<VisualFrame
  title="Keep a second possibility alive"
  label="Beam search experiment"
  prompt="Greedy decoding keeps only the most likely next token. A beam keeps several prefixes. With this fixed two-token tree, will your beam choose the same final sequence as greedy decoding?"
>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 350 246"
      role="img"
      aria-label={`Fixed tree: go has probability 0.6, stay 0.4. After go, home and here each have probability 0.5. After stay, home has 0.9 and here 0.1. ${revealed ? `Width ${width} chooses ${result.winner.sequence} with score ${fmt(result.winner.score)}.` : "Predict before revealing the sequence scores."}`}
    >
      <title>A fixed branching tree for two output tokens</title>
      <text x="175" y="20" text-anchor="middle" font-size="15">Start</text>
      {#each beamBranches as branch, i (branch.token)}
        <line
          x1="175"
          y1="29"
          x2={i === 0 ? 90 : 260}
          y2="65"
          stroke="#71856a"
          stroke-width="2"
        />
        <text x={i === 0 ? 90 : 260} y="83" text-anchor="middle" font-size="15"
          >{branch.token} · {branch.probability}</text
        >
        {#each branch.next as next, j (next.token)}
          {@const x = 45 + i * 170 + j * 80}
          {@const kept = !revealed || result.prefixes.includes(branch.token)}
          <line
            x1={i === 0 ? 90 : 260}
            y1="92"
            x2={x}
            y2="141"
            stroke={kept ? "#397354" : "#71856a"}
            stroke-width="2"
            stroke-dasharray={kept ? undefined : "4 4"}
          />
          <text {x} y="160" text-anchor="middle" font-size="14"
            >{next.token}</text
          >
          <text {x} y="180" text-anchor="middle" font-size="14"
            >{next.probability}</text
          >
          {#if revealed}<text {x} y="211" text-anchor="middle" font-size="14"
              >{kept
                ? fmt(branch.probability * next.probability)
                : "pruned"}</text
            >{/if}
        {/each}
      {/each}
      <text x="175" y="240" text-anchor="middle" font-size="13"
        >{revealed
          ? "Bottom row: full sequence scores"
          : "Numbers: conditional probabilities"}</text
      >
    </svg>
  </div>
  <div class="visual-controls">
    <label
      >Beam width<select
        aria-label="Beam width"
        value={width}
        onchange={(e) =>
          update({
            width: Number(e.currentTarget.value),
            prediction: "",
            revealed: false,
          })}
        ><option value={1}>1 prefix (greedy)</option><option value={2}
          >2 prefixes</option
        ></select
      ></label
    >
    <label
      >Compared with greedy, the winning sequence is…<select
        aria-label="Predict beam outcome"
        value={prediction}
        disabled={revealed}
        onchange={(e) => update({ prediction: e.currentTarget.value })}
        ><option value="">Choose a prediction</option><option value="same"
          >The same</option
        ><option value="different">Different</option></select
      ></label
    >
  </div>
  <div class="visual-actions">
    <button
      class="button"
      disabled={!prediction || revealed}
      onclick={() => update({ revealed: true })}
      >Compare completed sequences</button
    ><button
      class="button ghost"
      onclick={() => onupdate({ width: 2, prediction: "", revealed: false })}
      >Reset beam search</button
    >
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    {#if revealed}
      <strong
        >{prediction === answer
          ? "Your prediction matches."
          : `The winning sequence is ${answer}, so revise your prediction.`}</strong
      >
      <span>Greedy: “{greedy.winner.sequence}”, score 0.6 × 0.5 = 0.3.</span>
      <span data-testid="beam-winner"
        >Beam width {width}: “{result.winner.sequence}”, score {result.winner
          .first} × {result.winner.second} = {fmt(result.winner.score)}.</span
      >
      <span
        >{width === 2
          ? "Keeping “stay” lets its strong continuation overtake “go”. The model’s probabilities did not change."
          : "Width one discards “stay” after the first token. It cannot recover that prefix later."}</span
      >
    {:else}<span>Choose a prediction to compare the two decoding policies.</span
      >{/if}
  </div>
  <details>
    <summary>See what the sequence score measures</summary>
    <p>
      All outputs here have exactly two tokens. Their score is the product of
      the two conditional probabilities. Real decoders usually add log
      probabilities for numerical stability and need rules for ending sequences
      and comparing lengths. Equal scores in this lab keep the listed order:
      “home” before “here”.
    </p>
    <p>
      This hand-written tree contains no trained model. A wider beam searches
      more possibilities; it does not guarantee factual or useful text, or the
      best sequence in an arbitrary larger tree.
    </p>
  </details>
</VisualFrame>
