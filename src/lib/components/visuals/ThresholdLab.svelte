<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { thresholdCounts } from "$lib/decision-visuals";
  import {
    visualNumber,
    visualChoice,
    visualBoolean,
    type VisualValues,
  } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const threshold = $derived(
    visualNumber(values, "threshold", 60, 0, 100, true),
  );
  const prediction = $derived(
    visualChoice(
      values,
      "prediction",
      ["", "0", "1", "2", "3", "4"] as const,
      "",
    ),
  );
  const revealed = $derived(
    visualBoolean(values, "revealed") && prediction !== "",
  );
  const result = $derived(thresholdCounts(threshold));
  const percent = (value: number | null) =>
    value === null ? "undefined (no flags)" : `${(100 * value).toFixed(1)}%`;
  function update(next: VisualValues) {
    onupdate({ threshold, prediction, revealed, ...next });
  }
</script>

<VisualFrame
  title="Move the cutoff, inspect the mistakes"
  label="Classification threshold experiment"
  prompt="Eight invented parts have scores and known conditions. Flag scores at or above the cutoff. Predict how many defects will be missed before revealing the error counts."
>
  <div class="visual-controls">
    <label
      >Flag scores at or above: <strong>{threshold}</strong><input
        aria-label="Flag threshold"
        type="range"
        min="0"
        max="100"
        step="1"
        value={threshold}
        oninput={(e) =>
          update({
            threshold: Number(e.currentTarget.value),
            prediction: "",
            revealed: false,
          })}
      /></label
    >
    <label
      >How many of the four defects are missed?<select
        aria-label="Predict missed defects"
        value={prediction}
        disabled={revealed}
        onchange={(e) => update({ prediction: e.currentTarget.value })}
        ><option value="">Choose a count</option
        >{#each [0, 1, 2, 3, 4] as n (n)}<option value={String(n)}>{n}</option
          >{/each}</select
      ></label
    >
  </div>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 320 324"
      role="img"
      aria-label={`Threshold ${threshold}. ${result.rows.map((r) => `${r.id}: score ${r.score}, ${r.defective ? "defective" : "good"}`).join(". ")}. Scores at or above the vertical line are flagged.`}
    >
      <title>Part scores and a movable decision threshold</title>
      <rect
        x={45 + 2.5 * threshold}
        y="25"
        width={2.5 * (100 - threshold)}
        height="249"
        fill="#e8eedf"
      />
      <line
        x1={45 + 2.5 * threshold}
        x2={45 + 2.5 * threshold}
        y1="25"
        y2="277"
        stroke="#946025"
        stroke-width="2"
        stroke-dasharray="4 3"
      />
      {#each result.rows as row, i (row.id)}
        <text x="8" y={48 + 30 * i} font-size="15">{row.id}</text>
        <line
          x1="45"
          x2="295"
          y1={43 + 30 * i}
          y2={43 + 30 * i}
          stroke="#dce2d6"
        />
        {#if row.defective}<circle
            cx={45 + 2.5 * row.score}
            cy={43 + 30 * i}
            r="7"
            fill="#397354"
          />{:else}<rect
            x={38 + 2.5 * row.score}
            y={36 + 30 * i}
            width="14"
            height="14"
            fill="#ebddc5"
            stroke="#6f593b"
          />{/if}
      {/each}
      {#each [0, 50, 100] as tick (tick)}<text
          x={45 + 2.5 * tick}
          y="294"
          text-anchor="middle"
          font-size="14">{tick}</text
        >{/each}
      <text x="8" y="317" font-size="14"
        >Circle: defect · square: good · axis: score</text
      >
    </svg>
  </div>
  <div class="visual-actions">
    <button
      class="button"
      disabled={!prediction || revealed}
      onclick={() => update({ revealed: true })}>Reveal error counts</button
    ><button class="button ghost" onclick={() => onupdate({})}
      >Reset threshold</button
    >
  </div>
  {#if revealed}<div
      class="visual-result"
      aria-live="polite"
      data-testid="threshold-result"
    >
      <strong
        >{Number(prediction) === result.fn
          ? "Your count matches."
          : `You predicted ${prediction} missed; the count is ${result.fn}.`}</strong
      ><span
        >Caught defects: {result.tp} · False alarms: {result.fp} · Missed defects:
        {result.fn} · Good parts left alone: {result.tn}.</span
      ><span
        >Precision: {percent(result.precision)}. Recall: {percent(
          result.recall,
        )}. Accuracy: {percent(result.accuracy)}.</span
      ><span
        >Precision divides correct flags by all flags. Recall divides caught
        defects by all four defects.</span
      >
    </div>{/if}
  <details>
    <summary>Read the scores and decisions as a table</summary>
    <div class="table-scroll">
      <table>
        <caption>Eight invented parts; the known conditions stay fixed</caption
        ><thead
          ><tr
            ><th scope="col">Part</th><th scope="col">Score</th><th scope="col"
              >Condition</th
            >{#if revealed}<th scope="col">Decision</th>{/if}</tr
          ></thead
        ><tbody
          >{#each result.rows as row (row.id)}<tr
              ><th scope="row">{row.id}</th><td>{row.score}</td><td
                >{row.defective ? "Defective" : "Good"}</td
              >{#if revealed}<td>{row.flagged ? "Flag" : "Leave"}</td>{/if}</tr
            >{/each}</tbody
        >
      </table>
    </div>
  </details>
  <p class="visual-note">
    Try cutoffs 60, 30, then 100. Lowering the cutoff can catch more defects and
    create more false alarms. These scores are not calibrated probabilities.
    Choosing a cutoff on these cases makes them development examples; final
    evaluation needs other cases.
  </p>
</VisualFrame>
