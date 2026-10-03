import { marked } from "marked";
import katex from "katex";
import sanitize from "sanitize-html";

/**
 * Lesson markdown = GitHub-flavored markdown plus a few teaching blocks:
 *
 *   $x^2$            inline math (KaTeX)
 *   $$ ... $$        display math on its own lines
 *   ```python        highlighted code; ```python run  adds an in-browser Run button
 *   :::kind Title    callout container closed by a line containing only :::
 *
 * Callout kinds are listed in CALLOUTS. `predict` renders as a question whose
 * answer stays hidden until the learner opens it.
 */
export const CALLOUTS = {
  predict: "Predict first",
  mixup: "Common mix-up",
  papers: "In the papers",
  story: "The story",
  try: "Try it",
  key: "Key idea",
  deeper: "Go deeper",
  example: "Worked example",
} as const;
export type CalloutKind = keyof typeof CALLOUTS;

const ALLOWED_TAGS = [
  "p",
  "strong",
  "em",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "br",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "caption",
  "del",
  "sub",
  "sup",
];

export class LessonMarkdownError extends Error {}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const PY_KEYWORDS = new Set(
  "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(
    " ",
  ),
);
const PY_BUILTINS = new Set(
  "abs all any bool dict enumerate float int len list max min print range round set sorted str sum tuple zip map filter isinstance".split(
    " ",
  ),
);

/** A small, dependency-free highlighter: enough to make code readable, not a parser. */
export function highlightPython(source: string): string {
  const token =
    /("""[^]*?"""|'''[^]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#[^\n]*|\b\d+(?:\.\d+)?(?:e[-+]?\d+)?\b|\b[A-Za-z_]\w*\b)/g;
  let out = "";
  let last = 0;
  for (const match of source.matchAll(token)) {
    const text = match[0];
    out += escapeHtml(source.slice(last, match.index));
    let cls = "";
    if (text.startsWith("#")) cls = "tok-com";
    else if (/^["']/.test(text)) cls = "tok-str";
    else if (/^\d/.test(text)) cls = "tok-num";
    else if (PY_KEYWORDS.has(text)) cls = "tok-kw";
    else if (PY_BUILTINS.has(text)) cls = "tok-fn";
    out += cls
      ? `<span class="${cls}">${escapeHtml(text)}</span>`
      : escapeHtml(text);
    last = match.index! + text.length;
  }
  return out + escapeHtml(source.slice(last));
}

function renderMath(tex: string, display: boolean, where: string) {
  try {
    const rendered = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      output: "htmlAndMathml",
      strict: "ignore",
    });
    // Markers let plain-text exports and vocabulary matching use the TeX source.
    return `<!--math:${encodeURIComponent(tex)}-->${rendered}<!--/math-->`;
  } catch (error) {
    throw new LessonMarkdownError(
      `${where}: invalid math "${tex}": ${(error as Error).message}`,
    );
  }
}

function renderCode(lang: string, flags: string, source: string) {
  const runnable = lang === "python" && /\brun\b/.test(flags);
  const body = lang === "python" ? highlightPython(source) : escapeHtml(source);
  const label =
    lang === "python" ? "Python" : lang ? lang.toUpperCase() : "Code";
  return `<div class="code-block${runnable ? " runnable" : ""}" data-lang="${escapeHtml(lang || "text")}"><div class="code-head"><span>${label}</span></div><pre tabindex="0" role="region" aria-label="${label} code example"><code>${body}</code></pre></div>`;
}

function sanitizeHtml(html: string) {
  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

/** Render lesson markdown to trusted HTML. `where` identifies the source in errors. */
export function renderLessonMarkdown(
  markdown: string,
  where = "lesson",
): string {
  const blocks: string[] = [];
  const hold = (html: string) => `@@BLOCK${blocks.push(html) - 1}@@`;
  let text = markdown.replace(/\r\n/g, "\n");

  // 1. Callout containers (rendered recursively, so each keeps its own placeholders).
  text = text.replace(
    /^:::([a-z]+)[ \t]*([^\n]*)\n([^]*?)\n:::[ \t]*$/gm,
    (_m, kind: string, title: string, inner: string) => {
      if (!(kind in CALLOUTS))
        throw new LessonMarkdownError(`${where}: unknown callout ":::${kind}"`);
      if (/^:::/m.test(inner))
        throw new LessonMarkdownError(`${where}: callouts cannot be nested`);
      const label = CALLOUTS[kind as CalloutKind];
      const titleHtml = title.trim()
        ? renderLessonMarkdown(title.trim(), where)
            .replace(/^<p>/, "")
            .replace(/<\/p>\s*$/, "")
        : "";
      const body = renderLessonMarkdown(inner, where);
      if (kind === "predict") {
        if (!titleHtml)
          throw new LessonMarkdownError(
            `${where}: :::predict needs a question after the kind`,
          );
        return (
          "\n" +
          hold(
            `<div class="callout callout-predict"><p class="callout-label">${label}</p><p class="callout-question">${titleHtml}</p><details><summary>Reveal the answer</summary><div class="callout-body">${body}</div></details></div>`,
          ) +
          "\n"
        );
      }
      return (
        "\n" +
        hold(
          `<aside class="callout callout-${kind}"><p class="callout-label">${label}${titleHtml ? `<span>${titleHtml}</span>` : ""}</p><div class="callout-body">${body}</div></aside>`,
        ) +
        "\n"
      );
    },
  );
  if (/^:::/m.test(text))
    throw new LessonMarkdownError(
      `${where}: unclosed or malformed ::: callout (open with ":::kind Title", close with ":::" on its own line)`,
    );

  // 2. Code fences (their contents must not be read as math or markdown).
  text = text.replace(
    /^```([A-Za-z0-9_-]*)([^\n]*)\n([^]*?)\n```[ \t]*$/gm,
    (_m, lang: string, flags: string, source: string) =>
      "\n" + hold(renderCode(lang.toLowerCase(), flags, source)) + "\n",
  );

  // 3. Math.
  text = text.replace(
    /\$\$([^]+?)\$\$/g,
    (_m, tex: string) =>
      "\n" +
      hold(
        `<div class="math-display" tabindex="0" role="group" aria-label="Equation">${renderMath(tex.trim(), true, where)}</div>`,
      ) +
      "\n",
  );
  text = text.replace(
    /(^|[^\\$])\$([^$\n]+?)\$/g,
    (_m, before: string, tex: string) =>
      before + hold(renderMath(tex.trim(), false, where)),
  );
  if (/(^|[^\\])\$/.test(text))
    throw new LessonMarkdownError(
      `${where}: unmatched "$". Write math as $...$ or escape a literal dollar as \\$`,
    );
  text = text.replace(/\\\$/g, "$");

  let html = sanitizeHtml(marked.parse(text, { async: false }) as string);
  // Wide tables scroll sideways on phones, so keyboard users must be able to focus them.
  html = html.replace(/<table>/g, '<table tabindex="0">');
  // Block placeholders arrive wrapped in their own paragraph.
  html = html.replace(/<p>\s*(@@BLOCK\d+@@)\s*<\/p>/g, "$1");
  for (let pass = 0; pass < 4 && html.includes("@@BLOCK"); pass++)
    html = html.replace(/@@BLOCK(\d+)@@/g, (_m, i: string) => blocks[+i]);
  if (html.includes("@@BLOCK"))
    throw new LessonMarkdownError(`${where}: could not place a rendered block`);
  return html;
}

/** Plain words a learner reads (math → TeX, tags removed). Used for word counts and lint. */
export function markdownWords(markdown: string): number {
  const stripped = markdown
    .replace(/\\\$/g, "dollars ")
    .replace(/```[^]*?```/g, " ")
    .replace(/\$\$[^]*?\$\$/g, " formula ")
    .replace(/\$[^$\n]+\$/g, " x ")
    .replace(/^:::.*$/gm, " ");
  return stripped
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}
