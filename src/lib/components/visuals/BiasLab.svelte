<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { lineFit } from "$lib/math-visuals";
  import { fmt } from "$lib/simulations";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const weight = $derived(visualNumber(values, "weight", 1, -1, 4));
  const bias = $derived(visualNumber(values, "bias", 0, -2, 3));
  const fit = $derived(lineFit(weight, bias));
  const px = (x: number) => 52 + x * 119;
  const py = (y: number) => 230 - (y + 3) * 14;
  function update(next: Partial<{ weight: number; bias: number }>) {
    onupdate({ weight, bias, ...next });
  }
</script>

<VisualFrame
  title="Tilt the line. Lift the line."
  label="Weight and bias experiment"
  prompt="Three examples follow a hidden rule. First leave the weight alone and move the bias. Which predictions move, and by how much? Then try matching all three examples."
>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 350 285"
      role="img"
      aria-label={`Prediction equals ${fmt(weight)} times input plus ${fmt(bias)}. The three target values are 1, 3, and 5. Exact predictions and errors are listed below.`}
    >
      <title>Weight changes the tilt; bias changes the height</title>
      <line x1="36" y1={py(0)} x2="323" y2={py(0)} stroke="#879784" />
      <line x1={px(0)} y1="28" x2={px(0)} y2="237" stroke="#879784" />
      {#each [0, 5, 10] as y (y)}
        <line
          x1="36"
          y1={py(y)}
          x2="323"
          y2={py(y)}
          stroke="#d8dfd2"
          stroke-dasharray="3 5"
        />
        <text x="29" y={py(y) + 4} text-anchor="end" font-size="16">{y}</text>
      {/each}
      {#each [0, 1, 2] as x (x)}<text
          x={px(x)}
          y="253"
          text-anchor="middle"
          font-size="16">{x}</text
        >{/each}
      <path
        d={`M ${px(-0.1)} ${py(weight * -0.1 + bias)} L ${px(2.2)} ${py(weight * 2.2 + bias)}`}
        stroke="#397354"
        stroke-width="3"
        fill="none"
      />
      {#each fit.rows as row (row.x)}
        <line
          x1={px(row.x)}
          y1={py(row.prediction)}
          x2={px(row.x)}
          y2={py(row.target)}
          stroke="#a76d34"
          stroke-width="2"
          stroke-dasharray="4 3"
        />
        <circle
          cx={px(row.x)}
          cy={py(row.target)}
          r="6"
          fill="#fffefa"
          stroke="#694f8a"
          stroke-width="3"
        />
        <rect
          x={px(row.x) - 4}
          y={py(row.prediction) - 4}
          width="8"
          height="8"
          fill="#397354"
        />
      {/each}
      <text x="40" y="17" font-size="16">Output</text><text
        x="186"
        y="277"
        text-anchor="middle"
        font-size="16">Input x</text
      >
    </svg>
    <div class="visual-legend">
      <span>○ Purple: examples</span><span>■ Green: predictions</span><span
        >Dashed: distance to the example</span
      >
    </div>
  </div>
  <div class="visual-controls">
    <label
      >Weight w: <strong>{fmt(weight)}</strong><input
        aria-label="Line weight"
        type="range"
        min="-1"
        max="4"
        step="0.1"
        value={weight}
        oninput={(event) =>
          update({ weight: Number(event.currentTarget.value) })}
      /></label
    >
    <label
      >Bias b: <strong>{fmt(bias)}</strong><input
        aria-label="Line bias"
        type="range"
        min="-2"
        max="3"
        step="0.1"
        value={bias}
        oninput={(event) => update({ bias: Number(event.currentTarget.value) })}
      /></label
    >
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    <strong>Prediction = {fmt(weight)} × input + ({fmt(bias)})</strong>
    <span
      >At input 0, the prediction is always the bias: {fmt(bias)}. Raising the
      bias by 1 raises every prediction by 1.</span
    >
    <span
      >{fit.loss < 1e-12
        ? "You found the rule: twice the input, plus one."
        : "Can you match the height at input 0, then match the tilt?"}</span
    >
  </div>
  <button class="button ghost" onclick={() => onupdate({ weight: 1, bias: 0 })}
    >Reset line</button
  >
  <details>
    <summary>See the numbers and the meaning of bias</summary>
    <p>
      A <strong>weight</strong> multiplies an input. A <strong>bias</strong> is an
      added offset, a number a model can learn. It lets the line cross the vertical
      axis somewhere other than zero. Here, “bias” names a parameter; social bias
      means unfair or systematically skewed behavior, a different idea.
    </p>
    <table>
      <caption>Predictions and signed errors for the three examples</caption>
      <thead
        ><tr
          ><th scope="col">Input</th><th scope="col">Target</th><th scope="col"
            >Prediction</th
          ><th scope="col">Error</th></tr
        ></thead
      >
      <tbody
        >{#each fit.rows as row (row.x)}<tr
            ><th scope="row">{row.x}</th><td>{row.target}</td><td
              >{fmt(row.prediction)}</td
            ><td>{fmt(row.residual)}</td></tr
          >{/each}</tbody
      >
    </table>
    <p>
      Error means prediction − target. Negative means too low. Mean squared
      error averages the three squared errors: <strong>{fmt(fit.loss)}</strong>.
      Moving the weight changes a prediction by input × weight change; at input
      0 it changes nothing.
    </p>
  </details>
  <p class="visual-note">
    Remember: weight tilts; bias lifts. This toy uses one input and a straight
    line. Experimenting here does not mark the lesson mastered.
  </p>
</VisualFrame>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }
  th,
  td {
    text-align: right;
    padding: 0.5rem 0.3rem;
    border-bottom: 1px solid #d7dece;
  }
  caption {
    text-align: left;
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }
</style>
