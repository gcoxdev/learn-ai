/**
 * Runs learner Python in a Web Worker using Pyodide (CPython compiled to
 * WebAssembly). Nothing is downloaded until the learner presses Run; code and
 * output never leave the device. NumPy and other Pyodide packages load on
 * demand from the same CDN when a program imports them.
 */
export const PYODIDE_VERSION = "0.29.3";
const INDEX = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const RUN_TIMEOUT_MS = 30_000;
const BOOT_TIMEOUT_MS = 120_000;

export type RuntimeStatus = "idle" | "loading" | "ready" | "failed";
export type OutputChunk = { stream: "stdout" | "stderr"; text: string };

const workerSource = `
let py = null;
const boot = (async () => {
  importScripts(${JSON.stringify(INDEX + "pyodide.js")});
  py = await loadPyodide({ indexURL: ${JSON.stringify(INDEX)} });
})();
boot.then(
  () => self.postMessage({ type: "ready" }),
  (e) => self.postMessage({ type: "fatal", text: String((e && e.message) || e) }),
);
self.onmessage = async (event) => {
  const { id, code } = event.data;
  try {
    await boot;
    py.setStdout({ batched: (text) => self.postMessage({ id, type: "out", stream: "stdout", text }) });
    py.setStderr({ batched: (text) => self.postMessage({ id, type: "out", stream: "stderr", text }) });
    await py.loadPackagesFromImports(code, { messageCallback: () => {}, errorCallback: () => {} });
    const globals = py.globals.get("dict")();
    try {
      await py.runPythonAsync(code, { globals });
    } finally {
      globals.destroy();
    }
    self.postMessage({ id, type: "done" });
  } catch (e) {
    self.postMessage({ id, type: "error", text: String((e && e.message) || e) });
  }
};
`;

let worker: Worker | null = null;
let status: RuntimeStatus = "idle";
let bootPromise: Promise<void> | null = null;
let nextId = 1;
const listeners = new Set<(s: RuntimeStatus) => void>();
const pending = new Map<
  number,
  {
    onOutput: (chunk: OutputChunk) => void;
    resolve: (r: { ok: boolean; error?: string }) => void;
  }
>();

function setStatus(next: RuntimeStatus) {
  status = next;
  for (const l of listeners) l(next);
}
export function runtimeStatus() {
  return status;
}
export function onRuntimeStatus(listener: (s: RuntimeStatus) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function reset(reason: string) {
  worker?.terminate();
  worker = null;
  bootPromise = null;
  for (const [, p] of pending) p.resolve({ ok: false, error: reason });
  pending.clear();
  setStatus("idle");
}

function start(): Promise<void> {
  if (bootPromise) return bootPromise;
  setStatus("loading");
  const url = URL.createObjectURL(
    new Blob([workerSource], { type: "text/javascript" }),
  );
  worker = new Worker(url);
  URL.revokeObjectURL(url);
  bootPromise = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reset("Python took too long to start. Check your connection and try again.");
      setStatus("failed");
      reject(new Error("timeout"));
    }, BOOT_TIMEOUT_MS);
    worker!.onmessage = (event) => {
      const data = event.data;
      if (data.type === "ready") {
        clearTimeout(timer);
        setStatus("ready");
        resolve();
        return;
      }
      if (data.type === "fatal") {
        clearTimeout(timer);
        const message = `Python could not start: ${data.text}`;
        reset(message);
        setStatus("failed");
        reject(new Error(message));
        return;
      }
      const job = pending.get(data.id);
      if (!job) return;
      if (data.type === "out")
        job.onOutput({ stream: data.stream, text: data.text });
      else if (data.type === "done") {
        pending.delete(data.id);
        job.resolve({ ok: true });
      } else if (data.type === "error") {
        pending.delete(data.id);
        job.resolve({ ok: false, error: tidyTraceback(data.text) });
      }
    };
    worker!.onerror = () => {
      clearTimeout(timer);
      reset("Python could not start. Check your connection and try again.");
      setStatus("failed");
      reject(new Error("worker error"));
    };
  });
  return bootPromise;
}

/** Keep the learner-relevant end of a Pyodide traceback. */
export function tidyTraceback(text: string): string {
  const lines = text.trim().split("\n");
  const first = lines.findIndex((l) => l.includes('File "<exec>"'));
  const kept = first >= 0 ? ["Traceback (most recent call last):", ...lines.slice(first)] : lines.slice(-4);
  return kept.join("\n").replaceAll('File "<exec>"', "File \"your code\"");
}

export async function runPython(
  code: string,
  onOutput: (chunk: OutputChunk) => void,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await start();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const id = nextId++;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      reset(
        `Stopped after ${RUN_TIMEOUT_MS / 1000} seconds. Look for a loop that never ends, then run again.`,
      );
    }, RUN_TIMEOUT_MS);
    pending.set(id, {
      onOutput,
      resolve: (r) => {
        clearTimeout(timer);
        resolve(r);
      },
    });
    worker!.postMessage({ id, code });
  });
}
