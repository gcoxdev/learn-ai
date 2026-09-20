<script lang="ts">
  import VisualFrame from "./VisualFrame.svelte";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (v: VisualValues) => void } = $props();
  const milestones = [
    {
      date: "1943",
      title: "Idealized neural units",
      kind: "Mathematical abstraction",
      question:
        "Could simplified neuron-like units express logical calculations?",
      evidence:
        "McCulloch and Pitts connected idealized units to logical computation. This was a mathematical account, not a complete simulation of a brain.",
      keep: "Separate a useful abstraction from the whole biological system.",
    },
    {
      date: "1950",
      title: "A question about intelligence",
      kind: "Conceptual argument",
      question:
        "How might machine intelligence be discussed and examined through behavior?",
      evidence:
        "Turing's paper explored the question through arguments and a behavioral framing. Its role differs from a trained model or a benchmark result.",
      keep: "A way to frame a question is different from a demonstrated capability.",
    },
    {
      date: "1955 / 1956",
      title: "An organized research agenda",
      kind: "Research proposal",
      question:
        "Could a summer research project investigate aspects of intelligence computationally?",
      evidence:
        "The Dartmouth proposal was written in 1955 for the summer of 1956. Its ambitions described research to pursue, not capabilities already achieved.",
      keep: "Read a proposal's goals in the future tense.",
    },
    {
      date: "2012",
      title: "An image-recognition milestone",
      kind: "Measured task result",
      question: "What improved image recognition on a large labeled benchmark?",
      evidence:
        "The AlexNet ImageNet result joined architecture, data, optimization, and computation. Success on that evaluated task did not establish every kind of intelligence.",
      keep: "Ask which task and evidence support the claim.",
    },
    {
      date: "2017",
      title: "Attention as an architecture",
      kind: "Architecture and experiments",
      question:
        "Could attention-based computation support sequence-to-sequence tasks?",
      evidence:
        "The Transformer paper introduced an architecture and reported experiments. Later pretraining and applications build on mechanisms that need their own evidence.",
      keep: "Distinguish a computation's design from the way it is trained or used.",
    },
  ];
  const index = $derived(
    visualNumber(values, "milestone", 0, 0, milestones.length - 1, true),
  );
  const chosen = $derived(milestones[index]);
</script>

<VisualFrame
  title="Dates tell you when. Evidence tells you what."
  label="AI history timeline"
  prompt="Choose a landmark and ask: is this a proposed goal, a way of thinking, or a measured result?"
>
  <ol class="milestones">
    {#each milestones as item, i (item.date)}<li>
        <button
          aria-pressed={index === i}
          class:chosen={index === i}
          onclick={() => onupdate({ milestone: i })}
          ><span>{item.date}</span><strong>{item.title}</strong></button
        >
      </li>{/each}
  </ol>
  <div class="visual-result" aria-live="polite">
    <strong>{chosen.kind}</strong><span>{chosen.question}</span><span
      >{chosen.evidence}</span
    ><strong>{chosen.keep}</strong>
  </div>
  <p class="visual-note">
    This is a selection of landmarks from the lesson, not a complete history.
    Rows are equally spaced for reading; their spacing is not elapsed time. A
    later date does not make an earlier tradition obsolete.
  </p>
</VisualFrame>

<style>
  .milestones {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: grid;
    gap: 0.55rem;
  }
  .milestones li {
    padding-left: 1.1rem;
    border-left: 2px solid #9caf94;
    position: relative;
  }
  .milestones li::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #527345;
    border: 2px solid #f4f6ed;
    position: absolute;
    left: -7px;
    top: 18px;
  }
  .milestones button {
    width: 100%;
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 0.7rem;
    text-align: left;
    padding: 0.7rem;
    border: 1px solid #bac7ae;
    border-radius: 7px;
    background: #fffefa;
    color: #2d4832;
    cursor: pointer;
    line-height: 1.5;
  }
  .milestones button.chosen {
    background: #dfead2;
    border-color: #385f3c;
  }
  .milestones span {
    font-size: 0.8rem;
  }
  .milestones strong {
    font-size: 0.85rem;
  }
  @media (max-width: 520px) {
    .milestones button {
      grid-template-columns: 1fr;
      gap: 0.2rem;
    }
  }
</style>
