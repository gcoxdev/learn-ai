<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { clusterPoints, kMeansStep } from "$lib/mechanism-visuals";
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
  const centerA = $derived(visualNumber(values, "centerA", 2, 0, 5));
  const centerB = $derived(visualNumber(values, "centerB", 6, 5, 11));
  const stage = $derived(visualNumber(values, "stage", 0, 0, 2, true));
  const prediction = $derived(
    visualChoice(values, "prediction", ["", "A", "B"] as const, ""),
  );
  const result = $derived(kMeansStep(clusterPoints, [centerA, centerB]));
  const shownCenters = $derived(
    stage === 2 ? result.updated : [centerA, centerB],
  );
  const answer = $derived(result.assignments[2] === 0 ? "A" : "B");
  const px = (point: number) => 28 + point * 26;
  function update(next: VisualValues) {
    onupdate({ centerA, centerB, stage, prediction, ...next });
  }
</script>

<VisualFrame
  title="Assign, then move the centers"
  label="K-means experiment"
  prompt="Six points sit on a number line. Before assigning them, predict which center gets the point at 4. Then move each center to its group’s mean."
>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 342 200"
      role="img"
      aria-label={`Points 1, 2, 4, 8, 9, 10. Center A ${fmt(shownCenters[0])}, center B ${fmt(shownCenters[1])}. ${stage ? `A contains ${result.groups[0].join(", ") || "no points"}; B contains ${result.groups[1].join(", ") || "no points"}.` : "Assignments are hidden until you predict."}`}
    >
      <title>One-dimensional k-means assignment and center update</title>
      <line x1="28" x2="314" y1="145" y2="145" stroke="#82958a" />
      {#each [0, 2, 4, 6, 8, 10] as tick (tick)}<text
          x={px(tick)}
          y="166"
          text-anchor="middle"
          font-size="14">{tick}</text
        >{/each}
      {#each clusterPoints as point, i (point)}
        {#if stage > 0}<line
            x1={px(point)}
            x2={px(shownCenters[result.assignments[i]])}
            y1="98"
            y2={result.assignments[i] === 0 ? 52 : 70}
            stroke={result.assignments[i] === 0 ? "#397354" : "#946025"}
            stroke-dasharray="4 4"
          />{/if}
        <circle
          cx={px(point)}
          cy="105"
          r="10"
          fill={stage === 0
            ? "#e4e8de"
            : result.assignments[i] === 0
              ? "#397354"
              : "#946025"}
          stroke="#233c31"
        />
        <text x={px(point)} y="132" text-anchor="middle" font-size="14"
          >{point}</text
        >
        {#if stage > 0}<text
            x={px(point)}
            y="88"
            text-anchor="middle"
            font-size="14">{result.assignments[i] === 0 ? "A" : "B"}</text
          >{/if}
      {/each}
      {#each shownCenters as center, i (i)}
        <rect
          x={px(center) - 8}
          y={i === 0 ? 37 : 55}
          width="16"
          height="16"
          fill={i === 0 ? "#397354" : "#946025"}
        />
        <text x={i === 0 ? 14 : 180} y="21" font-size="14"
          >{i === 0 ? "A (green)" : "B (ochre)"}: {Number(
            center.toFixed(2),
          )}</text
        >
      {/each}
      <text x="171" y="192" text-anchor="middle" font-size="14"
        >Circles: points · squares: centers</text
      >
    </svg>
  </div>
  <div class="visual-controls">
    <label
      >Starting center A: <strong>{fmt(centerA)}</strong><input
        aria-label="Starting center A"
        type="range"
        min="0"
        max="5"
        step="0.5"
        value={centerA}
        oninput={(e) =>
          update({
            centerA: Number(e.currentTarget.value),
            stage: 0,
            prediction: "",
          })}
      /></label
    >
    <label
      >Starting center B: <strong>{fmt(centerB)}</strong><input
        aria-label="Starting center B"
        type="range"
        min="5"
        max="11"
        step="0.5"
        value={centerB}
        oninput={(e) =>
          update({
            centerB: Number(e.currentTarget.value),
            stage: 0,
            prediction: "",
          })}
      /></label
    >
    <label
      >Which center gets point 4?<select
        aria-label="Predict point 4 assignment"
        value={prediction}
        disabled={stage > 0}
        onchange={(e) => update({ prediction: e.currentTarget.value })}
        ><option value="">Choose a prediction</option><option value="A"
          >Center A</option
        ><option value="B">Center B</option></select
      ></label
    >
  </div>
  <p class="visual-note">
    Use the nearest center. If distances tie, choose A. These are made-up
    measurements, not natural categories.
  </p>
  <div class="visual-actions">
    <button
      class="button"
      disabled={!prediction || stage > 0}
      onclick={() => update({ stage: 1 })}>Assign points</button
    >
    <button
      class="button"
      disabled={stage !== 1}
      onclick={() => update({ stage: 2 })}>Move centers to means</button
    >
    <button
      class="button ghost"
      onclick={() =>
        onupdate({ centerA: 2, centerB: 6, stage: 0, prediction: "" })}
      >Reset clustering</button
    >
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    {#if stage === 0}<span>Choose a prediction to reveal the assignments.</span>
    {:else}
      <strong
        >{prediction === answer
          ? "Your prediction matches."
          : `You predicted ${prediction}; the nearest center is ${answer}.`} Point
        4 joins {answer}.</strong
      >
      <span
        >Distance from 4 to A: {fmt(Math.abs(4 - centerA))}; to B: {fmt(
          Math.abs(4 - centerB),
        )}.</span
      >
      {#if stage === 2}<span data-testid="cluster-centers"
          >Updated centers: A = {fmt(result.updated[0])}, B = {fmt(
            result.updated[1],
          )}.</span
        ><span
          >Sum of squared distances: {fmt(result.before)} → {fmt(result.after)}.
          The assignments stay fixed during this center update.</span
        >
      {:else}<span
          >The centers have not moved yet. Next, replace each with the mean of
          its assigned points.</span
        >{/if}
    {/if}
  </div>
  <details>
    <summary>See the mean calculation and next iteration</summary>
    {#if stage === 2}{#each result.groups as group, i (i)}<p>
          Center {i === 0 ? "A" : "B"}: {group.length
            ? `(${group.join(" + ")}) ÷ ${group.length} = ${fmt(result.updated[i])}.`
            : "No assigned points, so this experiment keeps its previous center."}
        </p>{/each}{:else}<p>
        After moving the centers, the calculation for each mean appears here.
      </p>{/if}
    <p>
      A full k-means run repeats assignment and update until a stopping rule is
      met. This lab shows one iteration with two centers and one feature. A
      different start or feature scale can change the groups.
    </p>
  </details>
</VisualFrame>
