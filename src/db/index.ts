import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Singleton across the process AND dev hot-reloads. Caching must happen in
// production too — a per-call client leaks a 10-connection pool per request
// and exhausts Postgres within minutes.
const globalForDb = globalThis as unknown as {
  __preplyflyDb?: PostgresJsDatabase<typeof schema>;
};

function init(): PostgresJsDatabase<typeof schema> {
  if (globalForDb.__preplyflyDb) return globalForDb.__preplyflyDb;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
  });
  globalForDb.__preplyflyDb = drizzle(client, { schema });
  return globalForDb.__preplyflyDb;
}

// Lazy proxy: importing this module never connects (so `next build` can
// collect page data without DATABASE_URL). The DB is created on first query.
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    const real = init() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
