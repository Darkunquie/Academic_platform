import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  webQuestions,
  webChecks,
  webSubmissions,
  progress,
} from "@/db/schema";

/* --------------------------- Admin: questions ---------------------- */

export function listWebQuestions(topicId: string) {
  return db
    .select()
    .from(webQuestions)
    .where(eq(webQuestions.topicId, topicId))
    .orderBy(desc(webQuestions.id));
}

export async function getWebQuestion(id: string) {
  const [row] = await db
    .select()
    .from(webQuestions)
    .where(eq(webQuestions.id, id))
    .limit(1);
  return row ?? null;
}

export async function createWebQuestion(args: {
  topicId: string;
  title: string;
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  htmlStarter?: string;
  cssStarter?: string;
  jsStarter?: string;
  createdBy?: string;
}) {
  const [row] = await db
    .insert(webQuestions)
    .values({
      topicId: args.topicId,
      title: args.title,
      prompt: args.prompt,
      difficulty: args.difficulty,
      htmlStarter: args.htmlStarter ?? "",
      cssStarter: args.cssStarter ?? "",
      jsStarter: args.jsStarter ?? "",
      source: "human",
      createdBy: args.createdBy,
    })
    .returning({ id: webQuestions.id });
  return row.id;
}

export function deleteWebQuestion(id: string) {
  return db.delete(webQuestions).where(eq(webQuestions.id, id));
}

export function updateWebStarters(
  id: string,
  args: { htmlStarter: string; cssStarter: string; jsStarter: string }
) {
  return db.update(webQuestions).set(args).where(eq(webQuestions.id, id));
}

/* ---------------------------- Admin: checks ------------------------ */

export function listWebChecks(questionId: string) {
  return db
    .select()
    .from(webChecks)
    .where(eq(webChecks.webQuestionId, questionId))
    .orderBy(asc(webChecks.sortOrder), asc(webChecks.id));
}

export function addWebCheck(args: {
  webQuestionId: string;
  label: string;
  expression: string;
  weight: number;
  sortOrder: number;
}) {
  return db.insert(webChecks).values(args);
}

export function deleteWebCheck(id: string) {
  return db.delete(webChecks).where(eq(webChecks.id, id));
}

/* ----------------------------- Student ----------------------------- */

export async function getStudentWeb(questionId: string) {
  const q = await getWebQuestion(questionId);
  if (!q) return null;
  const checks = await db
    .select({
      id: webChecks.id,
      label: webChecks.label,
      weight: webChecks.weight,
    })
    .from(webChecks)
    .where(eq(webChecks.webQuestionId, questionId))
    .orderBy(asc(webChecks.sortOrder), asc(webChecks.id));
  return { question: q, checks };
}

export async function getCheckExpressions(questionId: string) {
  return db
    .select({
      id: webChecks.id,
      label: webChecks.label,
      expression: webChecks.expression,
      weight: webChecks.weight,
    })
    .from(webChecks)
    .where(eq(webChecks.webQuestionId, questionId))
    .orderBy(asc(webChecks.sortOrder), asc(webChecks.id));
}

export type WebSubmitResult = {
  status: "accepted" | "wrong" | "error";
  passed: number;
  total: number;
  score: number;
};

export async function storeWebSubmission(args: {
  studentId: string;
  questionId: string;
  html: string;
  css: string;
  js: string;
  results: { checkId: string; ok: boolean }[];
}): Promise<WebSubmitResult> {
  const q = await getWebQuestion(args.questionId);
  if (!q) throw new Error("Question not found");

  const checks = await db
    .select()
    .from(webChecks)
    .where(eq(webChecks.webQuestionId, args.questionId));

  let passed = 0;
  let total = 0;
  let weightedPassed = 0;
  let weightedTotal = 0;
  for (const c of checks) {
    total += 1;
    weightedTotal += c.weight;
    const r = args.results.find((x) => x.checkId === c.id);
    if (r?.ok) {
      passed += 1;
      weightedPassed += c.weight;
    }
  }

  const status: WebSubmitResult["status"] =
    total > 0 && passed === total ? "accepted" : "wrong";
  const pct = weightedTotal
    ? Math.round((weightedPassed / weightedTotal) * 100)
    : 0;

  await db.insert(webSubmissions).values({
    studentId: args.studentId,
    webQuestionId: args.questionId,
    html: args.html,
    css: args.css,
    js: args.js,
    status,
    passed,
    total,
    score: pct.toString(),
  });

  if (status === "accepted") {
    const acceptedCount = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(webSubmissions)
      .where(
        and(
          eq(webSubmissions.studentId, args.studentId),
          eq(webSubmissions.webQuestionId, args.questionId),
          eq(webSubmissions.status, "accepted")
        )
      );
    if ((acceptedCount[0]?.n ?? 0) === 1) {
      await db
        .insert(progress)
        .values({
          studentId: args.studentId,
          topicId: q.topicId,
          codingSolved: 1,
        })
        .onConflictDoUpdate({
          target: [progress.studentId, progress.topicId],
          set: {
            codingSolved: sql`${progress.codingSolved} + 1`,
            updatedAt: new Date(),
          },
        });
    }
  }

  return { status, passed, total, score: pct };
}
