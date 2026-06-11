"use server";
import { safeErrorMessage } from "@/lib/errors";
import { requireStudent } from "@/modules/auth/guard";
import { getTopicChain } from "@/modules/curriculum/admin";
import { groqTranscribe } from "@/lib/groq";
import { rateLimit } from "@/lib/rate-limit";
import * as svc from "./service";

export async function startInterviewAction(input: {
  mode: "voice" | "text";
  topicIds: string[];
  difficulty: "easy" | "medium" | "hard";
  count: number;
}): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  const user = await requireStudent();
  if (!rateLimit(`interview:${user.id}`, 10, 60_000)) {
    return { ok: false, error: "Rate limit hit. Wait a minute and retry." };
  }
  const topicIds = [...new Set(input.topicIds)].filter(Boolean);
  if (topicIds.length === 0) {
    return { ok: false, error: "Select at least one topic." };
  }

  // Board/class scope: every topic must belong to the student's grade.
  for (const id of topicIds) {
    const chain = await getTopicChain(id);
    if (!chain || chain.gradeId !== user.gradeId) {
      return { ok: false, error: "Invalid topic selection." };
    }
  }

  try {
    const count = Math.min(Math.max(input.count, 1), 10);
    const sessionId = await svc.createSession(
      user.id,
      input.mode,
      topicIds,
      input.difficulty,
      count
    );
    return { ok: true, sessionId };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function transcribeAction(
  fd: FormData
): Promise<{ ok: boolean; text?: string; error?: string }> {
  const user = await requireStudent();
  if (!rateLimit(`stt:${user.id}`, 60, 60_000)) {
    return { ok: false, error: "Rate limit hit. Slow down a moment." };
  }
  const file = fd.get("audio");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No audio captured." };
  }
  try {
    const text = await groqTranscribe(file);
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function submitAnswerAction(input: {
  interviewQuestionId: string;
  transcript: string;
}): Promise<{ ok: boolean; score?: number; feedback?: string; error?: string }> {
  const user = await requireStudent();
  if (!rateLimit(`grade:${user.id}`, 30, 60_000)) {
    return { ok: false, error: "Rate limit hit. Slow down a moment." };
  }
  try {
    const { score, feedback } = await svc.answerQuestion(
      user.id,
      input.interviewQuestionId,
      input.transcript
    );
    return { ok: true, score, feedback };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function completeInterviewAction(
  sessionId: string
): Promise<{ ok: boolean; overall?: number; error?: string }> {
  const user = await requireStudent();
  try {
    const { overall } = await svc.completeSession(user.id, sessionId);
    return { ok: true, overall };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}
