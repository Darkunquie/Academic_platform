import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { selfAttempts, selfAttemptQuestions } from "@/db/schema";

export type SaveTestQuestion = {
  prompt: string;
  options: { text: string; isCorrect: boolean }[];
  correctIndex: number;
  explanation?: string;
  studentChoice: number | null;
  isCorrect: boolean;
};

export type SaveInterviewQuestion = {
  prompt: string;
  idealAnswer: string;
  studentAnswer: string;
  score: number; // 0-10
  feedback: string;
};

export async function createTestAttempt(args: {
  studentId: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  pdfHash: string | null;
  questions: SaveTestQuestion[];
}): Promise<string> {
  const total = args.questions.length;
  const correct = args.questions.filter((q) => q.isCorrect).length;
  const scorePct = total ? Math.round((correct / total) * 100) : 0;

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(selfAttempts)
      .values({
        studentId: args.studentId,
        subject: args.subject,
        topic: args.topic,
        mode: "test",
        difficulty: args.difficulty,
        pdfHash: args.pdfHash,
        totalQuestions: total,
        correctCount: correct,
        scorePct,
      })
      .returning({ id: selfAttempts.id });

    if (args.questions.length > 0) {
      await tx.insert(selfAttemptQuestions).values(
        args.questions.map((q, i) => ({
          attemptId: row.id,
          seq: i,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation ?? null,
          studentChoice: q.studentChoice,
          isCorrect: q.isCorrect,
        }))
      );
    }

    return row.id;
  });
}

export async function createInterviewAttempt(args: {
  studentId: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  pdfHash: string | null;
  questions: SaveInterviewQuestion[];
}): Promise<string> {
  const total = args.questions.length;
  const totalScore = args.questions.reduce((s, q) => s + q.score, 0);
  const scorePct = total ? Math.round((totalScore / (total * 10)) * 100) : 0;

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(selfAttempts)
      .values({
        studentId: args.studentId,
        subject: args.subject,
        topic: args.topic,
        mode: "interview",
        difficulty: args.difficulty,
        pdfHash: args.pdfHash,
        totalQuestions: total,
        correctCount: 0,
        scorePct,
      })
      .returning({ id: selfAttempts.id });

    if (args.questions.length > 0) {
      await tx.insert(selfAttemptQuestions).values(
        args.questions.map((q, i) => ({
          attemptId: row.id,
          seq: i,
          prompt: q.prompt,
          idealAnswer: q.idealAnswer,
          studentAnswer: q.studentAnswer,
          score: q.score,
          feedback: q.feedback,
        }))
      );
    }

    return row.id;
  });
}

export function listSelfAttempts(studentId: string) {
  return db
    .select()
    .from(selfAttempts)
    .where(eq(selfAttempts.studentId, studentId))
    .orderBy(desc(selfAttempts.createdAt));
}

export async function getSelfAttempt(id: string, studentId: string) {
  const [row] = await db
    .select()
    .from(selfAttempts)
    .where(and(eq(selfAttempts.id, id), eq(selfAttempts.studentId, studentId)))
    .limit(1);
  if (!row) return null;
  const qs = await db
    .select()
    .from(selfAttemptQuestions)
    .where(eq(selfAttemptQuestions.attemptId, id))
    .orderBy(selfAttemptQuestions.seq);
  return { attempt: row, questions: qs };
}

export async function deleteSelfAttempt(id: string, studentId: string) {
  await db
    .delete(selfAttempts)
    .where(
      and(eq(selfAttempts.id, id), eq(selfAttempts.studentId, studentId))
    );
}

/** Find a prior attempt for the same PDF (by hash) + mode for this student. */
export async function findReplayable(
  studentId: string,
  pdfHash: string,
  mode: "test" | "interview"
) {
  const [row] = await db
    .select()
    .from(selfAttempts)
    .where(
      and(
        eq(selfAttempts.studentId, studentId),
        eq(selfAttempts.pdfHash, pdfHash),
        eq(selfAttempts.mode, mode)
      )
    )
    .orderBy(desc(selfAttempts.createdAt))
    .limit(1);
  return row ?? null;
}
