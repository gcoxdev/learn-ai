<script lang="ts">
  import {
    defaultSplitAssignments,
    inspectSplit,
    splitCards,
    splitNames,
    type CardId,
    type SplitAssignments,
    type SplitName,
  } from "$lib/foundation-visuals";
  import {
    visualBoolean,
    visualChoice,
    type VisualValues,
  } from "$lib/visual-state";
  import VisualFrame from "./VisualFrame.svelte";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const partitions = ["train", "validation", "test"] as const;
  const assignments = $derived(
    Object.fromEntries(
      splitCards.map((card) => [
        card.id,
        visualChoice(
          values,
          card.id,
          partitions,
          defaultSplitAssignments[card.id],
        ),
      ]),
    ) as SplitAssignments,
  );
  const checked = $derived(visualBoolean(values, "checked"));
  const result = $derived(inspectSplit(assignments));
  function assign(id: CardId, split: SplitName) {
    onupdate({ ...assignments, [id]: split, checked: false });
  }
</script>

<VisualFrame
  title="Keep related examples together"
  label="Data splitting experiment"
  prompt="Each button has two photos. Can you fill all three groups without putting photos of the same button in different groups?"
>
  <p class="visual-note">
    <strong>Training</strong> examples teach the rule.
    <strong>Validation</strong>
    examples help choose between rules. <strong>Test</strong> examples are saved for
    the final check. A partition is one of these groups. A source here means the physical
    button, photographed twice.
  </p>
  <div class="partition-map" aria-label="Examples per partition">
    {#each partitions as partition (partition)}
      <div>
        <span>{splitNames[partition]}</span><strong
          >{result.counts[partition]} photos</strong
        ><small
          >{partition === "train"
            ? "Learn the rule"
            : partition === "validation"
              ? "Choose the rule"
              : "Check at the end"}</small
        >
      </div>
    {/each}
  </div>
  <div class="cards">
    {#each splitCards as card (card.id)}
      <article
        class:crossing={checked &&
          result.crossings.some((crossing) => crossing.source === card.source)}
      >
        <svg
          viewBox="0 0 130 95"
          role="img"
          aria-label={`Photo ${card.photo} of button ${card.source}`}
        >
          <rect x="2" y="2" width="126" height="91" rx="8" fill="#ecebe4" />
          <g transform={`rotate(${card.photo === 1 ? -8 : 12} 65 47)`}>
            <circle
              cx="65"
              cy="47"
              r="31"
              fill={card.color}
              stroke="#3f5148"
              stroke-width="2"
            />
            <circle
              cx="65"
              cy="47"
              r="25"
              fill="none"
              stroke="#fffefa"
              stroke-opacity=".6"
            />
            {#each Array.from({ length: card.holes }, (_, i) => i) as hole (hole)}
              <circle
                cx={57 + (hole % 2) * 16}
                cy={card.holes === 2 ? 47 : 39 + Math.floor(hole / 2) * 16}
                r="3.5"
                fill="#fffefa"
                stroke="#3f5148"
              />
            {/each}
          </g>
        </svg>
        <label
          >Button {card.source} · photo {card.photo}<select
            aria-label={`Partition for button ${card.source} photo ${card.photo}`}
            value={assignments[card.id]}
            onchange={(event) =>
              assign(card.id, event.currentTarget.value as SplitName)}
          >
            {#each partitions as partition (partition)}<option value={partition}
                >{splitNames[partition]}</option
              >{/each}
          </select></label
        >
        {#if checked && result.crossings.some((crossing) => crossing.source === card.source)}<span
            class="crossing-note">Same source crosses groups</span
          >{/if}
      </article>
    {/each}
  </div>
  <div class="visual-actions">
    <button
      class="button"
      onclick={() => onupdate({ ...assignments, checked: true })}
      >Check split</button
    ><button
      class="button secondary"
      onclick={() => onupdate({ ...defaultSplitAssignments, checked: false })}
      >Reset experiment</button
    >
  </div>
  {#if checked}
    <div
      class="visual-result"
      aria-live="polite"
      data-testid="data-split-result"
    >
      {#if result.solved}
        <strong
          >All three groups are filled, and each button stays in one group.</strong
        >
        <span
          >The final check now uses a different button from the learning and
          selection steps. You removed this particular source of leakage.</span
        >
      {:else}
        <strong
          >{result.crossings.length
            ? `${result.crossings.length} source ${result.crossings.length === 1 ? "crosses" : "groups cross"} a boundary.`
            : "Related photos stay together."}</strong
        >
        {#each result.crossings as crossing (crossing.source)}<span
            >Button {crossing.source} appears in {crossing.partitions
              .map((partition) => splitNames[partition])
              .join(" and ")}.</span
          >{/each}
        {#if result.crossings.length}<span
            >A rule might recognize that particular button instead of handling a
            new one. A tidy count in each group does not prevent this.</span
          >{/if}
        {#if result.empty.length}<span
            >Still empty: {result.empty
              .map((partition) => splitNames[partition])
              .join(", ")}. Keep each pair together and move a whole pair into
            each empty group.</span
          >{/if}
      {/if}
    </div>
  {/if}
  <p class="visual-note">
    These drawings stand in for related photos. <strong>Leakage</strong> means information
    crosses a boundary that was meant to protect a fair check. This tiny puzzle checks
    source separation only; real evaluation also needs enough representative examples
    and careful handling of time and preprocessing.
  </p>
</VisualFrame>

<style>
  .partition-map {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    margin: 1rem 0;
  }
  .partition-map div {
    display: grid;
    gap: 0.35rem;
    padding: 0.8rem 0.4rem;
    border: 1px solid #becbb4;
    border-radius: 9px;
    text-align: center;
    background: #e8eedf;
  }
  .partition-map span {
    font-size: 0.78rem;
    font-weight: 600;
  }
  .partition-map strong {
    font-size: 0.9rem;
  }
  .partition-map small {
    font-size: 0.7rem;
    line-height: 1.5;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;
  }
  article {
    background: #fffefa;
    border: 2px solid #dce2d6;
    border-radius: 10px;
    padding: 0.6rem;
  }
  article.crossing {
    border-color: #986431;
  }
  article svg {
    margin-bottom: 0.5rem;
  }
  .crossing-note {
    display: block;
    font-size: 0.7rem;
    line-height: 1.5;
    color: #774f28;
    margin-top: 0.5rem;
  }
  @media (max-width: 560px) {
    .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
  }
</style>
