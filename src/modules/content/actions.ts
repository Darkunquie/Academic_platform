"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/guard";
import { saveFile, deleteFile } from "@/lib/storage";
import { enqueueTopicPrewarm } from "@/modules/assessment/prewarm";
import * as svc from "./service";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function raw(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function kindFromMime(mime: string): "image" | "audio" | "pdf" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  return "pdf";
}

export async function saveTopicContentAction(fd: FormData) {
  const user = await requireAdmin();
  const topicId = str(fd, "topicId");
  const body = raw(fd, "body");
  const videoUrl = str(fd, "videoUrl");
  if (topicId) {
    await svc.upsertTopicContent(topicId, body, user.id, videoUrl);
    if (body.trim().length > 100) {
      void enqueueTopicPrewarm(topicId);
    }
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function uploadAssetAction(fd: FormData) {
  await requireAdmin();
  const topicId = str(fd, "topicId");
  const file = fd.get("file");
  if (!topicId || !(file instanceof File) || file.size === 0) return;

  const { key, size, mime } = await saveFile(file);
  const kind = kindFromMime(mime);

  await svc.addAsset(topicId, kind, key, file.name, mime, size);
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function deleteAssetAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) {
    const removed = await svc.deleteAssetRow(id);
    if (removed?.r2Key) await deleteFile(removed.r2Key);
  }
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}
