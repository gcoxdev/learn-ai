<script lang="ts">
  import { networkTrace } from "$lib/foundation-visuals";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  import VisualFrame from "./VisualFrame.svelte";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const x = $derived(visualNumber(values, "x", 2, 0, 5, true));
  const step = $derived(visualNumber(values, "step", 0, 0, 3, true));
  const trace = $derived(networkTrace(x));
  const stages = [
    "Start with the input",
    "Multiply, then add biases",
    "Apply the ReLU rule",
    "Combine the two values",
  ];
  function update(change: VisualValues) {
    onupdate({ x, step, ...change });
  }
</script>

<VisualFrame
  title="Follow one number through a network"
  label="Neural network forward pass experiment"
  prompt="Start with 2. Predict which middle value would change if the input became 4, then step through to check."
>
  <p class="visual-note">
    A <strong>weight</strong> multiplies an incoming value. A
    <strong>bias</strong>
    is a fixed number added afterward. <strong>ReLU</strong> is a rule that keeps
    positive values and turns negative values into zero.
  </p>
  <div class="visual-controls">
    <label
      >Input x: {x}<input
        type="range"
        min="0"
        max="5"
        step="1"
        value={x}
        aria-label="Network input"
        oninput={(event) =>
          update({ x: Number(event.currentTarget.value), step: 0 })}
      /></label
    >
    <label
      >Calculation step<select
        value={step}
        onchange={(event) =>
          update({ step: Number(event.currentTarget.value) })}
      >
        {#each stages as stage, index (stage)}<option value={index}
            >{index + 1}. {stage}</option
          >{/each}
      </select></label
    >
  </div>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 340 438"
      role="img"
      aria-label={`Network diagram. Input ${x}. First middle unit: multiply by 2, add bias minus 1, then ReLU. Second middle unit: multiply by minus 1, add bias 3, then ReLU. Output: first value plus twice the second value, plus bias 1. Current step: ${stages[step]}.`}
    >
      <path
        d="M156 62 81 165m0 0 1 -9m-1 9 9 -3M184 62 259 165m0 0 -9 -3m9 3 -1 -9"
        fill="none"
        stroke="#6b815f"
        stroke-width="2.5"
      />
      <path
        d="M86 247 149 341m0 0 -8 -3m8 3 0 -9M254 247 191 341m0 0 0 -9m0 9 8 -3"
        fill="none"
        stroke="#6b815f"
        stroke-width="2.5"
      />
      <path
        d="M23 142v59h15m0 0 -6 -4m6 4 -6 4M317 142v59h-15m0 0 6 -4m-6 4 6 4M295 346v28h-51m0 0 6 -4m-6 4 6 4"
        fill="none"
        stroke="#97723f"
        stroke-width="2"
        stroke-dasharray="4 3"
      />
      <rect
        x="105"
        y="10"
        width="130"
        height="54"
        rx="12"
        fill="#f3e9d2"
        stroke="#b6975c"
      />
      <text x="170" y="44" text-anchor="middle" font-size="22" font-weight="600"
        >x = {x}</text
      >
      <rect x="81" y="99" width="48" height="27" rx="5" fill="#fffefa" /><text
        x="105"
        y="119"
        text-anchor="middle"
        font-size="17">× 2</text
      >
      <rect x="211" y="99" width="58" height="27" rx="5" fill="#fffefa" /><text
        x="240"
        y="119"
        text-anchor="middle"
        font-size="17">× −1</text
      >
      <text x="7" y="130" font-size="14">bias −1</text><text
        x="275"
        y="130"
        font-size="14">bias +3</text
      >
      <rect
        x="40"
        y="171"
        width="94"
        height="77"
        rx="12"
        fill={step >= 1 ? "#e5ebdc" : "#f2f1ea"}
        stroke="#789471"
      />
      <rect
        x="206"
        y="171"
        width="94"
        height="77"
        rx="12"
        fill={step >= 1 ? "#e5ebdc" : "#f2f1ea"}
        stroke="#789471"
      />
      <text x="87" y="195" text-anchor="middle" font-size="13"
        >{step < 2 ? "Middle sum 1" : "After ReLU 1"}</text
      >
      <text x="253" y="195" text-anchor="middle" font-size="13"
        >{step < 2 ? "Middle sum 2" : "After ReLU 2"}</text
      >
      <text x="87" y="228" text-anchor="middle" font-size="25" font-weight="600"
        >{step === 0
          ? "?"
          : step === 1
            ? trace.firstSum
            : trace.firstHidden}</text
      >
      <text
        x="253"
        y="228"
        text-anchor="middle"
        font-size="25"
        font-weight="600"
        >{step === 0
          ? "?"
          : step === 1
            ? trace.secondSum
            : trace.secondHidden}</text
      >
      <rect x="84" y="285" width="48" height="27" rx="5" fill="#fffefa" /><text
        x="108"
        y="305"
        text-anchor="middle"
        font-size="17">× 1</text
      >
      <rect x="209" y="285" width="48" height="27" rx="5" fill="#fffefa" /><text
        x="233"
        y="305"
        text-anchor="middle"
        font-size="17">× 2</text
      >
      <text x="272" y="334" font-size="14">bias +1</text>
      <rect
        x="97"
        y="348"
        width="146"
        height="75"
        rx="12"
        fill={step === 3 ? "#f3e9d2" : "#f2f1ea"}
        stroke="#b6975c"
      />
      <text x="170" y="373" text-anchor="middle" font-size="15">Output y</text
      ><text
        x="170"
        y="405"
        text-anchor="middle"
        font-size="25"
        font-weight="600">{step === 3 ? trace.output : "?"}</text
      >
    </svg>
  </div>
  <div class="visual-legend">
    <span>Solid arrows: multiply by a weight</span><span
      >Dashed arrows: add a bias</span
    >
  </div>
  <div class="visual-result" aria-live="polite" data-testid="network-trace">
    <strong>Step {step + 1}: {stages[step]}</strong>
    {#if step === 0}<span
        >The input is {x}. There are two middle units. Each will combine this
        input with its own weight and bias.</span
      >{/if}
    {#if step >= 1}<span
        >First sum: 2 × {x} − 1 = {trace.firstSum}. Second sum: −1 × {x} + 3 = {trace.secondSum}.</span
      >{/if}
    {#if step >= 2}<span
        >ReLU gives {trace.firstHidden} and {trace.secondHidden}. {trace.firstSum <
          0 || trace.secondSum < 0
          ? "A negative sum became zero."
          : "Neither sum is negative, so neither changes."}</span
      >{/if}
    {#if step === 3}<strong
        >Output: 1 × {trace.firstHidden} + 2 × {trace.secondHidden} + 1 = {trace.output}.</strong
      >{/if}
  </div>
  <div class="visual-actions">
    <button
      class="button secondary"
      disabled={step === 0}
      onclick={() => update({ step: step - 1 })}>Previous step</button
    ><button
      class="button"
      disabled={step === 3}
      onclick={() => update({ step: step + 1 })}>Next calculation</button
    ><button
      class="button secondary"
      onclick={() => onupdate({ x: 2, step: 0 })}>Reset experiment</button
    >
  </div>
  <p class="visual-note">
    This is a <strong>forward pass</strong>: use the current weights and biases
    to calculate an output. Changing x does not train the network. The middle
    units are “hidden” because they sit between the input and output, not
    because their arithmetic is secret.
  </p>
</VisualFrame>
