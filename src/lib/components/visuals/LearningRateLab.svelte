<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { learningRateTrace } from "$lib/mechanism-visuals";
  import { fmt } from "$lib/simulations";
  import {
    visualChoice,
    visualNumber,
    type VisualValues,
  } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const rate = $derived(visualNumber(values, "rate", 0.8, 0, 1.2));
  const savedSteps = $derived(visualNumber(values, "steps", 0, 0, 6, true));
  const steps = $derived(savedSteps === 1 ? 2 : savedSteps);
  const prediction = $derived(
    visualChoice(
      values,
      "prediction",
      ["", "constant", "decay", "same"] as const,
      "",
    ),
  );
  const constant = $derived(learningRateTrace(rate, "constant", steps));
  const decay = $derived(learningRateTrace(rate, "decay", steps));
  const afterTwo = $derived([
    learningRateTrace(rate, "constant", 2)[2].loss,
    learningRateTrace(rate, "decay", 2)[2].loss,
  ]);
  const answer = $derived(
    Math.abs(afterTwo[0] - afterTwo[1]) < 1e-10
      ? "same"
      : afterTwo[0] < afterTwo[1]
        ? "constant"
        : "decay",
  );
  const labels = {
    constant: "the constant rate",
    decay: "the decaying rate",
    same: "the same loss",
  };
  const scale = $derived(
    Math.max(
      4,
      ...constant.map((row) => Math.abs(row.weight)),
      ...decay.map((row) => Math.abs(row.weight)),
    ),
  );
  const px = (step: number) => 45 + step * 45;
  const py = (weight: number) => 125 - (weight / scale) * 80;
  const line = (rows: typeof constant) =>
    rows.map((row) => `${px(row.step)},${py(row.weight)}`).join(" ");
  function update(next: VisualValues) {
    onupdate({ rate, steps, prediction, ...next });
  }
</script>

<VisualFrame
  title="Compare a steady step with a shrinking step"
  label="Learning rate schedule experiment"
  prompt="Both runs start at w = 4 and try to reach zero. Keep one learning rate constant; divide the other by the update number. Which run will have the smaller loss after two updates?"
>
  <div class="visual-controls">
    <label
      >Starting learning rate: <strong>{fmt(rate)}</strong><input
        aria-label="Schedule starting rate"
        type="range"
        min="0"
        max="1.2"
        step="0.1"
        value={rate}
        oninput={(e) =>
          update({
            rate: Number(e.currentTarget.value),
            steps: 0,
            prediction: "",
          })}
      /></label
    ><label
      >After two updates, the smaller loss comes from…<select
        aria-label="Predict lower loss"
        value={prediction}
        disabled={steps > 0}
        onchange={(e) => update({ prediction: e.currentTarget.value })}
        ><option value="">Choose a prediction</option><option value="constant"
          >The constant rate</option
        ><option value="decay">The decaying rate</option><option value="same"
          >They tie</option
        ></select
      ></label
    >
  </div>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 350 254"
      role="img"
      aria-label={`Weight versus update number. Both start at 4; target is zero. ${steps ? `After ${steps} updates: constant weight ${fmt(constant[steps].weight)}, decaying weight ${fmt(decay[steps].weight)}.` : "Predict before revealing either trajectory."}`}
    >
      <title>Two gradient descent trajectories on loss w squared</title>
      {#each [-1, 0, 1] as tick (tick)}<line
          x1="45"
          x2="315"
          y1={py(tick * scale)}
          y2={py(tick * scale)}
          stroke="#9caa95"
          stroke-dasharray={tick ? "3 4" : undefined}
        /><text x="38" y={py(tick * scale) + 5} text-anchor="end" font-size="13"
          >{Math.round(tick * scale * 10) / 10}</text
        >{/each}
      <text x="45" y="23" font-size="14">Weight w (zero is the target)</text>
      <polyline
        points={line(constant)}
        fill="none"
        stroke="#946025"
        stroke-width="3"
      />
      <polyline
        points={line(decay)}
        fill="none"
        stroke="#397354"
        stroke-width="3"
        stroke-dasharray="5 4"
      />
      {#each constant as row (row.step)}<rect
          x={px(row.step) - 4}
          y={py(row.weight) - 4}
          width="8"
          height="8"
          fill="#946025"
        />{/each}
      {#each decay as row (row.step)}<circle
          cx={px(row.step)}
          cy={py(row.weight)}
          r="4"
          fill="#fffefa"
          stroke="#397354"
          stroke-width="2"
        />{/each}
      {#each [0, 1, 2, 3, 4, 5, 6] as step (step)}<text
          x={px(step)}
          y="228"
          text-anchor="middle"
          font-size="14">{step}</text
        >{/each}<text x="180" y="250" text-anchor="middle" font-size="14"
        >Update number</text
      >
    </svg>
    <div class="visual-legend">
      <span>Squares, solid: constant rate</span><span
        >Circles, dashed: decaying rate</span
      >
    </div>
  </div>
  <div class="visual-actions">
    <button
      class="button"
      disabled={!prediction || steps > 0}
      onclick={() => update({ steps: 2 })}>Compare two updates</button
    ><button
      class="button"
      disabled={steps < 2 || steps >= 6}
      onclick={() => update({ steps: steps + 1 })}
      >Take one more paired step</button
    ><button
      class="button ghost"
      onclick={() => onupdate({ rate: 0.8, steps: 0, prediction: "" })}
      >Reset schedules</button
    >
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    {#if steps > 0}<strong
        >{prediction === answer
          ? "Your prediction matches."
          : "Revise your prediction."} After two updates: {answer === "same"
          ? "both have the same loss"
          : `${labels[answer]} gives the smaller loss`}.</strong
      ><span data-testid="schedule-loss"
        >After {steps} updates — constant loss: {fmt(constant[steps].loss)};
        decaying loss: {fmt(decay[steps].loss)}.</span
      ><span
        >Most recent rates: constant {fmt(constant[steps].rate)}; decaying {fmt(
          decay[steps].rate,
        )}. {rate > 1
          ? "The constant run grows farther from zero at this rate."
          : rate === 0
            ? "A zero rate leaves both runs at their starting point."
            : "Try a different starting rate; decay does not always win."}</span
      >{:else}<span
        >Loss is w²; lower is better. Both runs currently have loss 16. Make a
        prediction, then compare their updates.</span
      >{/if}
  </div>
  <details>
    <summary>See the update rule and worked numbers</summary>
    <p>
      For loss L(w) = w², the gradient is 2w. Every update uses w_new = w_old −
      rate × 2w_old. The decaying run uses starting rate ÷ update number,
      beginning at update 1; both first updates use the same rate.
    </p>
    {#if steps > 0}<p>
        First update in both runs: 4 − {fmt(rate)} × 8 = {fmt(
          constant[1].weight,
        )}.
      </p>
      <p>
        Second constant update: {fmt(constant[1].weight)} − {fmt(rate)} × ({fmt(
          constant[2].gradient,
        )}) = {fmt(constant[2].weight)}. Second decaying update: {fmt(
          decay[1].weight,
        )} − {fmt(rate / 2)} × ({fmt(decay[2].gradient)}) = {fmt(
          decay[2].weight,
        )}.
      </p>{/if}
    <p>
      This scalar bowl isolates the schedule. It has no data noise, momentum, or
      Adam state. Crossing zero is an overshoot; whether loss shrinks depends on
      the distance from zero afterward. The vertical scale expands if the
      constant run grows.
    </p>
  </details>
</VisualFrame>
