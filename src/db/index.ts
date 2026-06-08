import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse a single client across hot reloads / serverless invocations.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
  db?: PostgresJsDatabase<typeof schema>;
};

function init(): PostgresJsDatabase<typeof schema> {
  if (globalForDb.db) return globalForDb.db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = globalForDb.client ?? postgres(connectionString, { max: 10 });
  if (process.env.NODE_ENV !== "production") globalForDb.client = client;
  const instance = drizzle(client, { schema });
  if (process.env.NODE_ENV !== "production") globalForDb.db = instance;
  return instance;
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
