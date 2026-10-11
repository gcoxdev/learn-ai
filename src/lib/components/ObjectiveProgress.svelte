<script lang="ts">
  import type { Attempt, Objective } from "$lib/model";
  import { evidenceMessage, objectiveEvidence } from "$lib/evidence-progress";
  let {
    objective,
    attempts,
    compact = false,
  }: {
    objective: Objective;
    attempts: Attempt[];
    compact?: boolean;
  } = $props();
  const evidence = $derived(objectiveEvidence(objective, attempts));
</script>

<div class={["objective-progress", { compact }]}>
  <div class="evidence-label">
    <strong
      >{evidence.passed} of {evidence.total} passed</strong
    ><span
      >{evidence.complete
        ? "Passed"
        : evidence.passed
          ? "In progress"
          : evidence.tried
            ? "Practicing"
            : "Not started"}</span
    >
  </div>
  <progress
    max={evidence.total}
    value={evidence.passed}
    aria-label={`Quiz progress: ${objective.title}`}
  ></progress>
  {#if !compact}<p>{evidenceMessage(evidence)}</p>{/if}
</div>

<style>
  .objective-progress {
    margin: 0.8rem 0;
    padding: 0.85rem 1rem;
    border: 1px solid #d5dfcd;
    border-radius: 8px;
    background: #f2f6eb;
    color: #344e39;
  }
  .evidence-label {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
    justify-content: space-between;
    font-size: 0.8rem;
    line-height: 1.6;
  }
  .evidence-label span {
    color: #5a6654;
  }
  progress {
    display: block;
    width: 100%;
    height: 0.5rem;
    margin: 0.6rem 0;
    accent-color: #427655;
    border: none;
    border-radius: 4px;
    overflow: hidden;
    background: #dfe6d7;
  }
  progress::-webkit-progress-bar {
    background: #dfe6d7;
  }
  progress::-webkit-progress-value {
    background: #427655;
  }
  progress::-moz-progress-bar {
    background: #427655;
  }
  p {
    margin: 0.45rem 0 0;
    font-size: 0.8rem;
    line-height: 1.7;
  }
  .compact {
    padding: 0.6rem 0.8rem;
  }
</style>
