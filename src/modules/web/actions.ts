"use server";
import { safeErrorMessage } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireStudent } from "@/modules/auth/guard";
import { rateLimit } from "@/lib/rate-limit";
import * as svc from "./service";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

/* ------------------------------ Admin ------------------------------- */

export async function createWebQuestionAction(fd: FormData) {
  const user = await requireAdmin();
  const topicId = str(fd, "topicId");
  const title = str(fd, "title");
  const prompt = str(fd, "prompt");
  const rawDifficulty = str(fd, "difficulty") || "easy";
  const difficulty: "easy" | "medium" | "hard" =
    ["easy", "medium", "hard"].includes(rawDifficulty)
      ? (rawDifficulty as "easy" | "medium" | "hard")
      : "easy";
  const htmlStarter = String(fd.get("htmlStarter") ?? "");
  const cssStarter = String(fd.get("cssStarter") ?? "");
  const jsStarter = String(fd.get("jsStarter") ?? "");

  if (topicId && title && prompt) {
    await svc.createWebQuestion({
      topicId,
      title,
      prompt,
      difficulty,
      htmlStarter,
      cssStarter,
      jsStarter,
      createdBy: user.id,
    });
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function deleteWebQuestionAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteWebQuestion(id);
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function updateWebStartersAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) {
    await svc.updateWebStarters(id, {
      htmlStarter: String(fd.get("htmlStarter") ?? ""),
      cssStarter: String(fd.get("cssStarter") ?? ""),
      jsStarter: String(fd.get("jsStarter") ?? ""),
    });
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

const EXPRESSION_MAX_LEN = 500;
const EXPRESSION_BLOCKLIST = [
  "import(",
  "import ",
  "fetch(",
  "XMLHttpRequest",
  "WebSocket",
  "document.cookie",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "navigator.sendBeacon",
  "navigator.credentials",
  "parent.",
  "top.",
  "opener.",
  "postMessage",
  "eval(",
  "Function(",
  "constructor.constructor",
  "<script",
];

function validateExpression(expr: string): string | null {
  if (expr.length > EXPRESSION_MAX_LEN) {
    return `Expression exceeds ${EXPRESSION_MAX_LEN} characters`;
  }
  const lower = expr.toLowerCase();
  for (const tok of EXPRESSION_BLOCKLIST) {
    if (lower.includes(tok.toLowerCase())) {
      return `Expression contains disallowed token: ${tok}`;
    }
  }
  return null;
}

export async function addWebCheckAction(fd: FormData) {
  await requireAdmin();
  const webQuestionId = str(fd, "questionId");
  const label = str(fd, "label");
  const expression = String(fd.get("expression") ?? "");
  const weight = Number(str(fd, "weight")) || 1;
  const sortOrder = Number(str(fd, "sortOrder")) || 0;
  if (webQuestionId && label && expression) {
    const reason = validateExpression(expression);
    if (reason) throw new Error(reason);
    await svc.addWebCheck({
      webQuestionId,
      label,
      expression,
      weight,
      sortOrder,
    });
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function deleteWebCheckAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteWebCheck(id);
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

/* ----------------------------- Student ------------------------------ */

export async function getCheckExpressionsAction(
  questionId: string
): Promise<
  | {
      ok: true;
      checks: { id: string; label: string; expression: string; weight: number }[];
    }
  | { ok: false; error: string }
> {
  try {
    await requireStudent();
    const checks = await svc.getCheckExpressions(questionId);
    return { ok: true, checks };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function submitWebAction(input: {
  questionId: string;
  html: string;
  css: string;
  js: string;
  results: { checkId: string; ok: boolean }[];
}): Promise<
  | { ok: true; result: svc.WebSubmitResult }
  | { ok: false; error: string }
> {
  const user = await requireStudent();
  if (!rateLimit(`web:${user.id}`, 20, 60_000)) {
    return { ok: false, error: "Rate limit hit. Slow down a moment." };
  }
  try {
    const result = await svc.storeWebSubmission({
      studentId: user.id,
      questionId: input.questionId,
      html: input.html,
      css: input.css,
      js: input.js,
      results: input.results,
    });
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}
