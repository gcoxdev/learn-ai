<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import {
    DIAL_CANDIDATES,
    DIAL_EXAMPLES,
    dialReadout,
  } from "$lib/system-one-visuals";
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
  const exampleIds = DIAL_EXAMPLES.map((e) => e.id);
  const example = $derived(visualChoice(values, "example", exampleIds, "lever"));
  const temperature = $derived(
    visualNumber(values, "temperature", 1, 0.1, 3),
  );
  const revealed = $derived(visualBoolean(values, "revealed"));
  const current = $derived(DIAL_EXAMPLES.find((e) => e.id === example)!);
  const r = $derived(dialReadout(example, temperature));
  const f2 = (p: number) => p.toFixed(2);
  function update(next: VisualValues) {
    onupdate({ example, temperature, revealed, ...next });
  }
</script>

<VisualFrame
  title="Turn the temperature dial"
  label="Temperature and confidence experiment"
  prompt="The model's raw scores for this message stay fixed. Temperature divides them before they become probabilities. Turn the dial and watch two numbers: the top probability, and the confidence a provider might report."
>
  <div class="visual-controls">
    <label
      >Message<select
        aria-label="Message to score"
        value={example}
        onchange={(e) =>
          update({ example: e.currentTarget.value, revealed: false })}
        >{#each DIAL_EXAMPLES as e (e.id)}<option value={e.id}>{e.text}</option
          >{/each}</select
      ></label
    >
    <label
      >Temperature T: <strong>{temperature.toFixed(2)}</strong><input
        aria-label="Temperature"
        type="range"
        min="0.1"
        max="3"
        step="0.05"
        value={temperature}
        oninput={(e) => update({ temperature: Number(e.currentTarget.value) })}
      /></label
    >
  </div>
  <blockquote class="scored-message">{current.text}</blockquote>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 340 214"
      role="img"
      aria-label={`Temperature ${temperature.toFixed(2)}. ${DIAL_CANDIDATES.map((c, i) => `${c} ${f2(r.probabilities[i])}`).join(", ")}.`}
    >
      <title>Probabilities after dividing the fixed scores by T</title>
      {#each DIAL_CANDIDATES as label, i (label)}
        <text x="4" y={30 + 36 * i} font-size="13">{label}</text>
        <rect x="110" y={15 + 36 * i} width="190" height="22" fill="#eef1ea" />
        <rect
          x="110"
          y={15 + 36 * i}
          width={190 * r.probabilities[i]}
          height="22"
          fill={i === r.top ? "#397354" : "#9db59a"}
        />
        {#if revealed && i === current.correct}<text
            x="96"
            y={31 + 36 * i}
            font-size="14"
            text-anchor="end"
            fill="#946025">✓</text
          >{/if}
        <text x="306" y={31 + 36 * i} font-size="13"
          >{f2(r.probabilities[i])}</text
        >
      {/each}
    </svg>
  </div>
  <div class="visual-result" aria-live="polite" data-testid="dial-result">
    <strong
      >Top answer: {DIAL_CANDIDATES[r.top]} · top probability {f2(
        r.topProbability,
      )} · reported confidence {f2(r.confidence)}</strong
    >
    <span
      >Reported confidence here uses one documented provider formula, (p_max −
      1/n) / (1 − 1/n) with n = {DIAL_CANDIDATES.length}: it rescales the top
      probability so that a uniform guess scores 0. It is not the chance the
      answer is right.</span
    >
    {#if revealed}<span
        >The correct answer is {DIAL_CANDIDATES[current.correct]}. {r.isCorrect
          ? "The model's top answer is right."
          : "The model's top answer is wrong at every temperature: dividing every score by the same T never changes their order. A low T only makes the wrong answer look surer."}</span
      >{/if}
  </div>
  <div class="visual-actions">
    <button
      class="button"
      disabled={revealed}
      onclick={() => update({ revealed: true })}>Reveal the correct answer</button
    ><button class="button ghost" onclick={() => onupdate({})}>Reset T to 1</button
    >
  </div>
  <details>
    <summary>Read the scores and probabilities as a table</summary>
    <div class="table-scroll">
      <table>
        <caption>{current.text} (T = {temperature.toFixed(2)})</caption><thead
          ><tr
            ><th scope="col">Candidate</th><th scope="col">Raw score</th><th
              scope="col">Probability</th
            ></tr
          ></thead
        ><tbody
          >{#each DIAL_CANDIDATES as label, i (label)}<tr
              ><th scope="row">{label}</th><td>{current.logits[i]}</td><td
                >{f2(r.probabilities[i])}</td
              ></tr
            >{/each}</tbody
        >
      </table>
    </div>
  </details>
  <p class="visual-note">
    Invented scores for teaching. Try the brake-lever message at T = 1, then
    0.25. Temperature scaling fits one T on held-out data so that probabilities
    match how often answers are right on average. It cannot fix the ranking of a
    single message, so good average calibration does not certify any one
    decision.
  </p>
</VisualFrame>

<style>
  .scored-message {
    margin: 0;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid #9db59a;
    font-style: italic;
  }
</style>
