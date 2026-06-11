"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { INDIAN_STATES } from "@/lib/states";

type SectionOpt = { id: string; code: string; name: string };
type ProviderOpt = {
  id: string;
  name: string;
  kind?: "board" | "university";
};
type GradeOpt = { id: string; name: string; level: number };

const labelClass =
  "block text-[11px] font-medium uppercase tracking-[0.05em] text-[#071e24]";
const labelStyle = { fontFamily: "JetBrains Mono, monospace" } as const;

const fieldClass =
  "h-12 w-full rounded-lg border border-[#cbd5e1] bg-white px-4 text-[15px] text-[#071e24] outline-none transition-all placeholder:text-[#c1c8cb] focus:border-[#785a00] focus:ring-2 focus:ring-[#785a00]/20 disabled:bg-[#e1f7ff] disabled:cursor-not-allowed";

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
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
    if (!agreed) {
      setError("Acknowledge the terms before continuing.");
      return;
    }
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
      <div
        className="rounded-lg border px-5 py-4 text-[14px]"
        style={{
          borderColor: "#a4cddc",
          backgroundColor: "#e1f7ff",
          color: "#002028",
        }}
      >
        Account created. It is now{" "}
        <strong className="font-bold">pending admin approval</strong>. Redirecting
        to login…
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
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-[13px]"
          style={{
            borderColor: "rgba(186,26,26,0.3)",
            backgroundColor: "#ffdad6",
            color: "#93000a",
          }}
        >
          {error}
        </div>
      )}

      {/* Full name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass} style={labelStyle}>
          Full Name
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="ALAN TURING"
          className={fieldClass}
        />
      </div>

      {/* Email + phone */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={labelClass} style={labelStyle}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="a.turing@preplyfly.edu"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-2">
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

      {/* Country + state */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
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

      {/* Stage */}
      <div className="flex flex-col gap-2">
        <span className={labelClass} style={labelStyle}>
          Stage
        </span>
        {sections.length === 0 ? (
          <p className="text-[13px]" style={{ color: "#41484b" }}>
            Loading…
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => {
              const active = form.sectionId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pickStage(s.id)}
                  className="inline-flex h-10 items-center rounded-lg border px-4 text-[13px] font-medium transition-all"
                  style={{
                    borderColor: active ? "#002028" : "#cbd5e1",
                    backgroundColor: active ? "#002028" : "#ffffff",
                    color: active ? "#ffffff" : "#071e24",
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Provider */}
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

          <div
            className="flex max-h-60 flex-wrap gap-2 overflow-y-auto rounded-lg border p-2"
            style={{ borderColor: "#cbd5e1", backgroundColor: "#e1f7ff" }}
          >
            {filteredProviders.length === 0 ? (
              <span
                className="px-2 py-1 text-[13px]"
                style={{ color: "#41484b" }}
              >
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
                    className="inline-flex h-9 items-center rounded-md border px-3 text-[13px] font-medium transition-all"
                    style={{
                      borderColor: active ? "#002028" : "#cbd5e1",
                      backgroundColor: active ? "#002028" : "#ffffff",
                      color: active ? "#ffffff" : "#071e24",
                    }}
                  >
                    {p.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Grade */}
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
                  className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-md border px-3 text-[13px] font-medium transition-all"
                  style={{
                    borderColor: active ? "#002028" : "#cbd5e1",
                    backgroundColor: active ? "#002028" : "#ffffff",
                    color: active ? "#ffffff" : "#071e24",
                  }}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Password */}
      {form.gradeId && (
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className={labelClass} style={labelStyle}>
            Security Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-[#daf2fa]"
              style={{ color: "#41484b" }}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="flex items-start gap-3 py-2">
        <input
          id="terms"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-[#cbd5e1] text-[#785a00] focus:ring-[#785a00]/30"
        />
        <label
          htmlFor="terms"
          className="text-[14px]"
          style={{ color: "#41484b", fontFamily: "Geist, sans-serif" }}
        >
          I acknowledge the{" "}
          <a
            href="#"
            className="font-medium underline underline-offset-4"
            style={{ color: "#785a00" }}
          >
            Terms of Service
          </a>{" "}
          and confirm my alignment with the academic integrity protocols.
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !form.gradeId || !form.password || !agreed}
        className="w-full rounded-lg px-6 py-4 text-white shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: "#002028",
          fontFamily: "Geist, sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        {loading ? "Initialising…" : "Create Account"}
      </button>
    </form>
  );
}
