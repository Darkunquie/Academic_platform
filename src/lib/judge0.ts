// Judge0 client. Works with self-hosted Judge0 (JUDGE0_URL only) or
// Judge0 CE on RapidAPI (JUDGE0_URL + JUDGE0_KEY).

import { UpstreamError } from "./errors";

export type Judge0Result = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  status: { id: number; description: string } | null;
};

function base(): string {
  const url = process.env.JUDGE0_URL?.replace(/\/$/, "");
  if (!url) throw new Error("JUDGE0_URL is not configured. Add it to .env");
  return url;
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const key = process.env.JUDGE0_KEY;
  if (key) {
    // RapidAPI-style auth.
    h["X-RapidAPI-Key"] = key;
    try {
      h["X-RapidAPI-Host"] = new URL(base()).host;
    } catch {
      /* ignore */
    }
  }
  return h;
}

export async function runOne(args: {
  languageId: number;
  source: string;
  stdin?: string;
  expectedOutput?: string;
  cpuTimeLimit?: number;
  wallTimeLimit?: number;
}): Promise<Judge0Result> {
  const res = await fetch(
    `${base()}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        language_id: args.languageId,
        source_code: args.source,
        stdin: args.stdin ?? "",
        expected_output: args.expectedOutput ?? null,
        cpu_time_limit: args.cpuTimeLimit ?? 5,
        wall_time_limit: args.wallTimeLimit ?? (args.cpuTimeLimit ?? 5) * 2,
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new UpstreamError(
      "judge0",
      res.status,
      "Code sandbox unavailable. Please retry shortly.",
      text.slice(0, 1000)
    );
  }
  return res.json();
}

export function isSandboxConfigured(): boolean {
  return !!process.env.JUDGE0_URL;
}
