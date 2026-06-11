import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { groqPrewarmQueue } from "@/db/schema";

type Variant = {
  kind: "mock_test" | "interview";
  difficulty: "easy" | "medium" | "hard";
  count: number;
};

const DEFAULT_VARIANTS: Variant[] = [
  { kind: "mock_test", difficulty: "easy", count: 20 },
  { kind: "mock_test", difficulty: "medium", count: 20 },
  { kind: "mock_test", difficulty: "hard", count: 20 },
  { kind: "interview", difficulty: "medium", count: 10 },
];

/**
 * Enqueue pre-warm jobs for a topic. Idempotent — the unique index on
 * (topicId, kind, difficulty, count) lets us call this on every topic save
 * without producing duplicates.
 */
export async function enqueueTopicPrewarm(
  topicId: string,
  variants: Variant[] = DEFAULT_VARIANTS
): Promise<void> {
  if (!topicId) return;
  await db
    .insert(groqPrewarmQueue)
    .values(
      variants.map((v) => ({
        topicId,
        kind: v.kind,
        difficulty: v.difficulty,
        count: v.count,
      }))
    )
    .onConflictDoNothing();
}

export type PrewarmJob = {
  id: string;
  topicId: string;
  kind: "mock_test" | "interview";
  difficulty: "easy" | "medium" | "hard";
  count: number;
};

/**
 * Atomically claim the next pending job. Returns null if queue is empty.
 * Uses SELECT FOR UPDATE SKIP LOCKED semantics via a CTE so multiple workers
 * can run concurrently without double-claiming.
 */
export async function claimNextPrewarmJob(): Promise<PrewarmJob | null> {
  const res = await db.execute(sql`
    WITH next AS (
      SELECT id FROM ${groqPrewarmQueue}
      WHERE status = 'pending' AND attempts < 3
      ORDER BY enqueued_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE ${groqPrewarmQueue}
    SET status = 'running', started_at = now(), attempts = attempts + 1
    FROM next
    WHERE ${groqPrewarmQueue.id} = next.id
    RETURNING ${groqPrewarmQueue.id}, ${groqPrewarmQueue.topicId},
              ${groqPrewarmQueue.kind}, ${groqPrewarmQueue.difficulty},
              ${groqPrewarmQueue.count}
  `);
  const row = (res as unknown as { rows?: PrewarmJob[] }).rows?.[0];
  if (!row) return null;
  return row;
}

export async function markPrewarmDone(id: string): Promise<void> {
  await db
    .update(groqPrewarmQueue)
    .set({ status: "done", completedAt: new Date(), lastError: null })
    .where(eq(groqPrewarmQueue.id, id));
}

export async function markPrewarmFailed(
  id: string,
  err: string
): Promise<void> {
  await db
    .update(groqPrewarmQueue)
    .set({
      status: "failed",
      completedAt: new Date(),
      lastError: err.slice(0, 500),
    })
    .where(eq(groqPrewarmQueue.id, id));
}

export async function resetStalledPrewarms(
  olderThanMinutes = 10
): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
  const res = await db
    .update(groqPrewarmQueue)
    .set({ status: "pending" })
    .where(
      and(
        eq(groqPrewarmQueue.status, "running"),
        sql`${groqPrewarmQueue.startedAt} < ${cutoff.toISOString()}`
      )
    )
    .returning({ id: groqPrewarmQueue.id });
  return res.length;
}

export async function listPendingPrewarms(limit = 50) {
  return db
    .select()
    .from(groqPrewarmQueue)
    .where(eq(groqPrewarmQueue.status, "pending"))
    .orderBy(asc(groqPrewarmQueue.enqueuedAt))
    .limit(limit);
}
