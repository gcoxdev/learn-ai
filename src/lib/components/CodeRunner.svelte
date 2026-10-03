<script module lang="ts">
  let counter = 0;
</script>

<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import {
    onRuntimeStatus,
    runPython,
    runtimeStatus,
    type OutputChunk,
    type RuntimeStatus,
  } from "$lib/python-runtime";

  let { block, source }: { block: HTMLElement; source: string } = $props();
  const uid = `py-${++counter}`;

  let code = $state(untrack(() => source));
  let editing = $state(false);
  let running = $state(false);
  let output = $state<OutputChunk[]>([]);
  let error = $state<string | null>(null);
  let ran = $state(false);
  let status = $state<RuntimeStatus>(runtimeStatus());
  let editor = $state<HTMLTextAreaElement | undefined>();
  const stop = onRuntimeStatus((s) => (status = s));
  onDestroy(() => {
    stop();
  });

  $effect(() => {
    const pre = block.querySelector("pre");
    if (pre) pre.hidden = editing;
  });

  const changed = $derived(code !== source);
  const lineCount = $derived(Math.min(24, Math.max(4, code.split("\n").length + 1)));

  async function run() {
    if (running) return;
    running = true;
    ran = true;
    output = [];
    error = null;
    const result = await runPython(code, (chunk) => {
      const last = output.at(-1);
      if (last && last.stream === chunk.stream)
        output[output.length - 1] = { ...last, text: last.text + "\n" + chunk.text };
      else output.push(chunk);
    });
    if (!result.ok) error = result.error ?? "Something went wrong.";
    running = false;
  }
  function edit() {
    editing = true;
    queueMicrotask(() => editor?.focus());
  }
  function resetCode() {
    code = source;
    output = [];
    error = null;
    ran = false;
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      run();
    } else if (event.key === "Tab" && !event.shiftKey && editor) {
      event.preventDefault();
      const { selectionStart: a, selectionEnd: b } = editor;
      code = code.slice(0, a) + "    " + code.slice(b);
      queueMicrotask(() => editor && (editor.selectionStart = editor.selectionEnd = a + 4));
    } else if (event.key === "Escape") {
      editing = false;
    }
  }
</script>

<div class="runner">
  <div class="runner-bar">
    <button class="runner-run" onclick={run} disabled={running} aria-describedby={ran ? undefined : `${uid}-note`}>
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
      {running ? (status === "loading" ? "Starting Python…" : "Running…") : ran ? "Run again" : "Run"}
    </button>
    {#if !editing}<button class="runner-ghost" onclick={edit}>Edit code</button>
    {:else}<button class="runner-ghost" onclick={() => (editing = false)}>Done editing</button>{/if}
    {#if changed || ran}<button class="runner-ghost" onclick={resetCode}>Reset</button>{/if}
  </div>
  {#if editing}
    <label class="visually-hidden" for={`${uid}-editor`}>Python code editor</label>
    <textarea
      id={`${uid}-editor`}
      bind:this={editor}
      bind:value={code}
      rows={lineCount}
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      onkeydown={keydown}
    ></textarea>
    <p class="runner-tip">Tab indents · Ctrl/⌘ + Enter runs · Esc closes the editor</p>
  {/if}
  {#if running && status === "loading"}
    <p class="runner-status" role="status">
      Starting Python in your browser. The first run downloads about 10 MB; later runs are instant.
    </p>
  {/if}
  {#if ran && !(running && status === "loading")}
    <div class="runner-output" aria-live="polite">
      <span class="runner-output-label">Output</span>
      {#if output.length === 0 && !error && !running}<pre class="quiet">(no output: add a print() to see results)</pre>{/if}
      {#each output as chunk, i (i)}<pre class={chunk.stream}>{chunk.text}</pre>{/each}
      {#if error}<pre class="stderr">{error}</pre>{/if}
    </div>
  {/if}
  {#if !ran}<p class="runner-note" id={`${uid}-note`}>
      Real Python runs in your browser (Pyodide). Your code never leaves your device.
    </p>{/if}
</div>

<style>
  .runner {
    border-top: 1px solid #dfe6d6;
    padding: 10px 14px 12px;
    background: #f7f9f3;
  }
  .runner-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  button {
    font: inherit;
    font-size: 12.5px;
    cursor: pointer;
    border-radius: 999px;
    padding: 6px 14px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .runner-run {
    background: #193c32;
    color: #f4f8ee;
    border: 1px solid #193c32;
    font-weight: 600;
  }
  .runner-run:disabled {
    opacity: 0.75;
    cursor: progress;
  }
  .runner-ghost {
    background: #fff;
    border: 1px solid #cfdac4;
    color: #31543c;
  }
  button:focus-visible,
  textarea:focus-visible {
    outline: 3px solid #9fc28c;
    outline-offset: 2px;
  }
  textarea {
    display: block;
    width: 100%;
    margin-top: 10px;
    padding: 12px 14px;
    border: 1px solid #cfdac4;
    border-radius: 8px;
    background: #fff;
    color: #2c3a2f;
    font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 12.5px;
    line-height: 1.7;
    tab-size: 4;
    resize: vertical;
    white-space: pre;
    overflow-x: auto;
  }
  .runner-tip,
  .runner-note,
  .runner-status {
    margin: 8px 2px 0 !important;
    font-size: 11.5px !important;
    line-height: 1.5 !important;
    color: #6b7369;
  }
  .runner-status {
    color: #8a5a1f;
  }
  .runner-output {
    margin-top: 10px;
    border-radius: 8px;
    background: #1e2d25;
    padding: 10px 14px 12px;
  }
  .runner-output-label {
    display: block;
    font-size: 10px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #9fb99a;
    margin-bottom: 4px;
  }
  .runner .runner-output pre {
    margin: 0;
    padding: 0;
    background: none;
    color: #e8f0e2;
    font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 12.5px;
    line-height: 1.65;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    border: 0;
    border-radius: 0;
  }
  .runner .runner-output pre.stderr {
    color: #ffb4a8;
  }
  .runner .runner-output pre.quiet {
    color: #9fb99a;
    font-style: italic;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
