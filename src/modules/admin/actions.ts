"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/guard";
import * as svc from "./users";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}
function strs(fd: FormData, key: string) {
  return fd.getAll(key).map((v) => String(v ?? "").trim()).filter(Boolean);
}

async function requireSuper() {
  const u = await requireAdmin();
  if (u.role !== "super_admin")
    throw new Error("Only super-admin can perform this action");
  return u;
}

export async function createAdminAction(fd: FormData) {
  const me = await requireSuper();
  const role = str(fd, "role") as "admin" | "super_admin";
  await svc.createAdmin({
    name: str(fd, "name"),
    email: str(fd, "email"),
    password: str(fd, "password"),
    providerIds: strs(fd, "providerIds"),
    superAdmin: role === "super_admin",
    actorId: me.id,
  });
  revalidatePath("/admin/users");
}

export async function changeRoleAction(fd: FormData) {
  const me = await requireSuper();
  const userId = str(fd, "userId");
  const role = str(fd, "role") as svc.Role;
  if (!userId || !role) return;
  if (userId === me.id) throw new Error("Cannot change your own role");
  await svc.changeRole(userId, role, me.id);
  revalidatePath("/admin/users");
}

export async function setStatusAction(fd: FormData) {
  const me = await requireAdmin();
  const userId = str(fd, "userId");
  const status = str(fd, "status") as svc.Status;
  if (!userId || !status) return;
  await svc.setStatus(userId, status, me.id);
  revalidatePath("/admin/users");
  revalidatePath("/admin/approvals");
}

export async function setScopeAction(fd: FormData) {
  const me = await requireSuper();
  const adminId = str(fd, "adminId");
  const providerIds = strs(fd, "providerIds");
  if (!adminId) return;
  await svc.setScope(adminId, providerIds, me.id);
  revalidatePath("/admin/users");
}

export async function resetPasswordAction(fd: FormData) {
  const me = await requireSuper();
  const userId = str(fd, "userId");
  const newPassword = str(fd, "newPassword");
  if (!userId || !newPassword) return;
  await svc.resetPassword(userId, newPassword, me.id);
  revalidatePath("/admin/users");
}
