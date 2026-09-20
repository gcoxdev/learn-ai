<script lang="ts">
  import type { Snippet } from "svelte";
  import "./visual.css";
  let {
    title,
    label = title,
    prompt,
    children,
  }: {
    title: string;
    label?: string;
    prompt: string;
    children: Snippet;
  } = $props();
</script>

<section class="lab visual-lab" aria-label={label}>
  <span class="eyebrow">PREDICT · TRY · EXPLAIN</span>
  <h3>{title}</h3>
  <p class="visual-prompt">{prompt}</p>
  {@render children()}
</section>
