import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  sections,
  providers,
  grades,
  subjects,
  chapters,
  topics,
} from "@/db/schema";

/* ----------------------------- Sections ----------------------------- */

export function listSections() {
  return db
    .select()
    .from(sections)
    .orderBy(asc(sections.sortOrder), asc(sections.name));
}

export async function getSection(id: string) {
  const [row] = await db.select().from(sections).where(eq(sections.id, id)).limit(1);
  return row;
}

/* ----------------------------- Providers ---------------------------- */

export function listProviders(sectionId: string) {
  return db
    .select()
    .from(providers)
    .where(eq(providers.sectionId, sectionId))
    .orderBy(asc(providers.name));
}

export async function getProviderChain(id: string) {
  const [row] = await db
    .select({
      id: providers.id,
      name: providers.name,
      kind: providers.kind,
      sectionId: sections.id,
      sectionName: sections.name,
      sectionCode: sections.code,
    })
    .from(providers)
    .innerJoin(sections, eq(providers.sectionId, sections.id))
    .where(eq(providers.id, id))
    .limit(1);
  return row;
}

export function createProvider(
  sectionId: string,
  kind: "board" | "university",
  name: string,
  createdBy: string,
  state?: string | null
) {
  return db
    .insert(providers)
    .values({ sectionId, kind, name, createdBy, state: state || null });
}

export function renameProvider(id: string, name: string) {
  return db.update(providers).set({ name }).where(eq(providers.id, id));
}

export function deleteProvider(id: string) {
  return db.delete(providers).where(eq(providers.id, id));
}

/* ------------------------------ Grades ------------------------------ */

export function listGrades(providerId: string) {
  return db
    .select()
    .from(grades)
    .where(eq(grades.providerId, providerId))
    .orderBy(asc(grades.level), asc(grades.name));
}

export async function getGradeChain(id: string) {
  const [row] = await db
    .select({
      id: grades.id,
      name: grades.name,
      providerId: providers.id,
      providerName: providers.name,
      sectionId: sections.id,
      sectionName: sections.name,
    })
    .from(grades)
    .innerJoin(providers, eq(grades.providerId, providers.id))
    .innerJoin(sections, eq(providers.sectionId, sections.id))
    .where(eq(grades.id, id))
    .limit(1);
  return row;
}

export function createGrade(providerId: string, name: string, level: number) {
  return db.insert(grades).values({ providerId, name, level });
}

export function renameGrade(id: string, name: string) {
  return db.update(grades).set({ name }).where(eq(grades.id, id));
}

export function deleteGrade(id: string) {
  return db.delete(grades).where(eq(grades.id, id));
}

/* ----------------------------- Subjects ----------------------------- */

export function listSubjects(gradeId: string) {
  return db
    .select()
    .from(subjects)
    .where(eq(subjects.gradeId, gradeId))
    .orderBy(asc(subjects.sortOrder), asc(subjects.name));
}

export async function getSubjectChain(id: string) {
  const [row] = await db
    .select({
      id: subjects.id,
      name: subjects.name,
      isCoding: subjects.isCoding,
      gradeId: grades.id,
      gradeName: grades.name,
      providerId: providers.id,
      providerName: providers.name,
      sectionId: sections.id,
      sectionName: sections.name,
    })
    .from(subjects)
    .innerJoin(grades, eq(subjects.gradeId, grades.id))
    .innerJoin(providers, eq(grades.providerId, providers.id))
    .innerJoin(sections, eq(providers.sectionId, sections.id))
    .where(eq(subjects.id, id))
    .limit(1);
  return row;
}

export function createSubject(
  gradeId: string,
  name: string,
  isCoding: boolean
) {
  return db.insert(subjects).values({ gradeId, name, isCoding });
}

export function renameSubject(id: string, name: string) {
  return db.update(subjects).set({ name }).where(eq(subjects.id, id));
}

export function setSubjectCoding(id: string, isCoding: boolean) {
  return db.update(subjects).set({ isCoding }).where(eq(subjects.id, id));
}

export function deleteSubject(id: string) {
  return db.delete(subjects).where(eq(subjects.id, id));
}

/* ----------------------------- Chapters ----------------------------- */

export function listChapters(subjectId: string) {
  return db
    .select()
    .from(chapters)
    .where(eq(chapters.subjectId, subjectId))
    .orderBy(asc(chapters.sortOrder), asc(chapters.name));
}

export async function getChapterChain(id: string) {
  const [row] = await db
    .select({
      id: chapters.id,
      name: chapters.name,
      subjectId: subjects.id,
      subjectName: subjects.name,
      gradeId: grades.id,
      gradeName: grades.name,
      providerId: providers.id,
      providerName: providers.name,
      sectionId: sections.id,
      sectionName: sections.name,
    })
    .from(chapters)
    .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
    .innerJoin(grades, eq(subjects.gradeId, grades.id))
    .innerJoin(providers, eq(grades.providerId, providers.id))
    .innerJoin(sections, eq(providers.sectionId, sections.id))
    .where(eq(chapters.id, id))
    .limit(1);
  return row;
}

export function createChapter(subjectId: string, name: string) {
  return db.insert(chapters).values({ subjectId, name });
}

export function renameChapter(id: string, name: string) {
  return db.update(chapters).set({ name }).where(eq(chapters.id, id));
}

export function deleteChapter(id: string) {
  return db.delete(chapters).where(eq(chapters.id, id));
}

/* ------------------------------ Topics ------------------------------ */

export function listTopics(chapterId: string) {
  return db
    .select()
    .from(topics)
    .where(eq(topics.chapterId, chapterId))
    .orderBy(asc(topics.sortOrder), asc(topics.name));
}

export async function getTopicChain(id: string) {
  const [row] = await db
    .select({
      id: topics.id,
      name: topics.name,
      chapterId: chapters.id,
      chapterName: chapters.name,
      subjectId: subjects.id,
      subjectName: subjects.name,
      isCoding: subjects.isCoding,
      gradeId: grades.id,
      gradeName: grades.name,
      providerId: providers.id,
      providerName: providers.name,
      sectionId: sections.id,
      sectionName: sections.name,
    })
    .from(topics)
    .innerJoin(chapters, eq(topics.chapterId, chapters.id))
    .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
    .innerJoin(grades, eq(subjects.gradeId, grades.id))
    .innerJoin(providers, eq(grades.providerId, providers.id))
    .innerJoin(sections, eq(providers.sectionId, sections.id))
    .where(eq(topics.id, id))
    .limit(1);
  return row;
}

export async function createTopic(chapterId: string, name: string) {
  const [row] = await db
    .insert(topics)
    .values({ chapterId, name })
    .returning({ id: topics.id });
  return row;
}

/** Full subjects → chapters → topics tree for a grade (student selectors). */
export async function listGradeTree(gradeId: string) {
  const subs = await db
    .select()
    .from(subjects)
    .where(eq(subjects.gradeId, gradeId))
    .orderBy(asc(subjects.sortOrder), asc(subjects.name));
  if (subs.length === 0) return [];

  const subIds = subs.map((s) => s.id);
  const chs = await db
    .select()
    .from(chapters)
    .where(inArray(chapters.subjectId, subIds))
    .orderBy(asc(chapters.sortOrder), asc(chapters.name));

  const chIds = chs.map((c) => c.id);
  const tps = chIds.length
    ? await db
        .select()
        .from(topics)
        .where(inArray(topics.chapterId, chIds))
        .orderBy(asc(topics.sortOrder), asc(topics.name))
    : [];

  return subs.map((s) => ({
    id: s.id,
    name: s.name,
    isCoding: s.isCoding,
    chapters: chs
      .filter((c) => c.subjectId === s.id)
      .map((c) => ({
        id: c.id,
        name: c.name,
        topics: tps
          .filter((t) => t.chapterId === c.id)
          .map((t) => ({ id: t.id, name: t.name })),
      })),
  }));
}

export function renameTopic(id: string, name: string) {
  return db.update(topics).set({ name }).where(eq(topics.id, id));
}

export function deleteTopic(id: string) {
  return db.delete(topics).where(eq(topics.id, id));
}
