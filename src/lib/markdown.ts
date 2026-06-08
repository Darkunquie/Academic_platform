import { Marked } from "marked";
import markedKatex from "marked-katex-extension";

const md = new Marked();
md.use(markedKatex({ throwOnError: false, nonStandard: true }));

/** Render trusted (admin-authored) markdown to HTML.
 *  Supports inline `$x^2$` and block `$$\sum x_i$$` via KaTeX.
 */
export function renderMarkdown(src: string): string {
  return md.parse(src ?? "", { async: false }) as string;
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
