import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  adminScope,
  auditLog,
  sections,
  providers,
  grades,
} from "@/db/schema";
import { hashPassword } from "../auth/password";

export type Role = "super_admin" | "admin" | "student";
export type Status = "pending" | "approved" | "rejected";

export type UserFilter = {
  role?: Role | "all";
  status?: Status | "all";
  q?: string;
  sectionCode?: string;
  limit?: number;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: Status;
  country: string | null;
  state: string | null;
  section: string | null;
  provider: string | null;
  grade: string | null;
  createdAt: Date;
  scopeCount: number; // number of providers an admin can manage
};

export async function listUsers(f: UserFilter = {}): Promise<UserRow[]> {
  const conds = [];
  if (f.role && f.role !== "all") conds.push(eq(users.role, f.role));
  if (f.status && f.status !== "all") conds.push(eq(users.status, f.status));
  if (f.sectionCode) conds.push(eq(sections.code, f.sectionCode as never));
  if (f.q && f.q.trim()) {
    const q = `%${f.q.trim()}%`;
    conds.push(
      or(ilike(users.name, q), ilike(users.email, q), ilike(users.phone, q))!
    );
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      status: users.status,
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
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(f.limit ?? 200);

  if (rows.length === 0) return [];

  // Scope counts per admin
  const adminIds = rows.filter((r) => r.role === "admin").map((r) => r.id);
  const scopeCounts = new Map<string, number>();
  if (adminIds.length > 0) {
    const scopes = await db
      .select({
        adminId: adminScope.adminId,
        n: sql<number>`count(*)::int`,
      })
      .from(adminScope)
      .where(inArray(adminScope.adminId, adminIds))
      .groupBy(adminScope.adminId);
    for (const s of scopes) scopeCounts.set(s.adminId, s.n);
  }

  return rows.map((r) => ({
    ...r,
    role: r.role as Role,
    status: r.status as Status,
    scopeCount: scopeCounts.get(r.id) ?? 0,
  }));
}

export async function countByRole() {
  const rows = await db
    .select({ role: users.role, n: sql<number>`count(*)::int` })
    .from(users)
    .groupBy(users.role);
  return rows;
}

export async function getScope(adminId: string): Promise<string[]> {
  const rows = await db
    .select({ id: adminScope.providerId })
    .from(adminScope)
    .where(eq(adminScope.adminId, adminId));
  return rows.map((r) => r.id);
}

export async function listProvidersForScope() {
  return db
    .select({
      id: providers.id,
      name: providers.name,
      kind: providers.kind,
      sectionId: providers.sectionId,
      sectionName: sections.name,
      state: providers.state,
    })
    .from(providers)
    .innerJoin(sections, eq(providers.sectionId, sections.id))
    .orderBy(asc(sections.sortOrder), asc(providers.name));
}

export async function setScope(
  adminId: string,
  providerIds: string[],
  actorId: string
) {
  await db.transaction(async (tx) => {
    await tx.delete(adminScope).where(eq(adminScope.adminId, adminId));
    if (providerIds.length > 0) {
      await tx
        .insert(adminScope)
        .values(providerIds.map((pid) => ({ adminId, providerId: pid })));
    }
  });
  await db.insert(auditLog).values({
    actorId,
    action: "set_admin_scope",
    entity: "users",
    entityId: adminId,
    meta: { providerCount: providerIds.length },
  });
}

export async function changeRole(
  userId: string,
  role: Role,
  actorId: string
) {
  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));
  await db.insert(auditLog).values({
    actorId,
    action: "change_role",
    entity: "users",
    entityId: userId,
    meta: { role },
  });
  // If demoted from admin → clear scope
  if (role !== "admin" && role !== "super_admin") {
    await db.delete(adminScope).where(eq(adminScope.adminId, userId));
  }
}

export async function setStatus(
  userId: string,
  status: Status,
  actorId: string
) {
  await db
    .update(users)
    .set({
      status,
      approvedBy: actorId,
      approvedAt: status === "approved" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  await db.insert(auditLog).values({
    actorId,
    action: `set_status_${status}`,
    entity: "users",
    entityId: userId,
  });
}

export async function resetPassword(
  userId: string,
  newPassword: string,
  actorId: string
) {
  if (newPassword.length < 8) throw new Error("Password too short");
  const hash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash: hash, updatedAt: new Date() })
    .where(eq(users.id, userId));
  await db.insert(auditLog).values({
    actorId,
    action: "reset_password",
    entity: "users",
    entityId: userId,
  });
}

export async function createAdmin(args: {
  name: string;
  email: string;
  password: string;
  providerIds: string[];
  actorId: string;
  superAdmin?: boolean;
}) {
  const email = args.email.trim().toLowerCase();
  if (!email || !args.name.trim()) throw new Error("Name and email required");
  if (args.password.length < 8) throw new Error("Password too short");

  // Block duplicate
  const [exists] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (exists) throw new Error("Email already in use");

  const hash = await hashPassword(args.password);
  const [created] = await db
    .insert(users)
    .values({
      name: args.name.trim(),
      email,
      passwordHash: hash,
      role: args.superAdmin ? "super_admin" : "admin",
      status: "approved",
      country: "India",
    })
    .returning({ id: users.id });

  if (args.providerIds.length > 0 && !args.superAdmin) {
    await db
      .insert(adminScope)
      .values(
        args.providerIds.map((pid) => ({
          adminId: created.id,
          providerId: pid,
        }))
      );
  }

  await db.insert(auditLog).values({
    actorId: args.actorId,
    action: args.superAdmin ? "create_super_admin" : "create_admin",
    entity: "users",
    entityId: created.id,
    meta: { email, providerCount: args.providerIds.length },
  });

  return created;
}
