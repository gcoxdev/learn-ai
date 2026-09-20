<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { detectorCounts } from "$lib/decision-visuals";
  import { fmt } from "$lib/simulations";
  import {
    visualNumber,
    visualChoice,
    visualBoolean,
    type VisualValues,
  } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const prevalence = $derived(
    visualNumber(values, "prevalence", 1, 0, 100, true),
  );
  const sensitivity = $derived(
    visualNumber(values, "sensitivity", 90, 0, 100, true),
  );
  const falseAlarm = $derived(
    visualNumber(values, "falseAlarm", 5, 0, 100, true),
  );
  const prediction = $derived(
    visualChoice(
      values,
      "prediction",
      ["", "less", "half", "more", "undefined"] as const,
      "",
    ),
  );
  const revealed = $derived(
    visualBoolean(values, "revealed") && prediction !== "",
  );
  const result = $derived(detectorCounts(prevalence, sensitivity, falseAlarm));
  const answer = $derived(
    result.posterior === null
      ? "undefined"
      : Math.abs(result.posterior - 0.5) < 1e-12
        ? "half"
        : result.posterior < 0.5
          ? "less"
          : "more",
  );
  const percent = (value: number) => `${(100 * value).toFixed(1)}%`;
  function update(next: VisualValues) {
    onupdate({
      prevalence,
      sensitivity,
      falseAlarm,
      prediction,
      revealed,
      ...next,
    });
  }
  function change(key: string, value: number) {
    update({ [key]: value, prediction: "", revealed: false });
  }
</script>

<VisualFrame
  title="Which flags are real defects?"
  label="Bayes experiment"
  prompt="A flag is a clue, not a verdict. Predict whether fewer or more than half of the flagged parts are defective, then count both ways a flag can happen."
>
  <div class="visual-controls">
    <label
      >Defective parts in the whole batch: <strong>{prevalence}%</strong><input
        aria-label="Defect prevalence"
        type="range"
        min="0"
        max="100"
        step="1"
        value={prevalence}
        oninput={(e) => change("prevalence", Number(e.currentTarget.value))}
      /></label
    >
    <label
      >Of defective parts, detector flags: <strong>{sensitivity}%</strong><input
        aria-label="Defects detected"
        type="range"
        min="0"
        max="100"
        step="1"
        value={sensitivity}
        oninput={(e) => change("sensitivity", Number(e.currentTarget.value))}
      /></label
    >
    <label
      >Of good parts, detector flags: <strong>{falseAlarm}%</strong><input
        aria-label="Good parts falsely flagged"
        type="range"
        min="0"
        max="100"
        step="1"
        value={falseAlarm}
        oninput={(e) => change("falseAlarm", Number(e.currentTarget.value))}
      /></label
    >
    <label
      >Among the flagged parts, how many are defective?<select
        aria-label="Predict the flagged fraction"
        value={prediction}
        disabled={revealed}
        onchange={(e) => update({ prediction: e.currentTarget.value })}
        ><option value="">Choose a prediction</option><option value="less"
          >Fewer than half</option
        ><option value="half">Exactly half</option><option value="more"
          >More than half</option
        ><option value="undefined"
          >No flags, so the fraction is undefined</option
        ></select
      ></label
    >
  </div>
  <div class="visual-actions">
    <button
      class="button"
      disabled={!prediction || revealed}
      onclick={() => update({ revealed: true })}>Count the flags</button
    ><button class="button ghost" onclick={() => onupdate({})}
      >Reset detector</button
    >
  </div>
  {#if revealed}
    <div class="visual-canvas">
      <svg
        viewBox="0 0 320 172"
        role="img"
        aria-label={`Defective share of all parts: ${prevalence} percent. Defective share of flagged parts: ${result.posterior === null ? "undefined because no parts were flagged" : percent(result.posterior)}.`}
      >
        <title>Compare the whole batch with the flagged group</title>
        <text x="10" y="22" font-size="15"
          >Whole batch: {prevalence}% defective</text
        >
        <rect x="10" y="34" width="300" height="25" fill="#ebddc5" /><rect
          x="10"
          y="34"
          width={3 * prevalence}
          height="25"
          fill="#397354"
        />
        <text x="10" y="92" font-size="15"
          >Flagged: {result.posterior === null
            ? "no cases"
            : `${percent(result.posterior)} defective`}</text
        >
        {#if result.posterior !== null}<rect
            x="10"
            y="104"
            width="300"
            height="25"
            fill="#ebddc5"
          /><rect
            x="10"
            y="104"
            width={300 * result.posterior}
            height="25"
            fill="#397354"
          />{/if}
        <text x="10" y="157" font-size="14"
          >Green: defective · pale: good parts</text
        >
      </svg>
    </div>
    <div class="visual-result" aria-live="polite" data-testid="bayes-result">
      <strong
        >{prediction === answer
          ? "Your prediction matches the counts."
          : "The counts suggest a different answer. Trace both sources of flags below."}</strong
      >
      {#if result.posterior === null}<span
          >No parts are flagged. Dividing by zero cannot give a fraction of real
          defects among flags.</span
        >{:else}<span
          >{fmt(result.truePositive)} / {fmt(result.flagged)} =
          {percent(result.posterior)} of flagged parts are defective.</span
        >{/if}
    </div>
    <div class="table-scroll">
      <table>
        <caption>Expected counts among 10,000 parts</caption><thead
          ><tr
            ><th scope="col">Observed condition</th><th scope="col">Flagged</th
            ><th scope="col">Not flagged</th></tr
          ></thead
        ><tbody
          ><tr
            ><th scope="row">Defective: {fmt(result.defective)}</th><td
              >{fmt(result.truePositive)}</td
            ><td>{fmt(result.missed)}</td></tr
          ><tr
            ><th scope="row">Good: {fmt(result.good)}</th><td
              >{fmt(result.falsePositive)}</td
            ><td>{fmt(result.correctRejections)}</td></tr
          ></tbody
        >
      </table>
    </div>
    <p class="visual-note">
      The first bar counts all 10,000 parts; the second counts only the {fmt(
        result.flagged,
      )} flagged parts. The bars have different denominators.
    </p>
  {:else}<p class="visual-result">
      Choose a prediction, then reveal the counts.
    </p>{/if}
  <p class="visual-note">
    Try raising prevalence from 1% to 10% while keeping the detector settings
    fixed. These are expected counts from invented rates, not a random sample or
    a guarantee about a real detector.
  </p>
</VisualFrame>
