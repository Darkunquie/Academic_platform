"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireSuperAdmin } from "@/modules/auth/guard";
import * as svc from "./admin";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function revalidate(fd: FormData) {
  const path = str(fd, "revalidate");
  if (path) revalidatePath(path);
}

/* ----------------------------- Providers ---------------------------- */

export async function createProviderAction(fd: FormData) {
  const user = await requireSuperAdmin();
  const sectionId = str(fd, "sectionId");
  const name = str(fd, "name");
  const state = str(fd, "state"); // "" = national / all-states
  if (!sectionId || !name) return;

  const section = await svc.getSection(sectionId);
  if (!section) return;
  // Boards for school/intermediate; universities for everything else.
  const kind =
    section.code === "school" || section.code === "intermediate"
      ? "board"
      : "university";

  await svc.createProvider(sectionId, kind, name, user.id, state || null);
  revalidate(fd);
}

export async function renameProviderAction(fd: FormData) {
  await requireSuperAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (id && name) await svc.renameProvider(id, name);
  revalidate(fd);
}

export async function deleteProviderAction(fd: FormData) {
  await requireSuperAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteProvider(id);
  revalidate(fd);
}

/* ------------------------------ Grades ------------------------------ */

export async function createGradeAction(fd: FormData) {
  await requireAdmin();
  const providerId = str(fd, "providerId");
  const name = str(fd, "name");
  const level = Number(str(fd, "level")) || 0;
  if (providerId && name) await svc.createGrade(providerId, name, level);
  revalidate(fd);
}

export async function renameGradeAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (id && name) await svc.renameGrade(id, name);
  revalidate(fd);
}

export async function deleteGradeAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteGrade(id);
  revalidate(fd);
}

/* ----------------------------- Subjects ----------------------------- */

export async function createSubjectAction(fd: FormData) {
  await requireAdmin();
  const gradeId = str(fd, "gradeId");
  const name = str(fd, "name");
  const isCoding = fd.get("isCoding") === "on";
  if (gradeId && name) await svc.createSubject(gradeId, name, isCoding);
  revalidate(fd);
}

export async function renameSubjectAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (id && name) await svc.renameSubject(id, name);
  revalidate(fd);
}

export async function toggleSubjectCodingAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const isCoding = str(fd, "isCoding") === "true";
  if (id) await svc.setSubjectCoding(id, isCoding);
  revalidate(fd);
}

export async function deleteSubjectAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteSubject(id);
  revalidate(fd);
}

/* ----------------------------- Chapters ----------------------------- */

export async function createChapterAction(fd: FormData) {
  await requireAdmin();
  const subjectId = str(fd, "subjectId");
  const name = str(fd, "name");
  if (subjectId && name) await svc.createChapter(subjectId, name);
  revalidate(fd);
}

export async function renameChapterAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (id && name) await svc.renameChapter(id, name);
  revalidate(fd);
}

export async function deleteChapterAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteChapter(id);
  revalidate(fd);
}

/* ------------------------------ Topics ------------------------------ */

export async function createTopicAction(fd: FormData) {
  await requireAdmin();
  const chapterId = str(fd, "chapterId");
  const name = str(fd, "name");
  if (chapterId && name) await svc.createTopic(chapterId, name);
  revalidate(fd);
}

export async function createTopicFullAction(fd: FormData) {
  const user = await requireAdmin();
  const chapterId = str(fd, "chapterId");
  const name = str(fd, "name");
  if (!chapterId || !name) {
    revalidate(fd);
    return;
  }

  const contentSvc = await import("@/modules/content/service");
  const { saveFile } = await import("@/lib/storage");

  const topic = await svc.createTopic(chapterId, name);

  const body = String(fd.get("body") ?? "").trim();
  if (body) {
    await contentSvc.upsertTopicContent(topic.id, body, user.id);
  }

  const files = fd.getAll("files");
  for (const f of files) {
    if (!(f instanceof File) || f.size === 0) continue;
    const { key, size, mime } = await saveFile(f);
    const kind = mime.startsWith("image/")
      ? ("image" as const)
      : mime.startsWith("audio/")
        ? ("audio" as const)
        : ("pdf" as const);
    await contentSvc.addAsset(topic.id, kind, key, f.name, mime, size);
  }

  revalidate(fd);
}

export async function renameTopicAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (id && name) await svc.renameTopic(id, name);
  revalidate(fd);
}

export async function deleteTopicAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (id) await svc.deleteTopic(id);
  revalidate(fd);
}
