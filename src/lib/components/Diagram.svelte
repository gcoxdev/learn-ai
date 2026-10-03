<script module lang="ts">
  let counter = 0;
</script>

<script lang="ts">
  import type { Diagram } from "$lib/model";

  let { diagram }: { diagram: Diagram } = $props();
  const uid = `diagram-${++counter}`;

  const CELL_W = 224;
  const CELL_H = 124;
  const BOX_W = 152;
  const PAD = 18;

  const tones: Record<string, { fill: string; stroke: string; ink: string }> = {
    plain: { fill: "#ffffff", stroke: "#b9c9ad", ink: "#26372e" },
    accent: { fill: "#193c32", stroke: "#193c32", ink: "#f4f8ee" },
    data: { fill: "#eef4fb", stroke: "#a9bfd6", ink: "#23405c" },
    warn: { fill: "#fbf4ea", stroke: "#e2bf8e", ink: "#6e4717" },
    muted: { fill: "#f3f3ef", stroke: "#cfd2c9", ink: "#5b5f58" },
  };

  // Approximate glyph widths keep text inside the box without measuring the DOM.
  const LABEL_CHARS = 16;
  const NOTE_CHARS = 21;
  const LABEL_LINE = 18;
  const NOTE_LINE = 15;

  /** Greedy word wrap; the last allowed line keeps whatever is left. */
  function wrap(text: string, width: number, maxLines: number) {
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
      if (!line) line = word;
      else if (line.length + 1 + word.length <= width || lines.length === maxLines - 1)
        line += ` ${word}`;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  const layout = $derived.by(() => {
    const cols = Math.max(...diagram.nodes.map((n) => n.col)) + 1;
    const rows = Math.max(...diagram.nodes.map((n) => n.row)) + 1;
    const boxes = new Map(
      diagram.nodes.map((n) => {
        const labelLines = wrap(n.label, LABEL_CHARS, 2);
        const noteLines = n.note ? wrap(n.note, NOTE_CHARS, 3) : [];
        const textH =
          labelLines.length * LABEL_LINE + noteLines.length * NOTE_LINE + (noteLines.length ? 4 : 0);
        const h = Math.max(46, textH + 20);
        const cx = PAD + n.col * CELL_W + CELL_W / 2;
        const cy = PAD + n.row * CELL_H + CELL_H / 2;
        // Baseline of the first label line, so the whole text block is centred.
        const top = cy - textH / 2 + 13;
        const noteTop = top + (labelLines.length - 1) * LABEL_LINE + 4 + NOTE_LINE;
        return [
          n.id,
          { ...n, cx, cy, w: BOX_W, h, x: cx - BOX_W / 2, y: cy - h / 2, labelLines, noteLines, top, noteTop },
        ];
      }),
    );
    return { width: cols * CELL_W + PAD * 2, height: rows * CELL_H + PAD * 2, boxes };
  });

  type Box = { cx: number; cy: number; w: number; h: number };
  /** Point where the ray from the box centre toward (tx, ty) leaves the box. */
  function exit(box: Box, tx: number, ty: number, gap = 5) {
    const dx = tx - box.cx;
    const dy = ty - box.cy;
    const sx = dx === 0 ? Infinity : (box.w / 2 + gap) / Math.abs(dx);
    const sy = dy === 0 ? Infinity : (box.h / 2 + gap) / Math.abs(dy);
    const s = Math.min(sx, sy);
    return { x: box.cx + dx * s, y: box.cy + dy * s };
  }

  const edges = $derived(
    diagram.edges.map((e) => {
      const a = layout.boxes.get(e.from)!;
      const b = layout.boxes.get(e.to)!;
      const bend = (e.bend ?? 0) * 34;
      const mx = (a.cx + b.cx) / 2;
      const my = (a.cy + b.cy) / 2;
      const len = Math.hypot(b.cx - a.cx, b.cy - a.cy) || 1;
      // Control point pushed perpendicular to the straight line.
      const qx = mx + (-(b.cy - a.cy) / len) * bend * 2;
      const qy = my + ((b.cx - a.cx) / len) * bend * 2;
      const start = bend ? exit(a, qx, qy) : exit(a, b.cx, b.cy);
      const end = bend ? exit(b, qx, qy, 9) : exit(b, a.cx, a.cy, 9);
      const path = bend
        ? `M${start.x},${start.y} Q${qx},${qy} ${end.x},${end.y}`
        : `M${start.x},${start.y} L${end.x},${end.y}`;
      // Midpoint of the drawn curve for the label.
      const lx = bend ? 0.25 * start.x + 0.5 * qx + 0.25 * end.x : (start.x + end.x) / 2;
      const ly = bend ? 0.25 * start.y + 0.5 * qy + 0.25 * end.y : (start.y + end.y) / 2;
      return { ...e, path, lx, ly, labelW: e.label ? e.label.length * 6.9 + 16 : 0 };
    }),
  );

  const nameOf = (id: string) => diagram.nodes.find((n) => n.id === id)?.label ?? id;
</script>

<div class="diagram">
<figure>
  <div class="diagram-scroll">
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      style={`min-width: ${Math.min(layout.width, 540)}px; max-width: ${layout.width}px`}
      role="img"
      aria-labelledby={`${uid}-title ${uid}-desc`}
    >
      <title id={`${uid}-title`}>{diagram.caption}</title>
      <desc id={`${uid}-desc`}>{diagram.description}</desc>
      <defs>
        <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#6f8a63" />
        </marker>
      </defs>
      {#each edges as e, i (i)}
        <path
          d={e.path}
          fill="none"
          stroke="#8aa27a"
          stroke-width="1.8"
          stroke-dasharray={e.dashed ? "6 5" : undefined}
          marker-end={`url(#${uid}-arrow)`}
        />
      {/each}
      {#each edges as e, i (i)}
        {#if e.label}
          <rect x={e.lx - e.labelW / 2} y={e.ly - 11} width={e.labelW} height="22" rx="11" fill="#f7f9f3" stroke="#dfe6d6" />
          <text x={e.lx} y={e.ly + 4} text-anchor="middle" class="edge-label">{e.label}</text>
        {/if}
      {/each}
      {#each [...layout.boxes.values()] as n (n.id)}
        {@const t = tones[n.tone]}
        <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="10" fill={t.fill} stroke={t.stroke} stroke-width="1.5" />
        <text text-anchor="middle" class="node-label" fill={t.ink}>
          {#each n.labelLines as line, j (j)}<tspan x={n.cx} y={n.top + j * LABEL_LINE}>{line}</tspan>{/each}
        </text>
        {#if n.noteLines.length}<text text-anchor="middle" class="node-note" fill={t.ink}>
            {#each n.noteLines as line, j (j)}<tspan x={n.cx} y={n.noteTop + j * NOTE_LINE}>{line}</tspan>{/each}
          </text>{/if}
      {/each}
    </svg>
  </div>
  <figcaption>{diagram.caption}</figcaption>
</figure>
  <details class="diagram-text">
    <summary>Read this diagram as text</summary>
    <p>{diagram.description}</p>
    <ul>
      {#each diagram.edges as e, i (i)}<li>
          {nameOf(e.from)} → {nameOf(e.to)}{e.label ? `: ${e.label}` : ""}{e.dashed ? " (dashed)" : ""}
        </li>{/each}
    </ul>
  </details>
</div>

<style>
  figure {
    margin: 0;
  }
  .diagram {
    margin: 4px 0 26px;
    padding: 14px 14px 10px;
    border: 1px solid #e3e9dc;
    border-radius: 14px;
    background: linear-gradient(180deg, #fbfcf8, #f5f8f0);
  }
  .diagram-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    margin: 0 auto;
  }
  .node-label {
    font: 600 15px Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .node-note {
    font: 12px Inter, ui-sans-serif, system-ui, sans-serif;
    opacity: 0.78;
  }
  .edge-label {
    font: 12.5px Inter, ui-sans-serif, system-ui, sans-serif;
    fill: #4d6a41;
  }
  figcaption {
    margin: 10px 4px 4px;
    font-size: 12.5px;
    line-height: 1.6;
    color: #5f6d58;
  }
  .diagram-text {
    margin: 4px 4px 2px;
    font-size: 12.5px;
    color: #5f6d58;
  }
  .diagram-text summary {
    cursor: pointer;
    color: #31543c;
    text-decoration: underline;
    text-underline-offset: 3px;
    width: max-content;
  }
  .diagram-text p,
  .diagram-text ul {
    margin: 8px 0;
    line-height: 1.7;
  }
</style>
