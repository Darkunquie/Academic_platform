import { asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  interviewSessions,
  interviewSessionTopics,
  interviewQuestions,
  interviewAnswers,
  progress,
  topics,
} from "@/db/schema";
import { getTopicChain } from "@/modules/curriculum/admin";
import {
  generateInterviewQuestions,
  scoreInterviewAnswer,
} from "./generate";

/** Create a session, generate + store its questions. Returns sessionId. */
export async function createSession(
  studentId: string,
  mode: "voice" | "text",
  topicIds: string[],
  difficulty: "easy" | "medium" | "hard",
  count: number
): Promise<string> {
  const first = await getTopicChain(topicIds[0]);
  const subjectId = first?.subjectId ?? null;

  const [session] = await db
    .insert(interviewSessions)
    .values({ studentId, subjectId, mode, status: "active" })
    .returning({ id: interviewSessions.id });

  await db.insert(interviewSessionTopics).values(
    topicIds.map((topicId) => ({ sessionId: session.id, topicId }))
  );

  const { questions, cached } = await generateInterviewQuestions(
    topicIds,
    count,
    difficulty
  );

  if (questions.length) {
    await db.insert(interviewQuestions).values(
      questions.map((q, i) => ({
        sessionId: session.id,
        seq: i,
        question: q.question,
        idealAnswer: q.idealAnswer,
        source: cached ? ("cache" as const) : ("ai" as const),
      }))
    );
  }

  return session.id;
}

export async function getSessionForStudent(
  sessionId: string,
  studentId: string
) {
  const [session] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1);
  if (!session || session.studentId !== studentId) return null;

  const qs = await db
    .select()
    .from(interviewQuestions)
    .where(eq(interviewQuestions.sessionId, sessionId))
    .orderBy(asc(interviewQuestions.seq));

  const qIds = qs.map((q) => q.id);
  const answers = qIds.length
    ? await db
        .select()
        .from(interviewAnswers)
        .where(inArray(interviewAnswers.interviewQuestionId, qIds))
    : [];

  return { session, questions: qs, answers };
}

/** Score + store one answer. Returns the score + feedback. */
export async function answerQuestion(
  studentId: string,
  interviewQuestionId: string,
  transcript: string,
  audioR2Key?: string
) {
  const [q] = await db
    .select()
    .from(interviewQuestions)
    .where(eq(interviewQuestions.id, interviewQuestionId))
    .limit(1);
  if (!q) throw new Error("Question not found");

  // Ownership check via the parent session.
  const [session] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, q.sessionId))
    .limit(1);
  if (!session || session.studentId !== studentId) {
    throw new Error("Not authorized");
  }

  const { score, feedback } = await scoreInterviewAnswer(
    q.question,
    q.idealAnswer ?? "",
    transcript
  );

  await db.insert(interviewAnswers).values({
    interviewQuestionId,
    transcript,
    audioR2Key,
    score: score.toString(),
    feedback,
  });

  return { score, feedback };
}

/** Finalize: average score → overall (0-100), mark complete, update progress. */
export async function completeSession(studentId: string, sessionId: string) {
  const data = await getSessionForStudent(sessionId, studentId);
  if (!data) throw new Error("Not authorized");

  const scores = data.answers
    .map((a) => Number(a.score ?? 0))
    .filter((n) => !Number.isNaN(n));
  const avg10 = scores.length
    ? scores.reduce((s, n) => s + n, 0) / scores.length
    : 0;
  const overall = Math.round(avg10 * 10); // 0-100

  await db
    .update(interviewSessions)
    .set({
      status: "completed",
      overallScore: overall.toString(),
      completedAt: new Date(),
    })
    .where(eq(interviewSessions.id, sessionId));

  // Update interview_best for each selected topic.
  const sessTopics = await db
    .select({ topicId: interviewSessionTopics.topicId })
    .from(interviewSessionTopics)
    .where(eq(interviewSessionTopics.sessionId, sessionId));

  for (const { topicId } of sessTopics) {
    await db
      .insert(progress)
      .values({ studentId, topicId, interviewBest: overall.toString() })
      .onConflictDoUpdate({
        target: [progress.studentId, progress.topicId],
        set: {
          interviewBest: sql`greatest(coalesce(${progress.interviewBest}, 0), ${overall})`,
          updatedAt: new Date(),
        },
      });
  }

  return { overall };
}
