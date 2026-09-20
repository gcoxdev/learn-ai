<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import {
    visualBoolean,
    visualChoice,
    visualNumber,
    type VisualValues,
  } from "$lib/visual-state";
  import { changedVideoFrame, videoFrame } from "$lib/system-visuals";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const mode = $derived(
    visualChoice(
      values,
      "mode",
      ["consistent", "identity-change"] as const,
      "identity-change",
    ),
  );
  const frame = $derived(visualNumber(values, "frame", 0, 0, 5, true));
  const revealed = $derived(visualBoolean(values, "revealed"));
  const frames = $derived(
    Array.from({ length: 6 }, (_, index) =>
      videoFrame(index, mode === "identity-change"),
    ),
  );
  const neighbors = $derived(
    [frame - 1, frame, frame + 1].filter((index) => index >= 0 && index < 6),
  );
  function update(patch: VisualValues) {
    onupdate({ mode, frame, revealed, ...patch });
  }
</script>

{#snippet picture(index: number, large = false)}
  {@const item = frames[index]}
  <svg
    viewBox="0 0 132 78"
    role="img"
    aria-label={`Frame ${index + 1}: a ${item.shape} at horizontal position ${item.x}`}
  >
    <path d="M 8 62 H 124" stroke="#9aad92" stroke-width="2" />
    <path
      d="M 14 17 H 118"
      stroke="#e5e9dc"
      stroke-width="1"
      stroke-dasharray="3 4"
    />
    {#if item.shape === "circle"}<circle
        cx={item.x}
        cy="43"
        r={large ? 13 : 12}
        fill="#37714e"
        stroke="#224b32"
        stroke-width="2"
      />
    {:else}<path
        d={`M ${item.x} 28 L ${item.x + 14} 55 L ${item.x - 14} 55 Z`}
        fill="#a66927"
        stroke="#714415"
        stroke-width="2"
      />{/if}
  </svg>
{/snippet}

<VisualFrame
  title="Keep an object itself across time"
  label="Video continuity experiment"
  prompt="A circle travels to the right. In the broken sequence, one frame changes its identity. Inspect neighboring frames and select the odd one."
>
  <p class="visual-note">
    These are six hand-drawn frames, not generated video. A <strong
      >frame</strong
    >
    is one still picture. <strong>Temporal consistency</strong> means related details
    stay coherent as time passes.
  </p>
  <div class="visual-controls">
    <label
      >Sequence
      <select
        value={mode}
        onchange={(event) =>
          update({ mode: event.currentTarget.value, revealed: false })}
        aria-label="Video sequence"
      >
        <option value="identity-change">One identity change</option><option
          value="consistent">Consistent motion</option
        >
      </select>
    </label>
  </div>
  <div class="frame-strip" aria-label="Six frames in time order">
    {#each frames as item (item.index)}
      <button
        class:chosen={item.index === frame}
        aria-pressed={item.index === frame}
        aria-label={`Inspect frame ${item.index + 1}`}
        onclick={() => update({ frame: item.index, revealed: false })}
      >
        <span>Frame {item.index + 1}</span>{@render picture(item.index)}
      </button>
    {/each}
  </div>
  <label class="scrubber"
    >Inspect frame {frame + 1}
    <input
      type="range"
      min="0"
      max="5"
      step="1"
      value={frame}
      aria-label="Selected video frame"
      aria-valuetext={`Frame ${frame + 1}`}
      oninput={(event) =>
        update({ frame: +event.currentTarget.value, revealed: false })}
    />
  </label>
  <div
    class="neighbor-strip"
    aria-label="Selected frame and available neighbors"
  >
    {#each neighbors as index (index)}<div class="neighbor">
        <strong
          >{index === frame ? "Selected" : index < frame ? "Before" : "After"} · {index +
            1}</strong
        >{@render picture(index, true)}
      </div>{/each}
  </div>
  {#if mode === "identity-change"}<div class="visual-actions">
      <button
        class="button primary small"
        onclick={() => update({ revealed: true })}>Check selected frame</button
      >
    </div>{/if}
  <div class="visual-result" role="status">
    {#if mode === "consistent"}<strong
        >All six frames keep the same circle.</strong
      ><span
        >Its position changes by the same amount each time. Motion is expected;
        an unexplained change of object is not.</span
      >
    {:else if revealed && frame === changedVideoFrame}<strong
        >Found it: frame 4 changes the circle into a triangle.</strong
      ><span
        >Frames 3 and 5 still show a circle. The position continues smoothly,
        but the object’s identity does not.</span
      >
    {:else if revealed}<strong>Frame {frame + 1} still shows the circle.</strong
      ><span
        >Compare the shapes in the other frames. Look for one isolated change,
        not the expected movement to the right.</span
      >
    {:else}<span
        >Selected frame {frame + 1}: {frames[frame].shape}. Compare before and
        after, then explain what should stay the same.</span
      >{/if}
  </div>
  <p class="visual-note">
    A realistic video model must coordinate appearance, motion, and interactions
    across many frames. This example isolates just one failure. Checking a frame
    is practice; it does not award mastery.
  </p>
  <div class="visual-actions">
    <button
      class="button secondary small"
      onclick={() =>
        onupdate({ mode: "identity-change", frame: 0, revealed: false })}
      >Reset sequence</button
    >
  </div>
</VisualFrame>

<style>
  .frame-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.55rem;
    margin: 1rem 0;
  }
  .frame-strip button {
    padding: 0.55rem 0.25rem 0.2rem;
    border: 2px solid #b4c2a8;
    border-radius: 0.5rem;
    background: #fffefa;
    min-width: 0;
    color: #284530;
    cursor: pointer;
  }
  .frame-strip .chosen {
    border-color: #305d3b;
    box-shadow: 0 0 0 1px #305d3b;
    background: #e9f0df;
  }
  .frame-strip span {
    font-size: 0.8rem;
    font-weight: 600;
  }
  .scrubber {
    display: block;
    margin: 1.2rem 0;
  }
  .neighbor-strip {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.55rem;
  }
  .neighbor {
    flex: 1 1 90px;
    max-width: 180px;
    min-width: 0;
    border: 1px solid #c9d5bd;
    background: #fffefa;
    padding: 0.65rem 0.25rem 0.2rem;
    border-radius: 0.4rem;
    text-align: center;
  }
  .neighbor strong {
    font-size: 0.75rem;
  }
</style>
