import { Marked } from "marked";
import markedKatex from "marked-katex-extension";
import DOMPurify from "isomorphic-dompurify";

const md = new Marked();
md.use(markedKatex({ throwOnError: false, nonStandard: true }));

const KATEX_TAGS = [
  "math",
  "semantics",
  "annotation",
  "mrow",
  "mi",
  "mn",
  "mo",
  "ms",
  "mtext",
  "msup",
  "msub",
  "msubsup",
  "mfrac",
  "msqrt",
  "mroot",
  "mover",
  "munder",
  "munderover",
  "mtable",
  "mtr",
  "mtd",
  "mspace",
  "mstyle",
  "mpadded",
  "menclose",
];

/** Render admin-authored markdown to sanitized HTML.
 *  Supports inline `$x^2$` and block `$$\sum x_i$$` via KaTeX.
 *  Output is sanitized to neutralize stored-XSS from compromised admin content.
 */
export function renderMarkdown(src: string): string {
  const raw = md.parse(src ?? "", { async: false }) as string;
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ["target", "rel"],
    ADD_TAGS: KATEX_TAGS,
  });
}

/** Strip markdown/markup to plain text for text-to-speech. */
export function toPlainText(md: string): string {
  return (md ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> label
    .replace(/[#>*_`~]/g, " ") // markdown symbols
    .replace(/\r?\n/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}
