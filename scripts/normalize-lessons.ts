import { readdir, readFile, writeFile } from "node:fs/promises";
import { isMap, isScalar, isSeq, parseDocument, Scalar, visit } from "yaml";

/**
 * Normalize lesson sources for editing: prose fields become literal blocks
 * (no folding surprises), long strings stay on one line, and the obsolete
 * duplicated `text_mode` copy is removed (the renderer uses `markdown`).
 *
 *   node --import tsx scripts/normalize-lessons.ts [files...]
 */
const PROSE_KEYS = new Set(["markdown", "takeaway", "reveal_markdown"]);
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : (await readdir("content/lessons"))
      .filter((f) => f.endsWith(".yaml"))
      .map((f) => `content/lessons/${f}`);

for (const file of files) {
  const text = await readFile(file, "utf8");
  const doc = parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length) throw new Error(`${file}: ${doc.errors[0].message}`);
  const before = JSON.stringify(stripTextMode(doc.toJSON()));
  visit(doc, {
    Pair(_key, pair) {
      if (isScalar(pair.key) && pair.key.value === "text_mode")
        return visit.REMOVE;
      if (
        isScalar(pair.key) &&
        PROSE_KEYS.has(String(pair.key.value)) &&
        isScalar(pair.value) &&
        typeof pair.value.value === "string"
      ) {
        const value = pair.value.value.replace(/[ \t]+$/gm, "");
        pair.value.value = value;
        pair.value.type =
          value.includes("\n") || value.length > 100
            ? Scalar.BLOCK_LITERAL
            : Scalar.PLAIN;
      } else if (isScalar(pair.value) && typeof pair.value.value === "string") {
        if (
          pair.value.type === Scalar.BLOCK_FOLDED ||
          pair.value.type === Scalar.BLOCK_LITERAL
        )
          pair.value.type = pair.value.value.includes("\n")
            ? Scalar.BLOCK_LITERAL
            : Scalar.PLAIN;
      }
    },
  });
  const out = doc.toString({ lineWidth: 0, minContentWidth: 0 });
  const after = JSON.stringify(parseDocument(out).toJSON());
  if (after !== before) throw new Error(`${file}: normalization changed content`);
  if (out !== text) await writeFile(file, out);
}

function stripTextMode(value: any): any {
  if (Array.isArray(value)) return value.map(stripTextMode);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => k !== "text_mode")
        .map(([k, v]) => [k, stripTextMode(v)]),
    );
  return value;
}
void isMap;
void isSeq;
