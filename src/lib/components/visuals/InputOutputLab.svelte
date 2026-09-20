<script lang="ts">
  import { visualChoice, type VisualValues } from "$lib/visual-state";
  import VisualFrame from "./VisualFrame.svelte";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const picture = $derived(
    visualChoice(
      values,
      "picture",
      ["red-two", "blue-four"] as const,
      "red-two",
    ),
  );
  const task = $derived(
    visualChoice(values, "task", ["color", "holes"] as const, "color"),
  );
  const color = $derived(picture === "red-two" ? "red" : "blue");
  const holes = $derived(picture === "red-two" ? 2 : 4);
  const answer = $derived(task === "color" ? color : `${holes} holes`);
  function update(change: VisualValues) {
    onupdate({ picture, task, ...change });
  }
</script>

<VisualFrame
  title="Same picture, different question"
  label="Inputs and outputs experiment"
  prompt="Predict the answer before you switch the task. What changes if the picture stays the same?"
>
  <div class="visual-controls">
    <label
      >Picture — the input<select
        value={picture}
        onchange={(event) => update({ picture: event.currentTarget.value })}
      >
        <option value="red-two">Red button, two holes</option><option
          value="blue-four">Blue button, four holes</option
        >
      </select></label
    >
    <label
      >Task — what to find<select
        value={task}
        onchange={(event) => update({ task: event.currentTarget.value })}
      >
        <option value="color">Name the color</option><option value="holes"
          >Count the holes</option
        >
      </select></label
    >
  </div>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 340 300"
      role="img"
      aria-label={`Input: a ${color} button with ${holes} holes. Task: ${task === "color" ? "name the color" : "count the holes"}. Output: ${answer}.`}
    >
      <rect
        x="20"
        y="15"
        width="130"
        height="135"
        rx="12"
        fill="#ecebe4"
        stroke="#c7cebd"
      />
      <circle
        cx="85"
        cy="73"
        r="40"
        fill={color === "red" ? "#bf6250" : "#557b98"}
        stroke="#3f5148"
        stroke-width="2"
      />
      <circle
        cx="85"
        cy="73"
        r="32"
        fill="none"
        stroke="#fffefa"
        stroke-opacity=".6"
      />
      {#each Array.from({ length: holes }, (_, i) => i) as hole (hole)}
        <circle
          cx={holes === 2 ? 77 + hole * 16 : 77 + (hole % 2) * 16}
          cy={holes === 2 ? 73 : 65 + Math.floor(hole / 2) * 16}
          r="4"
          fill="#fffefa"
          stroke="#3f5148"
        />
      {/each}
      <text x="85" y="132" text-anchor="middle" font-size="15"
        >Input picture</text
      >
      <path
        d="M155 82H185l-7 -5m7 5 -7 5"
        fill="none"
        stroke="#567252"
        stroke-width="2"
      />
      <rect
        x="193"
        y="39"
        width="127"
        height="85"
        rx="10"
        fill="#e5ebdc"
        stroke="#789471"
      />
      <text x="256" y="64" text-anchor="middle" font-size="14"
        >Hand-written rule</text
      >
      <text x="256" y="91" text-anchor="middle" font-size="16" font-weight="600"
        >{task === "color" ? "Read color" : "Count holes"}</text
      >
      <path
        d="M257 134V180H172v13m0 0 -5 -7m5 7 5 -7"
        fill="none"
        stroke="#567252"
        stroke-width="2"
      />
      <rect
        x="65"
        y="201"
        width="210"
        height="80"
        rx="12"
        fill="#f3e9d2"
        stroke="#b6975c"
      />
      <text x="170" y="226" text-anchor="middle" font-size="14"
        >Output — the answer</text
      >
      <text
        x="170"
        y="256"
        text-anchor="middle"
        font-size="24"
        font-weight="600">{answer}</text
      >
    </svg>
  </div>
  <div class="visual-result" aria-live="polite">
    <strong data-testid="input-output-result">The output is “{answer}”.</strong
    ><span
      >The input picture is {color} with {holes} holes. The task decides which feature
      the rule reads.</span
    >
  </div>
  <p class="visual-note">
    This drawing stands in for a photo. This experiment uses a rule written by a
    person; nothing learns from examples here. A model is a reusable rule. A
    learned model can have the same input → answer shape, but its rule is fitted
    to examples during training.
  </p>
  <div class="visual-actions">
    <button
      class="button secondary"
      onclick={() => onupdate({ picture: "red-two", task: "color" })}
      >Reset experiment</button
    >
  </div>
</VisualFrame>
