// Fallback: convert markdown → HTML → PDF via Chrome headless.
// Used when /make-pdf skill's browse daemon isn't available.
import { marked } from "marked";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const [, , inPath, outPath, title = "Document"] = process.argv;
if (!inPath || !outPath) {
  console.error("usage: md-to-pdf <in.md> <out.pdf> [title]");
  process.exit(1);
}

const CHROME =
  process.env.CHROME ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

const md = readFileSync(inPath, "utf8");
const body = marked.parse(md, { async: false }) as string;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  @page { size: A4; margin: 1in; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #111;
    line-height: 1.55;
    font-size: 11pt;
    max-width: 100%;
  }
  h1 { font-size: 22pt; margin-top: 0; border-bottom: 2px solid #333; padding-bottom: 6pt; }
  h2 { font-size: 16pt; margin-top: 18pt; color: #1a1a1a; border-bottom: 1px solid #ccc; padding-bottom: 4pt; }
  h3 { font-size: 13pt; margin-top: 14pt; color: #222; }
  p { margin: 8pt 0; }
  code { font-family: "Consolas", "Menlo", monospace; background: #f4f4f4; padding: 1pt 4pt; border-radius: 3pt; font-size: 0.92em; }
  pre { background: #f4f4f4; padding: 10pt; border-radius: 5pt; overflow-x: auto; font-size: 9pt; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #888; padding-left: 10pt; color: #555; margin: 10pt 0; }
  ul, ol { padding-left: 22pt; }
  li { margin: 3pt 0; }
  table { border-collapse: collapse; margin: 10pt 0; width: 100%; font-size: 10pt; }
  th, td { border: 1px solid #ccc; padding: 5pt 8pt; text-align: left; }
  th { background: #f0f0f0; font-weight: 600; }
  hr { border: none; border-top: 1px solid #ccc; margin: 18pt 0; }
  strong { color: #000; }
</style>
</head>
<body>
${body}
</body>
</html>`;

const dir = mkdtempSync(join(tmpdir(), "mdpdf-"));
const htmlPath = join(dir, "doc.html");
writeFileSync(htmlPath, html);

try {
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      `--print-to-pdf=${outPath}`,
      "--print-to-pdf-no-header",
      "--virtual-time-budget=5000",
      `file:///${htmlPath.replace(/\\/g, "/")}`,
    ],
    { stdio: "inherit" }
  );
  console.log(`wrote ${outPath}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
