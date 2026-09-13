<script lang="ts">
  let guests = $state(3);
  let weight = $state(2);
  const crackers = $derived(guests * weight);
</script>

<section class="lab" aria-label="Change an input or a weight">
  <h3>A rule with one adjustable number</h3>
  <p>
    Predict first, then change one control. These controls show a calculation;
    they do not train a model.
  </p>
  <label
    >Guests — the input: {guests}<input
      type="range"
      min="0"
      max="6"
      step="1"
      bind:value={guests}
      aria-label="Number of guests"
    /></label
  >
  <label
    >Crackers per guest — the weight: {weight}<input
      type="range"
      min="0"
      max="5"
      step="1"
      bind:value={weight}
      aria-label="Crackers per guest"
    /></label
  >
  <p aria-live="polite" data-testid="weight-result">
    <strong>{guests} × {weight} = {crackers} crackers</strong>
  </p>
  <div aria-hidden="true" class="cracker-groups">
    {#each Array.from({ length: guests }, (_, i) => i) as guest (guest)}<span
        >Guest {guest + 1}: {weight ? "● ".repeat(weight) : "none"}</span
      >{/each}
  </div>
  <p>
    Keep the weight fixed to ask about a different group. Keep the guests fixed
    to see what changing the rule does. Controls reset when you leave this
    activity.
  </p>
</section>

<style>
  label {
    display: block;
    margin: 1rem 0;
  }
  input {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
    accent-color: var(--green);
  }
  .cracker-groups {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }
  .cracker-groups span {
    padding: 0.5rem;
    background: #edf1e7;
    border-radius: 0.5rem;
  }
</style>
