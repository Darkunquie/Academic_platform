"use server";
import { safeErrorMessage } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireStudent } from "@/modules/auth/guard";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/db";
import * as svc from "./service";
import { generateMcqs } from "./generate";
import {
  extractDocxText,
  parseMcqText,
  type ParsedMcq,
} from "./import";
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

export async function parseMcqUploadAction(
  fd: FormData
): Promise<
  | { ok: true; items: ParsedMcq[] }
  | { ok: false; error: string }
> {
  const user = await requireAdmin();
  if (!rateLimit(`parse-mcq:${user.id}`, 5, 60_000)) {
    return { ok: false, error: "Rate limit hit. Wait a minute and retry." };
  }
  const file = fd.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file" };
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "File too large (max 5 MB)" };
  }
  try {
    const name = file.name.toLowerCase();
    let text: string;
    if (name.endsWith(".docx")) {
      text = await extractDocxText(await file.arrayBuffer());
    } else if (
      name.endsWith(".md") ||
      name.endsWith(".txt") ||
      file.type.startsWith("text/")
    ) {
      text = await file.text();
    } else {
      return {
        ok: false,
        error: "Only .docx, .md, .txt are supported",
      };
    }
    const items = parseMcqText(text);
    if (items.length === 0) {
      return {
        ok: false,
        error: "No questions detected. Check the template format.",
      };
    }
    return { ok: true, items };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function bulkImportMcqsAction(input: {
  topicId: string;
  items: ParsedMcq[];
}): Promise<{ ok: boolean; inserted?: number; skipped?: number; error?: string }> {
  const user = await requireAdmin();
  if (!input.topicId) return { ok: false, error: "Missing topicId" };
  try {
    const { inserted, skipped } = await db.transaction(async (tx) => {
      let inserted = 0;
      let skipped = 0;
      for (const item of input.items) {
        const opts = item.options.filter((o) => o.text.trim().length > 0);
        if (!item.prompt.trim() || opts.length < 2) {
          skipped += 1;
          continue;
        }
        await svc.createMcqQuestion(
          {
            topicId: input.topicId,
            prompt: item.prompt,
            options: opts,
            difficulty: item.difficulty,
            source: "human",
            explanation: item.explanation,
            createdBy: user.id,
          },
          tx
        );
        inserted += 1;
      }
      return { inserted, skipped };
    });
    revalidatePath(`/admin/curriculum/topic/${input.topicId}/test`);
    return { ok: true, inserted, skipped };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function generateQuestionsAction(input: {
  topicId: string;
  count: number;
  difficulty: "easy" | "medium" | "hard";
  fresh?: boolean;
}): Promise<{ ok: boolean; count?: number; error?: string }> {
  const user = await requireAdmin();
  if (!rateLimit(`gen:${user.id}`, 20, 60_000)) {
    return { ok: false, error: "Rate limit hit. Wait a minute and retry." };
  }
  try {
    const gen = await generateMcqs(
      input.topicId,
      Math.min(Math.max(input.count, 1), 15),
      input.difficulty,
      input.fresh ?? false
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
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
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
