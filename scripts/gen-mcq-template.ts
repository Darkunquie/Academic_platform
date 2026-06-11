import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const OUT = "public/templates/mcq-template.docx";

// Strict template format that the parser expects.
// - Each question starts with a line "Q: <question text>"
// - Options listed as "- option text"
// - Correct option(s) prefixed with "*" (e.g. "- *correct option")
// - Optional trailer: "Explanation: ...", "Difficulty: easy|medium|hard"
// - Blank line separates questions

function q(opts: {
  question: string;
  options: { text: string; correct?: boolean }[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
}): Paragraph[] {
  const out: Paragraph[] = [];
  out.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Q: ", bold: true }),
        new TextRun({ text: opts.question }),
      ],
    })
  );
  for (const o of opts.options) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `- ${o.correct ? "*" : ""}${o.text}`,
            bold: !!o.correct,
          }),
        ],
      })
    );
  }
  if (opts.explanation) {
    out.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Explanation: ", italics: true, bold: true }),
          new TextRun({ text: opts.explanation, italics: true }),
        ],
      })
    );
  }
  out.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Difficulty: ", italics: true, bold: true }),
        new TextRun({ text: opts.difficulty, italics: true }),
      ],
    })
  );
  out.push(new Paragraph({ children: [] }));
  return out;
}

const intro: Paragraph[] = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: "MCQ Upload Template", bold: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Use the exact format below. Mark the correct option with a * before the text.",
        italics: true,
      }),
    ],
  }),
  new Paragraph({ children: [] }),
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: "Rules", bold: true })],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "• Each question starts with \"Q: \"" }),
    ],
  }),
  new Paragraph({
    children: [new TextRun({ text: "• Options are lines starting with \"- \"" })],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "• Mark the correct option with a \"*\" before its text, e.g. \"- *Paris\"" }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "• Optional \"Explanation:\" line after options" }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "• Optional \"Difficulty:\" line with easy | medium | hard" }),
    ],
  }),
  new Paragraph({
    children: [new TextRun({ text: "• Blank line separates questions" })],
  }),
  new Paragraph({ children: [] }),
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: "Examples", bold: true })],
  }),
  new Paragraph({ children: [] }),
];

const samples = [
  q({
    question: "What is the capital of France?",
    options: [
      { text: "London" },
      { text: "Berlin" },
      { text: "Paris", correct: true },
      { text: "Madrid" },
    ],
    explanation: "Paris has been the capital of France since the 5th century.",
    difficulty: "easy",
  }),
  q({
    question: "Which keyword in JavaScript declares a constant binding?",
    options: [
      { text: "var" },
      { text: "let" },
      { text: "const", correct: true },
      { text: "def" },
    ],
    explanation: "const creates a read-only binding to a value.",
    difficulty: "easy",
  }),
  q({
    question:
      "Time complexity of binary search on a sorted array of size n is:",
    options: [
      { text: "O(n)" },
      { text: "O(log n)", correct: true },
      { text: "O(n log n)" },
      { text: "O(1)" },
    ],
    explanation: "Each step halves the search space.",
    difficulty: "medium",
  }),
  q({
    question: "Which HTTP status indicates a successful resource creation?",
    options: [
      { text: "200 OK" },
      { text: "201 Created", correct: true },
      { text: "204 No Content" },
      { text: "301 Moved Permanently" },
    ],
    explanation: "201 is returned when a new resource has been created.",
    difficulty: "medium",
  }),
  q({
    question: "Which data structure uses LIFO order?",
    options: [
      { text: "Queue" },
      { text: "Stack", correct: true },
      { text: "Heap" },
      { text: "Linked list" },
    ],
    difficulty: "easy",
  }),
];

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [...intro, ...samples.flat()],
    },
  ],
});

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const buf = await Packer.toBuffer(doc);
  writeFileSync(OUT, buf);
  console.log(`✓ wrote ${OUT} (${buf.byteLength} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
