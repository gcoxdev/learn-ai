<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import {
    visualChoice,
    visualBoolean,
    type VisualValues,
  } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (v: VisualValues) => void } = $props();
  const selected = $derived(
    visualChoice(values, "answer", ["none", "a", "b"] as const, "none"),
  );
  const swapped = $derived(visualBoolean(values, "swapped"));
  const checked = $derived(visualBoolean(values, "checked"));
  const answers = {
    a: "Absolutely! You can visit from 9 a.m. to 5 p.m. on Tuesday. We look forward to welcoming you.",
    b: "Tuesday: 10 a.m.–5 p.m., according to the supplied schedule.",
  };
  const order = $derived(
    swapped ? (["b", "a"] as const) : (["a", "b"] as const),
  );
  function pick(answer: "a" | "b") {
    onupdate({ answer, swapped, checked: false });
  }
</script>

<VisualFrame
  title="A polished answer can still miss the fact."
  label="Evidence comparison experiment"
  prompt="Use the source to choose the factually correct answer. Then swap their positions: should the winner change?"
>
  <div class="source-card">
    <span class="eyebrow">SUPPLIED SOURCE · TEACHING FIXTURE</span>
    <h4>Library opening hours</h4>
    <dl>
      <div>
        <dt>Monday</dt>
        <dd>9 a.m.–5 p.m.</dd>
      </div>
      <div>
        <dt>Tuesday</dt>
        <dd><mark>10 a.m.–5 p.m.</mark></dd>
      </div>
    </dl>
  </div>
  <p class="question">Visitor: “When can I visit on Tuesday?”</p>
  <div class="responses" role="group" aria-label="Candidate answers">
    {#each order as id (id)}<button
        class:selected={selected === id}
        aria-pressed={selected === id}
        onclick={() => pick(id)}
        ><span>Answer {id.toUpperCase()}</span>
        <p>{answers[id]}</p></button
      >{/each}
  </div>
  <div class="visual-actions">
    <button
      class="button primary"
      disabled={selected === "none"}
      onclick={() => onupdate({ answer: selected, swapped, checked: true })}
      >Check against the source</button
    ><button
      class="button"
      onclick={() => onupdate({ answer: selected, swapped: !swapped, checked })}
      >Swap answer positions</button
    ><button
      class="button"
      onclick={() =>
        onupdate({ answer: "none", swapped: false, checked: false })}
      >Reset comparison</button
    >
  </div>
  {#if checked}<div class="visual-result" role="status">
      <strong
        >{selected === "b"
          ? "B matches the supplied schedule."
          : "A borrows Monday's start time."}</strong
      ><span
        >Tuesday starts at 10 a.m. Answer B keeps that fact. Answer A sounds
        welcoming but gives the wrong hour. Changing the display order does not
        change either answer's factual content.</span
      >
    </div>{/if}
  <p class="visual-note">
    This checks one factual claim against supplied evidence. It does not
    establish an overall model ranking. Both answers and the schedule are
    authored examples.
  </p>
</VisualFrame>

<style>
  .source-card {
    border: 1px solid #c1cdb5;
    border-radius: 8px;
    background: #fffefa;
    padding: 1rem;
  }
  h4 {
    margin: 0.65rem 0;
    font-size: 1.05rem;
  }
  dl {
    margin: 0;
    font-size: 0.85rem;
  }
  dl div {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    gap: 1rem;
  }
  dd {
    margin: 0;
  }
  mark {
    background: #e8ecd0;
    color: #263d2b;
    padding: 0.2rem;
  }
  .question {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .responses {
    display: grid;
    gap: 0.65rem;
  }
  .responses button {
    text-align: left;
    border: 1px solid #b6c3ac;
    background: #fffefa;
    border-radius: 8px;
    padding: 0.85rem;
    cursor: pointer;
    color: #243e2c;
  }
  .responses button.selected {
    outline: 2px solid #486a3d;
    outline-offset: 1px;
    background: #e6eddc;
  }
  .responses span {
    font-size: 0.75rem;
    font-weight: 700;
  }
  .responses p {
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0.4rem 0 0;
  }
</style>
