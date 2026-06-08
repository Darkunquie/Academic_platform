import { auth } from "@/auth";

/** The logged-in student's grade scope, or null if not a scoped student. */
export async function studentGradeId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.role !== "student") return null;
  return session.user.gradeId ?? null;
}
