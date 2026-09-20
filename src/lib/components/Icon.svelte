<script lang="ts">
  let { name, size = 20 }: { name: string; size?: number } = $props();
  const paths: Record<string, string> = {
    home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    book: "M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3ZM12 6v15",
    map: "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16",
    chart: "M4 3v17h17M8 15v-4M13 15V7M18 15V4",
    search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    left: "M20 12H4m6-6-6 6 6 6",
    chevron: "m9 5 7 7-7 7",
    check: "m5 12 4 4L19 6",
    clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    layers: "m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5",
    chat: "M21 11a9 9 0 0 1-9 9H5l-3 2V11a9 9 0 0 1 19 0ZM7 10h10M7 14h6",
    image: "M3 3h18v18H3ZM3 16l5-5 5 5 4-4 4 4M16 7h.01",
    video: "M3 5h13v14H3ZM16 9l5-3v12l-5-3",
    audio: "M3 10v4M7 6v12M11 3v18M15 7v10M19 5v14M23 10v4",
    robot: "M5 7h14v13H5ZM12 3v4M9 11h.01M15 11h.01M9 16h6M2 11v5M22 11v5",
    tools: "M4 4h6v6H4ZM14 14h6v6h-6ZM10 7h7v7M7 10v7h7",
    chip: "M6 6h12v12H6ZM9 9h6v6H9ZM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4",
    spark:
      "m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7ZM20 2v4M18 4h4",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    upload: "M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5",
    bookmark: "M5 3h14v18l-7-4-7 4Z",
    close: "m6 6 12 12M6 18 18 6",
    menu: "M4 6h16M4 12h16M4 18h16",
    list: "M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01",
    lock: "M6 10h12v11H6ZM8 10V6a4 4 0 0 1 8 0v4",
    reset: "M3 10a9 9 0 1 1 1 8M3 3v7h7",
    play: "m8 4 12 8-12 8Z",
    info: "M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    external: "M14 3h7v7M10 14 21 3M10 3H3v18h18v-7",
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"><path d={paths[name] ?? paths.spark} /></svg
>
