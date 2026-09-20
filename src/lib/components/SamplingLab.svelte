<script lang="ts">
  import {
    sampleFromDistribution,
    samplingCounts,
    samplingDistribution,
    samplingScores,
  } from "$lib/sampling";

  let temperature = $state(1);
  let topK = $state(3);
  let draw = $state(0.75);
  const names = ["A", "B", "C"];
  const probabilities = $derived(
    samplingDistribution(samplingScores, temperature, topK),
  );
  const choice = $derived(sampleFromDistribution(probabilities, draw));
  const counts = $derived(samplingCounts(probabilities));
  const lower = $derived(
    probabilities.slice(0, choice).reduce((sum, p) => sum + p, 0),
  );
  const upper = $derived(lower + probabilities[choice]);

  function reset() {
    temperature = 1;
    topK = 3;
    draw = 0.75;
  }
</script>

<section class="lab sampling-lab" aria-label="Sampling experiment">
  <span class="eyebrow">SAME SCORES, DIFFERENT CHOICES</span>
  <h3>Give chance a steering wheel.</h3>
  <p>
    Three pretend next-token candidates have scores <strong>2, 1, 0</strong>. A
    score is a preference number, not a probability. These scores are invented;
    there is no trained model behind this experiment.
  </p>
  <div class="sampling-controls">
    <label>
      <strong>Temperature: {temperature.toFixed(1)}</strong>
      <span
        >How spread out the chances are. Lower favors the highest score.</span
      >
      <input
        type="range"
        min="0.2"
        max="2"
        step="0.1"
        bind:value={temperature}
        aria-label="Temperature"
      />
    </label>
    <label>
      <strong>Top-k: {topK}</strong>
      <span
        >Keep only the k highest-scoring candidates before assigning chances.</span
      >
      <select bind:value={topK} aria-label="Top-k">
        <option value={3}>3 — keep all candidates</option>
        <option value={2}>2 — keep A and B</option>
        <option value={1}>1 — keep only A</option>
      </select>
    </label>
    <label>
      <strong>Draw: {draw.toFixed(2)}</strong>
      <span
        >A number from 0 up to (but not including) 1 that picks one probability
        interval.</span
      >
      <input
        type="range"
        min="0"
        max="0.99"
        step="0.01"
        bind:value={draw}
        aria-label="Sampling draw"
      />
    </label>
  </div>
  <p class="sampling-method">
    <strong>Softmax</strong> converts the kept scores into probabilities: divide scores
    by temperature, exponentiate, then divide by their total. The probabilities add
    to 100%. Top-k sets excluded candidates to zero.
  </p>
  <div class="chance-strip" aria-hidden="true">
    {#each probabilities as probability, i (names[i])}<span
        class={`candidate-${i}`}
        style:width={`${probability * 100}%`}
        >{probability > 0.12 ? names[i] : ""}</span
      >{/each}
    <span class="draw-marker" style:left={`${draw * 100}%`}></span>
  </div>
  <p class="strip-caption">
    The line marks your draw on a 0–1 strip. Wider intervals mean larger
    chances.
  </p>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (A labeled scroll region lets keyboard users reach all table columns on narrow screens.) -->
  <div
    class="table-scroll"
    role="region"
    aria-label="Sampling probabilities and counts"
    tabindex="0"
  >
    <table>
      <caption>Chances and a repeatable 100-draw comparison</caption>
      <thead
        ><tr
          ><th scope="col">Candidate</th><th scope="col">Score</th><th
            scope="col">Probability</th
          ><th scope="col">Picks / 100</th></tr
        ></thead
      >
      <tbody>
        {#each probabilities as probability, i (names[i])}<tr>
            <th scope="row"
              >{names[i]}{probability === 0 ? " (excluded)" : ""}</th
            >
            <td>{samplingScores[i]}</td>
            <td data-testid={`sampling-probability-${names[i]}`}
              >{(probability * 100).toFixed(1)}%</td
            >
            <td>{counts[i]}</td>
          </tr>{/each}
      </tbody>
    </table>
  </div>
  <div class="sampling-result" aria-live="polite" aria-atomic="true">
    <strong data-testid="sampling-choice"
      >Draw {draw.toFixed(2)} picks candidate {names[choice]}.</strong
    >
    <span>
      Its interval runs from {lower.toFixed(3)} up to {upper.toFixed(3)}
      (upper edge excluded). It has {(probabilities[choice] * 100).toFixed(1)}%
      of the probability.
    </span>
  </div>
  <p>
    <strong>Try this:</strong> with temperature 1.0 and top-k 3, move the draw from
    0.50 to 0.75 to 0.95. The choice changes; the chances do not. Then keep draw 0.75
    and lower temperature to 0.5. Which candidate wins now?
  </p>
  <button class="button" onclick={reset}>Reset experiment</button>
  <p class="lab-note">
    A sampler normally supplies a random draw; here you choose it so results are
    repeatable. The counts use 100 fixed, evenly spaced draws (0.005, 0.015, …,
    0.995), not random trials. Displayed values are rounded; calculations use
    full precision. These controls reset when you leave the activity and do not
    count as assessment evidence.
  </p>
</section>

<style>
  .sampling-lab {
    min-width: 0;
  }
  h3 {
    margin: 0.8rem 0;
  }
  p,
  .sampling-result {
    font-size: 0.85rem;
    line-height: 1.7;
  }
  .sampling-controls {
    display: grid;
    gap: 1.2rem;
    margin: 1.4rem 0;
  }
  label {
    display: grid;
    gap: 0.5rem;
    font-size: 0.85rem;
  }
  label span {
    font-size: 0.78rem;
    line-height: 1.6;
  }
  input,
  select {
    width: 100%;
    accent-color: var(--green);
  }
  select {
    padding: 0.6rem;
    background: white;
    border: 1px solid #829373;
    border-radius: 5px;
  }
  .sampling-method {
    border-left: 3px solid #789368;
    padding-left: 0.8rem;
  }
  .chance-strip {
    display: flex;
    position: relative;
    height: 2rem;
    margin: 1.5rem 0 0.6rem;
  }
  .chance-strip > span {
    display: grid;
    place-items: center;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .candidate-0 {
    background: #bfd2ab;
  }
  .candidate-1 {
    background: #ecd0ab;
  }
  .candidate-2 {
    background: #cbd7e7;
  }
  .chance-strip > .draw-marker {
    position: absolute;
    top: -0.3rem;
    bottom: -0.3rem;
    width: 3px;
    background: #203b2d;
    transform: translateX(-50%);
  }
  .strip-caption {
    font-size: 0.75rem;
  }
  .sampling-result {
    display: grid;
    gap: 0.3rem;
    padding: 1rem;
    background: #e4edda;
    border-radius: 6px;
    margin: 1rem 0;
  }
  .sampling-result span {
    font-size: 0.8rem;
  }
  td {
    font-variant-numeric: tabular-nums;
  }
</style>
