"use server";
import { safeErrorMessage } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireStudent } from "@/modules/auth/guard";
import { rateLimit } from "@/lib/rate-limit";
import { LANG_KEYS } from "./languages";
import * as svc from "./service";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

/* ------------------------------ Admin ------------------------------- */

export async function createCodingQuestionAction(fd: FormData) {
  const user = await requireAdmin();
  const topicId = str(fd, "topicId");
  const title = str(fd, "title");
  const prompt = str(fd, "prompt");
  const constraints = String(fd.get("constraints") ?? "");
  const timeLimitMs = Number(str(fd, "timeLimitMs")) || 2000;
  const memLimitKb = Number(str(fd, "memLimitKb")) || 128000;
  const difficulty = (str(fd, "difficulty") || "easy") as
    | "easy"
    | "medium"
    | "hard";
  const languages = fd
    .getAll("lang")
    .map((l) => String(l))
    .filter((l) => LANG_KEYS.includes(l as never));

  if (topicId && title && prompt && languages.length > 0) {
    await svc.createCodingQuestion({
      topicId,
      title,
      prompt,
      constraints,
      timeLimitMs,
      memLimitKb,
      languages,
      difficulty,
      createdBy: user.id,
    });
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function updateCodingConstraintsAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const constraints = String(fd.get("constraints") ?? "");
  const timeLimitMs = Number(str(fd, "timeLimitMs")) || 2000;
  const memLimitKb = Number(str(fd, "memLimitKb")) || 128000;
  if (id) {
    await svc.updateCodingConstraints(id, {
      constraints,
      timeLimitMs,
      memLimitKb,
    });
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function deleteCodingQuestionAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteCodingQuestion(id);
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function updateCodingLanguagesAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const languages = fd
    .getAll("lang")
    .map((l) => String(l))
    .filter((l) => LANG_KEYS.includes(l as never));
  if (id && languages.length > 0) {
    await svc.updateCodingLanguages(id, languages);
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function addTestCaseAction(fd: FormData) {
  await requireAdmin();
  const codingQuestionId = str(fd, "questionId");
  const stdin = String(fd.get("stdin") ?? "");
  const expectedOutput = String(fd.get("expected") ?? "");
  const isSample = fd.get("isSample") === "on";
  const weight = Number(str(fd, "weight")) || 1;
  if (codingQuestionId) {
    await svc.addTestCase({
      codingQuestionId,
      stdin,
      expectedOutput,
      isSample,
      weight,
    });
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function deleteTestCaseAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteTestCase(id);
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

/* ----------------------------- Student ------------------------------ */

export async function runCodeAction(input: {
  questionId: string;
  language: string;
  source: string;
}): Promise<
  | { ok: true; result: svc.RunResult }
  | { ok: false; error: string }
> {
  const user = await requireStudent();
  if (!rateLimit(`code:${user.id}`, 20, 60_000)) {
    return { ok: false, error: "Rate limit hit. Slow down a moment." };
  }
  try {
    const result = await svc.runAndStore(
      user.id,
      input.questionId,
      input.language,
      input.source
    );
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}
