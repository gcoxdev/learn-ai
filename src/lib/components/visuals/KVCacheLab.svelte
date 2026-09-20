<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { kvCacheSize } from "$lib/mechanism-visuals";
  import { fmt } from "$lib/simulations";
  import {
    visualBoolean,
    visualChoice,
    visualNumber,
    type VisualValues,
  } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const promptTokens = $derived(
    visualNumber(values, "promptTokens", 16, 4, 64, true),
  );
  const appended = $derived(visualNumber(values, "appended", 0, 0, 8, true));
  const heads = $derived(
    Number(visualChoice(values, "heads", ["2", "4", "8"] as const, "2")),
  );
  const precision = $derived(
    Number(visualChoice(values, "precision", ["1", "2"] as const, "2")),
  );
  const prediction = $derived(
    visualChoice(
      values,
      "prediction",
      ["", "same", "double", "four"] as const,
      "",
    ),
  );
  const revealed = $derived(visualBoolean(values, "revealed"));
  const tokens = $derived(promptTokens + appended);
  const cache = $derived(kvCacheSize(tokens, heads, precision));
  const doubled = $derived(kvCacheSize(tokens * 2, heads, precision));
  function update(next: VisualValues) {
    onupdate({
      promptTokens,
      appended,
      heads: String(heads),
      precision: String(precision),
      prediction,
      revealed,
      ...next,
    });
  }
</script>

<VisualFrame
  title="Give every retained token a place"
  label="KV cache experiment"
  prompt="A dense KV cache retains keys and values for earlier positions. Append a token and watch the payload grow. Then predict what doubling the retained length does when every other setting stays fixed."
>
  <div class="visual-controls">
    <label
      >Prompt tokens: <strong>{promptTokens}</strong><input
        aria-label="Prompt token count"
        type="range"
        min="4"
        max="64"
        step="4"
        value={promptTokens}
        oninput={(e) =>
          update({
            promptTokens: Number(e.currentTarget.value),
            appended: 0,
            prediction: "",
            revealed: false,
          })}
      /></label
    >
    <label
      >KV heads per layer<select
        aria-label="KV heads"
        value={String(heads)}
        onchange={(e) =>
          update({
            heads: e.currentTarget.value,
            prediction: "",
            revealed: false,
          })}
        ><option value="2">2 KV heads</option><option value="4"
          >4 KV heads</option
        ><option value="8">8 KV heads</option></select
      ></label
    >
    <label
      >Bytes per stored value<select
        aria-label="Cache precision"
        value={String(precision)}
        onchange={(e) =>
          update({
            precision: e.currentTarget.value,
            prediction: "",
            revealed: false,
          })}
        ><option value="2">2 bytes (16 bits)</option><option value="1"
          >1 byte (8 bits)</option
        ></select
      ></label
    >
  </div>
  <p class="visual-note">
    Fixed: one sequence, four attention layers, 16 numbers per head per key or
    value. Count KV heads, which may differ from query heads.
  </p>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 350 206"
      role="img"
      aria-label={`Current cache: ${tokens} positions, ${fmt(cache.kibibytes)} KiB. Half stores keys and half values. ${revealed ? `At ${tokens * 2} positions, payload doubles to ${fmt(doubled.kibibytes)} KiB.` : "The doubled-length comparison is hidden until you predict."}`}
    >
      <title>Cache payload increases with retained positions</title>
      <text x="20" y="23" font-size="15">Now: {tokens} retained positions</text>
      <rect
        x="20"
        y="36"
        width={(tokens / 144) * 150}
        height="25"
        fill="#397354"
      />
      <rect
        x={20 + (tokens / 144) * 150}
        y="36"
        width={(tokens / 144) * 150}
        height="25"
        fill="#946025"
      />
      <text x="20" y="83" font-size="15">{fmt(cache.kibibytes)} KiB total</text>
      {#if revealed}<text x="20" y="118" font-size="15"
          >Double: {tokens * 2} retained positions</text
        ><rect
          x="20"
          y="131"
          width={((tokens * 2) / 144) * 150}
          height="25"
          fill="#397354"
        /><rect
          x={20 + ((tokens * 2) / 144) * 150}
          y="131"
          width={((tokens * 2) / 144) * 150}
          height="25"
          fill="#946025"
        /><text x="20" y="178" font-size="15"
          >{fmt(doubled.kibibytes)} KiB total</text
        >{:else}<text x="20" y="130" font-size="15"
          >Predict to reveal double the length.</text
        >{/if}
      <text x="20" y="202" font-size="13"
        >Green: keys · ochre: values · equal halves</text
      >
    </svg>
    <p class="visual-note">
      Bar length tracks retained positions. Byte labels also account for KV
      heads and precision.
    </p>
  </div>
  <div class="visual-actions">
    <button
      class="button"
      disabled={appended >= 8}
      onclick={() =>
        update({ appended: appended + 1, prediction: "", revealed: false })}
      >Append one processed token</button
    ><button
      class="button ghost"
      onclick={() =>
        onupdate({
          promptTokens: 16,
          appended: 0,
          heads: "2",
          precision: "2",
          prediction: "",
          revealed: false,
        })}>Reset cache</button
    >
  </div>
  <p data-testid="cache-size">
    {promptTokens} prompt + {appended} appended = {tokens} retained positions. Cache
    payload:
    <strong>{fmt(cache.bytes)} bytes ({fmt(cache.kibibytes)} KiB)</strong>.
  </p>
  <label
    >Double the retained positions; the payload becomes…<select
      aria-label="Predict doubled cache size"
      value={prediction}
      disabled={revealed}
      onchange={(e) => update({ prediction: e.currentTarget.value })}
      ><option value="">Choose a prediction</option><option value="same"
        >The same size</option
      ><option value="double">Twice the size</option><option value="four"
        >Four times the size</option
      ></select
    ></label
  >
  <div class="visual-actions">
    <button
      class="button"
      disabled={!prediction || revealed}
      onclick={() => update({ revealed: true })}>Reveal doubled cache</button
    >
  </div>
  <div class="visual-result" aria-live="polite" aria-atomic="true">
    {#if revealed}<strong
        >{prediction === "double"
          ? "Your prediction matches."
          : "The payload doubles; revise your prediction using the per-token cost."}</strong
      ><span data-testid="cache-comparison"
        >{tokens} → {tokens * 2} positions; {fmt(cache.kibibytes)} → {fmt(
          doubled.kibibytes,
        )} KiB.</span
      >{:else}<span
        >Each processed token adds {fmt(cache.bytesPerToken)} bytes with these settings.
        Caching saves repeated prefix work; the new token still needs computation.</span
      >{/if}
  </div>
  <details>
    <summary>See the memory formula and its limits</summary>
    <p>
      Bytes = 2 (keys and values) × batch × retained tokens × layers × KV heads
      × head dimension × bytes per value.
    </p>
    <p>
      Here: 2 × 1 × {tokens} × 4 × {heads} × 16 × {precision} = {fmt(
        cache.bytes,
      )} bytes. One KiB is 1,024 bytes.
    </p>
    <p>
      This counts dense vector payload, excluding model weights, allocation
      overhead, quantization scales, and temporary buffers. The 8-bit setting
      changes only this storage calculation; it makes no claim about equal model
      outputs or speed. Sliding windows, compression, and other cache policies
      need different accounting. Model weights stay fixed.
    </p>
  </details>
</VisualFrame>
