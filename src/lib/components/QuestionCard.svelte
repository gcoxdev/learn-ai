<script lang="ts">
  import { grade } from "$lib/engine";
  import type { Question, Responses } from "$lib/model";
  import Icon from "./Icon.svelte";
  let {
    question,
    responses = {},
    onchange,
    onanswer,
    onhint,
    oncontinue,
    practice = false,
    exposed = false,
  }: {
    question: Question;
    responses?: Responses;
    onchange: (r: Responses) => void;
    onanswer: (responses: Responses, hinted: boolean) => void;
    onhint?: () => void;
    oncontinue?: () => void;
    practice?: boolean;
    exposed?: boolean;
  } = $props();
  let answered = $state(false);
  let correct = $state(false);
  let hint = $state(false);
  let revealed = $state(false);
  const complete = $derived(
    Object.keys(question.answers).every(
      (key) => (responses[key] ?? "").trim().length > 0,
    ),
  );
  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!complete || answered) return;
    correct = grade(question, responses);
    answered = true;
    onanswer(responses, hint || revealed || exposed);
  }
  function showExample() {
    revealed = true;
    answered = true;
    correct = false;
    onhint?.();
    onanswer(responses, true);
  }
</script>

<form class="question-card" onsubmit={submit}>
  <div class="question-kicker">
    <Icon name={practice ? "spark" : "check"} size={16} />{practice
      ? "PAUSE & THINK"
      : question.transfer
        ? "APPLY THE IDEA"
        : "CHECK YOUR UNDERSTANDING"}
  </div>
  <p class="question-prompt">{question.prompt}</p>
  <fieldset disabled={answered}>
    <legend class="sr-only">Your response</legend>
    {#if question.fields.length}
      <div class="numeric-fields">
        {#each question.fields as field (field.id)}<label
            >{field.label}<input
              inputmode="decimal"
              autocomplete="off"
              value={responses[field.id] ?? ""}
              oninput={(e) =>
                onchange({ ...responses, [field.id]: e.currentTarget.value })}
            /></label
          >{/each}
      </div>
    {/if}
    {#if question.options.length}
      {#if question.kind === "structured"}<p class="reason-label">
          Choose the explanation that matches your calculation.
        </p>{/if}
      <div class="answer-options">
        {#each question.options as option (option.id)}
          <label class={{ selected: responses.choice === option.id }}
            ><input
              type="radio"
              name={question.id}
              value={option.id}
              checked={responses.choice === option.id}
              onchange={() => onchange({ ...responses, choice: option.id })}
            /><span>{option.text}</span></label
          >
        {/each}
      </div>
    {/if}
  </fieldset>
  {#if (hint || exposed) && !answered}<p class="hint-box">
      <strong>A little help:</strong>
      {question.hint}<span>This attempt will count as practice.</span>
    </p>{/if}
  {#if answered}
    <div
      class={["answer-feedback", correct ? "correct" : "review"]}
      role="status"
    >
      <strong
        >{revealed
          ? "Worked example"
          : correct
            ? "That’s right."
            : "A useful place to revisit."}</strong
      >
      <p>{question.feedback}</p>
      {#if hint || exposed}<small
          >This is practice. A fresh, unassisted check can supply mastery
          evidence.</small
        >{/if}
    </div>
    {#if oncontinue}<button
        class="button primary"
        type="button"
        onclick={oncontinue}>Continue <Icon name="arrow" size={17} /></button
      >{/if}
  {:else}
    <div class="question-actions">
      <button class="button primary" type="submit" disabled={!complete}
        >Check answer <Icon name="arrow" size={17} /></button
      >
      <button
        class="text-button"
        type="button"
        onclick={() => {
          hint = true;
          onhint?.();
        }}>Give me a hint</button
      >
      {#if practice}<button
          class="text-button"
          type="button"
          onclick={showExample}>Show worked example</button
        >{/if}
    </div>
  {/if}
</form>
