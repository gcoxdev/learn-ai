<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { squareSlope } from "$lib/math-visuals";
  import { fmt } from "$lib/simulations";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const x = $derived(visualNumber(values, "x", 1, -2.5, 2.5));
  const h = $derived(visualNumber(values, "h", 1, 0.01, 1.5));
  const result = $derived(squareSlope(x, h));
  const px = (value: number) => 40 + (value + 3) * 41;
  const py = (value: number) => 237 - (value + 2) * 11;
  const curve = Array.from({ length: 85 }, (_, i) => {
    const n = -3 + i / 12;
    return `${px(n)},${py(n * n)}`;
  }).join(" ");
  const left = $derived(Math.max(-3, x - 1));
  const right = $derived(Math.min(4, x + 1));
  function update(next: Partial<{ x: number; h: number }>) {
    onupdate({ x, h, ...next });
  }
</script>

<VisualFrame
  title="Zoom in on a slope"
  label="Derivative experiment"
  prompt="A slope tells us how quickly a result changes. Keep the first point still and bring the second closer. Can you make the two-point slope nearly match the local slope? Then explore the left side of the bowl."
>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 350 280"
      role="img"
      aria-label={`The curve is x squared. At x ${fmt(x)}, the local slope is ${fmt(result.derivative)}. Comparing x with x plus ${fmt(h)} gives slope ${fmt(result.secant)}.`}
    >
      <title>A secant approaches the tangent on the curve y = x²</title>
      {#each [0, 5, 10, 15] as y (y)}<line
          x1="40"
          x2="327"
          y1={py(y)}
          y2={py(y)}
          stroke="#d8dfd2"
          stroke-dasharray="3 5"
        /><text x="33" y={py(y) + 4} text-anchor="end" font-size="16">{y}</text
        >{/each}
      <line x1={px(0)} x2={px(0)} y1="27" y2="240" stroke="#879784" />
      <polyline points={curve} fill="none" stroke="#82958a" stroke-width="3" />
      <line
        x1={px(left)}
        y1={py(result.start + result.derivative * (left - x))}
        x2={px(right)}
        y2={py(result.start + result.derivative * (right - x))}
        stroke="#397354"
        stroke-width="3"
      />
      <path
        d={`M ${px(x)} ${py(result.start)} H ${px(x + h)} V ${py(result.end)}`}
        stroke="#a46c32"
        stroke-dasharray="3 3"
        fill="none"
      />
      <line
        x1={px(x)}
        y1={py(result.start)}
        x2={px(x + h)}
        y2={py(result.end)}
        stroke="#a46c32"
        stroke-width="3"
      />
      <circle
        cx={px(x)}
        cy={py(result.start)}
        r="5"
        fill="#397354"
        stroke="#fffefa"
        stroke-width="2"
      />
      <circle
        cx={px(x + h)}
        cy={py(result.end)}
        r="5"
        fill="#fffefa"
        stroke="#a46c32"
        stroke-width="2"
      />
      {#each [-2, 0, 2, 4] as tick (tick)}<text
          x={px(tick)}
          y="254"
          font-size="16"
          text-anchor="middle">{tick}</text
        >{/each}
      <text x="40" y="17" font-size="16">Result y = x²</text><text
        x="183"
        y="276"
        font-size="16"
        text-anchor="middle">Input x</text
      >
    </svg>
    <div class="visual-legend">
      <span>Green: local slope (tangent)</span><span
        >Ochre: two-point slope (secant)</span
      ><span>Dotted: rise and run</span>
    </div>
  </div>
  <div class="visual-controls">
    <label
      >First point x: <strong>{fmt(x)}</strong><input
        aria-label="Derivative first point"
        type="range"
        min="-2.5"
        max="2.5"
        step="0.1"
        value={x}
        oninput={(event) => update({ x: Number(event.currentTarget.value) })}
      /></label
    >
    <label
      >Distance h: <strong>{fmt(h)}</strong><input
        aria-label="Comparison distance"
        type="range"
        min="0.01"
        max="1.5"
        step="0.01"
        value={h}
        oninput={(event) => update({ h: Number(event.currentTarget.value) })}
      /></label
    >
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    <strong
      >Two-point slope: {fmt(result.rise)} ÷ {fmt(h)} = {fmt(
        result.secant,
      )}</strong
    >
    <span
      >Local slope: 2 × ({fmt(x)}) =
      <strong data-testid="derivative-slope">{fmt(result.derivative)}</strong>.
      The gap between these slopes is {fmt(h)}.</span
    >
    <span
      >{x < 0
        ? "Negative slope: moving a tiny bit right lowers the result."
        : x > 0
          ? "Positive slope: moving a tiny bit right raises the result."
          : "Zero slope: the tangent is flat here. The bowl still curves upward."}</span
    >
  </div>
  <button class="button ghost" onclick={() => onupdate({ x: 1, h: 1 })}
    >Reset points</button
  >
  <details>
    <summary>See why the derivative is 2x</summary>
    <p>
      A function is a rule from input to output. Our rule is f(x) = x². The <strong
        >secant</strong
      > joins two points; its slope is the change in output (rise) divided by the
      change in input (run).
    </p>
    <p class="formula">
      [f(x + h) − f(x)] / h<br />= [(x + h)² − x²] / h<br />= [2xh + h²] / h<br
      />= 2x + h, for h ≠ 0.
    </p>
    <p>
      As h gets closer to zero, 2x + h gets closer to 2x. This limit is the <strong
        >derivative</strong
      >, written f′(x) or df/dx. We take a limit; we never divide by zero. The
      <strong>tangent</strong> is a line with that local slope.
    </p>
    <p>
      Current points: ({fmt(x)}, {fmt(result.start)}) and ({fmt(x + h)}, {fmt(
        result.end,
      )}). Their output change is {fmt(result.end)} − {fmt(result.start)} = {fmt(
        result.rise,
      )}.
    </p>
    <p>
      Gradient descent follows the negative slope to reduce loss. For this bowl
      the flat point is the minimum. For other functions, a zero derivative can
      also occur at a maximum or a flat crossing, so zero alone is not proof of
      the best solution.
    </p>
  </details>
  <p class="visual-note">
    Remember: two points measure an average slope; a derivative measures the
    local slope. Values are displayed to six decimal places.
  </p>
</VisualFrame>

<style>
  .formula {
    font-family: var(--font-mono, monospace);
    font-size: 0.8rem;
    line-height: 1.9;
  }
</style>
