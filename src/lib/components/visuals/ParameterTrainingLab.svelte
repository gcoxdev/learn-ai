<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { lineFit, parameterTrajectory } from "$lib/math-visuals";
  import { fmt } from "$lib/simulations";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const initialWeight = $derived(
    visualNumber(values, "initialWeight", 0, -2, 4),
  );
  const initialBias = $derived(visualNumber(values, "initialBias", 0, -3, 3));
  const rate = $derived(visualNumber(values, "rate", 0.1, 0, 0.3));
  const steps = $derived(visualNumber(values, "steps", 0, 0, 16, true));
  const rows = $derived(
    parameterTrajectory(initialWeight, initialBias, rate, steps),
  );
  const current = $derived(rows[rows.length - 1]);
  const previous = $derived(
    rows.length > 1 ? rows[rows.length - 2] : undefined,
  );
  const bounds = $derived({
    minW: Math.min(-2, ...rows.map((row) => row.weight - 0.5)),
    maxW: Math.max(4, ...rows.map((row) => row.weight + 0.5)),
    minB: Math.min(-3, ...rows.map((row) => row.bias - 0.5)),
    maxB: Math.max(4, ...rows.map((row) => row.bias + 0.5)),
  });
  const px = (weight: number) =>
    45 + (277 * (weight - bounds.minW)) / (bounds.maxW - bounds.minW);
  const py = (bias: number) =>
    244 - (215 * (bias - bounds.minB)) / (bounds.maxB - bounds.minB);
  const maximumLoss = $derived(
    Math.max(
      lineFit(bounds.minW, bounds.minB).loss,
      lineFit(bounds.minW, bounds.maxB).loss,
      lineFit(bounds.maxW, bounds.minB).loss,
      lineFit(bounds.maxW, bounds.maxB).loss,
    ),
  );
  const cells = $derived(
    Array.from({ length: 25 * 25 }, (_, index) => {
      const column = index % 25;
      const row = Math.floor(index / 25);
      const weight =
        bounds.minW + ((column + 0.5) / 25) * (bounds.maxW - bounds.minW);
      const bias =
        bounds.maxB - ((row + 0.5) / 25) * (bounds.maxB - bounds.minB);
      const fraction =
        Math.log1p(lineFit(weight, bias).loss) / Math.log1p(maximumLoss);
      const color = [238, 244, 229].map((light, i) =>
        Math.round(light + ([45, 80, 53][i] - light) * fraction),
      );
      return {
        id: index,
        x: 45 + (column * 277) / 25,
        y: 29 + (row * 215) / 25,
        fill: `rgb(${color.join(",")})`,
      };
    }),
  );
  const path = $derived(
    rows.map((row) => `${px(row.weight)},${py(row.bias)}`).join(" "),
  );
  function update(
    next: Partial<{
      initialWeight: number;
      initialBias: number;
      rate: number;
      steps: number;
    }>,
  ) {
    onupdate({ initialWeight, initialBias, rate, steps, ...next });
  }
</script>

<VisualFrame
  title="Train a weight and a bias together"
  label="Two parameter training experiment"
  prompt="The examples are (0, 1), (1, 3), and (2, 5): each pair is an input and its target. Our prediction is weight × input + bias. Before taking a step, use the gradient signs to predict which way each parameter will move."
>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 350 292"
      role="img"
      aria-label={`Two-dimensional mean squared error map. Horizontal axis is weight; vertical axis is bias. Current weight ${fmt(current.weight)}, bias ${fmt(current.bias)}, loss ${fmt(current.loss)}. The zero-loss solution is weight 2, bias 1.`}
    >
      <title>The full loss surface for two trainable parameters</title>
      {#each cells as cell (cell.id)}<rect
          x={cell.x}
          y={cell.y}
          width={277 / 25 + 0.15}
          height={215 / 25 + 0.15}
          fill={cell.fill}
        />{/each}
      <rect
        x="45"
        y="29"
        width="277"
        height="215"
        fill="none"
        stroke="#879784"
      />
      <polyline points={path} fill="none" stroke="#fffefa" stroke-width="5" />
      <polyline points={path} fill="none" stroke="#a05b27" stroke-width="2" />
      {#each rows as row (row.step)}<circle
          cx={px(row.weight)}
          cy={py(row.bias)}
          r="2.5"
          fill="#914e20"
        />{/each}
      <path
        d={`M ${px(initialWeight)} ${py(initialBias) - 6} l -5 9 h 10 Z`}
        fill="#a05b27"
        stroke="#fffefa"
        stroke-width="1"
      />
      <path
        d={`M ${px(2) - 6} ${py(1)} h 12 M ${px(2)} ${py(1) - 6} v 12`}
        stroke="#233d30"
        stroke-width="2.5"
      />
      <circle
        cx={px(current.weight)}
        cy={py(current.bias)}
        r="6"
        fill="#fffefa"
        stroke="#233d30"
        stroke-width="2"
      />
      <text x="45" y="264" font-size="16">{fmt(bounds.minW)}</text><text
        x="322"
        y="264"
        text-anchor="end"
        font-size="16">{fmt(bounds.maxW)}</text
      >
      <text x="37" y="34" font-size="16" text-anchor="end"
        >{fmt(bounds.maxB)}</text
      ><text x="37" y="246" font-size="16" text-anchor="end"
        >{fmt(bounds.minB)}</text
      >
      <text x="45" y="17" font-size="16">Bias b ↑</text><text
        x="184"
        y="285"
        text-anchor="middle"
        font-size="16">Weight w →</text
      >
    </svg>
    <div class="visual-legend">
      <span>▲ Start</span><span>○ Current</span><span
        >+ Zero loss at (2, 1)</span
      >
    </div>
    <p class="visual-note map-note">
      Each color tile evaluates both a weight and a bias. Lighter means lower
      loss; darker means higher loss. Colors use a logarithmic scale. The axes
      expand to keep every step visible.
    </p>
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    <strong
      >Step {steps}: weight {fmt(current.weight)}, bias {fmt(
        current.bias,
      )}</strong
    >
    <span
      >Mean squared error: <strong data-testid="parameter-loss"
        >{fmt(current.loss)}</strong
      ></span
    >
    <span
      >Weight derivative: {fmt(current.weightGradient)}. Bias derivative: {fmt(
        current.biasGradient,
      )}.</span
    >
    <span
      >{rate === 0
        ? "A zero learning rate leaves both parameters in place."
        : current.loss < 1e-12
          ? "These parameters match every example. Both gradients are zero here."
          : `The next update subtracts ${fmt(rate)} times each derivative from its parameter.`}</span
    >
  </div>
  <div class="visual-controls">
    <label
      >Starting weight: <strong>{fmt(initialWeight)}</strong><input
        aria-label="Starting training weight"
        type="range"
        min="-2"
        max="4"
        step="0.1"
        value={initialWeight}
        oninput={(event) =>
          update({
            initialWeight: Number(event.currentTarget.value),
            steps: 0,
          })}
      /></label
    >
    <label
      >Starting bias: <strong>{fmt(initialBias)}</strong><input
        aria-label="Starting training bias"
        type="range"
        min="-3"
        max="3"
        step="0.1"
        value={initialBias}
        oninput={(event) =>
          update({ initialBias: Number(event.currentTarget.value), steps: 0 })}
      /></label
    >
    <label
      >Learning rate: <strong>{fmt(rate)}</strong><input
        aria-label="Two parameter learning rate"
        type="range"
        min="0"
        max="0.3"
        step="0.01"
        value={rate}
        oninput={(event) =>
          update({ rate: Number(event.currentTarget.value), steps: 0 })}
      /></label
    >
  </div>
  <div class="visual-actions">
    <button
      class="button primary"
      disabled={steps >= 16}
      onclick={() => update({ steps: steps + 1 })}
      >Update both parameters</button
    >
    <button class="button ghost" onclick={() => update({ steps: 0 })}
      >Restart this run</button
    >
    <button
      class="button ghost"
      onclick={() =>
        onupdate({ initialWeight: 0, initialBias: 0, rate: 0.1, steps: 0 })}
      >Reset experiment</button
    >
  </div>
  <details>
    <summary>See the partial derivatives and exact updates</summary>
    <p>
      A <strong>partial derivative</strong> measures how the loss changes when
      we vary one parameter and hold the other still. The
      <strong>gradient</strong> contains both partial derivatives. We calculate them
      at the same current weight and bias, then update both together.
    </p>
    <p>
      For each example: prediction p = wx + b; error e = p − target.<br />Mean
      squared error L = (e₁² + e₂² + e₃²) / 3.<br />Weight derivative ∂L/∂w =
      (2/3) × (e₁x₁ + e₂x₂ + e₃x₃).<br />Bias derivative ∂L/∂b = (2/3) × (e₁ +
      e₂ + e₃).
    </p>
    <p>
      The curled ∂ symbol marks a partial derivative. Multiplying by x appears
      only in the weight derivative because ∂p/∂w = x, while ∂p/∂b = 1.
    </p>
    <table>
      <caption>Current predictions and errors</caption><thead
        ><tr
          ><th scope="col">Input</th><th scope="col">Target</th><th scope="col"
            >Prediction</th
          ><th scope="col">Error</th></tr
        ></thead
      ><tbody>
        {#each current.rows as row (row.x)}<tr
            ><th scope="row">{row.x}</th><td>{row.target}</td><td
              >{fmt(row.prediction)}</td
            ><td>{fmt(row.residual)}</td></tr
          >{/each}
      </tbody>
    </table>
    <p>
      Next weight = {fmt(current.weight)} − {fmt(rate)} × ({fmt(
        current.weightGradient,
      )}) = {fmt(current.weight - rate * current.weightGradient)}.<br />Next
      bias = {fmt(current.bias)} − {fmt(rate)} × ({fmt(current.biasGradient)}) = {fmt(
        current.bias - rate * current.biasGradient,
      )}.
    </p>
    {#if previous}<p>
        Last update used the gradients at weight {fmt(previous.weight)} and bias {fmt(
          previous.bias,
        )}. Loss moved from {fmt(previous.loss)} to {fmt(current.loss)}.
      </p>{/if}
    <div class="history-table">
      <table>
        <caption>Parameters and loss after each simultaneous update</caption
        ><thead
          ><tr
            ><th scope="col">Step</th><th scope="col">Weight</th><th scope="col"
              >Bias</th
            ><th scope="col">Loss</th></tr
          ></thead
        ><tbody>
          {#each rows as row (row.step)}<tr
              ><th scope="row">{row.step}</th><td>{fmt(row.weight)}</td><td
                >{fmt(row.bias)}</td
              ><td>{fmt(row.loss)}</td></tr
            >{/each}
        </tbody>
      </table>
    </div>
  </details>
  <p class="visual-note">
    Displayed numbers are rounded to six decimal places; calculations use full
    precision. This map shows the full two-parameter loss, not a slice with one
    parameter fixed. Its bowl has a unique zero-loss solution. Real neural
    networks have many more parameters and more complicated landscapes. Each
    click pauses; at most 16 updates are shown.
  </p>
</VisualFrame>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
  }
  th,
  td {
    text-align: right;
    padding: 0.5rem 0.2rem;
    border-bottom: 1px solid #d7dece;
    overflow-wrap: anywhere;
  }
  caption {
    text-align: left;
    margin-bottom: 0.4rem;
  }
  .map-note {
    margin-bottom: 0;
  }
  .history-table {
    margin-top: 1rem;
  }
</style>
