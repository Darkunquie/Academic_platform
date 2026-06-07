"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

type Opt = { id: string; name: string };

export function SignupForm() {
  const router = useRouter();
  const [sections, setSections] = useState<Opt[]>([]);
  const [providers, setProviders] = useState<Opt[]>([]);
  const [grades, setGrades] = useState<Opt[]>([]);

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

  useEffect(() => {
    fetch("/api/curriculum/sections")
      .then((r) => r.json())
      .then(setSections)
      .catch(() => setSections([]));
  }, []);

  // section -> providers
  useEffect(() => {
    if (!form.sectionId) {
      setProviders([]);
      return;
    }
    fetch(`/api/curriculum/providers?sectionId=${form.sectionId}`)
      .then((r) => r.json())
      .then(setProviders)
      .catch(() => setProviders([]));
  }, [form.sectionId]);

  // provider -> grades
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
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
        Account created. It is now <strong>pending admin approval</strong>.
        You can log in once approved. Redirecting to login…
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <Label>Full name</Label>
        <Input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            required
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Country</Label>
          <Input
            required
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </div>
        <div>
          <Label>State</Label>
          <Input
            required
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Section</Label>
        <Select
          required
          value={form.sectionId}
          onChange={(e) => {
            set("sectionId", e.target.value);
            set("providerId", "");
            set("gradeId", "");
          }}
        >
          <option value="">Select section…</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Board / University</Label>
        <Select
          required
          disabled={!form.sectionId}
          value={form.providerId}
          onChange={(e) => {
            set("providerId", e.target.value);
            set("gradeId", "");
          }}
        >
          <option value="">Select…</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Class / Year</Label>
        <Select
          required
          disabled={!form.providerId}
          value={form.gradeId}
          onChange={(e) => set("gradeId", e.target.value)}
        >
          <option value="">Select…</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Password</Label>
        <Input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
