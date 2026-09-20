<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import {
    visualChoice,
    visualNumber,
    type VisualValues,
  } from "$lib/visual-state";
  import { robotStep, visualDecimal as number } from "$lib/system-visuals";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const position = $derived(visualNumber(values, "position", 0, -6, 6));
  const target = $derived(visualNumber(values, "target", 2, -3, 3));
  const gain = $derived(visualNumber(values, "gain", 0.5, 0, 1.5));
  const mode = $derived(
    visualChoice(values, "mode", ["fresh", "delayed"] as const, "fresh"),
  );
  // With commands limited to one unit, the previous true position can be at most one unit away.
  const previous = $derived(
    Math.max(
      position - 1,
      Math.min(position + 1, visualNumber(values, "previous", 0, -6, 6)),
    ),
  );
  const steps = $derived(visualNumber(values, "steps", 0, 0, 30, true));
  const observed = $derived(mode === "fresh" ? position : previous);
  const proposal = $derived(robotStep(position, observed, target, gain));
  function x(value: number) {
    return 20 + ((value + 6) * 280) / 12;
  }
  function update(patch: VisualValues) {
    onupdate({ position, previous, target, gain, mode, steps, ...patch });
  }
  function advance() {
    if (steps < 30)
      update({ position: proposal.next, previous: position, steps: steps + 1 });
  }
  const defaults = {
    position: 0,
    previous: 0,
    target: 2,
    gain: 0.5,
    mode: "fresh",
    steps: 0,
  };
</script>

<VisualFrame
  title="One observation, one small move"
  label="Robot feedback experiment"
  prompt="Predict the next position before applying a command. Then try a delayed measurement: does the controller still see where the robot is now?"
>
  <p class="visual-note">
    A <strong>controller</strong> is a rule that chooses a movement. Our robot moves
    on a numbered line. Its command uses the observed position; the simulation separately
    tracks its true position.
  </p>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 320 156"
      role="img"
      aria-label={`Robot at ${number(position)}, sensor observes ${number(observed)}, target ${number(target)}, proposed next position ${number(proposal.next)}`}
    >
      <path d="M20 90 H300" stroke="#72876d" stroke-width="3" />
      {#each [-6, -3, 0, 3, 6] as tick (tick)}<path
          d={`M${x(tick)} 85 V97`}
          stroke="#72876d"
        /><text x={x(tick)} y="115" text-anchor="middle" font-size="15"
          >{tick}</text
        >{/each}
      <path
        d={`M${x(target)} 30 V83 M${x(target)} 30 l16 7 l-16 7`}
        stroke="#94672d"
        stroke-width="2.5"
        fill="#d3ad66"
      />
      <text x="20" y="18" font-size="15">Flag = target</text>
      <circle
        cx={x(observed)}
        cy="135"
        r="5"
        fill="none"
        stroke="#666a93"
        stroke-width="2"
      />
      <path
        d={`M${x(observed)} 99 V128`}
        stroke="#666a93"
        stroke-dasharray="3 3"
      />
      <circle
        cx={x(proposal.next)}
        cy="73"
        r="10"
        fill="none"
        stroke="#62867c"
        stroke-width="2"
        stroke-dasharray="3 3"
      />
      <rect
        x={x(position) - 11}
        y="62"
        width="22"
        height="20"
        rx="4"
        fill="#386849"
        stroke="#22442f"
        stroke-width="2"
      />
      <circle cx={x(position) - 7} cy="84" r="4" fill="#253b2b" /><circle
        cx={x(position) + 7}
        cy="84"
        r="4"
        fill="#253b2b"
      />
    </svg>
    <div class="visual-legend">
      <span>Solid robot = true position</span><span
        >Dotted circle = next position</span
      ><span>Lower ring = observation</span>
    </div>
  </div>
  <div class="visual-controls">
    <label
      ><strong>Target: {number(target)}</strong><input
        type="range"
        min="-3"
        max="3"
        step="0.5"
        value={target}
        aria-label="Robot target"
        oninput={(event) => update({ target: +event.currentTarget.value })}
      /></label
    >
    <label
      ><strong>Gain: {number(gain)}</strong><input
        type="range"
        min="0"
        max="1.5"
        step="0.1"
        value={gain}
        aria-label="Controller gain"
        oninput={(event) => update({ gain: +event.currentTarget.value })}
      /></label
    >
    <label
      >Sensor observation<select
        value={mode}
        aria-label="Robot sensor"
        onchange={(event) => update({ mode: event.currentTarget.value })}
        ><option value="fresh">Fresh: current position</option><option
          value="delayed">Delayed: previous position</option
        ></select
      ></label
    >
  </div>
  <p class="visual-note">
    <strong>Gain</strong> sets how much of the observed error becomes a raw
    command. The command is then <strong>clipped</strong>, or limited, to −1
    through +1. Higher gain can overshoot; zero gain makes no move.
  </p>
  <div class="visual-result" role="status">
    <strong
      >True position {number(position)} · observed {number(observed)} · target {number(
        target,
      )}</strong
    >
    <span
      >Error: {number(target)} − ({number(observed)}) = {number(
        proposal.error,
      )}</span
    >
    <span
      >Raw command: {number(gain)} × {number(proposal.error)} = {number(
        proposal.rawCommand,
      )}; clipped command: {number(proposal.command)}</span
    >
    <strong
      >Proposed next position: {number(position)} + ({number(proposal.command)})
      = {number(proposal.next)}</strong
    >
    <span
      >{steps} commands applied.{proposal.error === 0
        ? " The observed error is zero, so the command is zero."
        : ""}</span
    >
  </div>
  <div class="visual-actions">
    <button
      class="button primary small"
      onclick={advance}
      disabled={steps >= 30}>Apply one command</button
    >
    <button
      class="button secondary small"
      onclick={() => onupdate({ ...defaults })}>Reset robot</button
    >
    <button
      class="button secondary small"
      onclick={() =>
        onupdate({ ...defaults, position: 1, previous: 0, mode: "delayed" })}
      >Try delayed example</button
    >
  </div>
  {#if steps >= 30}<p class="visual-note">
      Thirty steps reached. Reset to try a new trace.
    </p>{/if}
  <details>
    <summary>Compare with the project trace</summary>
    <p>
      At the default gain 0.5, target 2, and fresh observations, the true
      positions are 0 → 1 → 1.5 → 1.75. Each fresh observation updates the error
      before the next move.
    </p>
    <p>
      The delayed preset starts at true position 1 with an old observation of 0.
      It proposes a move of 1 to reach 2. A fresh observation of 1 would instead
      propose a move of 0.5 to reach 1.5. One lucky delayed result does not make
      delay useful in general.
    </p>
  </details>
  <p class="visual-note">
    This explicit rule is not a learned AI policy. A robot may use learned
    perception or policies around a control loop. Our toy assumes instant
    movement with no obstacles or unmodeled forces. It is practice, not hardware
    control or mastery evidence. Numbers shown are rounded to three decimal
    places; steps use full precision.
  </p>
</VisualFrame>
