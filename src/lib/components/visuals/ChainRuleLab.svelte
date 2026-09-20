<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { chainTrace } from "$lib/math-visuals";
  import { fmt } from "$lib/simulations";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const weight = $derived(visualNumber(values, "weight", 1, -1, 4));
  const step = $derived(visualNumber(values, "step", 0, 0, 3, true));
  const trace = $derived(chainTrace(weight));
  const message = $derived(
    [
      "First follow the values downward: multiply by 2, subtract 6, then square. Now trace how a tiny weight change would affect the loss.",
      `Start at the square. Its local derivative is 2 × residual = ${fmt(trace.lossToResidual)}. A tiny residual increase changes loss at that rate.`,
      `Move through subtraction. Subtracting a fixed target has derivative 1, so the loss derivative with respect to prediction stays ${fmt(trace.lossToResidual)}.`,
      `Move through multiplication. Prediction changes by 2 per unit of weight. Multiply the factors: ${fmt(trace.lossToResidual)} × 1 × 2 = ${fmt(trace.gradient)}.`,
    ][step],
  );
  const nodes = $derived([
    { id: "weight", y: 18, label: "Weight w", value: weight },
    {
      id: "prediction",
      y: 103,
      label: "Prediction p",
      value: trace.prediction,
    },
    { id: "residual", y: 188, label: "Residual r", value: trace.residual },
    { id: "loss", y: 273, label: "Squared loss L", value: trace.loss },
  ]);
</script>

<VisualFrame
  title="Follow the chain, then trace it back"
  label="Chain rule experiment"
  prompt="Use the same tiny model as the gradient lesson: input x = 2, target t = 6, prediction p = w × x. Predict whether increasing the weight will raise or lower the loss, then reveal one derivative factor at a time."
>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 350 343"
      role="img"
      aria-label={`Forward values: weight ${fmt(weight)}, prediction ${fmt(trace.prediction)}, residual ${fmt(trace.residual)}, loss ${fmt(trace.loss)}. ${step} of 3 backward factors revealed.`}
    >
      <title>Forward calculation and backward chain-rule factors</title>
      {#each nodes as node (node.id)}
        <rect
          x="10"
          y={node.y}
          width="179"
          height="48"
          rx="8"
          fill={node.id === "loss" ? "#f1e6d9" : "#e8eedf"}
          stroke="#a9b7a2"
        />
        <text x="23" y={node.y + 19} font-size="16">{node.label}</text><text
          x="175"
          y={node.y + 34}
          font-size="18"
          text-anchor="end"
          font-weight="600">{fmt(node.value)}</text
        >
      {/each}
      {#each [{ y: 66, operation: "× input 2" }, { y: 151, operation: "− target 6" }, { y: 236, operation: "square it" }] as op (op.y)}
        <path
          d={`M 48 ${op.y} v 30 m -4 -6 l 4 6 l 4 -6`}
          fill="none"
          stroke="#60725d"
          stroke-width="2"
        />
        <text x="64" y={op.y + 23} font-size="16">{op.operation}</text>
      {/each}
      {#each [{ phase: 1, top: 217, factor: trace.lossToResidual, cumulative: trace.lossToResidual }, { phase: 2, top: 132, factor: 1, cumulative: trace.lossToResidual }, { phase: 3, top: 47, factor: 2, cumulative: trace.gradient }] as back (back.phase)}
        <path
          d={`M 213 ${back.top + 56} v -48 m -4 6 l 4 -6 l 4 6`}
          fill="none"
          stroke={step >= back.phase ? "#9a5e27" : "#d8dfd2"}
          stroke-width="2"
        />
        <text x="230" y={back.top + 18} font-size="16"
          >Factor: {step >= back.phase ? fmt(back.factor) : "?"}</text
        >
        <text x="230" y={back.top + 38} font-size="16"
          >So far: {step >= back.phase ? fmt(back.cumulative) : "?"}</text
        >
      {/each}
      <text x="230" y="316" font-size="16">Start with 1</text>
    </svg>
    <div class="visual-legend">
      <span>Down: calculate values</span><span
        >Up: multiply derivative factors</span
      >
    </div>
  </div>
  <div class="visual-controls">
    <label
      >Weight w: <strong>{fmt(weight)}</strong><input
        aria-label="Chain rule weight"
        type="range"
        min="-1"
        max="4"
        step="0.1"
        value={weight}
        oninput={(event) =>
          onupdate({ weight: Number(event.currentTarget.value), step: 0 })}
      /></label
    >
  </div>
  <div class="visual-actions">
    <button
      class="button primary"
      disabled={step >= 3}
      onclick={() => onupdate({ weight, step: step + 1 })}
      >Trace next derivative</button
    >
    <button
      class="button ghost"
      onclick={() => onupdate({ weight: 1, step: 0 })}>Reset trace</button
    >
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    <strong>Backward step {step} of 3</strong><span>{message}</span>
    {#if step === 3}<span data-testid="chain-gradient"
        >The weight gradient is {fmt(trace.gradient)}. {trace.gradient < 0
          ? "A small weight increase lowers this loss."
          : trace.gradient > 0
            ? "A small weight decrease lowers this loss."
            : "At this weight the prediction matches the target; this toy squared loss is zero."}</span
      >{/if}
  </div>
  <details>
    <summary>See the chain-rule notation</summary>
    <p>
      A <strong>derivative</strong> measures local change. The
      <strong>chain rule</strong>
      multiplies the local changes along a chain of calculations. A
      <strong>gradient</strong> collects the derivatives with respect to the parameters;
      there is just one parameter here.
    </p>
    <p>
      Forward: p = 2w; r = p − 6; L = r².<br />Backward: dL/dw = (dL/dr) ×
      (dr/dp) × (dp/dw).
    </p>
    <table>
      <caption>Local derivatives at the current weight</caption><thead
        ><tr><th scope="col">Operation</th><th scope="col">Local factor</th></tr
        ></thead
      ><tbody>
        <tr
          ><th scope="row">Square r</th><td
            >dL/dr = 2r = {fmt(trace.lossToResidual)}</td
          ></tr
        >
        <tr><th scope="row">Subtract 6</th><td>dr/dp = 1</td></tr>
        <tr><th scope="row">Multiply w by 2</th><td>dp/dw = 2</td></tr>
      </tbody>
    </table>
    <p>
      All factors use the values from this same forward calculation. “Start with
      1” means dL/dL = 1. When one parameter feeds several branches, add the
      derivative contributions from those branches after applying the chain rule
      along each.
    </p>
    <p>
      To take a training step, subtract learning rate × gradient from the
      weight. The gradient is a local guide; a large step can overshoot.
    </p>
  </details>
  <p class="visual-note">
    Remember: values go forward; sensitivity comes back. This follows one path
    through a calculation, with no hidden layer or bias parameter.
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
    text-align: left;
    padding: 0.5rem 0.3rem;
    border-bottom: 1px solid #d7dece;
  }
  caption {
    text-align: left;
    margin-bottom: 0.4rem;
  }
</style>
