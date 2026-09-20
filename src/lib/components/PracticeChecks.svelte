<script lang="ts">
  import { getLearner } from "$lib/learner.svelte";
  import type { Lesson, Responses } from "$lib/model";
  import QuestionCard from "./QuestionCard.svelte";
  let { lesson }: { lesson: Lesson } = $props();
  const learner = getLearner();
  const available = $derived(
    lesson.questions.filter(
      (q) => !q.retired && learner.data.exposures.includes(q.id),
    ),
  );
  let selected = $state("");
  let responses = $state<Responses>({});
  let result = $state<boolean | null>(null);
  const question = $derived(available.find((q) => q.id === selected));
  function choose(id: string) {
    selected = id;
    responses = {};
    result = null;
  }
</script>

{#if available.length}
  <details class="practice-checks">
    <summary>Practice a previous check</summary>
    <p>
      Revisit questions you have already seen, as often as you like. These
      attempts are saved as practice and do not add independent checks.
    </p>
    <label
      >Choose a practice question
      <select
        value={selected}
        onchange={(event) => choose(event.currentTarget.value)}
      >
        <option value="">Select a question…</option>
        {#each available as item, i (item.id)}<option value={item.id}
            >{i + 1}. {item.prompt}</option
          >{/each}
      </select>
    </label>
    {#if question}
      {#if result !== null}<div role="status" class="practice-result">
          <strong
            >{result
              ? "Practice check passed."
              : "Keep working with this example."}</strong
          >
          <p>{question.feedback}</p>
          <button class="button secondary" onclick={() => choose(selected)}
            >Try this practice again</button
          >
        </div>
      {:else}{#key selected}<QuestionCard
            {question}
            {responses}
            exposed={true}
            practice={true}
            onchange={(value) => (responses = value)}
            onhint={() => learner.expose(question.id)}
            onanswer={(answers, hinted) => {
              result = learner.answer(
                question,
                answers,
                hinted,
                "practice",
              ).correct;
            }}
          />{/key}{/if}
    {/if}
  </details>
{/if}

<style>
  .practice-checks {
    margin-top: 1.5rem;
    border-top: 1px solid #d8dfd1;
    padding-top: 1rem;
  }
  summary {
    cursor: pointer;
    color: #31543c;
    font-weight: 600;
  }
  p {
    font-size: 0.85rem;
    line-height: 1.7;
  }
  label {
    display: grid;
    gap: 0.5rem;
    font-size: 0.85rem;
  }
  select {
    width: 100%;
    min-width: 0;
    padding: 0.7rem;
    border: 1px solid #8fa084;
    border-radius: 6px;
    background: #fffefa;
    color: #294433;
  }
  .practice-result {
    margin-top: 1rem;
    padding: 1rem;
    background: #f2f6eb;
    border-radius: 8px;
  }
</style>
