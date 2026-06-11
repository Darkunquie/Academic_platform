import { cacheGet, cacheIncr, cacheIncrBy } from "./cache";

const DEFAULT_CAP = 5_000_000; // 5M tokens/day ≈ $2.50/day at 8b mix
const ALERT_THRESHOLD = 0.8;

function dayKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `metric:groq:tokens:${today}`;
}

function errorKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `metric:groq:errors:${today}`;
}

function cap(): number {
  const raw = process.env.GROQ_DAILY_TOKEN_CAP;
  const n = raw ? Number(raw) : DEFAULT_CAP;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CAP;
}

/**
 * Returns true if the day's token budget is exhausted.
 * Fails open (returns false) if Redis is unreachable — we'd rather serve
 * students than refuse on a cache blip.
 */
export async function isOverCap(): Promise<boolean> {
  const used = (await cacheGet<number>(dayKey())) ?? 0;
  return used >= cap();
}

/**
 * Increment daily token spend by `tokens`. Returns the new total. Returns 0
 * on Redis miss (we still served the request — metric just lost this call).
 * Single atomic round-trip via Lua INCRBY+EXPIRE.
 */
export async function recordTokens(tokens: number): Promise<number> {
  if (!Number.isFinite(tokens) || tokens <= 0) return 0;
  const ttl = 35 * 24 * 60 * 60; // 35-day retention for monthly view
  const total = await cacheIncrBy(dayKey(), tokens, ttl);
  const capValue = cap();
  const alertAt = Math.floor(capValue * ALERT_THRESHOLD);
  if (total >= alertAt && total - tokens < alertAt) {
    console.warn(
      `[groq-cost] daily tokens at ${total} of ${capValue} cap (${(
        (total / capValue) *
        100
      ).toFixed(0)}%)`
    );
  }
  return total;
}

export async function recordGroqError(): Promise<void> {
  const ttl = 7 * 24 * 60 * 60;
  await cacheIncr(errorKey(), ttl);
}
