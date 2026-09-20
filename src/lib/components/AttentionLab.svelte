<script lang="ts">
  import { attentionMix, fmt } from "$lib/simulations";
  import type { Position } from "$lib/model";
  import "./visuals/visual.css";
  type State = NonNullable<Position["attention"]>;
  let {
    state = { query: "first", causal: true },
    onupdate,
  }: { state?: State; onupdate: (state: State) => void } = $props();
  const queries = { first: [2, 0], second: [0, 2], balanced: [1, 1] };
  const query = $derived(queries[state.query]);
  const result = $derived(attentionMix(query, state.causal));
  const diagramNumber = (value: number) => Number(value.toFixed(2));
</script>

<section
  class="lab attention-lab visual-lab"
  aria-label="Attention scoring experiment"
>
  <span class="eyebrow">ONE QUERY AT POSITION TWO</span>
  <h3>See which values contribute</h3>
  <p class="visual-prompt">
    Predict which connection will grow when the query switches from the first
    coordinate to the second. Try it, then explain what the mask prevents.
  </p>
  <p>
    A <strong>vector</strong> is a list of numbers. The <strong>query</strong>
    asks what to look for; each position's <strong>key</strong> supplies numbers
    to compare with it. A <strong>value</strong> is the information that position
    can contribute to the answer.
  </p>
  <p>
    All vectors below are constructed examples. Each key has two coordinates, so
    its dot-product score is divided by √2 before softmax.
  </p>
  <div class="attention-controls">
    <label
      >Query vector<select
        value={state.query}
        onchange={(event) =>
          onupdate({
            ...state,
            query: event.currentTarget.value as State["query"],
          })}
        ><option value="first">[2, 0] — first coordinate</option><option
          value="second">[0, 2] — second coordinate</option
        ><option value="balanced">[1, 1] — both coordinates</option></select
      ></label
    >
    <label class="check-control"
      ><input
        type="checkbox"
        checked={state.causal}
        onchange={(event) =>
          onupdate({ ...state, causal: event.currentTarget.checked })}
      />Apply the causal mask</label
    >
  </div>
  <p class="attention-mask-note">
    {state.causal
      ? "Positions one and two are allowed. Future position three receives zero weight."
      : "Future position three is now allowed for comparison. This would leak information in autoregressive next-token training."}
  </p>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 340 426"
      role="img"
      aria-label={`Query [${query.join(", ")}] at position two. Connection thickness represents each attention weight. ${state.causal ? "Position three is masked and contributes zero." : "All three positions can contribute."} Add the weighted values to obtain [${result.output.map(fmt).join(", ")}].`}
    >
      <rect
        x="8"
        y="5"
        width="324"
        height="57"
        rx="10"
        fill="#e5ebdc"
        stroke="#789471"
      />
      <text x="170" y="28" text-anchor="middle" font-size="16" font-weight="600"
        >Query at position 2: [{query.join(", ")}]</text
      >
      <text x="170" y="49" text-anchor="middle" font-size="13"
        >Scores become fractions of the mixture</text
      >
      {#each result.rows as row (row.id)}
        {@const y = 81 + (row.id - 1) * 81}
        <rect
          x="8"
          {y}
          width="107"
          height="62"
          rx="9"
          fill={row.allowed ? "#f3e9d2" : "#eeeee8"}
          stroke={row.allowed ? "#b6975c" : "#9d9f95"}
        />
        <text x="61" y={y + 22} text-anchor="middle" font-size="14"
          >Position {row.id}</text
        ><text x="61" y={y + 46} text-anchor="middle" font-size="16"
          >[{row.value.join(", ")}]</text
        >
        <line
          x1="121"
          y1={y + 34}
          x2="201"
          y2={y + 34}
          stroke={row.allowed ? "#56794e" : "#83877c"}
          stroke-width={1 + row.weight * 8}
          stroke-dasharray={row.allowed ? undefined : "4 4"}
        />
        <path
          d={`M201 ${y + 34}l-7 -5m7 5 -7 5`}
          fill="none"
          stroke={row.allowed ? "#56794e" : "#83877c"}
          stroke-width="2"
        />
        <text x="161" y={y + 16} text-anchor="middle" font-size="14"
          >× {diagramNumber(row.weight)}</text
        >
        <text x="161" y={y + 57} text-anchor="middle" font-size="12"
          >{row.allowed ? "weight" : "masked"}</text
        >
        <rect
          x="210"
          {y}
          width="122"
          height="62"
          rx="9"
          fill={row.allowed ? "#e5ebdc" : "#eeeee8"}
          stroke={row.allowed ? "#789471" : "#9d9f95"}
        />
        <text x="271" y={y + 22} text-anchor="middle" font-size="13"
          >Contribution</text
        ><text x="271" y={y + 46} text-anchor="middle" font-size="16"
          >[{row.value
            .map((v) => diagramNumber(v * row.weight))
            .join(", ")}]</text
        >
        {#if row.id < 3}<text
            x="271"
            y={y + 78}
            text-anchor="middle"
            font-size="18">+</text
          >{/if}
      {/each}
      <path
        d="M271 313v22l-5 -6m5 6 5 -6"
        fill="none"
        stroke="#567252"
        stroke-width="2"
      />
      <rect
        x="8"
        y="343"
        width="324"
        height="73"
        rx="10"
        fill="#e5ebdc"
        stroke="#789471"
      />
      <text x="170" y="369" text-anchor="middle" font-size="15"
        >Add the three contributions</text
      ><text
        x="170"
        y="398"
        text-anchor="middle"
        font-size="21"
        font-weight="600">[{result.output.map(diagramNumber).join(", ")}]</text
      >
    </svg>
  </div>
  <p class="visual-note">
    Thicker connections carry more weight. The picture rounds to two decimal
    places; the table shows more detail. A dashed connection is blocked by the
    mask.
  </p>
  <p class="attention-scroll-hint">
    Scroll the table sideways to compare all seven columns. With a keyboard,
    focus the table and use the arrow keys.
  </p>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Native horizontal scrolling needs keyboard focus; this labeled region preserves the table semantics.) -->
  <div
    class="table-scroll"
    role="region"
    aria-label="Attention scores and values"
    tabindex="0"
  >
    <table>
      <caption>Scores and value mixing for query [{query.join(", ")}]</caption
      ><thead
        ><tr
          ><th>Position</th><th>Key</th><th>Dot product</th><th>Scaled score</th
          ><th>Weight</th><th>Value</th><th>Contribution (weight × value)</th
          ></tr
        ></thead
      ><tbody
        >{#each result.rows as row (row.id)}<tr
            ><th scope="row">{row.id}{row.allowed ? "" : " (masked)"}</th><td
              >[{row.key.join(", ")}]</td
            ><td>{fmt(row.score)}</td><td>{fmt(row.scaled)}</td><td
              data-testid={`attention-weight-${row.id}`}>{fmt(row.weight)}</td
            ><td>[{row.value.join(", ")}]</td><td
              >[{row.value.map((v) => fmt(v * row.weight)).join(", ")}]</td
            ></tr
          >{/each}</tbody
      >
    </table>
  </div>
  <div class="mixture-result" aria-live="polite" aria-atomic="true">
    <span>Weighted value output</span><strong data-testid="attention-output"
      >[{result.output.map(fmt).join(", ")}]</strong
    >
  </div>
  <p class="lab-note">
    The displayed values are rounded. The computation uses full precision and a
    stable softmax. These weights describe input positions, not
    output-vocabulary probabilities.
  </p>
  <div class="visual-actions">
    <button
      class="button secondary"
      onclick={() => onupdate({ query: "first", causal: true })}
      >Reset experiment</button
    >
  </div>
</section>
