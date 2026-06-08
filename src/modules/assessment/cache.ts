import { createHash } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { generatedContent } from "@/db/schema";

/** Deterministic cache key for a (board+grade+subject+topic+type+...) combo. */
export function cacheKey(parts: (string | number)[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function getCached(key: string) {
  const [row] = await db
    .select()
    .from(generatedContent)
    .where(eq(generatedContent.cacheKey, key))
    .limit(1);
  if (row) {
    await db
      .update(generatedContent)
      .set({ hits: sql`${generatedContent.hits} + 1` })
      .where(eq(generatedContent.id, row.id));
  }
  return row ?? null;
}

export async function saveCached(
  key: string,
  type: "mock_test" | "interview" | "coding",
  payload: unknown,
  model: string
) {
  await db
    .insert(generatedContent)
    .values({ cacheKey: key, type, payload, model })
    .onConflictDoNothing();
}
