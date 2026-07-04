import { createHash } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  topics,
  topicContent,
  chapters,
  subjects,
  grades,
  providers,
} from "@/db/schema";
import { groqJson, GROQ_MODEL } from "@/lib/groq";
import { toPlainText } from "@/lib/markdown";
import { cacheKey, getCached, saveCached } from "@/modules/assessment/cache";

export type GenInterviewQ = { question: string; idealAnswer: string };

const PER_TOPIC_CHARS = 3000;
const MAX_CTX_CHARS = 12000;

function describeScope(label: string, values: string[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return `${label} ${values[0]}`.trim();
  return `${label} ${values.join(" / ")}`.trim();
}

/**
 * Generate interview questions spanning a SET of topics. Cached by the sorted
 * topic-id set + difficulty + count + content hash (so edits bust the cache).
 */
export async function generateInterviewQuestions(
  topicIds: string[],
  count: number,
  difficulty: "easy" | "medium" | "hard"
): Promise<{ questions: GenInterviewQ[]; cached: boolean }> {
  const sorted = [...topicIds].sort((a, b) => a.localeCompare(b));

  // Pull topics joined with parent chapter / subject / grade / provider so the
  // prompt can frame questions to the right curriculum scope.
  const ts = await db
    .select({
      id: topics.id,
      name: topics.name,
      chapterName: chapters.name,
      subjectName: subjects.name,
      gradeName: grades.name,
      providerName: providers.name,
    })
    .from(topics)
    .innerJoin(chapters, eq(topics.chapterId, chapters.id))
    .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
    .innerJoin(grades, eq(subjects.gradeId, grades.id))
    .innerJoin(providers, eq(grades.providerId, providers.id))
    .where(inArray(topics.id, sorted));

  // FK cascade guarantees no orphans in production, but the caller may pass
  // IDs that were deleted between selection and submit, or simply wrong. Fail
  // loud instead of silently generating fewer questions than requested.
  if (ts.length !== sorted.length) {
    const found = new Set(ts.map((t) => t.id));
    const missing = sorted.filter((id) => !found.has(id));
    throw new Error(
      `Topics not found: ${missing.join(", ")}. They may have been deleted.`
    );
  }

  const contents = await db
    .select()
    .from(topicContent)
    .where(inArray(topicContent.topicId, sorted));
  const contentMap = new Map(contents.map((c) => [c.topicId, c.bodyHtml]));

  // Strip markdown to plain text for cleaner token budget + group blocks per
  // topic. Concatenate, then cap.
  const blocks = ts.map((t) => {
    const raw = contentMap.get(t.id) ?? "";
    const plain = toPlainText(raw).slice(0, PER_TOPIC_CHARS);
    return `## ${t.chapterName} › ${t.name}\n${plain || "(no body content)"}`;
  });
  const ctx = blocks.join("\n\n").slice(0, MAX_CTX_CHARS);

  // Cache key now includes content hash so edits invalidate cached questions.
  const contentHash = createHash("sha256").update(ctx).digest("hex").slice(0, 16);
  const key = cacheKey([...sorted, "interview", difficulty, count, contentHash]);

  const hit = await getCached(key);
  if (hit) {
    const payload = hit.payload as { questions: GenInterviewQ[] };
    return { questions: payload.questions ?? [], cached: true };
  }

  if (!ctx.trim()) {
    throw new Error(
      "No study material available for the selected topics. Add content to the topics before starting an interview."
    );
  }

  // Aggregate unique curriculum scopes. A single interview may cross subjects
  // (and rarely grades/providers, e.g. if the caller pre-filters cross-grade
  // topics). Frame what is actually shared; list what differs.
  const uniq = <T,>(xs: T[]): T[] => Array.from(new Set(xs));
  const providersUniq = uniq(ts.map((t) => t.providerName));
  const gradesUniq = uniq(ts.map((t) => t.gradeName));
  const subjectsUniq = uniq(ts.map((t) => t.subjectName));

  const parts = [
    describeScope("", providersUniq),
    describeScope("", gradesUniq),
    describeScope("across", subjectsUniq),
  ].filter(Boolean);
  const framing = parts.length > 0 ? `Scope: ${parts.join(" ")}.` : "";

  const topicNames = ts
    .map((t) =>
      subjectsUniq.length > 1
        ? `"${t.name}" (${t.subjectName})`
        : `"${t.name}"`
    )
    .join(", ");

  const system =
    "You are a friendly but rigorous academic interviewer. Generate questions grounded strictly in the provided material — do NOT invent topics outside it. Respond with strict JSON only.";
  const user = `${framing}
Create ${count} interview questions (difficulty: ${difficulty}) that test understanding of these topics: ${topicNames}.

The material below is authoritative. Base each question on a specific concept, definition, example, or formula from this material. Do not ask about anything that is not present below.

"""
${ctx}
"""

Mix conceptual ("what is", "explain", "why"), applied ("how would you", "give an example", "compare"), and short-answer questions. Each idealAnswer must be a 2-4 sentence model response drawn from the material above.

Never ask about the app, this platform, "mock test", "mock interview", or any UI feature. Never ask meta questions like "a student who understands X should next be able to". Stay strictly on subject matter.

Return strict JSON:
{"questions":[{"question":"...","idealAnswer":"..."}]}`;

  const json = await groqJson<{ questions?: GenInterviewQ[] }>({
    system,
    user,
    model: GROQ_MODEL,
    temperature: 0.4,
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
