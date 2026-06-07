import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sections, providers, grades } from "@/db/schema";

export function getSections() {
  return db
    .select({ id: sections.id, code: sections.code, name: sections.name })
    .from(sections)
    .orderBy(asc(sections.sortOrder), asc(sections.name));
}

export function getProvidersBySection(sectionId: string) {
  return db
    .select({
      id: providers.id,
      name: providers.name,
      kind: providers.kind,
    })
    .from(providers)
    .where(eq(providers.sectionId, sectionId))
    .orderBy(asc(providers.name));
}

export function getGradesByProvider(providerId: string) {
  return db
    .select({ id: grades.id, name: grades.name, level: grades.level })
    .from(grades)
    .where(eq(grades.providerId, providerId))
    .orderBy(asc(grades.level), asc(grades.name));
}
