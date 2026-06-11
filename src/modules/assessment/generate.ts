import { getTopicChain } from "@/modules/curriculum/admin";
import { getTopicContent } from "@/modules/content/service";
import { groqJson, GROQ_FAST_MODEL } from "@/lib/groq";
import { cacheKey, getCached, saveCached } from "./cache";

export type GenMcq = {
  prompt: string;
  options: { text: string; isCorrect: boolean }[];
  explanation?: string;
};

/**
 * Generate MCQs for a topic. Results are cached per
 * (provider+grade+subject+topic+difficulty+count) combo so repeat
 * generations of the same combo cost nothing.
 */
export async function generateMcqs(
  topicId: string,
  count: number,
  difficulty: "easy" | "medium" | "hard"
): Promise<GenMcq[]> {
  const topic = await getTopicChain(topicId);
  if (!topic) throw new Error("Topic not found");

  const key = cacheKey([
    topic.providerId,
    topic.gradeId,
    topic.subjectId,
    topicId,
    "mock_test",
    difficulty,
    count,
  ]);

  const cached = await getCached(key);
  if (cached) {
    const payload = cached.payload as { questions: GenMcq[] };
    return payload.questions ?? [];
  }

  const content = await getTopicContent(topicId);
  const ctx = (content?.bodyHtml ?? "").slice(0, 2000);

  const system =
    "You are an expert exam question writer. Always respond with strict JSON only.";
  const user = `Write ${count} multiple-choice questions (difficulty: ${difficulty}) for the topic "${topic.name}" in subject "${topic.subjectName}" for ${topic.gradeName}.
Base them on this material when present:
"""
${ctx || "(no material provided — use standard curriculum knowledge for this topic)"}
"""
Rules: exactly 4 options per question, exactly one correct. Return JSON of the shape:
{"questions":[{"prompt":"...","options":[{"text":"...","isCorrect":true},{"text":"...","isCorrect":false},{"text":"...","isCorrect":false},{"text":"...","isCorrect":false}],"explanation":"short reason"}]}`;

  const json = await groqJson<{ questions?: GenMcq[] }>({
    system,
    user,
    model: GROQ_FAST_MODEL,
  });
  const questions = Array.isArray(json.questions) ? json.questions : [];

  await saveCached(key, "mock_test", { questions }, GROQ_FAST_MODEL);
  return questions;
}
