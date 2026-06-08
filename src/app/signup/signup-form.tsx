"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { INDIAN_STATES } from "@/lib/states";

type SectionOpt = { id: string; code: string; name: string };
type ProviderOpt = {
  id: string;
  name: string;
  kind?: "board" | "university";
};
type GradeOpt = { id: string; name: string; level: number };

const labelClass = "ml-1 text-[11px] font-medium uppercase text-ink-700";
const labelStyle = {
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.12em",
} as const;
const fieldClass =
  "h-12 w-full rounded-[14px] border-[1.5px] border-ink-200 bg-white px-4 text-[15px] text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:bg-paper disabled:cursor-not-allowed";

const STAGE_LABEL: Record<string, string> = {
  school: "Class",
  intermediate: "Year",
  college: "Course / year",
  postgrad: "Programme",
  professional: "Role",
};
const PROVIDER_LABEL: Record<string, string> = {
  school: "Board",
  intermediate: "Board",
  college: "University",
  postgrad: "University",
  professional: "Organisation",
};

export function SignupForm() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionOpt[]>([]);
  const [providers, setProviders] = useState<ProviderOpt[]>([]);
  const [grades, setGrades] = useState<GradeOpt[]>([]);
  const [providerSearch, setProviderSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India",
    state: "",
    password: "",
    sectionId: "",
    providerId: "",
    gradeId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const activeSection = useMemo(
    () => sections.find((s) => s.id === form.sectionId) ?? null,
    [sections, form.sectionId]
  );
  const code = activeSection?.code ?? "";

  useEffect(() => {
    fetch("/api/curriculum/sections")
      .then((r) => r.json())
      .then(setSections)
      .catch(() => setSections([]));
  }, []);

  useEffect(() => {
    if (!form.sectionId) {
      setProviders([]);
      return;
    }
    const q = new URLSearchParams({ sectionId: form.sectionId });
    if (form.state) q.set("state", form.state);
    fetch(`/api/curriculum/providers?${q.toString()}`)
      .then((r) => r.json())
      .then(setProviders)
      .catch(() => setProviders([]));
  }, [form.sectionId, form.state]);

  useEffect(() => {
    if (!form.providerId) {
      setGrades([]);
      return;
    }
    fetch(`/api/curriculum/grades?providerId=${form.providerId}`)
      .then((r) => r.json())
      .then(setGrades)
      .catch(() => setGrades([]));
  }, [form.providerId]);

  function pickStage(id: string) {
    set("sectionId", id);
    set("providerId", "");
    set("gradeId", "");
    setProviderSearch("");
  }
  function pickProvider(id: string) {
    set("providerId", id);
    set("gradeId", "");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[14px] border border-primary-200 bg-primary-50 px-5 py-4 text-[14px] text-primary-900">
        Account created. It is now{" "}
        <strong className="font-semibold">pending admin approval</strong>.
        Redirecting to login…
      </div>
    );
  }

  const filteredProviders = providers.filter((p) =>
    providerSearch.trim()
      ? p.name.toLowerCase().includes(providerSearch.trim().toLowerCase())
      : true
  );
  const useSearch = code === "postgrad" || code === "professional";
  const sortedGrades = [...grades].sort((a, b) => a.level - b.level);

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-[14px] border border-danger/30 bg-coral-100 px-4 py-3 text-[13px] text-coral-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass} style={labelStyle}>
          Full name
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Jane Doe"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass} style={labelStyle}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@school.edu"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={labelClass} style={labelStyle}>
            Phone
          </label>
          <input
            id="phone"
            required
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 90000 00000"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className={labelClass} style={labelStyle}>
            Country
          </label>
          <input
            id="country"
            required
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="state" className={labelClass} style={labelStyle}>
            State
          </label>
          <select
            id="state"
            required
            value={form.state}
            onChange={(e) => {
              set("state", e.target.value);
              set("providerId", "");
              set("gradeId", "");
            }}
            className={fieldClass}
          >
            <option value="">Select state…</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass} style={labelStyle}>
          Stage
        </span>
        {sections.length === 0 ? (
          <p className="text-[13px] text-ink-500">Loading…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => {
              const active = form.sectionId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pickStage(s.id)}
                  className={`inline-flex h-10 items-center rounded-[12px] border px-4 text-[13px] font-medium transition-all ${
                    active
                      ? "border-primary-700 bg-primary-700 text-white soft-shadow"
                      : "border-ink-200 bg-white text-ink-900 hover:border-primary-500 hover:text-primary-700"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {form.sectionId && providers.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={labelClass} style={labelStyle}>
            {PROVIDER_LABEL[code] ?? "Board"}
          </span>

          {useSearch && (
            <input
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              placeholder={`Search ${
                PROVIDER_LABEL[code]?.toLowerCase() ?? "provider"
              }…`}
              className={fieldClass}
            />
          )}

          <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto rounded-[14px] border border-ink-200 bg-paper p-2">
            {filteredProviders.length === 0 ? (
              <span className="px-2 py-1 text-[13px] text-ink-500">
                No matches.
              </span>
            ) : (
              filteredProviders.map((p) => {
                const active = form.providerId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickProvider(p.id)}
                    className={`inline-flex h-9 items-center rounded-[10px] border px-3 text-[13px] font-medium transition-all ${
                      active
                        ? "border-primary-700 bg-primary-700 text-white"
                        : "border-ink-200 bg-white text-ink-900 hover:border-primary-500 hover:text-primary-700"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {form.providerId && grades.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={labelClass} style={labelStyle}>
            {STAGE_LABEL[code] ?? "Class"}
          </span>
          <div className="flex flex-wrap gap-2">
            {sortedGrades.map((g) => {
              const active = form.gradeId === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => set("gradeId", g.id)}
                  className={`inline-flex h-10 min-w-[44px] items-center justify-center rounded-[10px] border px-3 text-[13px] font-medium transition-all ${
                    active
                      ? "border-primary-700 bg-primary-700 text-white soft-shadow"
                      : "border-ink-200 bg-white text-ink-900 hover:border-primary-500 hover:text-primary-700"
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {form.gradeId && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClass} style={labelStyle}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
            className={fieldClass}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !form.gradeId || !form.password}
        className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-primary-700 text-[15px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating…" : "Request access"}
        {!loading && (
          <span
            className="material-symbols-outlined transition-transform group-hover:translate-x-1"
            style={{ fontSize: "20px" }}
          >
            arrow_forward
          </span>
        )}
      </button>
    </form>
  );
}
