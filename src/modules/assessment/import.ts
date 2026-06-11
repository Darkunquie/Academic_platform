// MCQ bulk-import parser. Accepts plain text in the template format:
//
//   Q: <prompt>
//   - option 1
//   - *option 2  (correct option prefixed with *)
//   - option 3
//   Explanation: optional one-liner
//   Difficulty: easy | medium | hard
//   <blank line separates questions>
//
// Returns structured questions + per-row warnings so the admin preview UI
// can surface issues before commit.

export type ParsedOption = { text: string; isCorrect: boolean };

export type ParsedMcq = {
  prompt: string;
  options: ParsedOption[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  warnings: string[];
};

const Q_PREFIX = /^Q\s*[:.\-]\s*/i;
const OPT_PREFIX = /^[-*•]\s+/;
const BOLD_WRAP = /^\*\*(.+?)\*\*$/;
const DIFF_RE = /^Difficulty\s*[:\-]\s*(easy|medium|hard)\s*$/i;
const EXPL_RE = /^Explanation\s*[:\-]\s*(.*)$/i;

function cleanLine(raw: string): string {
  // Normalize fancy bullets, smart quotes, trim, collapse whitespace.
  return raw
    .replace(/^[•●◦‣⁃]\s*/, "- ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+$/g, "")
    .trim();
}

function parseOption(line: string): ParsedOption {
  let text = line.replace(OPT_PREFIX, "");
  let isCorrect = false;
  // "*text" or "**text**" or "text *" or trailing "(correct)"
  const boldMatch = BOLD_WRAP.exec(text);
  if (boldMatch) {
    text = boldMatch[1].trim();
    isCorrect = true;
  }
  if (text.startsWith("*")) {
    text = text.slice(1).trim();
    isCorrect = true;
  }
  if (/\s\*\s*$/.test(text)) {
    text = text.replace(/\s\*\s*$/, "");
    isCorrect = true;
  }
  const correctTag = /\(\s*correct\s*\)$/i;
  if (correctTag.test(text)) {
    text = text.replace(correctTag, "").trim();
    isCorrect = true;
  }
  return { text: text.trim(), isCorrect };
}

function finalizeBlock(
  promptLines: string[],
  options: ParsedOption[],
  explanation: string | undefined,
  difficulty: "easy" | "medium" | "hard"
): ParsedMcq | null {
  const prompt = promptLines.join(" ").trim();
  if (!prompt) return null;
  const cleanedOpts = options.filter((o) => o.text.length > 0);
  const warnings: string[] = [];
  if (cleanedOpts.length < 2) {
    warnings.push("Fewer than 2 options — will be skipped on import.");
  }
  const correctCount = cleanedOpts.filter((o) => o.isCorrect).length;
  if (correctCount === 0) {
    warnings.push("No correct option marked — defaults to first option.");
  } else if (correctCount > 1) {
    warnings.push("Multiple correct options marked — only first is kept.");
  }
  return {
    prompt,
    options: cleanedOpts,
    explanation,
    difficulty,
    warnings,
  };
}

export function parseMcqText(text: string): ParsedMcq[] {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(cleanLine);

  const out: ParsedMcq[] = [];
  let promptLines: string[] = [];
  let options: ParsedOption[] = [];
  let explanation: string | undefined;
  let difficulty: "easy" | "medium" | "hard" = "medium";
  let inQuestion = false;

  const flush = () => {
    if (!inQuestion) return;
    const block = finalizeBlock(promptLines, options, explanation, difficulty);
    if (block) out.push(block);
    promptLines = [];
    options = [];
    explanation = undefined;
    difficulty = "medium";
    inQuestion = false;
  };

  for (const ln of lines) {
    if (ln === "") {
      flush();
      continue;
    }
    if (Q_PREFIX.test(ln)) {
      flush();
      inQuestion = true;
      promptLines.push(ln.replace(Q_PREFIX, "").trim());
      continue;
    }
    if (!inQuestion) continue;

    const diffMatch = DIFF_RE.exec(ln);
    if (diffMatch) {
      difficulty = diffMatch[1].toLowerCase() as "easy" | "medium" | "hard";
      continue;
    }
    const explMatch = EXPL_RE.exec(ln);
    if (explMatch) {
      explanation = explMatch[1].trim();
      continue;
    }
    if (OPT_PREFIX.test(ln)) {
      options.push(parseOption(ln));
      continue;
    }
    // Continuation of prompt (multi-line question) — only before options begin.
    if (options.length === 0) {
      promptLines.push(ln);
    } else {
      // Trailing free text after options: treat as explanation if none yet.
      if (!explanation) explanation = ln;
    }
  }
  flush();
  return out;
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const mod = await import("mammoth");
  const result = await mod.extractRawText({
    buffer: Buffer.from(buffer),
  });
  return result.value;
}
