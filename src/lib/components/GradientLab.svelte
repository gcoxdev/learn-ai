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
      return `${45 + (i / 90) * 475},${220 - ((2 * w - 6) ** 2 / maxLoss) * 175}`;
    }).join(" "),
  );
  const cx = $derived(45 + ((current.weight - minW) / (maxW - minW)) * 475);
  const cy = $derived(220 - (current.loss / maxLoss) * 175);
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
        viewBox="0 0 560 270"
        role="img"
        aria-label={`Squared error versus weight. Current weight ${fmt(current.weight)}, error ${fmt(current.loss)}. Exact values follow in a table.`}
      >
        <title>Loss landscape for prediction = 2 × weight, target = 6</title>
        {#each [0, 0.25, 0.5, 0.75, 1] as tick (tick)}<line
            x1="45"
            x2="520"
            y1={220 - tick * 175}
            y2={220 - tick * 175}
            stroke="#dbe3da"
            stroke-dasharray="3 5"
          /><text x="37" y={224 - tick * 175} text-anchor="end"
            >{Math.round(tick * maxLoss)}</text
          >{/each}
        <line x1="45" x2="520" y1="220" y2="220" stroke="#82917e" />
        <polyline {points} fill="none" stroke="#397354" stroke-width="3" />
        <line
          x1={cx}
          x2={cx}
          y1={cy}
          y2="220"
          stroke="#ac7650"
          stroke-dasharray="4 4"
        />
        <circle {cx} {cy} r="7" fill="#b7784f" stroke="#fff" stroke-width="3" />
        <text x="45" y="241">{fmt(minW)}</text><text
          x="520"
          y="241"
          text-anchor="end">{fmt(maxW)}</text
        >
        <text x="280" y="260" text-anchor="middle">Weight w</text><text
          x="45"
          y="22">Squared error</text
        >
      </svg>
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
