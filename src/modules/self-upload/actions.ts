"use server";
import { safeErrorMessage } from "@/lib/errors";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireStudent } from "@/modules/auth/guard";
import { rateLimit } from "@/lib/rate-limit";
import { groqJson, groqTranscribe, GROQ_FAST_MODEL } from "@/lib/groq";
import { scoreInterviewAnswer } from "@/modules/interview/generate";
import * as svc from "./service";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const MIN_TEXT_LEN = 200;
const MAX_CTX_CHARS = 4000;

export type SelfMcq = {
  prompt: string;
  options: { text: string; isCorrect: boolean }[];
  explanation?: string;
};

export type SelfInterviewQ = {
  question: string;
  idealAnswer: string;
};

function dailyKey(userId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `self-upload:${userId}:${today}`;
}

function quota(userId: string): boolean {
  return rateLimit(dailyKey(userId), 3, 24 * 60 * 60 * 1000);
}

export async function parsePdfAction(
  fd: FormData
): Promise<
  | { ok: true; text: string; pages: number; chars: number; pdfHash: string }
  | { ok: false; error: string }
> {
  const user = await requireStudent();
  if (!quota(user.id)) {
    return { ok: false, error: "Daily limit reached (3 self-uploads/day)." };
  }
  const file = fd.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file" };
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File too large (max 20 MB)" };
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith(".pdf") && !file.type.includes("pdf")) {
    return { ok: false, error: "Only PDF files are supported" };
  }
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    // pdf-parse v1.1.1 — direct lib path dodges the "test pdf at import"
    // bug present in the index.js entry, and avoids the v2 worker problem
    // (v2 pulls in pdfjs-dist worker which Next.js can't resolve at runtime).
    // @ts-expect-error — pdf-parse has no types for the lib subpath
    const mod = (await import("pdf-parse/lib/pdf-parse.js")) as unknown as
      | {
          default: (
            b: Buffer
          ) => Promise<{ text: string; numpages: number }>;
        }
      | ((
          b: Buffer
        ) => Promise<{ text: string; numpages: number }>);
    let pdfParse:
      | ((b: Buffer) => Promise<{ text: string; numpages: number }>)
      | null = null;
    if (typeof mod === "function") pdfParse = mod;
    else if (typeof mod.default === "function") pdfParse = mod.default;
    if (!pdfParse) throw new Error("pdf-parse module not callable");
    const result = await pdfParse(buf);
    const text = (result.text ?? "").trim();
    if (text.length < MIN_TEXT_LEN) {
      return {
        ok: false,
        error:
          "Could not extract text. Scanned/image-only PDFs aren't supported — please use a text-based PDF.",
      };
    }
    const pdfHash = createHash("sha256").update(text).digest("hex");
    return {
      ok: true,
      text: text.slice(0, MAX_CTX_CHARS),
      pages: result.numpages ?? 0,
      chars: text.length,
      pdfHash,
    };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function generateSelfTestAction(input: {
  text: string;
  count: number;
  difficulty: "easy" | "medium" | "hard";
}): Promise<
  { ok: true; questions: SelfMcq[] } | { ok: false; error: string }
> {
  await requireStudent();
  const count = Math.min(Math.max(input.count, 1), 15);
  if (!input.text || input.text.length < MIN_TEXT_LEN) {
    return { ok: false, error: "Empty or too-short context" };
  }
  try {
    const system =
      "You are an expert exam question writer. Always respond with strict JSON only.";
    const user = `Write ${count} multiple-choice questions (difficulty: ${input.difficulty}) based ONLY on the material below.
"""
${input.text.slice(0, MAX_CTX_CHARS)}
"""
Rules: exactly 4 options per question, exactly one correct. Cover different parts of the material. Return JSON of the shape:
{"questions":[{"prompt":"...","options":[{"text":"...","isCorrect":true},{"text":"...","isCorrect":false},{"text":"...","isCorrect":false},{"text":"...","isCorrect":false}],"explanation":"short reason"}]}`;
    const json = await groqJson<{ questions?: SelfMcq[] }>({
      system,
      user,
      model: GROQ_FAST_MODEL,
      temperature: 0.2,
    });
    const questions = Array.isArray(json.questions) ? json.questions : [];
    if (questions.length === 0) {
      return { ok: false, error: "AI returned no questions. Try again." };
    }
    return { ok: true, questions };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function generateSelfInterviewAction(input: {
  text: string;
  count: number;
  difficulty: "easy" | "medium" | "hard";
}): Promise<
  { ok: true; questions: SelfInterviewQ[] } | { ok: false; error: string }
> {
  await requireStudent();
  const count = Math.min(Math.max(input.count, 1), 10);
  if (!input.text || input.text.length < MIN_TEXT_LEN) {
    return { ok: false, error: "Empty or too-short context" };
  }
  try {
    const system =
      "You are a friendly but rigorous interviewer. Respond with strict JSON only.";
    const user = `Create ${count} interview questions (difficulty: ${input.difficulty}) based ONLY on the material below.
"""
${input.text.slice(0, MAX_CTX_CHARS)}
"""
Mix conceptual and applied questions. Return JSON:
{"questions":[{"question":"...","idealAnswer":"a concise model answer"}]}`;
    const json = await groqJson<{ questions?: SelfInterviewQ[] }>({
      system,
      user,
      model: GROQ_FAST_MODEL,
      temperature: 0.2,
    });
    const questions = Array.isArray(json.questions) ? json.questions : [];
    if (questions.length === 0) {
      return { ok: false, error: "AI returned no questions. Try again." };
    }
    return { ok: true, questions };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function scoreSelfAnswerAction(input: {
  question: string;
  idealAnswer: string;
  answer: string;
}): Promise<
  | { ok: true; score: number; feedback: string }
  | { ok: false; error: string }
> {
  await requireStudent();
  try {
    const r = await scoreInterviewAnswer(
      input.question,
      input.idealAnswer,
      input.answer
    );
    return { ok: true, score: r.score, feedback: r.feedback };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function transcribeSelfAudioAction(
  fd: FormData
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const user = await requireStudent();
  if (!rateLimit(`stt:${user.id}`, 60, 60_000)) {
    return { ok: false, error: "Rate limit hit. Wait a minute and retry." };
  }
  const audio = fd.get("audio");
  if (!(audio instanceof File)) return { ok: false, error: "No audio" };
  // Whisper API has a 25 MB limit; enforce 20 MB to stay under.
  if (audio.size > 20 * 1024 * 1024) {
    return { ok: false, error: "Audio file too large (max 20 MB)" };
  }
  try {
    const text = await groqTranscribe(audio);
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

/* ---------------------- Persistence: attempt history ---------------- */

export async function saveTestAttemptAction(input: {
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  pdfHash: string | null;
  questions: {
    prompt: string;
    options: { text: string; isCorrect: boolean }[];
    explanation?: string;
    studentChoice: number | null;
  }[];
}): Promise<
  { ok: true; attemptId: string } | { ok: false; error: string }
> {
  const user = await requireStudent();
  try {
    const items = input.questions.map((q) => {
      const correctIndex = q.options.findIndex((o) => o.isCorrect);
      return {
        prompt: q.prompt,
        options: q.options,
        correctIndex,
        explanation: q.explanation,
        studentChoice: q.studentChoice,
        isCorrect: q.studentChoice === correctIndex,
      };
    });
    const id = await svc.createTestAttempt({
      studentId: user.id,
      subject: input.subject.trim(),
      topic: input.topic.trim(),
      difficulty: input.difficulty,
      pdfHash: input.pdfHash,
      questions: items,
    });
    revalidatePath("/dashboard/self-upload");
    return { ok: true, attemptId: id };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function saveInterviewAttemptAction(input: {
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  pdfHash: string | null;
  questions: {
    prompt: string;
    idealAnswer: string;
    studentAnswer: string;
    score: number;
    feedback: string;
  }[];
}): Promise<
  { ok: true; attemptId: string } | { ok: false; error: string }
> {
  const user = await requireStudent();
  try {
    const id = await svc.createInterviewAttempt({
      studentId: user.id,
      subject: input.subject.trim(),
      topic: input.topic.trim(),
      difficulty: input.difficulty,
      pdfHash: input.pdfHash,
      questions: input.questions,
    });
    revalidatePath("/dashboard/self-upload");
    return { ok: true, attemptId: id };
  } catch (e) {
    return { ok: false, error: safeErrorMessage(e, "Something went wrong. Please retry.") };
  }
}

export async function deleteSelfAttemptAction(
  fd: FormData
): Promise<void> {
  const user = await requireStudent();
  const id = String(fd.get("id") ?? "").trim();
  if (id) {
    await svc.deleteSelfAttempt(id, user.id);
    revalidatePath("/dashboard/self-upload");
  }
}
