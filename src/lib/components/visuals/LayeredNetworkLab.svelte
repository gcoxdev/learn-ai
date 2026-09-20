<script lang="ts">
  import {
    layeredControls,
    layeredDefaults,
    layeredNetworkTrace,
    layeredNumber as number,
    type LayeredEdge,
    type LayeredUnitId,
  } from "$lib/layered-network";
  import type { VisualValues } from "$lib/visual-state";
  import VisualFrame from "./VisualFrame.svelte";

  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();

  const controls = $derived(layeredControls(values));
  const trace = $derived(
    layeredNetworkTrace(controls.x1, controls.x2, controls.weight),
  );
  const selected = $derived(trace.byId[controls.unit]);
  const revealed = $derived(selected.layer <= controls.step);
  const layers = ["Input", "Hidden 1", "Hidden 2", "Output"];
  const stages = [
    "Inputs ready",
    "Hidden 1 calculated",
    "Hidden 2 calculated",
    "Output calculated",
  ];
  const firstInLayer: LayeredUnitId[] = ["x1", "a", "d", "y"];
  const positions: Record<LayeredUnitId, { x: number; y: number }> = {
    x1: { x: 60, y: 175 },
    x2: { x: 60, y: 285 },
    a: { x: 260, y: 120 },
    b: { x: 260, y: 230 },
    c: { x: 260, y: 340 },
    d: { x: 460, y: 175 },
    e: { x: 460, y: 285 },
    y: { x: 660, y: 230 },
  };

  function update(change: VisualValues) {
    onupdate({ ...controls, ...change });
  }

  function showLayer(step: number) {
    update({ step, unit: firstInLayer[step] });
  }

  function edgePath(edge: LayeredEdge) {
    const start = positions[edge.source],
      end = positions[edge.target];
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const dx = ((end.x - start.x) / distance) * 35;
    const dy = ((end.y - start.y) / distance) * 35;
    return `M ${start.x + dx} ${start.y + dy} L ${end.x - dx} ${end.y - dy}`;
  }

  function selectWithKey(event: KeyboardEvent, unit: LayeredUnitId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      update({ unit });
    }
  }
</script>

<VisualFrame
  title="See the layers of a neural network"
  label="Layered neural network experiment"
  prompt="Two inputs travel through two hidden layers to one output. Predict what one circle does, then calculate a layer and inspect its numbers."
>
  <p class="visual-note fixture-note">
    This tiny <strong>2 → 3 → 2 → 1</strong> network uses hand-chosen weights and
    biases. It has not been trained, and its output is just a number, not a probability
    or a real-world prediction.
  </p>

  <div class="visual-controls input-controls">
    <label>
      Input X1: <strong>{number(controls.x1)}</strong>
      <input
        type="range"
        min="-2"
        max="3"
        step="0.5"
        value={controls.x1}
        aria-label="Layered network input X1"
        oninput={(event) => update({ x1: Number(event.currentTarget.value) })}
      />
    </label>
    <label>
      Input X2: <strong>{number(controls.x2)}</strong>
      <input
        type="range"
        min="-2"
        max="3"
        step="0.5"
        value={controls.x2}
        aria-label="Layered network input X2"
        oninput={(event) => update({ x2: Number(event.currentTarget.value) })}
      />
    </label>
  </div>

  <div class="diagram-shell">
    <p class="diagram-direction">Information flows from left to right →</p>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (The scroll viewport needs keyboard focus so arrow keys can reveal every layer.) -->
    <div
      class="diagram-scroll"
      role="region"
      aria-label="Network diagram; scroll horizontally to view all four layers"
      tabindex="0"
      data-testid="layered-network-scroll"
    >
      <svg
        viewBox="0 0 720 395"
        role="group"
        aria-label={`Neural network with 2 inputs, 3 units in hidden layer 1, 2 units in hidden layer 2, and 1 output. ${stages[controls.step]}. Select a circle or use Inspect a unit below.`}
      >
        <g aria-hidden="true">
          <rect
            x="202"
            y="78"
            width="116"
            height="303"
            rx="18"
            class="layer-backdrop"
          />
          <rect
            x="402"
            y="78"
            width="116"
            height="303"
            rx="18"
            class="layer-backdrop"
          />
          {#each layers as layer, index (layer)}
            <text
              x={60 + index * 200}
              y="29"
              text-anchor="middle"
              class="layer-name">{layer}</text
            >
            <text
              x={60 + index * 200}
              y="51"
              text-anchor="middle"
              class="layer-size"
              >{[
                "2 values",
                "3 units · ReLU",
                "2 units · ReLU",
                "1 value · linear",
              ][index]}</text
            >
          {/each}
          {#each trace.edges as edge (edge.id)}
            <path
              d={edgePath(edge)}
              stroke={edge.weight > 0
                ? "#3e755b"
                : edge.weight < 0
                  ? "#9b643e"
                  : "#788274"}
              stroke-width={1.25 + Math.abs(edge.weight) * 2}
              stroke-dasharray={edge.weight < 0
                ? "8 5"
                : edge.weight === 0
                  ? "2 5"
                  : undefined}
              opacity={selected.activation === "input"
                ? 0.65
                : edge.target === selected.id
                  ? 1
                  : 0.2}
              fill="none"
              data-edge={edge.id}
              data-weight={edge.weight}
              data-emphasized={edge.target === selected.id}
            />
          {/each}
        </g>
        {#each trace.units as unit (unit.id)}
          <g
            class="network-unit"
            role="button"
            tabindex="0"
            aria-pressed={unit.id === selected.id}
            aria-label={`Inspect ${unit.label}, ${layers[unit.layer]}, ${unit.layer <= controls.step ? `value ${number(unit.value)}` : "not calculated yet"}`}
            onclick={() => update({ unit: unit.id })}
            onkeydown={(event) => selectWithKey(event, unit.id)}
            data-unit={unit.id}
          >
            <circle
              cx={positions[unit.id].x}
              cy={positions[unit.id].y}
              r="34"
              fill={unit.layer > controls.step
                ? "#f5f4ee"
                : unit.layer === 0 || unit.layer === 3
                  ? "#f3e6c9"
                  : "#e4eddb"}
              stroke={unit.id === selected.id ? "#284e39" : "#8c9a80"}
              stroke-width={unit.id === selected.id ? 3 : 1.5}
            />
            <text
              x={positions[unit.id].x}
              y={positions[unit.id].y - 8}
              text-anchor="middle"
              class="unit-name"
              aria-hidden="true">{unit.label}</text
            >
            <text
              x={positions[unit.id].x}
              y={positions[unit.id].y + 16}
              text-anchor="middle"
              class="unit-value"
              style:font-size={number(unit.value).length > 5 ? "14px" : "19px"}
              aria-hidden="true"
              >{unit.layer <= controls.step ? number(unit.value) : "?"}</text
            >
          </g>
        {/each}
      </svg>
    </div>
    <p class="scroll-hint">
      On a narrow screen, swipe sideways or focus the diagram and use the arrow
      keys. You can also choose any circle below.
    </p>
  </div>

  <div class="visual-legend network-legend">
    <span><i class="line-key positive"></i>Positive weight: solid</span>
    <span><i class="line-key negative"></i>Negative weight: dashed</span>
    <span><i class="line-key zero"></i>Zero weight: dotted</span>
    <span>Thicker line = larger weight magnitude</span>
  </div>
  <p class="visual-note">
    The outlined circle is selected. Selecting a hidden or output unit
    emphasizes its incoming connections. A ? means that layer has not been
    calculated yet.
  </p>

  <div class="visual-controls">
    <label>
      Calculation stage
      <select
        value={controls.step}
        onchange={(event) => showLayer(Number(event.currentTarget.value))}
      >
        {#each stages as stage, index (stage)}
          <option value={index}>{index}. {stage}</option>
        {/each}
      </select>
    </label>
    <label>
      Inspect a unit
      <select
        value={controls.unit}
        onchange={(event) => update({ unit: event.currentTarget.value })}
      >
        {#each trace.units as unit (unit.id)}
          <option value={unit.id}>{unit.label} — {layers[unit.layer]}</option>
        {/each}
      </select>
    </label>
  </div>

  <div class="visual-actions">
    <button
      class="button secondary"
      disabled={controls.step === 0}
      onclick={() => showLayer(controls.step - 1)}>Previous layer</button
    >
    <button
      class="button"
      disabled={controls.step === 3}
      onclick={() => showLayer(controls.step + 1)}>Next layer</button
    >
    <button
      class="button secondary"
      onclick={() => onupdate({ ...layeredDefaults })}>Reset network</button
    >
  </div>

  <div
    class="visual-result"
    aria-live="polite"
    data-testid="layered-network-stage"
  >
    <strong>Stage {controls.step} of 3: {stages[controls.step]}</strong>
    {#if controls.step === 0}
      <span
        >X1 = {number(controls.x1)} and X2 = {number(controls.x2)}. Inputs are
        numbers you supply; they are not calculated by this network.</span
      >
    {:else}
      <span
        >{layers[controls.step]} values: {trace.units
          .filter((unit) => unit.layer === controls.step)
          .map((unit) => `${unit.label} = ${number(unit.value)}`)
          .join(", ")}.</span
      >
      {#if controls.step === 3}<span data-testid="layered-network-output"
          >Output Y = {number(trace.output)}</span
        >{/if}
    {/if}
    <span>Revealed layers recalculate when you change an input or weight.</span>
  </div>

  <section
    class="unit-inspector"
    aria-label="Selected unit calculation"
    data-testid="layered-network-inspector"
  >
    <h4>{selected.label} · {layers[selected.layer]}</h4>
    {#if selected.activation === "input"}
      <p>
        This input circle holds <strong>{number(selected.value)}</strong>. Each
        outgoing connection multiplies this number by its own weight before
        passing it to the next layer. Input circles have no bias or activation
        here.
      </p>
    {:else}
      <p>
        Multiply each incoming value by its connection’s weight, add the
        contributions and this unit’s bias, then apply its activation rule.
      </p>
      {#if !revealed}<p class="pending-note">
          This unit has not been calculated yet. Use Next layer or Calculation
          stage to reveal {layers[selected.layer]}.
        </p>{/if}
      <table>
        <caption>Incoming connections for {selected.label}</caption>
        <thead
          ><tr
            ><th scope="col">From / value</th><th scope="col">Weight</th><th
              scope="col">Contribution</th
            ></tr
          ></thead
        >
        <tbody>
          {#each selected.incoming as edge (edge.id)}
            <tr>
              <th scope="row"
                >{trace.byId[edge.source].label}: {trace.byId[edge.source]
                  .layer <= controls.step
                  ? number(edge.input)
                  : "?"}</th
              >
              <td>× {number(edge.weight)}</td>
              <td>{revealed ? number(edge.contribution) : "?"}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p class="unit-bias">
        Bias: <strong>{number(selected.bias)}</strong> (added once to this unit’s
        total).
      </p>
      {#if revealed}
        <p class="unit-equation">
          Weighted sum + bias: {selected.incoming
            .map((edge) =>
              edge.contribution < 0
                ? `(${number(edge.contribution)})`
                : number(edge.contribution),
            )
            .join(" + ")} + ({number(selected.bias)}) =
          <strong>{number(selected.sum)}</strong>.
        </p>
        {#if selected.activation === "relu"}
          <p data-testid="layered-network-activation">
            <strong
              >ReLU: {number(selected.sum)} → {number(selected.value)}.</strong
            >
            {selected.sum < 0
              ? "The negative sum becomes zero."
              : "The sum is zero or positive, so it stays the same."}
          </p>
        {:else}
          <p data-testid="layered-network-activation">
            <strong>Linear output: Y = {number(selected.value)}.</strong> This output
            keeps the sum, even if it is negative; it does not use ReLU.
          </p>
        {/if}
      {:else}
        <p>
          Activation: {selected.activation === "relu"
            ? "ReLU (keep positive numbers; turn negative numbers into zero)"
            : "linear (keep the sum unchanged)"}.
        </p>
      {/if}
    {/if}
  </section>

  <details class="weight-experiment">
    <summary>Try changing one connection weight</summary>
    <p>
      X1 → A is the editable connection. Changing it can affect A and later
      layers; the other weights and every bias stay fixed. This is a manual
      change, not training.
    </p>
    <label>
      Weight from X1 to A: <strong>{number(controls.weight)}</strong>
      <input
        type="range"
        min="-2"
        max="2"
        step="0.25"
        value={controls.weight}
        aria-label="Weight from X1 to A"
        oninput={(event) =>
          update({ weight: Number(event.currentTarget.value), unit: "a" })}
      />
    </label>
    <p>
      The starting weight is 1. Set it to 0 to remove X1’s contribution to A, or
      below 0 to reverse its sign.
    </p>
  </details>

  <details>
    <summary>What do the circles and connections mean?</summary>
    <dl class="network-definitions">
      <div>
        <dt>Node / unit</dt>
        <dd>
          A circle holding one numerical value. In a hidden or output layer, a
          small calculation produces it.
        </dd>
      </div>
      <div>
        <dt>Edge / weight</dt>
        <dd>
          A connection carries a value to the next layer. Its weight multiplies
          that value. A negative weight reverses its sign; it does not mean
          “bad.”
        </dd>
      </div>
      <div>
        <dt>Bias</dt>
        <dd>
          A number added to a unit’s weighted sum, even when all incoming values
          are zero.
        </dd>
      </div>
      <div>
        <dt>Activation / ReLU</dt>
        <dd>
          An activation is a rule applied after the sum. Here the hidden layers
          use ReLU: keep zero and positive values; replace negative values with
          zero.
        </dd>
      </div>
      <div>
        <dt>Input / output</dt>
        <dd>
          Inputs are the numbers supplied to the network. The output is the
          number it calculates at the end.
        </dd>
      </div>
      <div>
        <dt>Hidden layer</dt>
        <dd>
          A group of units between input and output. “Hidden” describes its
          position, not secret arithmetic.
        </dd>
      </div>
    </dl>
  </details>
  <p class="visual-note">
    This is a common diagram of a fully connected feedforward network: each unit
    connects to every unit in the next layer, and values travel forward. It is a
    map of calculations, not a physical brain. Many AI systems use other
    architectures. Displayed numbers are rounded to four decimal places if
    needed.
  </p>
</VisualFrame>

<style>
  .fixture-note {
    margin-bottom: 1rem;
  }
  .diagram-shell {
    min-width: 0;
    overflow: hidden;
    background: #fffefa;
    border: 1px solid #dce2d6;
    border-radius: 10px;
  }
  .diagram-direction {
    margin: 0;
    padding: 0.85rem 1rem 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: #38523e;
  }
  .diagram-scroll {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    padding: 0.25rem 0;
  }
  .diagram-scroll svg {
    width: 100%;
    min-width: 720px;
    overflow: hidden;
  }
  .scroll-hint {
    margin: 0;
    padding: 0.5rem 1rem 0.85rem;
    color: #4e5c48;
    font-size: 0.75rem;
    line-height: 1.6;
    border-top: 1px solid #e5e8df;
  }
  .layer-backdrop {
    fill: #f4f6ed;
  }
  .layer-name {
    font-size: 18px;
    font-weight: 600;
  }
  .layer-size {
    font-size: 12px;
  }
  .unit-name {
    font-size: 14px;
    font-weight: 600;
  }
  .unit-value {
    font-size: 19px;
    font-weight: 650;
  }
  .network-unit {
    cursor: pointer;
    touch-action: manipulation;
  }
  .network-unit:focus-visible {
    outline: none;
  }
  .network-unit:focus-visible circle {
    stroke: #775229;
    stroke-width: 5;
  }
  .network-legend {
    margin-top: 0.8rem;
  }
  .network-legend span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .line-key {
    display: inline-block;
    width: 23px;
    border-top: 3px solid #3e755b;
  }
  .line-key.negative {
    border-top-style: dashed;
    border-color: #9b643e;
  }
  .line-key.zero {
    border-top-style: dotted;
    border-color: #788274;
  }
  .unit-inspector {
    min-width: 0;
    background: #fffefa;
    border: 1px solid #dce2d6;
    border-radius: 10px;
    padding: 1rem;
    color: #2d4332;
    font-size: 0.85rem;
    line-height: 1.7;
  }
  .unit-inspector h4 {
    margin: 0;
    font-size: 1rem;
  }
  .unit-inspector p {
    margin: 0.7rem 0;
  }
  .unit-inspector p:last-child {
    margin-bottom: 0;
  }
  .pending-note {
    border-left: 3px solid #a47b43;
    padding-left: 0.65rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 0.82rem;
  }
  caption {
    text-align: left;
    font-weight: 600;
    padding: 0.5rem 0;
  }
  th,
  td {
    text-align: left;
    padding: 0.45rem 0.25rem;
    border-bottom: 1px solid #e3e8db;
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }
  th {
    font-weight: 600;
  }
  .unit-bias {
    color: #655034;
  }
  .unit-equation {
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }
  .network-definitions {
    margin: 0.5rem 0;
  }
  .network-definitions div {
    margin: 0.65rem 0;
  }
  .network-definitions dt {
    font-weight: 600;
  }
  .network-definitions dd {
    margin: 0.1rem 0 0;
  }
  @media (max-width: 520px) {
    .unit-inspector {
      padding: 0.8rem;
    }
    table {
      font-size: 0.74rem;
    }
    .input-controls {
      gap: 0.7rem;
    }
  }
</style>
