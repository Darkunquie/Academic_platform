"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireStudent } from "@/modules/auth/guard";
import { rateLimit } from "@/lib/rate-limit";
import * as svc from "./service";
import { generateMcqs } from "./generate";
import type { SubmittedAnswer } from "./service";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

/* ------------------------------ Admin ------------------------------- */

export async function createQuestionAction(fd: FormData) {
  const user = await requireAdmin();
  const topicId = str(fd, "topicId");
  const prompt = str(fd, "prompt");
  const difficulty = (str(fd, "difficulty") || "medium") as
    | "easy"
    | "medium"
    | "hard";
  const correct = Number(str(fd, "correct"));

  const options = [0, 1, 2, 3]
    .map((i) => ({
      text: str(fd, `opt${i}`),
      isCorrect: i === correct,
    }))
    .filter((o) => o.text.length > 0);

  if (topicId && prompt && options.length >= 2) {
    await svc.createMcqQuestion({
      topicId,
      prompt,
      options,
      difficulty,
      source: "human",
      createdBy: user.id,
    });
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function deleteQuestionAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteQuestion(id);
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function generateQuestionsAction(input: {
  topicId: string;
  count: number;
  difficulty: "easy" | "medium" | "hard";
}): Promise<{ ok: boolean; count?: number; error?: string }> {
  const user = await requireAdmin();
  if (!rateLimit(`gen:${user.id}`, 20, 60_000)) {
    return { ok: false, error: "Rate limit hit. Wait a minute and retry." };
  }
  try {
    const gen = await generateMcqs(
      input.topicId,
      Math.min(Math.max(input.count, 1), 15),
      input.difficulty
    );
    for (const q of gen) {
      await svc.createMcqQuestion({
        topicId: input.topicId,
        prompt: q.prompt,
        options: q.options ?? [],
        difficulty: input.difficulty,
        source: "ai",
        explanation: q.explanation,
        createdBy: user.id,
      });
    }
    revalidatePath(`/admin/curriculum/topic/${input.topicId}/test`);
    return { ok: true, count: gen.length };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/* ----------------------------- Student ------------------------------ */

export async function submitTestAction(
  topicId: string,
  answers: SubmittedAnswer[]
) {
  const user = await requireStudent();
  return svc.gradeAndStoreTest(user.id, topicId, answers);
}
