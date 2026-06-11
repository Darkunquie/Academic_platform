import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { rateLimit as inMemoryLimit } from "./rate-limit";

type WindowSpec = `${number} s` | `${number} m` | `${number} h` | `${number} d`;

type LimitDef = { limit: number; window: WindowSpec; windowMs: number };

const sec = 1000;
const min = 60 * sec;
const hr = 60 * min;
const day = 24 * hr;

/**
 * Single source of truth for every rate-limited surface in the app.
 * Adding a new server action that calls an expensive resource? Add a key here.
 */
export const LIMITS = {
  signupIp: { limit: 5, window: "1 h", windowMs: hr },
  signupEmail: { limit: 3, window: "1 h", windowMs: hr },
  loginIp: { limit: 10, window: "1 m", windowMs: min },
  gen: { limit: 10, window: "1 m", windowMs: min },
  code: { limit: 20, window: "1 m", windowMs: min },
  grade: { limit: 30, window: "1 m", windowMs: min },
  stt: { limit: 60, window: "1 m", windowMs: min },
  selfUpload: { limit: 3, window: "24 h", windowMs: day },
} as const satisfies Record<string, LimitDef>;

export type LimitKey = keyof typeof LIMITS;

let cachedRedis: Redis | null = null;
const limiters = new Map<LimitKey, Ratelimit>();

function redis(): Redis | null {
  if (cachedRedis) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

function prefix(): string {
  return process.env.REDIS_KEY_PREFIX ?? "dev";
}

function limiter(key: LimitKey): Ratelimit | null {
  const cached = limiters.get(key);
  if (cached) return cached;
  const r = redis();
  if (!r) return null;
  const def = LIMITS[key];
  const rl = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(def.limit, def.window),
    prefix: `${prefix()}:rl:${key}`,
    analytics: false,
  });
  limiters.set(key, rl);
  return rl;
}

/**
 * Check a rate limit. Returns true if the action is allowed, false if rejected.
 * If Upstash is unavailable, falls back to the in-memory limiter so the gate
 * still works (per-process only, but better than no gate).
 */
export async function checkLimit(
  key: LimitKey,
  id: string
): Promise<boolean> {
  const rl = limiter(key);
  if (!rl) {
    const def = LIMITS[key];
    return inMemoryLimit(`${key}:${id}`, def.limit, def.windowMs);
  }
  try {
    const res = await rl.limit(id);
    return res.success;
  } catch {
    const def = LIMITS[key];
    return inMemoryLimit(`${key}:${id}`, def.limit, def.windowMs);
  }
}

export class RateLimitError extends Error {
  readonly key: LimitKey;
  constructor(key: LimitKey) {
    super(`rate-limit:${key}`);
    this.name = "RateLimitError";
    this.key = key;
  }
}

/** Throws RateLimitError if the limit is exceeded. */
export async function guardRate(key: LimitKey, id: string): Promise<void> {
  const ok = await checkLimit(key, id);
  if (!ok) throw new RateLimitError(key);
}
