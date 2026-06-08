import { and, asc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { sections, providers, grades } from "@/db/schema";

export function getSections() {
  return db
    .select({ id: sections.id, code: sections.code, name: sections.name })
    .from(sections)
    .orderBy(asc(sections.sortOrder), asc(sections.name));
}

export function getProvidersBySection(sectionId: string, state?: string) {
  // National boards (state IS NULL) are always shown; state boards only when
  // they match the student's state.
  const where = state
    ? and(
        eq(providers.sectionId, sectionId),
        or(isNull(providers.state), eq(providers.state, state))
      )
    : eq(providers.sectionId, sectionId);

  return db
    .select({
      id: providers.id,
      name: providers.name,
      kind: providers.kind,
      state: providers.state,
    })
    .from(providers)
    .where(where)
    .orderBy(asc(providers.name));
}

export function getGradesByProvider(providerId: string) {
  return db
    .select({ id: grades.id, name: grades.name, level: grades.level })
    .from(grades)
    .where(eq(grades.providerId, providerId))
    .orderBy(asc(grades.level), asc(grades.name));
}
