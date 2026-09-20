<script lang="ts">
  import {
    visualChoice,
    visualNumber,
    type VisualValues,
  } from "$lib/visual-state";
  import { compareSnackWeights, snackExamples } from "$lib/foundation-visuals";
  import VisualFrame from "./VisualFrame.svelte";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const mode = $derived(
    visualChoice(values, "mode", ["use", "fit"] as const, "use"),
  );
  const guests = $derived(visualNumber(values, "guests", 3, 0, 5, true));
  const weight = $derived(visualNumber(values, "weight", 2, 2, 3, true));
  const output = $derived(guests * weight);
  const candidates = compareSnackWeights();
  function update(change: VisualValues) {
    onupdate({ mode, guests, weight, ...change });
  }
</script>

<VisualFrame
  title="Using a rule is different from fitting it"
  label="Training and inference experiment"
  prompt="First change the number of guests. Does the rule change? Then fit the rule to the two examples and try again."
>
  <p class="visual-note">
    A model is a reusable rule. Here its weight is the number of crackers per
    guest. <strong>Inference</strong> means using the current rule;
    <strong>training</strong> means fitting its weight to examples.
  </p>
  <div class="visual-controls">
    <label
      >Choose an activity<select
        value={mode}
        onchange={(event) => update({ mode: event.currentTarget.value })}
      >
        <option value="use">Use the current rule (inference)</option><option
          value="fit">Fit to examples (training)</option
        >
      </select></label
    >
    <label
      >Guests to serve: {guests}<input
        type="range"
        min="0"
        max="5"
        step="1"
        value={guests}
        aria-label="Guests to serve"
        oninput={(event) =>
          update({ guests: Number(event.currentTarget.value) })}
      /></label
    >
  </div>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 340 264"
      role="img"
      aria-label={`The current rule uses a weight of ${weight} crackers per guest. ${guests} guests gives ${output} crackers. ${mode === "fit" ? "Training can change this weight using the examples." : "Inference keeps the weight fixed."}`}
    >
      <rect
        x="7"
        y="25"
        width="95"
        height="81"
        rx="10"
        fill="#f3e9d2"
        stroke="#b6975c"
      />
      <text x="54" y="50" text-anchor="middle" font-size="14">Input</text><text
        x="54"
        y="80"
        text-anchor="middle"
        font-size="20">{guests} guests</text
      >
      <path
        d="M109 66h23l-6 -5m6 5 -6 5"
        fill="none"
        stroke="#567252"
        stroke-width="2"
      />
      <rect
        x="140"
        y="15"
        width="192"
        height="104"
        rx="12"
        fill="#e5ebdc"
        stroke="#789471"
        stroke-width="2"
      />
      <text x="236" y="43" text-anchor="middle" font-size="15"
        >Current rule</text
      >
      <text x="236" y="72" text-anchor="middle" font-size="20" font-weight="600"
        >guests × {weight}</text
      >
      <text x="236" y="98" text-anchor="middle" font-size="13"
        >Weight: {weight} crackers / guest</text
      >
      <path
        d="M236 126v28l-5 -6m5 6 5 -6"
        fill="none"
        stroke="#567252"
        stroke-width="2"
      />
      <rect
        x="140"
        y="162"
        width="192"
        height="77"
        rx="12"
        fill="#f3e9d2"
        stroke="#b6975c"
      />
      <text x="236" y="188" text-anchor="middle" font-size="14">Output</text
      ><text
        x="236"
        y="218"
        text-anchor="middle"
        font-size="22"
        font-weight="600">{output} crackers</text
      >
      <text x="7" y="162" font-size="14">Weight stays</text><text
        x="7"
        y="183"
        font-size="14">at {weight} when</text
      ><text x="7" y="204" font-size="14">guests change.</text>
    </svg>
  </div>
  {#if mode === "fit"}
    <div class="examples">
      <h4>Examples to learn from</h4>
      {#each snackExamples as example (example.guests)}<p>
          {example.guests} guests actually ate
          <strong>{example.crackers} crackers</strong>.
        </p>{/each}
      <p>
        Try two possible weights. A “miss” is how many crackers an answer is
        away from the example.
      </p>
      <table>
        <caption>Compare both candidate rules</caption><thead
          ><tr
            ><th>Weight</th><th>For 2 guests</th><th>For 3 guests</th><th
              >Total miss</th
            ></tr
          ></thead
        ><tbody
          >{#each candidates as candidate (candidate.weight)}<tr
              ><th scope="row">{candidate.weight}</th><td
                >{candidate.predictions[0]}</td
              ><td>{candidate.predictions[1]}</td><td>{candidate.totalMiss}</td
              ></tr
            >{/each}</tbody
        >
      </table>
      <div class="visual-actions">
        <button
          class="button"
          onclick={() => update({ weight: 3 })}
          disabled={weight === 3}>Fit using both examples</button
        >
      </div>
      <p class="visual-note">
        Here “fit” selects the better of just two possible weights: 2 and 3.
        Larger models use other methods to search many more possibilities. These
        two examples alone do not prove that the rule works for everyone.
      </p>
    </div>
  {/if}
  <div class="visual-result" aria-live="polite">
    <strong data-testid="training-inference-result"
      >{guests} × {weight} = {output} crackers</strong
    ><span
      >{weight === 3
        ? "The weight is now 3, which matches both training examples. Using this fitted rule does not change it again."
        : "The starting weight is 2. Changing the input or switching views leaves that weight alone."}</span
    >
  </div>
  <p class="visual-note">
    Explain it back: which action changes the rule, and which action only asks
    it a new question?
  </p>
  <div class="visual-actions">
    <button
      class="button secondary"
      onclick={() => onupdate({ mode: "use", guests: 3, weight: 2 })}
      >Reset experiment</button
    >
  </div>
</VisualFrame>

<style>
  .examples {
    background: #fffefa;
    border: 1px solid #dce2d6;
    border-radius: 10px;
    padding: 1rem;
  }
  h4 {
    margin: 0 0 0.7rem;
  }
  .examples p {
    font-size: 0.85rem;
    line-height: 1.65;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }
  caption {
    text-align: left;
    font-weight: 600;
    padding: 0.6rem 0;
  }
  th,
  td {
    padding: 0.55rem 0.3rem;
    text-align: center;
    border-bottom: 1px solid #dce2d6;
  }
  th {
    font-weight: 600;
  }
</style>
