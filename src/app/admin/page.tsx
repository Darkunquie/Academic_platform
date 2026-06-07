import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

async function pendingCount() {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.role, "student"), eq(users.status, "pending")));
  return row?.n ?? 0;
}

export default async function AdminHome() {
  const pending = await pendingCount();
  return (
    <div>
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/approvals"
          className="rounded-lg border border-gray-200 bg-white p-5 hover:border-blue-400"
        >
          <div className="text-3xl font-bold">{pending}</div>
          <div className="mt-1 text-sm text-gray-500">Pending approvals</div>
        </Link>
        <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-400">
          Curriculum management — Phase 2
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-400">
          Analytics — Phase 7
        </div>
      </div>
    </div>
  );
}
