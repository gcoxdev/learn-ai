<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { imageNoiseFixture } from "$lib/visual-data";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (v: VisualValues) => void } = $props();
  const amount = $derived(visualNumber(values, "amount", 0.4, 0, 1));
  const seed = $derived(visualNumber(values, "seed", 1, 1, 3, true));
  const pixel = $derived(visualNumber(values, "pixel", 14, 0, 35, true));
  const pixels = $derived(imageNoiseFixture(amount, seed));
  const selected = $derived(pixels[pixel]);
  const f = (n: number) => Number(n.toFixed(3)).toString();
  const gray = (n: number) =>
    `rgb(${Math.round(n * 255)},${Math.round(n * 255)},${Math.round(n * 255)})`;
</script>

<VisualFrame
  title="Watch one pixel change as noise is added."
  label="Image and noise experiment"
  prompt="Start at zero noise, then increase it. Does the clean reference change, or only the version with noise?"
>
  <div class="image-pair">
    {#each ["clean", "noisy"] as kind (kind)}<div>
        <strong
          >{kind === "clean" ? "Clean reference" : "With added noise"}</strong
        ><svg
          viewBox="0 0 180 180"
          role="img"
          aria-label={kind === "clean"
            ? "A fixed six by six grayscale image of a dark disk on a light background."
            : `The same image with noise amount ${f(amount)}. Selected pixel ${pixel + 1} has value ${f(selected.noisy)}.`}
          ><title
            >{kind === "clean"
              ? "Clean six by six pixels"
              : "Pixels after noise and clipping"}</title
          >{#each pixels as p (p.id)}<rect
              x={p.x * 30}
              y={p.y * 30}
              width="30"
              height="30"
              fill={gray(kind === "clean" ? p.clean : p.noisy)}
            />{/each}<rect
            x={selected.x * 30 + 2}
            y={selected.y * 30 + 2}
            width="26"
            height="26"
            fill="none"
            stroke="#e97927"
            stroke-width="3"
          /><rect
            x={selected.x * 30 + 5}
            y={selected.y * 30 + 5}
            width="20"
            height="20"
            fill="none"
            stroke="#172b3b"
            stroke-width="1"
          /></svg
        >
      </div>{/each}
  </div>
  <div class="visual-controls">
    <label
      >Noise amount: {f(amount)}<input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={amount}
        oninput={(e) =>
          onupdate({ amount: +e.currentTarget.value, seed, pixel })}
      /></label
    ><label
      >Disturbance pattern<select
        value={seed}
        onchange={(e) =>
          onupdate({ amount, seed: +e.currentTarget.value, pixel })}
        >{#each [1, 2, 3] as n (n)}<option value={n}>Pattern {n}</option
          >{/each}</select
      ></label
    ><label
      >Inspect pixel<select
        value={pixel}
        onchange={(e) =>
          onupdate({ amount, seed, pixel: +e.currentTarget.value })}
        >{#each pixels as p (p.id)}<option value={p.id}
            >Row {p.y + 1}, column {p.x + 1}</option
          >{/each}</select
      ></label
    >
  </div>
  <div class="visual-result" aria-live="polite">
    <strong
      >Pixel {pixel + 1}: {f(selected.clean)} + {f(amount)} × ({f(
        selected.disturbance,
      )}) = {f(selected.raw)}</strong
    ><span
      >Displayed value: {f(selected.noisy)}. This drawing clips values below 0
      to black and above 1 to white. The outlined square is the pixel being
      inspected.</span
    >
  </div>
  <button
    class="button"
    onclick={() => onupdate({ amount: 0, seed: 1, pixel: 14 })}
    >Remove the noise</button
  >
  <details>
    <summary>Connect this to the denoising lesson</summary>
    <p>
      This shows a clean example and a corrupted input. A denoising model must
      learn an appropriate target from examples; it does not get to copy the
      clean reference at generation time. Here the disturbance is an invented,
      repeatable bounded pattern, not a sample from a diffusion model's Gaussian
      noise schedule. The pixel formula and clipping describe this illustration
      only.
    </p>
  </details>
</VisualFrame>

<style>
  .image-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
  }
  .image-pair strong {
    display: block;
    font-size: 0.8rem;
    color: #2c4934;
    line-height: 1.5;
    margin-bottom: 0.6rem;
  }
  .image-pair svg {
    border: 1px solid #8b9a83;
    border-radius: 3px;
    overflow: hidden;
  }
  @media (max-width: 520px) {
    .image-pair {
      gap: 0.65rem;
    }
  }
</style>
