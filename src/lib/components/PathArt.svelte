<script lang="ts">
  let { type = "language" }: { type?: string } = $props();
  const cells = Array.from({ length: 64 }, (_, i) => ({
    x: i % 8,
    y: Math.floor(i / 8),
    noise: (i * 37 + 13) % 100,
  }));
</script>

<div
  class={["path-art", type === "images" ? "art-image" : "art-language"]}
  aria-hidden="true"
>
  {#if type === "images"}
    <svg viewBox="0 0 440 160" fill="none">
      <g transform="translate(63 26)"
        >{#each cells as cell (cell.x + cell.y * 8)}<rect
            x={cell.x * 13}
            y={cell.y * 13}
            width="12"
            height="12"
            rx="2"
            fill={`hsl(30 25% ${35 + cell.noise * 0.52}%)`}
          />{/each}</g
      >
      <path d="M196 80h43m-7-6 7 6-7 6" stroke="#a17b56" stroke-width="1.5" />
      <rect x="270" y="22" width="115" height="115" rx="9" fill="#f7d99e" />
      <circle cx="348" cy="51" r="14" fill="#d88953" />
      <path d="m270 115 33-40 31 30 24-17 27 27v22H270Z" fill="#729079" />
      <path d="m270 128 49-30 35 23 31-15v31H270Z" fill="#3b6753" />
      <path
        d="m290 9 4 8m104 15-8 4M253 49l-8-1"
        stroke="#b78c62"
        stroke-width="1.5"
      />
    </svg>
  {:else}
    <div class="token-example">
      <span>The</span><span>world</span><span>is</span><span class="empty-token"
        >?</span
      >
    </div>
    <div
      class="probabilities"
      title="Example top continuations; other tokens total 0.17"
    >
      <div><span>full</span><i style="--bar: 74%"></i><small>0.42</small></div>
      <div>
        <span>changing</span><i style="--bar: 45%"></i><small>0.26</small>
      </div>
      <div>
        <span>beautiful</span><i style="--bar: 26%"></i><small>0.15</small>
      </div>
    </div>
  {/if}
</div>
