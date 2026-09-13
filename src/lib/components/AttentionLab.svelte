<script lang="ts">
  import { attentionMix, fmt } from "$lib/simulations";
  import type { Position } from "$lib/model";
  type State = NonNullable<Position["attention"]>;
  let {
    state = { query: "first", causal: true },
    onupdate,
  }: { state?: State; onupdate: (state: State) => void } = $props();
  const queries = { first: [2, 0], second: [0, 2], balanced: [1, 1] };
  const query = $derived(queries[state.query]);
  const result = $derived(attentionMix(query, state.causal));
</script>

<section class="lab attention-lab" aria-label="Attention scoring experiment">
  <span class="eyebrow">ONE QUERY AT POSITION TWO</span>
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
  <p class="attention-scroll-hint">
    Scroll the table sideways to compare all six columns. With a keyboard, focus
    the table and use the arrow keys.
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
          ><th>Weight</th><th>Value</th></tr
        ></thead
      ><tbody
        >{#each result.rows as row (row.id)}<tr
            ><th scope="row">{row.id}{row.allowed ? "" : " (masked)"}</th><td
              >[{row.key.join(", ")}]</td
            ><td>{fmt(row.score)}</td><td>{fmt(row.scaled)}</td><td
              data-testid={`attention-weight-${row.id}`}>{fmt(row.weight)}</td
            ><td>[{row.value.join(", ")}]</td></tr
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
</section>
