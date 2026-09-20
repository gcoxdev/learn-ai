<script lang="ts">
  import { expertMixture, fmt } from "$lib/simulations";
  let { type }: { type: "moe" | "tokens" | "denoising" } = $props();
  let topK = $state(2);
  let noiseStep = $state(0);
  let chosen = $state("");
  const mixture = $derived(expertMixture([0.55, 0.25, 0.15, 0.05], topK));
  const pixels = Array.from({ length: 144 }, (_, i) => {
    const x = i % 12,
      y = Math.floor(i / 12);
    return {
      i,
      x,
      y,
      noise: ((i * 37 + 29) % 100) / 100,
      target:
        (x - 7) ** 2 + (y - 4) ** 2 < 5
          ? 0.95
          : y > 8 - Math.abs(x - 6) * 0.55
            ? 0.25
            : 0.67,
    };
  });
</script>

<section
  class="lab mechanism-lab"
  aria-label={type === "moe"
    ? "Expert routing example"
    : type === "tokens"
      ? "Next-token distribution example"
      : "Illustrated denoising direction"}
>
  <span class="eyebrow"
    >{type === "moe"
      ? "A ROUTED FORWARD PASS"
      : type === "tokens"
        ? "ONE NEXT-TOKEN DECISION"
        : "FROM NOISE TO A FIXED PATTERN"}</span
  >
  {#if type === "moe"}
    <svg
      class="routing-map"
      viewBox="0 0 460 278"
      role="img"
      aria-label={`One token is routed to ${topK} selected experts. Their weighted outputs are added to give [${mixture.output.map(fmt).join(", ")}]. Exact weights follow below.`}
    >
      <title
        >One hidden representation, selected experts, one weighted mixture</title
      >
      {#each [0, 1, 2, 3] as id (id)}
        {@const selected = mixture.weights.find((e) => e.id === id)}
        <path
          d={`M 94 144 C 127 144 112 ${40 + id * 66} 154 ${40 + id * 66}`}
          fill="none"
          stroke={selected ? "#56834b" : "#cdd6c7"}
          stroke-width={selected ? 2 + selected.weight * 8 : 1}
          stroke-dasharray={selected ? undefined : "3 5"}
        />
        <path
          d={`M 285 ${40 + id * 66} C 327 ${40 + id * 66} 325 144 353 144`}
          fill="none"
          stroke={selected ? "#56834b" : "#cdd6c7"}
          stroke-width={selected ? 2 + selected.weight * 8 : 1}
          stroke-dasharray={selected ? undefined : "3 5"}
        />
        <rect
          x="154"
          y={17 + id * 66}
          width="131"
          height="46"
          rx="8"
          fill={selected ? "#e2edda" : "#f6f6f1"}
          stroke={selected ? "#548342" : "#aebaa6"}
        />
        <text x="220" y={45 + id * 66} text-anchor="middle" font-size="22"
          >Expert {id + 1}</text
        >
      {/each}
      <rect
        x="5"
        y="112"
        width="90"
        height="65"
        rx="9"
        fill="#dce8ee"
        stroke="#5c7c90"
      />
      <text x="50" y="140" text-anchor="middle" font-size="22">Token</text><text
        x="50"
        y="160"
        text-anchor="middle"
        font-size="20">vector</text
      >
      <rect
        x="353"
        y="112"
        width="102"
        height="65"
        rx="9"
        fill="#eadfc9"
        stroke="#8c714d"
      />
      <text x="404" y="140" text-anchor="middle" font-size="22">Weighted</text
      ><text x="404" y="160" text-anchor="middle" font-size="22">sum</text>
    </svg>
    <p class="routing-caption">Solid paths run. Dashed paths are inactive.</p>
    <div class="expert-grid">
      {#each [0.55, 0.25, 0.15, 0.05] as probability, i (probability)}<div
          class={{ active: mixture.weights.some((e) => e.id === i) }}
        >
          <span>Expert {i + 1}</span><strong>{probability.toFixed(2)}</strong
          ><small
            >{mixture.weights.some((e) => e.id === i)
              ? "Selected"
              : "Inactive for this token"}</small
          >
        </div>{/each}
    </div>
    <label class="inline-control"
      >Select experts <select bind:value={topK}
        ><option value={1}>Top 1</option><option value={2}>Top 2</option><option
          value={3}>Top 3</option
        ><option value={4}>All 4</option></select
      ></label
    >
    <div class="mixture-result" aria-live="polite">
      <span>Combined output</span><strong
        >[{mixture.output.map(fmt).join(", ")}]</strong
      >
    </div>
    <div class="table-scroll">
      <table>
        <caption
          >Renormalized selected weights and constructed expert outputs</caption
        ><thead
          ><tr><th>Expert</th><th>Mixing weight</th><th>Output vector</th></tr
          ></thead
        ><tbody
          >{#each mixture.weights as expert (expert.id)}<tr
              ><th scope="row">{expert.id + 1}</th><td>{fmt(expert.weight)}</td
              ><td>[{expert.output.join(", ")}]</td></tr
            >{/each}</tbody
        >
      </table>
    </div>
    <p class="lab-note">
      These are constructed values, not a production-model measurement. The
      example renormalizes selected probabilities; actual architectures may use
      different routing conventions.
    </p>
  {:else if type === "tokens"}
    <div class="context-sentence">
      The garden is <span>{chosen || "…"}</span>
    </div>
    <div class="token-choices">
      {#each [{ text: "quiet", p: 0.45 }, { text: "green", p: 0.3 }, { text: "beautiful", p: 0.15 }, { text: "other", p: 0.1 }] as token (token.text)}<button
          class={{ chosen: chosen === token.text }}
          onclick={() => (chosen = token.text)}
          ><span>{token.text}</span><i style:width={`${token.p * 100}%`}
          ></i><small>{(token.p * 100).toFixed(0)}%</small></button
        >{/each}
    </div>
    <p class="lab-note" aria-live="polite">
      {chosen
        ? `“${chosen}” has been appended. A real model would now recompute a distribution from the longer context.`
        : "Choose a continuation to append it. The probabilities sum to one."} This
      fixed distribution illustrates one step; no live model is running.
    </p>
  {:else}
    <div class="denoise-layout">
      <svg
        viewBox="0 0 144 144"
        role="img"
        aria-label={`Illustrative grayscale image, ${noiseStep * 10}% blended toward a fixed landscape. This is not a trained diffusion model.`}
        ><title>A fixed array blended with deterministic noise</title
        >{#each pixels as pixel (pixel.i)}<rect
            x={pixel.x * 12}
            y={pixel.y * 12}
            width="12"
            height="12"
            fill={`hsl(90 14% ${(pixel.noise * (1 - noiseStep / 10) + (pixel.target * noiseStep) / 10) * 90}%)`}
          />{/each}</svg
      >
      <div>
        <strong>Same noise. More structure.</strong>
        <p>
          This illustration blends a fixed array with noise. An actual generator
          uses learned predictions and a sampling rule.
        </p>
        <label
          >Illustration step <output>{noiseStep} / 10</output><input
            type="range"
            min="0"
            max="10"
            step="1"
            bind:value={noiseStep}
          /></label
        >
        <p class="lab-note">
          Text alternative: a random brightness grid gradually gives way to a
          pale sky, bright sun, and darker hills.
        </p>
      </div>
    </div>
  {/if}
</section>

<style>
  .routing-caption {
    font-size: 0.85rem;
    line-height: 1.6;
    color: #344934;
    margin: -0.25rem 0 1rem;
  }
  .routing-map {
    display: block;
    width: 100%;
    height: auto;
    margin: 1rem 0;
    background: #fffefa;
    border-radius: 10px;
  }
  .routing-map text {
    font-family: inherit;
    fill: #233d2b;
  }
</style>
