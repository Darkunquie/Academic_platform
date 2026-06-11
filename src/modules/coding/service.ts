import { asc, desc, eq, sql, and } from "drizzle-orm";
import { db } from "@/db";
import {
  codingQuestions,
  codingTestCases,
  codingSubmissions,
  progress,
  topics,
} from "@/db/schema";
import { runCode } from "@/lib/sandbox";
import { LANGUAGES } from "./languages";

/* --------------------------- Admin: questions ---------------------- */

export function listCodingQuestions(topicId: string) {
  return db
    .select()
    .from(codingQuestions)
    .where(eq(codingQuestions.topicId, topicId))
    .orderBy(desc(codingQuestions.id));
}

export async function getCodingQuestion(id: string) {
  const [row] = await db
    .select()
    .from(codingQuestions)
    .where(eq(codingQuestions.id, id))
    .limit(1);
  return row ?? null;
}

export async function createCodingQuestion(args: {
  topicId: string;
  title: string;
  prompt: string;
  languages: string[];
  difficulty: "easy" | "medium" | "hard";
  constraints?: string;
  timeLimitMs?: number;
  memLimitKb?: number;
  createdBy?: string;
}) {
  const [row] = await db
    .insert(codingQuestions)
    .values({
      topicId: args.topicId,
      title: args.title,
      prompt: args.prompt,
      languages: args.languages,
      difficulty: args.difficulty,
      constraints: args.constraints ?? "",
      timeLimitMs: args.timeLimitMs ?? 2000,
      memLimitKb: args.memLimitKb ?? 128000,
      source: "human",
      createdBy: args.createdBy,
    })
    .returning({ id: codingQuestions.id });
  return row.id;
}

export function updateCodingConstraints(
  id: string,
  args: { constraints: string; timeLimitMs: number; memLimitKb: number }
) {
  if (args.timeLimitMs <= 0 || args.timeLimitMs > 30000) {
    throw new Error("timeLimitMs must be between 1 and 30000");
  }
  if (args.memLimitKb <= 0 || args.memLimitKb > 2048000) {
    throw new Error("memLimitKb must be between 1 and 2048000");
  }
  return db.update(codingQuestions).set(args).where(eq(codingQuestions.id, id));
}

export function deleteCodingQuestion(id: string) {
  return db.delete(codingQuestions).where(eq(codingQuestions.id, id));
}

export function updateCodingLanguages(id: string, languages: string[]) {
  if (languages.length === 0) {
    throw new Error("At least one language must be provided");
  }
  const invalidLangs = languages.filter((lang) => !(lang in LANGUAGES));
  if (invalidLangs.length > 0) {
    throw new Error(`Invalid languages: ${invalidLangs.join(", ")}`);
  }
  return db
    .update(codingQuestions)
    .set({ languages })
    .where(eq(codingQuestions.id, id));
}

/* --------------------------- Admin: test cases --------------------- */

export function listTestCases(questionId: string) {
  return db
    .select()
    .from(codingTestCases)
    .where(eq(codingTestCases.codingQuestionId, questionId))
    .orderBy(asc(codingTestCases.isSample));
}

export function addTestCase(args: {
  codingQuestionId: string;
  stdin: string;
  expectedOutput: string;
  isSample: boolean;
  weight: number;
}) {
  return db.insert(codingTestCases).values(args);
}

export function deleteTestCase(id: string) {
  return db.delete(codingTestCases).where(eq(codingTestCases.id, id));
}

/* ----------------------------- Student ----------------------------- */

export async function getStudentCoding(questionId: string) {
  const q = await getCodingQuestion(questionId);
  if (!q) return null;
  const samples = await db
    .select()
    .from(codingTestCases)
    .where(
      and(
        eq(codingTestCases.codingQuestionId, questionId),
        eq(codingTestCases.isSample, true)
      )
    );
  return { question: q, samples };
}

export type RunResult = {
  status: "accepted" | "wrong" | "error";
  passed: number;
  total: number;
  compileError: string | null;
  samples: {
    stdin: string;
    expected: string;
    got: string;
    ok: boolean;
  }[];
};

type SampleRow = RunResult["samples"][number];

type CaseRow = {
  stdin: string;
  expectedOutput: string;
  isSample: boolean;
};

type CaseOutcome = { ok: boolean; compileOutput: string | null };

function failureSample(tc: CaseRow, reason: unknown): SampleRow {
  const message =
    reason instanceof Error ? reason.message : String(reason);
  return {
    stdin: tc.stdin,
    expected: tc.expectedOutput.trim(),
    got: `[Error: ${message.slice(0, 300)}]`,
    ok: false,
  };
}

function evaluateRun(
  tc: CaseRow,
  r: { stdout: string | null; compileOutput: string | null },
  samples: SampleRow[]
): CaseOutcome {
  const got = (r.stdout ?? "").trimEnd();
  const ok = got.trim() === tc.expectedOutput.trim();
  if (tc.isSample) {
    samples.push({
      stdin: tc.stdin,
      expected: tc.expectedOutput.trim(),
      got: got.trim(),
      ok,
    });
  }
  return { ok, compileOutput: r.compileOutput };
}

async function runAllCases(
  cases: CaseRow[],
  language: string,
  source: string
): Promise<{ passed: number; compileError: string | null; samples: SampleRow[] }> {
  const BATCH = 5;
  const samples: SampleRow[] = [];
  let passed = 0;
  let compileError: string | null = null;

  for (let i = 0; i < cases.length; i += BATCH) {
    const batch = cases.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((tc) => runCode({ language, source, stdin: tc.stdin }))
    );
    for (let j = 0; j < batch.length; j++) {
      const tc = batch[j];
      const settled = results[j];
      if (settled.status === "rejected") {
        if (tc.isSample) samples.push(failureSample(tc, settled.reason));
        continue;
      }
      const outcome = evaluateRun(tc, settled.value, samples);
      if (outcome.ok) passed += 1;
      if (!compileError && outcome.compileOutput) {
        compileError = outcome.compileOutput;
      }
    }
  }

  return { passed, compileError, samples };
}

function computeStatus(
  passed: number,
  total: number,
  compileError: string | null
): RunResult["status"] {
  if (total > 0 && passed === total) return "accepted";
  if (compileError) return "error";
  return "wrong";
}

async function bumpFirstSolveProgress(
  studentId: string,
  topicId: string,
  questionId: string
): Promise<void> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(codingSubmissions)
    .where(
      and(
        eq(codingSubmissions.studentId, studentId),
        eq(codingSubmissions.codingQuestionId, questionId),
        eq(codingSubmissions.status, "accepted")
      )
    );
  if ((row?.n ?? 0) !== 1) return;
  await db
    .insert(progress)
    .values({ studentId, topicId, codingSolved: 1 })
    .onConflictDoUpdate({
      target: [progress.studentId, progress.topicId],
      set: {
        codingSolved: sql`${progress.codingSolved} + 1`,
        updatedAt: new Date(),
      },
    });
}

export async function runAndStore(
  studentId: string,
  questionId: string,
  language: string,
  source: string
): Promise<RunResult> {
  const q = await getCodingQuestion(questionId);
  if (!q) throw new Error("Question not found");
  if (!(language in LANGUAGES)) throw new Error("Unsupported language");

  const cases = await db
    .select()
    .from(codingTestCases)
    .where(eq(codingTestCases.codingQuestionId, questionId));
  const total = cases.length;

  const { passed, compileError, samples } = await runAllCases(
    cases,
    language,
    source
  );
  const status = computeStatus(passed, total, compileError);
  const pct = total ? Math.round((passed / total) * 100) : 0;

  await db.insert(codingSubmissions).values({
    studentId,
    codingQuestionId: questionId,
    language,
    sourceCode: source,
    status,
    passed,
    total,
    score: pct.toString(),
  });

  if (status === "accepted") {
    await bumpFirstSolveProgress(studentId, q.topicId, questionId);
  }

  return { status, passed, total, compileError, samples };
}
