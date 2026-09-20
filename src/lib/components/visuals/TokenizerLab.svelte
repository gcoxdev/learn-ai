<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import {
    visualChoice,
    visualNumber,
    type VisualValues,
  } from "$lib/visual-state";
  import {
    encodeToyWord,
    tokenizerAfterMerges,
    tokenPairs,
    tokenTotal,
  } from "$lib/system-visuals";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const steps = $derived(visualNumber(values, "steps", 0, 0, 2, true));
  const corpus = $derived(tokenizerAfterMerges(steps));
  const pairs = $derived(tokenPairs(corpus));
  const selected = $derived(
    visualChoice(
      values,
      "selected",
      pairs.map((p) => p.key),
      pairs[0]?.key ?? "",
    ),
  );
  const result = $derived(
    visualChoice(
      values,
      "result",
      ["none", "retry", "merged"] as const,
      "none",
    ),
  );
  const word = $derived(
    visualChoice(values, "word", ["cat", "cap"] as const, "cap"),
  );
  const encoded = $derived(encodeToyWord(word, steps));
  function update(patch: VisualValues) {
    onupdate({ steps, selected, result, word, ...patch });
  }
  function merge() {
    if (steps >= 2) return;
    if (selected !== pairs[0].key) {
      update({ result: "retry" });
      return;
    }
    update({ steps: steps + 1, selected: "", result: "merged" });
  }
</script>

<VisualFrame
  title="Make a reusable text piece"
  label="Tokenizer merge experiment"
  prompt="Predict which neighboring pair wins. Merge it, then recount: are the same pairs still available?"
>
  <p class="visual-note">
    Training examples: <strong>cat twice, cap once</strong>. Each box is one
    token: a text piece stored as one unit. This toy counts only within words.
  </p>
  <div class="visual-canvas corpus" aria-label="Current token boundaries">
    {#each corpus as row (row.word)}
      <div class="word-row">
        <strong>{row.word} × {row.count}</strong>
        <div
          class="pieces"
          aria-label={`${row.word}: ${row.pieces.join(", ")}`}
        >
          {#each row.pieces as piece, i (`${row.word}-${i}-${piece}`)}<span
              class="piece">{piece}</span
            >{/each}
        </div>
      </div>
    {/each}
    <p>
      <strong>{tokenTotal(corpus)} tokens</strong> across all three examples · {steps}
      of 2 merges learned
    </p>
  </div>
  {#if steps < 2}
    <div class="visual-controls">
      <label
        >Choose a pair to merge
        <select
          value={selected}
          onchange={(event) =>
            update({ selected: event.currentTarget.value, result: "none" })}
          aria-label="Pair to merge"
        >
          {#each pairs as pair (pair.key)}<option value={pair.key}
              >{pair.left} + {pair.right} — {pair.count} occurrences</option
            >{/each}
        </select>
      </label>
    </div>
    <div class="visual-actions">
      <button class="button primary small" onclick={merge}
        >Merge selected pair</button
      >
    </div>
  {/if}
  <div class="visual-result" role="status">
    {#if result === "retry"}
      <strong>Recount the copies before merging.</strong><span
        >{pairs[0].left} + {pairs[0].right} occurs {pairs[0].count} times, more often
        than your choice. The corpus has not changed.</span
      >
    {:else if steps === 2}
      <strong>Two learned rules: c + a → ca, then ca + t → cat.</strong><span
        >The list now uses 4 tokens, down from 9. The spelling stays the same;
        the boundaries change.</span
      >
    {:else if steps === 1}
      <strong>c + a → ca saves three token positions.</strong><span
        >Now ca + t occurs twice and ca + p once. Recount the new pieces rather
        than the old letters.</span
      >
    {:else}
      <strong>9 tokens before any merges.</strong><span
        >The two copies of cat both count. Choose the pair with the largest
        total.</span
      >
    {/if}
  </div>
  <div class="frozen-example">
    <label
      >Apply the current rules to one word
      <select
        value={word}
        onchange={(event) => update({ word: event.currentTarget.value })}
        aria-label="Word to encode"
        ><option value="cap">cap</option><option value="cat">cat</option
        ></select
      >
    </label>
    <p><strong>{word} → [{encoded.join(", ")}]</strong></p>
    <p class="visual-note">
      Changing this word only applies the rules already learned. It does not add
      a merge or change model weights. Real tokenizers also specify bytes,
      spaces, and special tokens.
    </p>
  </div>
  <details>
    <summary>See the counting rule</summary>
    <p>
      Count adjacent pairs in each current word, multiply by that word’s number
      of copies, then add the counts. Select the largest total. For a tie, this
      toy sorts pair labels alphabetically. Merge non-overlapping matches from
      left to right, then recount.
    </p>
  </details>
  <div class="visual-actions">
    <button
      class="button secondary small"
      onclick={() =>
        onupdate({ steps: 0, selected: "c+a", result: "none", word: "cap" })}
      >Reset merges</button
    >
  </div>
  <p class="visual-note">
    Explain it: why can cap still have two pieces after cat becomes one? This
    experiment is practice; it does not award mastery.
  </p>
</VisualFrame>

<style>
  .corpus {
    display: grid;
    gap: 1rem;
  }
  .word-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
  }
  .word-row > strong {
    min-width: 4.5rem;
  }
  .pieces {
    display: flex;
    gap: 0.4rem;
  }
  .piece {
    display: grid;
    place-items: center;
    min-width: 2.6rem;
    height: 2.8rem;
    padding: 0 0.55rem;
    border: 2px solid #73917b;
    border-radius: 0.4rem;
    background: #e7eedc;
    font:
      600 1rem ui-monospace,
      monospace;
  }
  .corpus p {
    font-size: 0.83rem;
    margin: 0;
  }
  .frozen-example {
    border-top: 1px solid #d5dfcb;
    padding-top: 1rem;
  }
  .frozen-example > p {
    font-size: 0.9rem;
  }
</style>
