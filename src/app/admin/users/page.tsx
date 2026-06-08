import Link from "next/link";
import { auth } from "@/auth";
import { requireAdmin } from "@/modules/auth/guard";
import {
  countByRole,
  getScope,
  listProvidersForScope,
  listUsers,
  type Role,
  type Status,
} from "@/modules/admin/users";
import { UserRow } from "./user-row";
import { NewAdminForm } from "./new-admin-form";

export const dynamic = "force-dynamic";

type Search = Promise<{
  role?: string;
  status?: string;
  q?: string;
}>;

export default async function AdminUsersPage({
  searchParams,
}: Readonly<{ searchParams: Search }>) {
  await requireAdmin();
  const session = await auth();
  const me = session?.user;
  const isSuper = me?.role === "super_admin";

  const s = await searchParams;
  const role = (s.role ?? "all") as Role | "all";
  const status = (s.status ?? "all") as Status | "all";
  const q = s.q ?? "";

  const [rows, counts, providers] = await Promise.all([
    listUsers({ role, status, q }),
    countByRole(),
    listProvidersForScope(),
  ]);

  // Preload scope per admin row (small N, OK to N+1 here)
  const scopes = new Map<string, string[]>();
  for (const r of rows) {
    if (r.role === "admin") {
      scopes.set(r.id, await getScope(r.id));
    }
  }

  const total = rows.length;
  const countMap = new Map(counts.map((c) => [c.role, c.n]));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="mb-1 text-[11px] uppercase text-ink-500"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            01 — User management
          </p>
          <h1
            className="text-primary-900"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "42px",
              lineHeight: "46px",
              letterSpacing: "-0.01em",
              fontWeight: 400,
            }}
          >
            People
          </h1>
          <p className="mt-1 text-[14px] text-ink-700">
            Manage admins, students, roles, scopes, passwords.
          </p>
        </div>

        {isSuper && <NewAdminForm providers={providers} />}
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total" value={total} tone="ink" />
        <Stat
          label="Super admins"
          value={countMap.get("super_admin") ?? 0}
          tone="coral"
        />
        <Stat label="Admins" value={countMap.get("admin") ?? 0} tone="indigo" />
        <Stat
          label="Students"
          value={countMap.get("student") ?? 0}
          tone="primary"
        />
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-[16px] border border-ink-200 bg-white p-4 soft-shadow">
        <Filter label="Search" name="q" defaultValue={q} type="text" placeholder="name, email, phone" wide />
        <SelectFilter
          label="Role"
          name="role"
          value={role}
          options={[
            ["all", "All"],
            ["super_admin", "Super admin"],
            ["admin", "Admin"],
            ["student", "Student"],
          ]}
        />
        <SelectFilter
          label="Status"
          name="status"
          value={status}
          options={[
            ["all", "All"],
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
          ]}
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-primary-700 px-4 text-[13px] font-semibold text-white hover:bg-primary-900"
        >
          Apply
        </button>
        <Link
          href="/admin/users"
          className="inline-flex h-10 items-center gap-1.5 rounded-[12px] border border-ink-200 bg-white px-4 text-[13px] font-medium text-ink-700 hover:bg-paper"
        >
          Reset
        </Link>
      </form>

      <div className="overflow-hidden rounded-[20px] border border-ink-200 bg-white soft-shadow">
        <header className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_120px] gap-3 border-b border-ink-200 bg-ink-900 px-5 py-3 text-[10px] uppercase text-white">
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
            User
          </span>
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
            Role
          </span>
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
            Status
          </span>
          <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
            Scope / Class
          </span>
          <span
            className="text-right"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            Actions
          </span>
        </header>

        {rows.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <p
              className="text-ink-900"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
              }}
            >
              No users match.
            </p>
            <p className="mt-2 text-[13px] text-ink-500">
              Adjust filters or invite someone via "New admin".
            </p>
          </div>
        ) : (
          <ul>
            {rows.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                providers={providers}
                initialScope={scopes.get(u.id) ?? []}
                isSelf={u.id === me?.id}
                canEditRole={isSuper}
              />
            ))}
          </ul>
        )}
      </div>

      {!isSuper && (
        <p className="text-[12px] text-ink-500">
          Some actions (change role, manage scope, create admins) require super-admin.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: Readonly<{
  label: string;
  value: number;
  tone: "ink" | "primary" | "coral" | "indigo";
}>) {
  const t =
    tone === "primary"
      ? "text-primary-700"
      : tone === "coral"
        ? "text-coral-700"
        : tone === "indigo"
          ? "text-indigo-700"
          : "text-ink-900";
  return (
    <div className="rounded-[16px] border border-ink-200 bg-white px-4 py-3 soft-shadow">
      <p
        className="text-[10px] uppercase text-ink-500"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-[28px] font-semibold ${t}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </p>
    </div>
  );
}

function Filter({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  wide,
}: Readonly<{
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  wide?: boolean;
}>) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "min-w-[260px] flex-1" : ""}`}>
      <label
        className="ml-1 text-[10px] uppercase text-ink-500"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
      >
        {label}
      </label>
      <input
        name={name}
        defaultValue={defaultValue}
        type={type}
        placeholder={placeholder}
        className="h-10 rounded-[10px] border-[1.5px] border-ink-200 bg-white px-3 text-[13px] outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
      />
    </div>
  );
}

function SelectFilter({
  label,
  name,
  value,
  options,
}: Readonly<{
  label: string;
  name: string;
  value: string;
  options: [string, string][];
}>) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="ml-1 text-[10px] uppercase text-ink-500"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
      >
        {label}
      </label>
      <select
        name={name}
        defaultValue={value}
        className="h-10 rounded-[10px] border-[1.5px] border-ink-200 bg-white px-3 text-[13px] outline-none focus:border-primary-500"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
