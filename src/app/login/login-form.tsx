"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn, getSession } from "next-auth/react";

const labelClass =
  "block text-[11px] font-medium uppercase tracking-[0.05em] text-[#071e24]";
const labelStyle = { fontFamily: "JetBrains Mono, monospace" } as const;

const fieldClass =
  "h-12 w-full rounded-lg border border-[#cbd5e1] bg-white px-4 text-[15px] text-[#071e24] outline-none transition-all placeholder:text-[#c1c8cb] focus:border-[#785a00] focus:ring-2 focus:ring-[#785a00]/20";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-[13px]"
          style={{
            borderColor: "rgba(186,26,26,0.3)",
            backgroundColor: "#ffdad6",
            color: "#93000a",
            fontFamily: "Geist, sans-serif",
          }}
        >
          {error}
        </div>
      )}

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass} style={labelStyle}>
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="a.turing@preplyfly.edu"
          autoComplete="email"
          required
          className={fieldClass}
          style={{ fontFamily: "Geist, sans-serif" }}
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <label htmlFor="password" className={labelClass} style={labelStyle}>
            Security Password
          </label>
          <Link
            href="#"
            className="text-[11px] font-medium uppercase"
            style={{
              color: "#785a00",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.05em",
            }}
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className={`${fieldClass} pr-12`}
            style={{ fontFamily: "Geist, sans-serif" }}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg px-6 py-4 text-white shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: "#002028",
          fontFamily: "Geist, sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        {loading ? "Authenticating…" : "Sign in"}
      </button>

      <p
        className="text-center text-[11px] uppercase"
        style={{
          color: "#41484b",
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: "0.05em",
        }}
      >
        By signing in you agree to our{" "}
        <Link
          href="#"
          className="font-bold underline underline-offset-2"
          style={{ color: "#785a00" }}
        >
          Terms
        </Link>{" "}
        &{" "}
        <Link
          href="#"
          className="font-bold underline underline-offset-2"
          style={{ color: "#785a00" }}
        >
          Privacy
        </Link>
      </p>
    </form>
  );
}
