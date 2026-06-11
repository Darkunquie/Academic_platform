import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import type { User } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Throws unless the caller is an admin or super admin. Returns the user. */
export async function requireAdmin(): Promise<User> {
  const user = (await auth())?.user;
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Not authorized");
  }
  return user;
}

/** Throws unless the caller is a super admin. */
export async function requireSuperAdmin(): Promise<User> {
  const user = (await auth())?.user;
  if (!user || user.role !== "super_admin") {
    throw new Error("Not authorized");
  }
  return user;
}

/**
 * Throws unless the caller is an approved student. Returns the user.
 *
 * Checks the JWT first (cheap), then verifies the LIVE status in the DB so a
 * rejected/banned student loses access immediately, not at token expiry.
 */
export async function requireStudent(): Promise<User> {
  const user = (await auth())?.user;
  if (!user || user.role !== "student" || user.status !== "approved") {
    throw new Error("Not authorized");
  }

  const [row] = await db
    .select({ status: users.status, role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row || row.role !== "student" || row.status !== "approved") {
    throw new Error("Not authorized");
  }

  return user;
}
