export type UpstreamService =
  | "groq"
  | "piston"
  | "judge0"
  | "r2"
  | "resend"
  | "stt";

export class UpstreamError extends Error {
  readonly service: UpstreamService;
  readonly status: number;
  readonly userMessage: string;
  readonly internalDetail: string;

  constructor(
    service: UpstreamService,
    status: number,
    userMessage: string,
    internalDetail: string
  ) {
    super(`${service} ${status}: ${userMessage}`);
    this.name = "UpstreamError";
    this.service = service;
    this.status = status;
    this.userMessage = userMessage;
    this.internalDetail = internalDetail;
  }
}

export function safeErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof UpstreamError) return e.userMessage;
  if (e instanceof Error && e.message && e.message.length < 200) {
    return e.message;
  }
  return fallback;
}
