<script lang="ts">
  import type { Component } from "svelte";
  import type { Scene } from "$lib/model";
  import type { VisualKind, VisualValues } from "$lib/visual-state";
  type Props = {
    values: VisualValues;
    onupdate: (values: VisualValues) => void;
  };
  const loaders: Record<
    VisualKind,
    () => Promise<{ default: Component<Props> }>
  > = {
    "input-output": () => import("./InputOutputLab.svelte"),
    "training-inference": () => import("./TrainingInferenceLab.svelte"),
    "data-splits": () => import("./DataSplitLab.svelte"),
    "neural-network": () => import("./NetworkLab.svelte"),
    "network-layers": () => import("./LayeredNetworkLab.svelte"),
    clustering: () => import("./ClusteringLab.svelte"),
    "beam-search": () => import("./BeamSearchLab.svelte"),
    "kv-cache": () => import("./KVCacheLab.svelte"),
    "learning-rate": () => import("./LearningRateLab.svelte"),
    bayes: () => import("./BayesLab.svelte"),
    threshold: () => import("./ThresholdLab.svelte"),
    convolution: () => import("./ConvolutionLab.svelte"),
    bias: () => import("./BiasLab.svelte"),
    derivative: () => import("./DerivativeLab.svelte"),
    "chain-rule": () => import("./ChainRuleLab.svelte"),
    "parameter-training": () => import("./ParameterTrainingLab.svelte"),
    tokenizer: () => import("./TokenizerLab.svelte"),
    video: () => import("./VideoLab.svelte"),
    audio: () => import("./AudioLab.svelte"),
    robot: () => import("./RobotLab.svelte"),
    lifecycle: () => import("./LifecycleLab.svelte"),
    history: () => import("./HistoryLab.svelte"),
    evaluation: () => import("./EvaluationLab.svelte"),
    "image-noise": () => import("./ImageNoiseLab.svelte"),
    "answer-tray": () => import("./AnswerTrayLab.svelte"),
    "confidence-dial": () => import("./ConfidenceDialLab.svelte"),
    "help-desk": () => import("./HelpDeskLab.svelte"),
  };
  let {
    figure,
    values,
    onupdate,
    disabled = false,
  }: {
    figure: NonNullable<Scene["figure"]>;
    values: VisualValues;
    onupdate: (values: VisualValues) => void;
    disabled?: boolean;
  } = $props();
  let retry = $state(0);
  const activity = $derived.by(() => {
    void retry;
    return loaders[figure.kind]();
  });
</script>

<div class="visual-activity" data-visual={figure.kind}>
  <fieldset {disabled} class="activity-controls">
    <legend class="sr-only">Interactive illustration</legend>
    {#await activity}
      <div class="visual-fallback">
        <p>{figure.description}</p>
        <p>Loading the interactive illustration…</p>
      </div>
    {:then loaded}
      <loaded.default {values} {onupdate} />
    {:catch}
      <div class="visual-fallback">
        <p>{figure.description}</p>
        <p>The interactive illustration could not load.</p>
        <button class="button" onclick={() => retry++}>Try loading again</button
        >
      </div>
    {/await}
  </fieldset>
  <p class="figure-caption">{figure.caption}</p>
  <p class="figure-persistence">
    Your experiment settings are saved with this lesson. Exploring is practice;
    knowledge checks provide mastery evidence.
  </p>
</div>

<style>
  .visual-activity {
    margin: 1.4rem 0;
    min-width: 0;
  }
  .activity-controls {
    display: block;
    min-width: 0;
    padding: 0;
    margin: 0;
    border: 0;
  }
  .visual-fallback {
    padding: 1rem;
    background: #f0f3e9;
    border-radius: 8px;
    font-size: 0.9rem;
    line-height: 1.7;
  }
  .figure-caption {
    font-size: 0.84rem;
    line-height: 1.7;
    margin: 0.7rem 0.2rem 0.3rem;
    color: #40553d;
  }
  .figure-persistence {
    font-size: 0.73rem;
    line-height: 1.6;
    margin: 0.3rem 0.2rem 0;
    color: #52634c;
  }
</style>
