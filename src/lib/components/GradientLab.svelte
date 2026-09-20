<script lang="ts">
  import { descent, fmt } from "$lib/simulations";
  import Icon from "./Icon.svelte";
  let {
    rate = 0.1,
    initialWeight = 0,
    steps = 0,
    onupdate,
    curveOnly = false,
  }: {
    rate?: number;
    initialWeight?: number;
    steps?: number;
    onupdate: (s: {
      rate: number;
      initialWeight: number;
      steps: number;
    }) => void;
    curveOnly?: boolean;
  } = $props();
  const run = $derived.by(() => {
    try {
      return { rows: descent(rate, initialWeight, steps), error: "" };
    } catch (e) {
      return {
        rows: descent(rate, initialWeight, 0),
        error: e instanceof Error ? e.message : "Try a smaller rate.",
      };
    }
  });
  const current = $derived(run.rows.at(-1)!);
  const minW = $derived(Math.min(-1, ...run.rows.map((r) => r.weight)));
  const maxW = $derived(Math.max(7, ...run.rows.map((r) => r.weight)));
  const maxLoss = $derived(
    Math.max(70, (2 * minW - 6) ** 2 * 1.1, (2 * maxW - 6) ** 2 * 1.1),
  );
  const points = $derived(
    Array.from({ length: 91 }, (_, i) => {
      const w = minW + ((maxW - minW) * i) / 90;
      return `${75 + (i / 90) * 250},${220 - ((2 * w - 6) ** 2 / maxLoss) * 175}`;
    }).join(" "),
  );
  const cx = $derived(75 + ((current.weight - minW) / (maxW - minW)) * 250);
  const cy = $derived(220 - (current.loss / maxLoss) * 175);
  const previous = $derived(run.rows.at(-2));
  const tangent = $derived.by(() => {
    const w = current.weight;
    const gradient = current.gradient;
    let left = Math.max(minW, w - (maxW - minW) * 0.13);
    let right = Math.min(maxW, w + (maxW - minW) * 0.13);
    // Clip the tangent to the displayed loss range, not to the curved function.
    if (gradient > 0) {
      left = Math.max(left, w - current.loss / gradient);
      right = Math.min(right, w + (maxLoss - current.loss) / gradient);
    } else if (gradient < 0) {
      left = Math.max(left, w + (maxLoss - current.loss) / gradient);
      right = Math.min(right, w - current.loss / gradient);
    }
    return {
      x1: 75 + ((left - minW) / (maxW - minW)) * 250,
      y1: 220 - ((current.loss + gradient * (left - w)) / maxLoss) * 175,
      x2: 75 + ((right - minW) / (maxW - minW)) * 250,
      y2: 220 - ((current.loss + gradient * (right - w)) / maxLoss) * 175,
    };
  });
  const lastUpdate = $derived.by(() => {
    if (!previous) return undefined;
    const x = 75 + ((previous.weight - minW) / (maxW - minW)) * 250;
    const y = 220 - (previous.loss / maxLoss) * 175;
    const distance = Math.hypot(cx - x, cy - y);
    if (distance < 0.01) return { x, y, arrow: "" };
    const ux = (cx - x) / distance;
    const uy = (cy - y) / distance;
    const tipX = cx - ux * Math.min(9, distance / 3);
    const tipY = cy - uy * Math.min(9, distance / 3);
    const length = Math.min(7, distance / 4);
    return {
      x,
      y,
      arrow: `${tipX - ux * length - (uy * length) / 2},${tipY - uy * length + (ux * length) / 2} ${tipX},${tipY} ${tipX - ux * length + (uy * length) / 2},${tipY - uy * length - (ux * length) / 2}`,
    };
  });
  function changeRate(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value))
      onupdate({ rate: value, initialWeight, steps: 0 });
  }
</script>

<section class="lab gradient-lab" aria-label="Gradient descent experiment">
  <div class="lab-header">
    <span class="eyebrow"
      >{curveOnly ? "READ THE LANDSCAPE" : "TRY THE MECHANISM"}</span
    ><span class="small-badge">One input · one weight</span>
  </div>
  <div class="gradient-layout">
    <div>
      <svg
        class="loss-chart"
        viewBox="0 0 350 270"
        role="img"
        aria-label={`Squared error versus weight. Current weight ${fmt(current.weight)}, error ${fmt(current.loss)}. Exact values follow in a table.`}
      >
        <title>Loss landscape for prediction = 2 × weight, target = 6</title>
        {#each [0, 0.25, 0.5, 0.75, 1] as tick (tick)}<line
            x1="75"
            x2="325"
            y1={220 - tick * 175}
            y2={220 - tick * 175}
            stroke="#dbe3da"
            stroke-dasharray="3 5"
          /><text x="67" y={224 - tick * 175} text-anchor="end"
            >{Math.round(tick * maxLoss)}</text
          >{/each}
        <line x1="75" x2="325" y1="220" y2="220" stroke="#82917e" />
        <polyline {points} fill="none" stroke="#397354" stroke-width="3" />
        <line
          x1={tangent.x1}
          y1={tangent.y1}
          x2={tangent.x2}
          y2={tangent.y2}
          stroke="#74567e"
          stroke-width="3"
          stroke-dasharray="6 4"
        />
        {#if lastUpdate}
          <line
            x1={lastUpdate.x}
            y1={lastUpdate.y}
            x2={cx}
            y2={cy}
            stroke="#9c5b2e"
            stroke-width="2"
          />
          <circle
            cx={lastUpdate.x}
            cy={lastUpdate.y}
            r="4"
            fill="#fffefa"
            stroke="#9c5b2e"
            stroke-width="2"
          />
          {#if lastUpdate.arrow}<polyline
              points={lastUpdate.arrow}
              fill="none"
              stroke="#9c5b2e"
              stroke-width="2"
            />{/if}
        {/if}
        <line
          x1={cx}
          x2={cx}
          y1={cy}
          y2="220"
          stroke="#ac7650"
          stroke-dasharray="4 4"
        />
        <circle {cx} {cy} r="7" fill="#b7784f" stroke="#fff" stroke-width="3" />
        <text x="75" y="241">{fmt(minW)}</text><text
          x="325"
          y="241"
          text-anchor="end">{fmt(maxW)}</text
        >
        <text x="200" y="260" text-anchor="middle">Weight w</text><text
          x="75"
          y="22">Squared error</text
        >
      </svg>
      <p class="gradient-legend">
        Green: loss curve. Dashed purple: tangent, the local slope. {#if previous}Ochre
          arrow: last update between two parameter settings.{/if}
      </p>
    </div>
    <div class="lab-readouts" aria-live="polite" aria-atomic="true">
      <div><span>Weight</span><strong>{fmt(current.weight)}</strong></div>
      <div>
        <span>Prediction</span><strong>{fmt(current.prediction)}</strong>
      </div>
      <div>
        <span>Squared error</span><strong data-testid="current-loss"
          >{fmt(current.loss)}</strong
        >
      </div>
      <div>
        <span>Local gradient</span><strong>{fmt(current.gradient)}</strong>
      </div>
    </div>
  </div>
  <div class="gradient-explanation" aria-live="polite" aria-atomic="true">
    <p>
      The tangent has slope <strong>{fmt(current.gradient)}</strong>. {rate ===
      0
        ? "With a zero learning rate, the next update leaves the weight unchanged."
        : current.gradient < 0
          ? "A small move right lowers the loss, so the next update increases the weight."
          : current.gradient > 0
            ? "A small move left lowers the loss, so the next update decreases the weight."
            : "The tangent is flat. Here the prediction matches the target, so this toy loss is zero."}
    </p>
    {#if previous}<p>
        Last update: {fmt(previous.weight)} − {fmt(rate)} × ({fmt(
          previous.gradient,
        )}) = <strong>{fmt(current.weight)}</strong>. The loss changed from {fmt(
          previous.loss,
        )} to {fmt(current.loss)}. The arrow connects the before and after
        settings; training does not travel along the curve.
      </p>{/if}
  </div>
  <div class="lab-controls">
    <label
      >Learning rate <output>{rate.toFixed(2)}</output><input
        aria-label="Learning rate"
        type="range"
        min="0"
        max="0.3"
        step="0.01"
        value={rate}
        oninput={changeRate}
      /></label
    >
    <label
      >Initial weight<input
        aria-label="Initial weight"
        type="number"
        min="-6"
        max="12"
        step="0.1"
        value={initialWeight}
        onchange={(e) => {
          const n = Number(e.currentTarget.value);
          if (Number.isFinite(n) && n >= -6 && n <= 12)
            onupdate({ rate, initialWeight: n, steps: 0 });
        }}
      /></label
    >
    <button
      class="button primary"
      disabled={steps >= 12 || !!run.error}
      onclick={() => onupdate({ rate, initialWeight, steps: steps + 1 })}
      ><Icon name="play" size={16} />Take one step</button
    >
    <button
      class="button ghost"
      onclick={() => onupdate({ rate, initialWeight, steps: 0 })}
      ><Icon name="reset" size={16} />Reset</button
    >
  </div>
  <p class="lab-note">
    Each click takes one update, then pauses. Changing the initial weight or
    rate starts a fresh run. Try 0.10, 0.20, and 0.30 to compare shrinking
    error, overshooting, and divergence.
  </p>
  {#if run.error}<p role="alert">{run.error}</p>{/if}
  <details class="trace-details">
    <summary>Read the exact calculation table <span>Step {steps}</span></summary
    >
    <div class="table-scroll">
      <table>
        <caption class="sr-only">Every update for the current run</caption
        ><thead
          ><tr
            ><th>Step</th><th>Weight</th><th>Prediction</th><th>Loss</th><th
              >Gradient</th
            ></tr
          ></thead
        ><tbody
          >{#each run.rows as row (row.step)}<tr
              ><th scope="row">{row.step}</th><td>{fmt(row.weight)}</td><td
                >{fmt(row.prediction)}</td
              ><td>{fmt(row.loss)}</td><td>{fmt(row.gradient)}</td></tr
            >{/each}</tbody
        >
      </table>
    </div>
  </details>
</section>

<style>
  .loss-chart text {
    font-size: 16px;
    fill: #344934;
  }
  .gradient-legend {
    font-size: 0.75rem;
    line-height: 1.6;
    color: #465342;
    margin: 0.3rem 0 0.8rem;
  }
  .gradient-explanation {
    padding: 0.6rem 1rem;
    border-left: 3px solid #74567e;
    background: #f2edf3;
    font-size: 0.86rem;
    line-height: 1.65;
    margin: 0.8rem 0 1rem;
  }
  .gradient-explanation p {
    margin: 0.4rem 0;
  }
</style>
