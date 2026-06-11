import { Redis } from "@upstash/redis";

const REDIS_TIMEOUT_MS = 50;
const CIRCUIT_THRESHOLD = 10;
const CIRCUIT_RESET_MS = 5 * 60 * 1000;

type CircuitState = {
  failures: number;
  openUntil: number;
};

const circuit: CircuitState = { failures: 0, openUntil: 0 };

let cachedClient: Redis | null = null;
let cachedPrefix: string | null = null;

function client(): Redis | null {
  if (cachedClient) return cachedClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedClient = new Redis({ url, token });
  return cachedClient;
}

function prefix(): string {
  if (cachedPrefix !== null) return cachedPrefix;
  cachedPrefix = process.env.REDIS_KEY_PREFIX ?? "dev";
  return cachedPrefix;
}

function k(key: string): string {
  return `${prefix()}:${key}`;
}

function circuitOpen(): boolean {
  return Date.now() < circuit.openUntil;
}

function recordFailure(): void {
  circuit.failures += 1;
  if (circuit.failures >= CIRCUIT_THRESHOLD) {
    circuit.openUntil = Date.now() + CIRCUIT_RESET_MS;
    circuit.failures = 0;
  }
}

function recordSuccess(): void {
  circuit.failures = 0;
}

async function withTimeout<T>(
  op: Promise<T>,
  fallback: T
): Promise<T> {
  const timeout = new Promise<T>((resolve) =>
    setTimeout(() => resolve(fallback), REDIS_TIMEOUT_MS)
  );
  return Promise.race([op, timeout]);
}

/** Returns true if Upstash is configured and reachable. Cheap check. */
export function redisAvailable(): boolean {
  return client() !== null && !circuitOpen();
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = client();
  if (!c || circuitOpen()) return null;
  try {
    const raw = await withTimeout(c.get<string>(k(key)), null);
    if (raw === null) return null;
    recordSuccess();
    return typeof raw === "string" ? (JSON.parse(raw) as T) : (raw as T);
  } catch {
    recordFailure();
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const c = client();
  if (!c || circuitOpen()) return;
  try {
    await withTimeout(
      c.set(k(key), JSON.stringify(value), { ex: ttlSeconds }),
      null
    );
    recordSuccess();
  } catch {
    recordFailure();
  }
}

export async function cacheDel(key: string): Promise<void> {
  const c = client();
  if (!c || circuitOpen()) return;
  try {
    await withTimeout(c.del(k(key)), 0);
    recordSuccess();
  } catch {
    recordFailure();
  }
}

export async function cacheIncr(
  key: string,
  ttlSeconds: number
): Promise<number> {
  const c = client();
  if (!c || circuitOpen()) return 0;
  try {
    const n = await withTimeout(c.incr(k(key)), 0);
    if (n === 1) await withTimeout(c.expire(k(key), ttlSeconds), 0);
    recordSuccess();
    return n;
  } catch {
    recordFailure();
    return 0;
  }
}

export async function cacheExists(key: string): Promise<boolean> {
  const c = client();
  if (!c || circuitOpen()) return false;
  try {
    const n = await withTimeout(c.exists(k(key)), 0);
    recordSuccess();
    return n > 0;
  } catch {
    recordFailure();
    return false;
  }
}

/** Two-tier cache: Redis hot → caller-supplied cold loader → repopulate Redis. */
export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T | null>
): Promise<T | null> {
  const hot = await cacheGet<T>(key);
  if (hot !== null) return hot;
  const cold = await loader();
  if (cold !== null) await cacheSet(key, cold, ttlSeconds);
  return cold;
}
