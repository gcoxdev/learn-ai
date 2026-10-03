import { mount, unmount } from "svelte";
import CodeRunner from "./components/CodeRunner.svelte";

/**
 * Svelte action for rendered lesson HTML: attaches an in-browser Python runner
 * to every `.code-block.runnable`. Pass the HTML string so the action rescans
 * when the scene changes.
 */
export function runnableCode(node: HTMLElement, _html: string) {
  let mounted: ReturnType<typeof mount>[] = [];
  const clear = () => {
    for (const component of mounted) unmount(component);
    mounted = [];
  };
  const scan = () => {
    clear();
    for (const block of node.querySelectorAll<HTMLElement>(
      ".code-block.runnable",
    )) {
      const source = block.querySelector("code")?.textContent ?? "";
      mounted.push(
        mount(CodeRunner, { target: block, props: { block, source } }),
      );
    }
  };
  scan();
  return {
    update() {
      queueMicrotask(scan);
    },
    destroy: clear,
  };
}
