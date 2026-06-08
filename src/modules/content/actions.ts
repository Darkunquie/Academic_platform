"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/guard";
import { saveFile, deleteFile } from "@/lib/storage";
import * as svc from "./service";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export async function saveTopicContentAction(fd: FormData) {
  const user = await requireAdmin();
  const topicId = str(fd, "topicId");
  const body = String(fd.get("body") ?? "");
  if (topicId) await svc.upsertTopicContent(topicId, body, user.id);
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

export async function uploadAssetAction(fd: FormData) {
  await requireAdmin();
  const topicId = str(fd, "topicId");
  const file = fd.get("file");
  if (!topicId || !(file instanceof File) || file.size === 0) return;

  const { key, size, mime } = await saveFile(file);
  const kind = mime.startsWith("image/")
    ? "image"
    : mime.startsWith("audio/")
      ? "audio"
      : "pdf";

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
