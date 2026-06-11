import { auth } from "@/auth";
import type { User } from "next-auth";

/** Throws unless the caller is an admin or super admin. Returns the user. */
export async function requireAdmin(): Promise<User> {
  const user = (await auth())?.user;
  if (user?.role !== "admin" && user?.role !== "super_admin") {
    throw new Error("Not authorized");
  }
  return user;
}

/** Throws unless the caller is a super admin. */
export async function requireSuperAdmin(): Promise<User> {
  const user = (await auth())?.user;
  if (user?.role !== "super_admin") {
    throw new Error("Not authorized");
  }
  return user;
}

/** Throws unless the caller is an approved student. Returns the user. */
export async function requireStudent(): Promise<User> {
  const user = (await auth())?.user;
  if (user?.role !== "student" || user?.status !== "approved") {
    throw new Error("Not authorized");
  }
  return user;
}
