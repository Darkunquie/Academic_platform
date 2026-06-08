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
      source: "human",
      createdBy: args.createdBy,
    })
    .returning({ id: codingQuestions.id });
  return row.id;
}

export function deleteCodingQuestion(id: string) {
  return db.delete(codingQuestions).where(eq(codingQuestions.id, id));
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

  let passed = 0;
  let total = 0;
  let compileError: string | null = null;
  const samples: RunResult["samples"] = [];

  for (const tc of cases) {
    total += 1;
    const r = await runCode({ language, source, stdin: tc.stdin });
    const got = (r.stdout ?? "").trimEnd();
    const ok = got.trim() === tc.expectedOutput.trim();
    if (ok) passed += 1;
    if (!compileError && r.compileOutput) compileError = r.compileOutput;
    if (tc.isSample) {
      samples.push({
        stdin: tc.stdin,
        expected: tc.expectedOutput.trim(),
        got,
        ok,
      });
    }
  }

  const status: RunResult["status"] =
    total > 0 && passed === total
      ? "accepted"
      : compileError
        ? "error"
        : "wrong";

  const pct = total ? Math.round((passed / total) * 100) : 0;
  await db.insert(codingSubmissions).values({
    studentId,
    codingQuestionId: questionId,
    language,
    sourceCode: source,
    status: status === "accepted" ? "accepted" : status === "error" ? "error" : "wrong",
    passed,
    total,
    score: pct.toString(),
  });

  // First accepted solve → bump coding_solved for the topic.
  if (status === "accepted") {
    const [prior] = await db
      .select({ id: codingSubmissions.id })
      .from(codingSubmissions)
      .where(
        and(
          eq(codingSubmissions.studentId, studentId),
          eq(codingSubmissions.codingQuestionId, questionId),
          eq(codingSubmissions.status, "accepted")
        )
      )
      .limit(2);
    // The row we just inserted is one; if it's the only accepted one, count it.
    const acceptedCount = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(codingSubmissions)
      .where(
        and(
          eq(codingSubmissions.studentId, studentId),
          eq(codingSubmissions.codingQuestionId, questionId),
          eq(codingSubmissions.status, "accepted")
        )
      );
    if ((acceptedCount[0]?.n ?? 0) === 1) {
      await db
        .insert(progress)
        .values({ studentId, topicId: q.topicId, codingSolved: 1 })
        .onConflictDoUpdate({
          target: [progress.studentId, progress.topicId],
          set: {
            codingSolved: sql`${progress.codingSolved} + 1`,
            updatedAt: new Date(),
          },
        });
    }
    void prior;
  }

  return { status, passed, total, compileError, samples };
}
