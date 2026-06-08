// Simple in-memory rate limiter (per single instance). Good enough for the
// low-traffic stage; swap for Redis if you scale to multiple instances.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Returns true if the action is allowed, false if the limit is exceeded.
 * @param key   unique key, e.g. `generate:<userId>`
 * @param limit max calls per window
 * @param windowMs window length in ms
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}
