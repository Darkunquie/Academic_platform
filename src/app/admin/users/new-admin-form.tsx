"use client";

import { useMemo, useState, useTransition } from "react";
import { createAdminAction } from "@/modules/admin/actions";

type Prov = {
  id: string;
  name: string;
  kind: string;
  sectionName: string;
  state: string | null;
};

export function NewAdminForm({
  providers,
}: Readonly<{ providers: Prov[] }>) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

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

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    fd.delete("providerIds");
    for (const id of picked) fd.append("providerIds", id);
    start(async () => {
      try {
        await createAdminAction(fd);
        setName("");
        setEmail("");
        setPassword("");
        setPicked(new Set());
        setRole("admin");
        setOpen(false);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-primary-700 px-4 text-[13px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "16px" }}
        >
          person_add
        </span>
        New admin
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[20px] border border-ink-200 bg-white p-5 soft-shadow"
    >
      <header className="mb-4 flex items-center justify-between">
        <h2
          className="text-ink-900"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "24px",
            lineHeight: "28px",
          }}
        >
          New admin
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-500 hover:text-ink-900"
          aria-label="Close"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "20px" }}
          >
            close
          </span>
        </button>
      </header>

      {err && (
        <div className="mb-4 rounded-[10px] border border-coral-300 bg-coral-100 px-3 py-2 text-[13px] text-coral-700">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field
          label="Name"
          name="name"
          value={name}
          onChange={setName}
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={8}
          hint="At least 8 characters"
        />
        <div className="flex flex-col gap-1.5">
          <label
            className="ml-1 text-[11px] font-medium text-ink-700"
            style={{
              fontFamily: "var(--font-mono)",
              }}
          >
            Role
          </label>
          <select
            name="role"
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "admin" | "super_admin")
            }
            className="h-11 rounded-[12px] border-[1.5px] border-ink-200 bg-white px-3 text-[14px] text-ink-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          >
            <option value="admin">Admin (scoped)</option>
            <option value="super_admin">Super admin (all access)</option>
          </select>
        </div>
      </div>

      {role === "admin" && (
        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label
              className="ml-1 text-[11px] font-medium text-ink-700"
              style={{
                fontFamily: "var(--font-mono)",
                }}
            >
              Scope · pick providers ({picked.size} selected)
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search provider…"
              className="h-9 w-64 rounded-[10px] border border-ink-200 bg-white px-3 text-[13px] outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto rounded-[14px] border border-ink-200 bg-paper p-2">
            {filtered.slice(0, 200).map((p) => {
              const on = picked.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-[10px] border px-2.5 text-[12px] font-medium transition-all ${
                    on
                      ? "border-primary-700 bg-primary-700 text-white"
                      : "border-ink-200 bg-white text-ink-900 hover:border-primary-500"
                  }`}
                  title={`${p.sectionName}${p.state ? " · " + p.state : ""}`}
                >
                  {on && (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                    >
                      check
                    </span>
                  )}
                  {p.name}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <span className="px-2 py-1 text-[13px] text-ink-500">
                No matches.
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-ink-500">
            Admin will only see + manage selected providers' curriculum + students.
          </p>
        </section>
      )}

      <footer className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-10 items-center rounded-[12px] border border-ink-200 bg-white px-4 text-[13px] font-medium text-ink-900 hover:bg-paper"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-primary-700 px-4 text-[13px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create admin"}
        </button>
      </footer>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  minLength,
  hint,
}: Readonly<{
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  hint?: string;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="ml-1 text-[11px] font-medium text-ink-700"
        style={{ fontFamily: "var(--font-mono)", }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="h-11 rounded-[12px] border-[1.5px] border-ink-200 bg-white px-3 text-[14px] text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
      />
      {hint && <p className="text-[11px] text-ink-500">{hint}</p>}
    </div>
  );
}
