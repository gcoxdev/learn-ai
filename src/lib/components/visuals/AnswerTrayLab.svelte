<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import {
    TRAY_CANDIDATES,
    TRAY_MESSAGES,
    trayProbabilities,
    type TrayCandidate,
  } from "$lib/system-one-visuals";
  import {
    visualBoolean,
    visualChoice,
    type VisualValues,
  } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const messageIds = TRAY_MESSAGES.map((m) => m.id);
  const message = $derived(visualChoice(values, "message", messageIds, "brakes"));
  // Candidates default to "in the tray"; a stored false removes one.
  const enabled = $derived(
    Object.fromEntries(
      TRAY_CANDIDATES.map((c) => [c.id, values[c.id] !== false]),
    ) as Record<TrayCandidate, boolean>,
  );
  const keptCount = $derived(Object.values(enabled).filter(Boolean).length);
  const rows = $derived(trayProbabilities(message, enabled));
  const current = $derived(TRAY_MESSAGES.find((m) => m.id === message)!);
  const leader = $derived(
    rows.reduce((best, r) => (r.probability > best.probability ? r : best)),
  );
  const pct = (p: number) => `${(100 * p).toFixed(0)}%`;
  const showSum = $derived(visualBoolean(values, "showSum"));
  function update(next: VisualValues) {
    onupdate({
      message,
      showSum,
      ...Object.fromEntries(TRAY_CANDIDATES.map((c) => [c.id, enabled[c.id]])),
      ...next,
    });
  }
</script>

<VisualFrame
  title="Change the answers in the tray"
  label="Candidate answer tray experiment"
  prompt="A decision model can only choose from the answers you offer. Pick a message, then remove or restore candidates and watch the probabilities spread over whatever is left."
>
  <div class="visual-controls">
    <label
      >Message<select
        aria-label="Customer message"
        value={message}
        onchange={(e) => update({ message: e.currentTarget.value })}
        >{#each TRAY_MESSAGES as m (m.id)}<option value={m.id}>{m.text}</option
          >{/each}</select
      ></label
    >
    <fieldset class="tray-toggles">
      <legend>Candidates in the tray</legend>
      {#each TRAY_CANDIDATES as c (c.id)}<label class="tray-toggle"
          ><input
            type="checkbox"
            checked={enabled[c.id]}
            disabled={enabled[c.id] && keptCount <= 2}
            onchange={(e) => update({ [c.id]: e.currentTarget.checked })}
          />{c.label}</label
        >{/each}
    </fieldset>
  </div>
  <blockquote class="scored-message">{current.text}</blockquote>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 340 {40 + 34 * rows.length}"
      role="img"
      aria-label={`Message: ${current.text} ${rows.map((r) => `${r.label} ${pct(r.probability)}`).join(", ")}.`}
    >
      <title>Probability for each candidate still in the tray</title>
      {#each rows as row, i (row.id)}
        <text x="4" y={30 + 34 * i} font-size="13">{row.label}</text>
        <rect
          x="150"
          y={16 + 34 * i}
          width="150"
          height="20"
          fill="#eef1ea"
        />
        <rect
          x="150"
          y={16 + 34 * i}
          width={150 * row.probability}
          height="20"
          fill={row.id === leader.id ? "#397354" : "#9db59a"}
        />
        <text x="306" y={31 + 34 * i} font-size="13">{pct(row.probability)}</text>
      {/each}
    </svg>
  </div>
  <div class="visual-actions">
    <button
      class="button"
      onclick={() => update({ showSum: !showSum })}
      aria-expanded={showSum}>{showSum ? "Hide" : "Why do the bars always add to 100%?"}</button
    ><button class="button ghost" onclick={() => onupdate({})}
      >Restore all six answers</button
    >
  </div>
  <div class="visual-result" aria-live="polite" data-testid="tray-result">
    <strong>Top answer: {leader.label} at {pct(leader.probability)}.</strong>
    <span>{current.note}</span>
    {#if !enabled.unclear && !enabled.other}<span
        >With no escape answer, the model must put all of its probability on a
        real route, even for a message it cannot place.</span
      >{/if}
  </div>
  {#if showSum}<p class="visual-note">
      A choice question returns one probability per candidate, and they sum to
      1. This activity takes one fixed set of scores and spreads the
      probability again over the answers that remain. A real model would score
      the new list from scratch, and its numbers could move differently. Either
      way, a probability here means "out of these answers", not "out of
      everything that could be true".
    </p>{/if}
  <details>
    <summary>Read the probabilities as a table</summary>
    <div class="table-scroll">
      <table>
        <caption>{current.text}</caption><thead
          ><tr><th scope="col">Candidate</th><th scope="col">Probability</th></tr
          ></thead
        ><tbody
          >{#each rows as row (row.id)}<tr
              ><th scope="row">{row.label}</th><td
                >{row.probability.toFixed(2)}</td
              ></tr
            >{/each}</tbody
        >
      </table>
    </div>
  </details>
  <p class="visual-note">
    Invented scores for teaching, not output from any real model. Try the
    brakes message: billing and safety are both true. A single label hides one
    of them, which is why routes need a precedence rule (safety first) and a
    separate flag for the refund request.
  </p>
</VisualFrame>

<style>
  .scored-message {
    margin: 0;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid #9db59a;
    font-style: italic;
  }
  .tray-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    border: 0;
    padding: 0;
    margin: 0;
  }
  .tray-toggles legend {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .tray-toggle {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
  }
</style>
