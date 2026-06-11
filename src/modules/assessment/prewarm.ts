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
 * SELECT ... FOR UPDATE SKIP LOCKED inside a transaction lets multiple
 * workers run concurrently without double-claiming.
 */
export async function claimNextPrewarmJob(): Promise<PrewarmJob | null> {
  return db.transaction(async (tx) => {
    const [job] = await tx
      .select({
        id: groqPrewarmQueue.id,
        topicId: groqPrewarmQueue.topicId,
        kind: groqPrewarmQueue.kind,
        difficulty: groqPrewarmQueue.difficulty,
        count: groqPrewarmQueue.count,
      })
      .from(groqPrewarmQueue)
      .where(
        and(
          eq(groqPrewarmQueue.status, "pending"),
          sql`${groqPrewarmQueue.attempts} < 3`
        )
      )
      .orderBy(asc(groqPrewarmQueue.enqueuedAt))
      .limit(1)
      .for("update", { skipLocked: true });

    if (!job) return null;

    await tx
      .update(groqPrewarmQueue)
      .set({
        status: "running",
        startedAt: new Date(),
        attempts: sql`${groqPrewarmQueue.attempts} + 1`,
      })
      .where(eq(groqPrewarmQueue.id, job.id));

    return job as PrewarmJob;
  });
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
