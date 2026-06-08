"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    const session = await getSession();
    const role = session?.user?.role;
    const dest =
      role === "admin" || role === "super_admin" ? "/admin" : "/dashboard";
    router.push(dest);
    router.refresh();
  }

  const labelClass =
    "ml-1 text-[11px] font-medium uppercase text-ink-700";
  const labelStyle = {
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.12em",
  } as const;
  const inputClass =
    "h-12 w-full rounded-[14px] border-[1.5px] border-ink-200 bg-white px-4 text-[15px] text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100";

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-[14px] border border-danger/30 bg-coral-100 px-4 py-3 text-[13px] text-coral-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass} style={labelStyle}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@school.edu"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="mb-1 flex items-end justify-between">
          <label
            htmlFor="password"
            className={labelClass}
            style={labelStyle}
          >
            Password
          </label>
          <Link
            href="#"
            className="text-[13px] text-coral-700 underline decoration-coral-300 underline-offset-2 transition-colors hover:decoration-coral-700"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-ink-500 transition-colors hover:text-primary-700"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-primary-700 text-[15px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
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
