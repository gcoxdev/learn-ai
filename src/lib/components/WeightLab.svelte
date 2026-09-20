<script lang="ts">
  import VisualFrame from "./visuals/VisualFrame.svelte";
  let guests = $state(3);
  let weight = $state(2);
  const crackers = $derived(guests * weight);
  const needleX = $derived(170 - 47 * Math.cos((weight / 5) * Math.PI));
  const needleY = $derived(70 - 47 * Math.sin((weight / 5) * Math.PI));
</script>

<VisualFrame
  title="A rule with one adjustable number"
  label="Change an input or a weight"
  prompt="Keep the guests fixed. Can you change the rule so each guest gets three crackers? Predict the total, then try it."
>
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
  <div class="visual-canvas">
    <svg
      viewBox={`0 0 340 ${guests > 3 ? 380 : 265}`}
      role="img"
      aria-label={`${guests} guests, with ${weight} crackers on each plate: ${crackers} crackers altogether. The dial shows the weight, ${weight} crackers per guest.`}
    >
      <path
        d="M123 70a47 47 0 0 1 94 0"
        fill="none"
        stroke="#bdcbb3"
        stroke-width="8"
      />
      <line
        x1="170"
        y1="70"
        x2={needleX}
        y2={needleY}
        stroke="#397354"
        stroke-width="4"
        stroke-linecap="round"
      /><circle cx="170" cy="70" r="5" fill="#397354" />
      <text x="109" y="79" text-anchor="middle" font-size="14">0</text><text
        x="231"
        y="79"
        text-anchor="middle"
        font-size="14">5</text
      >
      <text
        x="170"
        y="105"
        text-anchor="middle"
        font-size="16"
        font-weight="600">Weight: {weight} crackers per guest</text
      >
      {#if guests === 0}<text
          x="170"
          y="178"
          text-anchor="middle"
          font-size="17">No guests → no plates → 0 crackers</text
        >{/if}
      {#each Array.from({ length: guests }, (_, i) => i) as guest (guest)}
        <g
          transform={`translate(${(guest % 3) * 110 + 5}, ${Math.floor(guest / 3) * 115 + 132})`}
        >
          <circle cx="55" cy="13" r="12" fill="#d5bd91" stroke="#76684f" />
          <path
            d="M33 47v-7c0-17 44-17 44 0v7"
            fill="#819a72"
            stroke="#526a49"
          />
          <ellipse
            cx="55"
            cy="66"
            rx="43"
            ry="23"
            fill="#fffefa"
            stroke="#83967a"
            stroke-width="2"
          />
          <ellipse
            cx="55"
            cy="66"
            rx="35"
            ry="17"
            fill="none"
            stroke="#d8dfcd"
          />
          {#each Array.from({ length: weight }, (_, i) => i) as cracker (cracker)}
            <rect
              x={cracker < 3 ? 35 + cracker * 15 : 43 + (cracker - 3) * 15}
              y={cracker < 3 ? 53 : 69}
              width="11"
              height="11"
              rx="2"
              fill="#d6a34e"
              stroke="#936932"
            />
          {/each}
          <text x="55" y="107" text-anchor="middle" font-size="14"
            >Guest {guest + 1}: {weight}</text
          >
        </g>
      {/each}
    </svg>
  </div>
  <p>
    Keep the weight fixed to ask about a different group. Keep the guests fixed
    to see what changing the rule does. Controls reset when you leave this
    activity. These controls show a calculation; they do not train a model.
  </p>
  <div class="visual-actions">
    <button
      class="button secondary"
      onclick={() => {
        guests = 3;
        weight = 2;
      }}>Reset experiment</button
    >
  </div>
</VisualFrame>

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
</style>
