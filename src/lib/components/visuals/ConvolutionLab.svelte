<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { slideFilter } from "$lib/decision-visuals";
  import { fmt } from "$lib/simulations";
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
  const weight = $derived(visualNumber(values, "weight", -1, -2, 2, true));
  const stride = $derived(visualNumber(values, "stride", 1, 1, 2, true));
  const padding = $derived(visualNumber(values, "padding", 0, 0, 1, true));
  const result = $derived(slideFilter([2, 5, 4], [1, weight], stride, padding));
  const position = $derived(
    visualNumber(values, "position", 0, 0, result.windows.length - 1, true),
  );
  const window = $derived(result.windows[position]);
  const prediction = $derived(
    visualChoice(
      values,
      "prediction",
      ["", "negative", "zero", "positive"] as const,
      "",
    ),
  );
  const revealed = $derived(
    visualBoolean(values, "revealed") && prediction !== "",
  );
  const sign = $derived(
    window.sum < 0 ? "negative" : window.sum > 0 ? "positive" : "zero",
  );
  const cx = (index: number) => 25 + index * 55;
  function update(next: VisualValues) {
    onupdate({
      weight,
      stride,
      padding,
      position,
      prediction,
      revealed,
      ...next,
    });
  }
  function change(next: VisualValues) {
    update({ ...next, prediction: "", revealed: false });
  }
</script>

<VisualFrame
  title="Slide one filter, reuse its weights"
  label="Sliding filter experiment"
  prompt="The input is [2, 5, 4]. At each position, multiply two neighboring values by [1, the adjustable weight] and add. Predict the sign of the selected output, then reveal the calculation."
>
  <div class="visual-controls">
    <label
      >Second filter weight: <strong>{weight}</strong><input
        aria-label="Second filter weight"
        type="range"
        min="-2"
        max="2"
        step="1"
        value={weight}
        oninput={(e) => change({ weight: Number(e.currentTarget.value) })}
      /></label
    >
    <label
      >Stride: move this many places<select
        aria-label="Filter stride"
        value={stride}
        onchange={(e) =>
          change({ stride: Number(e.currentTarget.value), position: 0 })}
        ><option value={1}>1 place</option><option value={2}>2 places</option
        ></select
      ></label
    >
    <label
      >Padding at each end<select
        aria-label="Filter padding"
        value={padding}
        onchange={(e) =>
          change({ padding: Number(e.currentTarget.value), position: 0 })}
        ><option value={0}>No extra values</option><option value={1}
          >One zero at each end</option
        ></select
      ></label
    >
    <label
      >Inspect an output position<select
        aria-label="Filter output position"
        value={position}
        onchange={(e) => change({ position: Number(e.currentTarget.value) })}
        >{#each result.windows as w, i (w.start)}<option value={i}
            >Output {i + 1}</option
          >{/each}</select
      ></label
    >
  </div>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 310 216"
      role="img"
      aria-label={`Padded input ${result.padded.join(", ")}. Output ${position + 1} uses ${window.values.join(" and ")}, with weights 1 and ${weight}. ${revealed ? `Their products sum to ${window.sum}.` : "The answer is hidden until revealed."}`}
    >
      <title>One shared filter selecting a pair of input values</title>
      <text x="5" y="20" font-size="15"
        >Input{padding ? " with boundary zeros" : ""}</text
      >
      {#each result.padded as value, i (i)}<rect
          x={cx(i) - 18}
          y="35"
          width="40"
          height="36"
          rx="5"
          fill={i >= window.start && i < window.start + 2
            ? "#e0ecd9"
            : "#f5f4ef"}
          stroke={i >= window.start && i < window.start + 2
            ? "#397354"
            : "#acb7a5"}
          stroke-width="2"
        /><text x={cx(i) + 2} y="59" text-anchor="middle" font-size="16"
          >{value}</text
        >{/each}
      <line
        x1={cx(window.start)}
        x2="70"
        y1="76"
        y2="115"
        stroke="#397354"
      /><line
        x1={cx(window.start + 1)}
        x2="225"
        y1="76"
        y2="115"
        stroke="#397354"
      />
      <text x="70" y="139" text-anchor="middle" font-size="16"
        >{window.values[0]} × 1</text
      ><text x="225" y="139" text-anchor="middle" font-size="16"
        >{window.values[1]} × ({weight})</text
      >
      <text x="150" y="176" text-anchor="middle" font-size="16"
        >Add the two products</text
      >
      <text x="150" y="204" text-anchor="middle" font-size="16"
        >Output {position + 1}: {revealed ? fmt(window.sum) : "?"}</text
      >
    </svg>
  </div>
  <div class="visual-controls">
    <label
      >What sign will this output have?<select
        aria-label="Predict filter output sign"
        value={prediction}
        disabled={revealed}
        onchange={(e) => update({ prediction: e.currentTarget.value })}
        ><option value="">Choose a prediction</option><option value="negative"
          >Negative</option
        ><option value="zero">Zero</option><option value="positive"
          >Positive</option
        ></select
      ></label
    >
  </div>
  <div class="visual-actions">
    <button
      class="button"
      disabled={!prediction || revealed}
      onclick={() => update({ revealed: true })}>Reveal filter sum</button
    ><button class="button ghost" onclick={() => onupdate({})}
      >Reset filter</button
    >
  </div>
  {#if revealed}<div
      class="visual-result"
      aria-live="polite"
      data-testid="filter-result"
    >
      <strong
        >{prediction === sign
          ? "Your prediction matches."
          : `You predicted ${prediction}; this output is ${sign}.`}</strong
      ><span
        >{window.values[0]} × 1 + {window.values[1]} × ({weight}) = {window.products
          .map((value) => (value < 0 ? `(${fmt(value)})` : fmt(value)))
          .join(" + ")} = {fmt(window.sum)}.</span
      ><span
        >All outputs using these same weights: [{result.windows
          .map((w) => fmt(w.sum))
          .join(", ")}].</span
      >
    </div>{/if}
  <p class="visual-note">
    Output positions: {result.windows.length}. Changing position reuses the
    weights; it does not train them. Try padding with zeros, then stride 2. This
    is one-dimensional cross-correlation, the unflipped operation often called
    convolution in neural networks. It omits channels, bias, and activation.
  </p>
</VisualFrame>
