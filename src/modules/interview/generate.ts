import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { topics, topicContent } from "@/db/schema";
import { groqJson, GROQ_MODEL } from "@/lib/groq";
import { cacheKey, getCached, saveCached } from "@/modules/assessment/cache";

export type GenInterviewQ = { question: string; idealAnswer: string };

/**
 * Generate interview questions spanning a SET of topics. Cached by the sorted
 * topic-id set + difficulty + count, so the same selection reuses questions.
 */
export async function generateInterviewQuestions(
  topicIds: string[],
  count: number,
  difficulty: "easy" | "medium" | "hard"
): Promise<{ questions: GenInterviewQ[]; cached: boolean }> {
  const sorted = [...topicIds].sort();
  const key = cacheKey([...sorted, "interview", difficulty, count]);

  const hit = await getCached(key);
  if (hit) {
    const payload = hit.payload as { questions: GenInterviewQ[] };
    return { questions: payload.questions ?? [], cached: true };
  }

  const ts = await db.select().from(topics).where(inArray(topics.id, sorted));
  const contents = await db
    .select()
    .from(topicContent)
    .where(inArray(topicContent.topicId, sorted));
  const contentMap = new Map(contents.map((c) => [c.topicId, c.bodyHtml]));

  const topicNames = ts.map((t) => t.name).join(", ");
  let ctx = ts
    .map((t) => {
      const body = (contentMap.get(t.id) ?? "").slice(0, 1200);
      return `## ${t.name}\n${body}`;
    })
    .join("\n\n")
    .slice(0, 6000);

  const system =
    "You are a friendly but rigorous technical/academic interviewer. Respond with strict JSON only.";
  const user = `Create ${count} interview questions (difficulty: ${difficulty}) that span these topics: ${topicNames}.
Use this material when present:
"""
${ctx || "(no material — use standard curriculum knowledge for these topics)"}
"""
Mix conceptual and applied questions. Return JSON:
{"questions":[{"question":"...","idealAnswer":"a concise model answer"}]}`;

  const json = await groqJson<{ questions?: GenInterviewQ[] }>({
    system,
    user,
    temperature: 0.5,
  });
  const questions = Array.isArray(json.questions) ? json.questions : [];

  await saveCached(key, "interview", { questions }, GROQ_MODEL);
  return { questions, cached: false };
}

/** Score a single spoken/typed answer against the question + ideal answer. */
export async function scoreInterviewAnswer(
  question: string,
  idealAnswer: string,
  answer: string
): Promise<{ score: number; feedback: string }> {
  if (!answer.trim()) {
    return { score: 0, feedback: "No answer was given." };
  }

  const system =
    "You are an interview grader. Score fairly from 0 to 10. Respond with strict JSON only.";
  const user = `Question: ${question}
Model answer: ${idealAnswer}
Candidate answer: ${answer}

Grade the candidate answer. Return JSON: {"score": <0-10 integer>, "feedback": "1-2 sentences, specific and constructive"}`;

  try {
    const json = await groqJson<{ score?: number; feedback?: string }>({
      system,
      user,
      temperature: 0.2,
    });
    const score = Math.max(0, Math.min(10, Math.round(Number(json.score) || 0)));
    return { score, feedback: json.feedback ?? "" };
  } catch {
    return { score: 0, feedback: "Could not grade this answer." };
  }
}
