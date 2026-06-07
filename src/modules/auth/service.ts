import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, auditLog, sections, providers, grades } from "@/db/schema";
import { hashPassword } from "./password";
import type { SignupInput } from "./validation";

export async function emailExists(email: string): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return !!row;
}

/** Create a new student in `pending` status. */
export async function createPendingStudent(input: SignupInput) {
  const passwordHash = await hashPassword(input.password);
  const [created] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone,
      country: input.country,
      state: input.state,
      passwordHash,
      role: "student",
      status: "pending",
      sectionId: input.sectionId,
      providerId: input.providerId,
      gradeId: input.gradeId,
    })
    .returning({ id: users.id, email: users.email });
  return created;
}

export async function listPendingStudents() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      country: users.country,
      state: users.state,
      section: sections.name,
      provider: providers.name,
      grade: grades.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(sections, eq(users.sectionId, sections.id))
    .leftJoin(providers, eq(users.providerId, providers.id))
    .leftJoin(grades, eq(users.gradeId, grades.id))
    .where(and(eq(users.role, "student"), eq(users.status, "pending")))
    .orderBy(desc(users.createdAt));
}

async function setStudentStatus(
  studentId: string,
  status: "approved" | "rejected",
  actorId: string
) {
  await db
    .update(users)
    .set({
      status,
      approvedBy: actorId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, studentId));

  await db.insert(auditLog).values({
    actorId,
    action: status === "approved" ? "approve_user" : "reject_user",
    entity: "users",
    entityId: studentId,
  });
}

export function approveStudent(studentId: string, actorId: string) {
  return setStudentStatus(studentId, "approved", actorId);
}

export function rejectStudent(studentId: string, actorId: string) {
  return setStudentStatus(studentId, "rejected", actorId);
}
