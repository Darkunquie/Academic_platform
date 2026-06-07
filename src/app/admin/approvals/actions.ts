"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { approveStudent, rejectStudent } from "@/modules/auth/service";

async function requireAdminId(): Promise<string> {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Not authorized");
  }
  return session!.user.id;
}

export async function approveAction(studentId: string) {
  const actorId = await requireAdminId();
  await approveStudent(studentId, actorId);
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
}

export async function rejectAction(studentId: string) {
  const actorId = await requireAdminId();
  await rejectStudent(studentId, actorId);
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
}
