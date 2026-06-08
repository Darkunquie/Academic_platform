import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { sections, providers, grades, users, progress } from "@/db/schema";

export function sectionStats() {
  return db
    .select({
      id: sections.id,
      name: sections.name,
      code: sections.code,
      students: sql<number>`count(distinct ${users.id})::int`,
    })
    .from(sections)
    .leftJoin(
      users,
      and(
        eq(users.sectionId, sections.id),
        eq(users.role, "student"),
        eq(users.status, "approved")
      )
    )
    .groupBy(sections.id, sections.name, sections.code, sections.sortOrder)
    .orderBy(asc(sections.sortOrder));
}

export function providerStats(sectionId: string) {
  return db
    .select({
      id: providers.id,
      name: providers.name,
      kind: providers.kind,
      students: sql<number>`count(distinct ${users.id})::int`,
    })
    .from(providers)
    .leftJoin(
      users,
      and(
        eq(users.providerId, providers.id),
        eq(users.role, "student"),
        eq(users.status, "approved")
      )
    )
    .where(eq(providers.sectionId, sectionId))
    .groupBy(providers.id, providers.name, providers.kind)
    .orderBy(asc(providers.name));
}

export function gradeStats(providerId: string) {
  return db
    .select({
      id: grades.id,
      name: grades.name,
      students: sql<number>`count(distinct ${users.id})::int`,
      avgTest: sql<number>`coalesce(round(avg(${progress.testBest}))::int, 0)`,
      avgInterview: sql<number>`coalesce(round(avg(${progress.interviewBest}))::int, 0)`,
      codingSolved: sql<number>`coalesce(sum(${progress.codingSolved})::int, 0)`,
      topicsViewed: sql<number>`count(*) filter (where ${progress.contentViewed})::int`,
    })
    .from(grades)
    .leftJoin(
      users,
      and(
        eq(users.gradeId, grades.id),
        eq(users.role, "student"),
        eq(users.status, "approved")
      )
    )
    .leftJoin(progress, eq(progress.studentId, users.id))
    .where(eq(grades.providerId, providerId))
    .groupBy(grades.id, grades.name, grades.level)
    .orderBy(asc(grades.level));
}

export async function getSectionName(id: string) {
  const [row] = await db
    .select({ name: sections.name })
    .from(sections)
    .where(eq(sections.id, id))
    .limit(1);
  return row?.name ?? null;
}

export async function getProviderName(id: string) {
  const [row] = await db
    .select({
      name: providers.name,
      sectionId: sections.id,
      sectionName: sections.name,
    })
    .from(providers)
    .innerJoin(sections, eq(providers.sectionId, sections.id))
    .where(eq(providers.id, id))
    .limit(1);
  return row ?? null;
}

export async function platformTotals() {
  const [row] = await db
    .select({
      students: sql<number>`count(*) filter (where ${users.role} = 'student' and ${users.status} = 'approved')::int`,
      pending: sql<number>`count(*) filter (where ${users.role} = 'student' and ${users.status} = 'pending')::int`,
    })
    .from(users);
  return row;
}
