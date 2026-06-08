import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { topicContent, contentAssets, progress } from "@/db/schema";

/* ----------------------------- Content ------------------------------ */

export async function getTopicContent(topicId: string) {
  const [row] = await db
    .select()
    .from(topicContent)
    .where(eq(topicContent.topicId, topicId))
    .limit(1);
  return row ?? null;
}

export async function upsertTopicContent(
  topicId: string,
  bodyHtml: string,
  updatedBy: string
) {
  await db
    .insert(topicContent)
    .values({ topicId, bodyHtml, updatedBy })
    .onConflictDoUpdate({
      target: topicContent.topicId,
      set: { bodyHtml, updatedBy, updatedAt: new Date() },
    });
}

/* ------------------------------ Assets ------------------------------ */

export function listTopicAssets(topicId: string) {
  return db
    .select()
    .from(contentAssets)
    .where(eq(contentAssets.topicId, topicId))
    .orderBy(asc(contentAssets.createdAt));
}

export function addAsset(
  topicId: string,
  kind: "pdf" | "image" | "audio",
  r2Key: string,
  filename: string,
  mime: string,
  sizeBytes: number
) {
  return db
    .insert(contentAssets)
    .values({ topicId, kind, r2Key, filename, mime, sizeBytes });
}

export async function getAsset(id: string) {
  const [row] = await db
    .select()
    .from(contentAssets)
    .where(eq(contentAssets.id, id))
    .limit(1);
  return row ?? null;
}

export async function deleteAssetRow(id: string) {
  const [row] = await db
    .delete(contentAssets)
    .where(eq(contentAssets.id, id))
    .returning({ r2Key: contentAssets.r2Key });
  return row ?? null;
}

/* ----------------------------- Progress ----------------------------- */

export async function markContentViewed(studentId: string, topicId: string) {
  await db
    .insert(progress)
    .values({ studentId, topicId, contentViewed: true })
    .onConflictDoUpdate({
      target: [progress.studentId, progress.topicId],
      set: { contentViewed: true, updatedAt: new Date() },
    });
}
