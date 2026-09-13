<script lang="ts">
  let values = $state([0, 1, 1, 0]);
  let columns = $state(2);
  let inverted = $state(false);
  const rows = $derived(values.length / columns);
  const sequence = $derived(`[${values.join(", ")}]`);

  function toggle(index: number) {
    values = values.map((value, i) => (i === index ? 1 - value : value));
  }
</script>

<section class="lab" aria-label="Interpret four stored pixel values">
  <h3>Four numbers, different pictures</h3>
  <p>
    Predict what will change when you choose a different row width or swap the
    color convention. Then try it. Select a pixel to change its stored value.
  </p>
  <label>
    Pixels per row
    <select bind:value={columns}>
      <option value={1}>1</option>
      <option value={2}>2</option>
      <option value={4}>4</option>
    </select>
  </label>
  <label class="convention">
    <input type="checkbox" bind:checked={inverted} />
    Swap the color convention
  </label>
  <div
    class="pixels"
    style:--columns={columns}
    role="group"
    aria-label="Pixel values in stored order"
  >
    {#each values as value, index (index)}
      {@const white = inverted ? value === 0 : value === 1}
      <button
        type="button"
        class={{ light: white }}
        aria-pressed={value === 1}
        aria-label={`Stored value ${index + 1}: ${value}. Displayed ${white ? "white" : "black"}`}
        onclick={() => toggle(index)}>{value}</button
      >
    {/each}
  </div>
  <div aria-live="polite" aria-atomic="true" data-testid="pixel-reading">
    <p><strong>Stored values: {sequence}</strong></p>
    <p>
      Read as {rows}
      {rows === 1 ? "row" : "rows"} of {columns}. 0 means {inverted
        ? "white"
        : "black"}; 1 means {inverted ? "black" : "white"}.
    </p>
  </div>
  <p>
    Row width and color convention change how the values are interpreted.
    Selecting a pixel changes the values themselves. This is a representation
    experiment; it does not train a model. Controls reset when you leave this
    activity.
  </p>
</section>

<style>
  label {
    display: block;
    margin-block: 1rem;
  }
  select {
    margin-left: 0.5rem;
  }
  .convention {
    display: flex;
    gap: 0.6rem;
    align-items: center;
  }
  .pixels {
    display: grid;
    grid-template-columns: repeat(var(--columns), 3.5rem);
    gap: 0.5rem;
    margin-block: 1.5rem;
  }
  .pixels button {
    width: 3.5rem;
    height: 3.5rem;
    padding: 0;
    border: 2px solid #444;
    border-radius: 0.25rem;
    background: #111;
    color: #fff;
    font-size: 1.2rem;
  }
  .pixels button.light {
    background: #fff;
    color: #111;
  }
</style>
