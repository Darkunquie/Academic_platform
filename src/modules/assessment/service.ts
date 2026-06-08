import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  questions,
  questionOptions,
  testAttempts,
  testAnswers,
  progress,
} from "@/db/schema";

export type OptionInput = { text: string; isCorrect: boolean };

/* --------------------------- Question bank -------------------------- */

export async function listQuestionsWithOptions(topicId: string) {
  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.topicId, topicId))
    .orderBy(desc(questions.createdAt));
  if (qs.length === 0) return [];

  const ids = qs.map((q) => q.id);
  const opts = await db
    .select()
    .from(questionOptions)
    .where(inArray(questionOptions.questionId, ids))
    .orderBy(asc(questionOptions.sortOrder));

  return qs.map((q) => ({
    ...q,
    options: opts.filter((o) => o.questionId === q.id),
  }));
}

export async function createMcqQuestion(args: {
  topicId: string;
  prompt: string;
  options: OptionInput[];
  difficulty: "easy" | "medium" | "hard";
  source: "human" | "ai";
  explanation?: string;
  createdBy?: string;
}) {
  // Sanitize: keep options with text, ensure exactly one correct.
  let opts = args.options.filter((o) => o.text.trim().length > 0);
  if (opts.length < 2) return;
  if (!opts.some((o) => o.isCorrect)) opts = opts.map((o, i) => ({ ...o, isCorrect: i === 0 }));
  // Only first correct stays correct.
  let seen = false;
  opts = opts.map((o) => {
    const keep = o.isCorrect && !seen;
    if (keep) seen = true;
    return { ...o, isCorrect: keep };
  });

  const [q] = await db
    .insert(questions)
    .values({
      topicId: args.topicId,
      type: "mcq",
      prompt: args.prompt,
      explanation: args.explanation,
      difficulty: args.difficulty,
      source: args.source,
      createdBy: args.createdBy,
    })
    .returning({ id: questions.id });

  await db.insert(questionOptions).values(
    opts.map((o, i) => ({
      questionId: q.id,
      text: o.text,
      isCorrect: o.isCorrect,
      sortOrder: i,
    }))
  );
}

export function deleteQuestion(id: string) {
  return db.delete(questions).where(eq(questions.id, id));
}

/* ------------------------- Student test flow ------------------------ */

/** MCQ questions for a student to take — correctness stripped. */
export async function getStudentTest(topicId: string) {
  const all = await listQuestionsWithOptions(topicId);
  return all
    .filter((q) => q.type === "mcq" && q.options.length >= 2)
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    }));
}

export type SubmittedAnswer = { questionId: string; optionId: string | null };

export async function gradeAndStoreTest(
  studentId: string,
  topicId: string,
  answers: SubmittedAnswer[]
) {
  const all = await listQuestionsWithOptions(topicId);
  const mcq = all.filter((q) => q.type === "mcq" && q.options.length >= 2);
  const total = mcq.length;
  const pick = new Map(answers.map((a) => [a.questionId, a.optionId]));

  let score = 0;
  const results = mcq.map((q) => {
    const correct = q.options.find((o) => o.isCorrect);
    const selectedId = pick.get(q.id) ?? null;
    const isCorrect = !!correct && selectedId === correct.id;
    if (isCorrect) score += 1;
    return {
      questionId: q.id,
      prompt: q.prompt,
      correctOptionId: correct?.id ?? null,
      selectedOptionId: selectedId,
      isCorrect,
      explanation: q.explanation ?? null,
    };
  });

  const [attempt] = await db
    .insert(testAttempts)
    .values({
      studentId,
      topicId,
      total,
      score: score.toString(),
      status: "submitted",
      submittedAt: new Date(),
    })
    .returning({ id: testAttempts.id });

  if (results.length) {
    await db.insert(testAnswers).values(
      results.map((r) => ({
        attemptId: attempt.id,
        questionId: r.questionId,
        selectedOptionId: r.selectedOptionId,
        isCorrect: r.isCorrect,
        awarded: r.isCorrect ? "1" : "0",
      }))
    );
  }

  const pct = total ? Math.round((score / total) * 100) : 0;
  await db
    .insert(progress)
    .values({ studentId, topicId, testBest: pct.toString() })
    .onConflictDoUpdate({
      target: [progress.studentId, progress.topicId],
      set: {
        testBest: sql`greatest(coalesce(${progress.testBest}, 0), ${pct})`,
        updatedAt: new Date(),
      },
    });

  return { score, total, pct, results };
}
