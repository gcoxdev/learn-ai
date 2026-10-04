<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { DESK_CASES, deskOutcome } from "$lib/system-one-visuals";
  import {
    visualBoolean,
    visualNumber,
    type VisualValues,
  } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const threshold = $derived(
    visualNumber(values, "threshold", 75, 50, 99, true),
  );
  const wrongCost = $derived(
    visualNumber(values, "wrongCost", 10, 1, 50, true),
  );
  const reviewCost = $derived(
    visualNumber(values, "reviewCost", 0.5, 0.1, 5),
  );
  const shift = $derived(visualBoolean(values, "shift"));
  const r = $derived(deskOutcome(threshold / 100, wrongCost, reviewCost, shift));
  const pct = (v: number | null) =>
    v === null ? "not measurable (nothing automated)" : `${(100 * v).toFixed(1)}%`;
  // Histogram of top probability in 0.05-wide bins from 0.40 to 1.00.
  const BINS = Array.from({ length: 12 }, (_, i) => 0.4 + 0.05 * i);
  const hist = $derived(
    BINS.map((lo, i) => {
      const hi = i === BINS.length - 1 ? 1.0001 : lo + 0.05;
      const inBin = DESK_CASES.filter(
        (c) => (shift || !c.shifted) && c.confidence >= lo - 1e-9 && c.confidence < hi - 1e-9,
      );
      return {
        lo,
        right: inBin.filter((c) => c.correct).length,
        wrong: inBin.filter((c) => !c.correct && !c.shifted).length,
        shiftedWrong: inBin.filter((c) => !c.correct && c.shifted).length,
      };
    }),
  );
  const maxCount = $derived(
    Math.max(...hist.map((b) => b.right + b.wrong + b.shiftedWrong), 1),
  );
  const x = (p: number) => 30 + ((p - 0.4) / 0.6) * 290;
  const h = (n: number) => (150 * n) / maxCount;
  function update(next: VisualValues) {
    onupdate({ threshold, wrongCost, reviewCost, shift, ...next });
  }
</script>

<VisualFrame
  title="Run the help desk for a day"
  label="Automation threshold and cost experiment"
  prompt="Messages whose top probability reaches the threshold are handled automatically; the rest go to a person. Set the costs, move the threshold, then add a batch of messages in a language the model was not tuned for."
>
  <div class="visual-controls">
    <label
      >Automate at top probability ≥ <strong>{(threshold / 100).toFixed(2)}</strong
      ><input
        aria-label="Automation threshold"
        type="range"
        min="50"
        max="99"
        step="1"
        value={threshold}
        oninput={(e) => update({ threshold: Number(e.currentTarget.value) })}
      /></label
    >
    <label
      >Cost of one wrong automated answer: <strong>{wrongCost}</strong><input
        aria-label="Cost of a wrong automated answer"
        type="range"
        min="1"
        max="50"
        step="1"
        value={wrongCost}
        oninput={(e) => update({ wrongCost: Number(e.currentTarget.value) })}
      /></label
    >
    <label
      >Cost of one human review: <strong>{reviewCost.toFixed(1)}</strong><input
        aria-label="Cost of a human review"
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        value={reviewCost}
        oninput={(e) => update({ reviewCost: Number(e.currentTarget.value) })}
      /></label
    >
    <label class="desk-toggle"
      ><input
        type="checkbox"
        checked={shift}
        onchange={(e) => update({ shift: e.currentTarget.checked })}
      />Add 40 messages in a new language</label
    >
  </div>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 340 214"
      role="img"
      aria-label={`Histogram of top probability for ${r.total} messages. Threshold ${(threshold / 100).toFixed(2)}. Automated ${r.automated}, of which ${r.wrong} wrong. Review queue ${r.review}.`}
    >
      <title>How many messages fall at each top probability, and which were wrong</title>
      <rect x={x(threshold / 100)} y="10" width={320 - x(threshold / 100)} height="160" fill="#e8eedf" />
      {#each hist as b (b.lo)}
        <rect x={x(b.lo) + 1} y={170 - h(b.right)} width="22" height={h(b.right)} fill="#397354" />
        <rect x={x(b.lo) + 1} y={170 - h(b.right) - h(b.wrong)} width="22" height={h(b.wrong)} fill="#d8b98a" />
        <rect
          x={x(b.lo) + 1}
          y={170 - h(b.right) - h(b.wrong) - h(b.shiftedWrong)}
          width="22"
          height={h(b.shiftedWrong)}
          fill="#a2483a"
        />
      {/each}
      <line
        x1={x(threshold / 100)}
        x2={x(threshold / 100)}
        y1="10"
        y2="172"
        stroke="#946025"
        stroke-width="2"
        stroke-dasharray="4 3"
      />
      {#each [0.4, 0.6, 0.8, 1.0] as tick (tick)}<text
          x={x(tick)}
          y="188"
          text-anchor="middle"
          font-size="13">{tick.toFixed(1)}</text
        >{/each}
      <text x="4" y="208" font-size="12"
        >Green: right · tan: wrong · red: wrong, new language</text
      >
    </svg>
  </div>
  <div class="visual-result" aria-live="polite" data-testid="desk-result">
    <strong
      >Automated {r.automated} of {r.total} · wrong among them {r.wrong} · review
      queue {r.review} · total cost {r.cost.toFixed(1)}</strong
    >
    <span>Error rate among automated answers: {pct(r.errorRate)}.</span>
    {#if shift}<span
        >New-language messages automated: {r.shiftedAutomated}, of which {r.shiftedWrong}
        wrong. They look as sure as ordinary messages, so the threshold lets them
        through.</span
      >{/if}
    <span
      >At 20,000 messages a day, this sample scales to about {Math.round(
        (r.automated / r.total) * 20000,
      ).toLocaleString("en-US")} automated and {Math.round(
        (r.wrong / r.total) * 20000,
      ).toLocaleString("en-US")} wrong automated answers.</span
    >
  </div>
  <div class="visual-actions">
    <button class="button ghost" onclick={() => onupdate({})}>Reset the desk</button>
  </div>
  <details>
    <summary>Read the histogram as a table</summary>
    <div class="table-scroll">
      <table>
        <caption>Messages by top probability ({r.total} messages)</caption><thead
          ><tr
            ><th scope="col">Top probability</th><th scope="col">Right</th><th
              scope="col">Wrong</th
            ><th scope="col">Wrong, new language</th></tr
          ></thead
        ><tbody
          >{#each hist as b (b.lo)}<tr
              ><th scope="row">{b.lo.toFixed(2)}–{(b.lo + 0.05).toFixed(2)}</th><td
                >{b.right}</td
              ><td>{b.wrong}</td><td>{b.shiftedWrong}</td></tr
            >{/each}</tbody
        >
      </table>
    </div>
  </details>
  <p class="visual-note">
    An invented sample for teaching. Raising the threshold cuts wrong automated
    answers and grows the queue; which threshold is cheapest depends on the two
    costs. When the new-language batch arrives, overall calibration on old data
    says nothing about it. Watch each slice, find out why it fails, and fix the
    cause before refitting a temperature.
  </p>
</VisualFrame>

<style>
  .desk-toggle {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
  }
</style>
