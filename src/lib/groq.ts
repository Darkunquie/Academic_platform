import { UpstreamError } from "./errors";
import { isOverCap, recordGroqError, recordTokens } from "./groq-cost";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Env-overridable so a retired/renamed model is a config change, not a deploy.
export const GROQ_MODEL =
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
export const GROQ_FAST_MODEL =
  process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant";

/** Retry transient upstream failures (429/5xx) with short backoff. */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [1000, 3000];
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const status = e instanceof UpstreamError ? e.status : 0;
      const retriable = status === 429 || (status >= 500 && status < 600);
      if (!retriable || attempt >= delays.length) throw e;
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
  }
}

type GroqArgs = {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  json?: boolean;
};

/** Low-level Groq chat call (OpenAI-compatible API). */
export async function groqChat({
  system,
  user,
  model = GROQ_MODEL,
  temperature = 0.4,
  json = false,
}: GroqArgs): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set. Add it to .env");

  if (await isOverCap()) {
    throw new UpstreamError(
      "groq",
      429,
      "AI service paused for the day. Try again tomorrow or contact support.",
      "daily token cap reached"
    );
  }

  return withRetry(async () => {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      void recordGroqError();
      throw new UpstreamError(
        "groq",
        res.status,
        "AI service unavailable. Please retry shortly.",
        text.slice(0, 1000)
      );
    }

    const data = await res.json();
    const tokens = Number(data.usage?.total_tokens) || 0;
    if (tokens > 0) void recordTokens(tokens);
    return data.choices?.[0]?.message?.content ?? "";
  });
}

/** Groq call that returns parsed JSON (forces JSON response mode). */
export async function groqJson<T = unknown>(args: GroqArgs): Promise<T> {
  const raw = await groqChat({ ...args, json: true });
  return JSON.parse(raw) as T;
}

// Vision-capable model on Groq (Llama 4 Scout supports image inputs).
export const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

type GroqVisionArgs = {
  system: string;
  user: string;
  imageBase64: string;
  imageMime: string;
  model?: string;
  temperature?: number;
};

/** Groq multimodal chat with a single image. Returns raw text content. */
export async function groqVision(args: GroqVisionArgs): Promise<string> {
  return groqVisionMulti({
    system: args.system,
    user: args.user,
    images: [{ base64: args.imageBase64, mime: args.imageMime }],
    model: args.model,
    temperature: args.temperature,
  });
}

type GroqVisionMultiArgs = {
  system: string;
  user: string;
  images: { base64: string; mime: string }[];
  model?: string;
  temperature?: number;
};

/** Groq multimodal chat with one or more images in a single request. */
export async function groqVisionMulti({
  system,
  user,
  images,
  model = GROQ_VISION_MODEL,
  temperature = 0.2,
}: GroqVisionMultiArgs): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set. Add it to .env");
  if (images.length === 0) throw new Error("groqVisionMulti: no images");

  if (await isOverCap()) {
    throw new UpstreamError(
      "groq",
      429,
      "AI service paused for the day. Try again tomorrow or contact support.",
      "daily token cap reached"
    );
  }

  return withRetry(async () => {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: user },
              ...images.map((img) => ({
                type: "image_url" as const,
                image_url: {
                  url: `data:${img.mime};base64,${img.base64}`,
                },
              })),
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      void recordGroqError();
      throw new UpstreamError(
        "groq",
        res.status,
        "AI service unavailable. Please retry shortly.",
        text.slice(0, 1000)
      );
    }

    const data = await res.json();
    const tokens = Number(data.usage?.total_tokens) || 0;
    if (tokens > 0) void recordTokens(tokens);
    return data.choices?.[0]?.message?.content ?? "";
  });
}

const GROQ_STT_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
export const GROQ_STT_MODEL =
  process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo";

/** Transcribe an audio file with Groq Whisper. Returns the text. */
export async function groqTranscribe(
  file: File,
  model: string = GROQ_STT_MODEL
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set. Add it to .env");

  const form = new FormData();
  form.append("file", file, file.name || "audio.webm");
  form.append("model", model);
  form.append("response_format", "json");

  return withRetry(async () => {
    const res = await fetch(GROQ_STT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new UpstreamError(
        "stt",
        res.status,
        "Voice transcription unavailable. Please retry shortly.",
        text.slice(0, 1000)
      );
    }
    const data = await res.json();
    return data.text ?? "";
  });
}
