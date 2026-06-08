"use client";

import { useMemo, useState, useTransition } from "react";
import {
  changeRoleAction,
  resetPasswordAction,
  setScopeAction,
  setStatusAction,
} from "@/modules/admin/actions";
import type { UserRow as UR, Role, Status } from "@/modules/admin/users";

type Prov = {
  id: string;
  name: string;
  kind: string;
  sectionName: string;
  state: string | null;
};

const ROLE_CHIP: Record<Role, string> = {
  super_admin: "bg-coral-100 text-coral-700",
  admin: "bg-indigo-100 text-indigo-700",
  student: "bg-primary-100 text-primary-700",
};

const STATUS_CHIP: Record<Status, string> = {
  pending: "bg-coral-100 text-coral-700",
  approved: "bg-primary-100 text-primary-700",
  rejected: "bg-[#FCE0DE] text-[#B23A3A]",
};

export function UserRow({
  user,
  providers,
  initialScope,
  isSelf,
  canEditRole,
}: Readonly<{
  user: UR;
  providers: Prov[];
  initialScope: string[];
  isSelf: boolean;
  canEditRole: boolean;
}>) {
  const [open, setOpen] = useState<null | "role" | "status" | "scope" | "pw">(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set(initialScope));
  const [pw, setPw] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.state ?? "").toLowerCase().includes(q) ||
        p.sectionName.toLowerCase().includes(q)
    );
  }, [providers, search]);

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function doRole(r: Role) {
    setErr(null);
    const fd = new FormData();
    fd.append("userId", user.id);
    fd.append("role", r);
    start(async () => {
      try {
        await changeRoleAction(fd);
        setOpen(null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  async function doStatus(s: Status) {
    setErr(null);
    const fd = new FormData();
    fd.append("userId", user.id);
    fd.append("status", s);
    start(async () => {
      try {
        await setStatusAction(fd);
        setOpen(null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  async function doScope() {
    setErr(null);
    const fd = new FormData();
    fd.append("adminId", user.id);
    for (const id of picked) fd.append("providerIds", id);
    start(async () => {
      try {
        await setScopeAction(fd);
        setOpen(null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  async function doPw() {
    setErr(null);
    const fd = new FormData();
    fd.append("userId", user.id);
    fd.append("newPassword", pw);
    start(async () => {
      try {
        await resetPasswordAction(fd);
        setPw("");
        setOpen(null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <li>
      <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_120px] items-center gap-3 border-b border-ink-200 px-5 py-3 text-[13px]">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-semibold text-primary-700"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {(user.name ?? "?")
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-ink-900">
              {user.name}
              {isSelf && (
                <span
                  className="ml-2 rounded-full bg-paper px-2 py-0.5 text-[10px] text-ink-500"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  YOU
                </span>
              )}
            </p>
            <p
              className="truncate text-[12px] text-ink-500"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {user.email}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex h-6 w-fit items-center rounded-full px-2.5 text-[10px] font-semibold uppercase ${ROLE_CHIP[user.role]}`}
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
        >
          {user.role === "super_admin" ? "Super admin" : user.role}
          {user.role === "admin" && (
            <span className="ml-1 text-ink-500">· {user.scopeCount}</span>
          )}
        </span>

        <span
          className={`inline-flex h-6 w-fit items-center rounded-full px-2.5 text-[10px] font-semibold uppercase ${STATUS_CHIP[user.status]}`}
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
        >
          {user.status}
        </span>

        <span className="truncate text-[12px] text-ink-700">
          {user.role === "student"
            ? [user.section, user.provider, user.grade]
                .filter(Boolean)
                .join(" · ") || "—"
            : "—"}
        </span>

        <div className="flex items-center justify-end gap-1">
          {!isSelf && user.status === "pending" && (
            <ActionBtn
              icon="check"
              label="Approve"
              tone="primary"
              onClick={() => doStatus("approved")}
            />
          )}
          {canEditRole && !isSelf && (
            <ActionBtn
              icon="badge"
              label="Role"
              onClick={() => setOpen(open === "role" ? null : "role")}
            />
          )}
          {canEditRole && user.role === "admin" && (
            <ActionBtn
              icon="hub"
              label="Scope"
              onClick={() => setOpen(open === "scope" ? null : "scope")}
            />
          )}
          {canEditRole && !isSelf && (
            <ActionBtn
              icon="key"
              label="Password"
              onClick={() => setOpen(open === "pw" ? null : "pw")}
            />
          )}
          {!isSelf && user.status === "approved" && (
            <ActionBtn
              icon="block"
              label="Suspend"
              tone="danger"
              onClick={() => doStatus("rejected")}
            />
          )}
        </div>
      </div>

      {open && (
        <div className="border-b border-ink-200 bg-paper px-5 py-4">
          {err && (
            <div className="mb-3 rounded-[8px] border border-coral-300 bg-coral-100 px-3 py-2 text-[12px] text-coral-700">
              {err}
            </div>
          )}

          {open === "role" && (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] uppercase text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                Change role to:
              </span>
              {(["student", "admin", "super_admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={pending || r === user.role}
                  onClick={() => doRole(r)}
                  className={`inline-flex h-8 items-center rounded-[10px] border px-3 text-[12px] font-medium transition-colors ${
                    r === user.role
                      ? "cursor-not-allowed border-ink-200 bg-paper text-ink-300"
                      : "border-ink-200 bg-white text-ink-900 hover:border-primary-500 hover:text-primary-700"
                  }`}
                >
                  {r === "super_admin" ? "Super admin" : r}
                </button>
              ))}
            </div>
          )}

          {open === "scope" && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-[11px] uppercase text-ink-500"
                  style={{
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.12em",
                  }}
                >
                  Scope · {picked.size} selected
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="h-8 w-64 rounded-[8px] border border-ink-200 bg-white px-2.5 text-[12px] outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex max-h-60 flex-wrap gap-1.5 overflow-y-auto rounded-[12px] border border-ink-200 bg-white p-2">
                {filtered.slice(0, 200).map((p) => {
                  const on = picked.has(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggle(p.id)}
                      className={`inline-flex h-7 items-center gap-1 rounded-[8px] border px-2 text-[11px] font-medium transition-colors ${
                        on
                          ? "border-primary-700 bg-primary-700 text-white"
                          : "border-ink-200 bg-white text-ink-900 hover:border-primary-500"
                      }`}
                    >
                      {on && (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "12px" }}
                        >
                          check
                        </span>
                      )}
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={doScope}
                  disabled={pending}
                  className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-primary-700 px-3 text-[12px] font-semibold text-white hover:bg-primary-900 disabled:opacity-60"
                >
                  Save scope
                </button>
              </div>
            </div>
          )}

          {open === "pw" && (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] uppercase text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                New password:
              </span>
              <input
                type="text"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="min 8 chars"
                className="h-8 w-64 rounded-[8px] border border-ink-200 bg-white px-2.5 text-[12px] outline-none focus:border-primary-500"
              />
              <button
                type="button"
                disabled={pending || pw.length < 8}
                onClick={doPw}
                className="inline-flex h-8 items-center rounded-[8px] bg-primary-700 px-3 text-[12px] font-semibold text-white hover:bg-primary-900 disabled:opacity-60"
              >
                Reset
              </button>
              <span className="text-[11px] text-ink-500">
                User must use this password next sign-in.
              </span>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  tone,
}: Readonly<{
  icon: string;
  label: string;
  onClick: () => void;
  tone?: "primary" | "danger";
}>) {
  const cls =
    tone === "primary"
      ? "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
      : tone === "danger"
        ? "border-[#FCE0DE] bg-[#FCE0DE]/40 text-[#B23A3A] hover:bg-[#FCE0DE]"
        : "border-ink-200 bg-white text-ink-700 hover:border-primary-500 hover:text-primary-700";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1 rounded-[8px] border px-2 text-[11px] font-medium transition-colors ${cls}`}
      title={label}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}
