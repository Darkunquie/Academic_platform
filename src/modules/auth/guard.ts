import { auth } from "@/auth";

type SessionUser = {
  id: string;
  role: "super_admin" | "admin" | "student";
  status: "pending" | "approved" | "rejected";
  gradeId?: string | null;
};

/** Throws unless the caller is an admin or super admin. Returns the user. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Not authorized");
  }
  return user;
}

/** Throws unless the caller is a super admin. */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== "super_admin") {
    throw new Error("Not authorized");
  }
  return user;
}

/** Throws unless the caller is an approved student. Returns the user. */
export async function requireStudent(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== "student" || user.status !== "approved") {
    throw new Error("Not authorized");
  }
  return user;
}
