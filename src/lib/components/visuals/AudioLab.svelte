<script lang="ts">
  import { onDestroy } from "svelte";
  import VisualFrame from "./VisualFrame.svelte";
  import { visualNumber, type VisualValues } from "$lib/visual-state";
  import {
    audioWindowSeconds,
    sinePoints,
    toneGain,
    toneSeconds,
    visualDecimal,
  } from "$lib/system-visuals";
  let {
    values = {},
    onupdate,
  }: { values?: VisualValues; onupdate: (values: VisualValues) => void } =
    $props();
  const frequency = $derived(
    visualNumber(values, "frequency", 440, 220, 880, true),
  );
  const path = $derived(
    sinePoints(frequency)
      .map(
        ({ t, y }, i) =>
          `${i === 0 ? "M" : "L"}${24 + (272 * t) / audioWindowSeconds},${76 - 42 * y}`,
      )
      .join(" "),
  );
  let playing = $state(false);
  let audioMessage = $state("Sound stays off until you press Play.");
  let context: AudioContext | undefined;
  let oscillator: OscillatorNode | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let request = 0;
  let disposed = false;

  function stopTone() {
    request++;
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (oscillator) {
      oscillator.onended = null;
      try {
        oscillator.stop();
      } catch {
        /* The brief tone may already have ended. */
      }
      oscillator.disconnect();
      oscillator = undefined;
    }
    if (context) {
      void context.close().catch(() => {});
      context = undefined;
    }
    playing = false;
  }
  async function playTone() {
    stopTone();
    const thisRequest = request;
    if (typeof window.AudioContext !== "function") {
      audioMessage =
        "This browser cannot play this tone. The waveform and controls still work.";
      return;
    }
    try {
      const nextContext = new AudioContext();
      context = nextContext;
      await nextContext.resume();
      if (disposed || request !== thisRequest) {
        if (nextContext.state !== "closed")
          void nextContext.close().catch(() => {});
        return;
      }
      const node = nextContext.createOscillator();
      oscillator = node;
      const volume = nextContext.createGain();
      node.type = "sine";
      node.frequency.setValueAtTime(frequency, nextContext.currentTime);
      const now = nextContext.currentTime;
      volume.gain.setValueAtTime(0, now);
      volume.gain.linearRampToValueAtTime(toneGain, now + 0.015);
      volume.gain.setValueAtTime(toneGain, now + toneSeconds - 0.06);
      volume.gain.linearRampToValueAtTime(0, now + toneSeconds);
      node.connect(volume);
      volume.connect(nextContext.destination);
      node.start(now);
      node.stop(now + toneSeconds);
      node.onended = () => {
        if (request === thisRequest) {
          audioMessage =
            "Tone finished. Change the frequency and predict the new pitch.";
          stopTone();
        }
      };
      playing = true;
      audioMessage = `Playing a ${frequency} Hz sine tone for ${toneSeconds} seconds.`;
      timer = setTimeout(() => {
        if (request === thisRequest) {
          audioMessage = "Tone finished.";
          stopTone();
        }
      }, 1000);
    } catch {
      if (request === thisRequest) {
        stopTone();
        audioMessage =
          "Audio was unavailable. You can still compare the calculated waves visually.";
      }
    }
  }
  function updateFrequency(next: number) {
    stopTone();
    audioMessage = "Frequency changed. Press Play to hear this setting.";
    onupdate({ frequency: next });
  }
  function stopByUser() {
    stopTone();
    audioMessage = "Sound stopped.";
  }
  function hide() {
    if (document.hidden) stopByUser();
  }
  onDestroy(() => {
    disposed = true;
    stopTone();
  });
</script>

<svelte:window onpagehide={stopByUser} />
<svelte:document onvisibilitychange={hide} />

<VisualFrame
  title="See a pitch, then hear it"
  label="Audio waveform experiment"
  prompt="Predict what will happen to the wave when the frequency doubles. Will it fit more cycles into the same slice of time?"
>
  <p class="visual-note">
    A <strong>waveform</strong> shows a signal changing over time. One
    <strong>cycle</strong>
    is a full repeat. Frequency counts cycles each second; <strong>Hz</strong> means
    “per second.” This is a computed sine tone, not generated speech.
  </p>
  <div class="visual-canvas">
    <svg
      viewBox="0 0 320 155"
      role="img"
      aria-label={`${frequency} Hz sine wave: ${visualDecimal(frequency * audioWindowSeconds)} cycles in ten milliseconds`}
    >
      <path
        d="M24 27 V121 H296 M24 76 H296"
        fill="none"
        stroke="#b8c5ab"
        stroke-width="1.3"
      />
      <path
        d="M160 30 V121 M296 30 V121"
        stroke="#dde4d5"
        stroke-dasharray="3 4"
      />
      <path d={path} fill="none" stroke="#306d50" stroke-width="2.5" />
      <text x="24" y="18" font-size="15">Signal value</text>
      <text x="24" y="141" font-size="15" text-anchor="middle">0</text>
      <text x="160" y="141" font-size="15" text-anchor="middle">5 ms</text>
      <text x="296" y="141" font-size="15" text-anchor="end">10 ms</text>
    </svg>
  </div>
  <div class="visual-controls">
    <label
      ><strong>Frequency: {frequency} Hz</strong>
      <input
        type="range"
        min="220"
        max="880"
        step="1"
        value={frequency}
        aria-label="Tone frequency"
        oninput={(event) => updateFrequency(+event.currentTarget.value)}
      />
    </label>
  </div>
  <div class="visual-actions">
    <button class="button primary small" onclick={playTone} disabled={playing}
      >Play brief tone</button
    >
    <button
      class="button secondary small"
      onclick={stopByUser}
      disabled={!playing}>Stop tone</button
    >
    <button class="button secondary small" onclick={() => updateFrequency(440)}
      >Reset to 440 Hz</button
    >
  </div>
  <p class="visual-note">
    Playback lasts 0.65 seconds at a fixed, low digital amplitude; your device
    controls listening volume. Changing frequency stops playback. Nothing plays
    automatically.
  </p>
  <div class="visual-result" role="status">
    <strong
      >{visualDecimal(frequency * audioWindowSeconds)} cycles fit in the same 10 ms
      window.</strong
    ><span>{audioMessage}</span>
  </div>
  <details>
    <summary>See the numbers</summary>
    <p>
      The drawn signal is sin(2π × {frequency} × t), where t is time in seconds. The
      window lasts 0.01 seconds, so it contains {frequency} × 0.01 = {visualDecimal(
        frequency * audioWindowSeconds,
      )} cycles. Playback uses a sine oscillator at this same frequency, with a short
      fade at its beginning and end.
    </p>
    <p>
      Frequency is different from sample rate. Frequency describes the wave’s
      repetitions; sample rate describes how often a device records or produces
      values. The browser chooses the output sample rate. The 401 points used to
      draw this curve are display coordinates, not the audio sample rate.
    </p>
  </details>
  <p class="visual-note">
    Explain it: why does raising frequency fit more waves into the picture
    without increasing the drawn height? This experiment is practice; it does
    not award mastery.
  </p>
</VisualFrame>
