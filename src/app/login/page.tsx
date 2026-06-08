import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="relative flex w-full flex-col justify-between overflow-hidden bg-paper p-6 md:w-1/2 md:p-16">
        <div className="dotted-pattern absolute inset-0" />
        <div className="mesh-gradient absolute inset-0" />

        <div
          className="shape-float absolute right-12 top-12 h-24 w-24 rounded-full bg-coral-300 opacity-20"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="shape-float absolute left-8 top-1/2 text-indigo-500 opacity-20"
          style={{ animationDelay: "1s" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "48px", fontVariationSettings: "'wght' 200" }}
          >
            add
          </span>
        </div>
        <div
          className="shape-float absolute bottom-32 left-16 h-16 w-16 rotate-12 rounded-2xl bg-primary-100 opacity-30"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 mt-12 flex max-w-lg flex-col gap-6">
          <p
            className="text-[11px] font-medium uppercase text-ink-700"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            01 — Welcome back
          </p>
          <h1
            className="text-primary-900"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "72px",
              lineHeight: "76px",
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Open your next{" "}
            <span className="hand-drawn-underline">chapter.</span>
          </h1>
          <p
            className="max-w-sm text-ink-700"
            style={{ fontSize: "17px", lineHeight: "28px" }}
          >
            Sign in to keep building, reading, and practicing.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-[13px] text-ink-500">
          <span
            className="material-symbols-outlined text-primary-700"
            style={{ fontSize: "20px" }}
          >
            menu_book
          </span>
          <span className="font-medium text-ink-900">Academic</span>
          <span>· © 2026</span>
        </div>
      </section>

      <section className="flex w-full items-center justify-center bg-white p-6 md:w-1/2">
        <div className="flex w-full max-w-[420px] flex-col gap-12">
          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] uppercase tracking-widest text-ink-500"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
            >
              Account
            </span>
            <h2
              className="text-ink-900"
              style={{ fontSize: "28px", lineHeight: "36px", fontWeight: 600 }}
            >
              Sign in
            </h2>
            <p className="text-[15px] text-ink-700">
              Use your email and password.
            </p>
          </div>

          <LoginForm />

          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-ink-200" />
            <span
              className="text-[11px] uppercase text-ink-500"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
            >
              Or
            </span>
            <div className="h-px flex-1 bg-ink-200" />
          </div>

          <Link
            href="/signup"
            className="flex h-12 w-full items-center justify-center rounded-[14px] border border-ink-200 bg-white text-[15px] font-semibold text-ink-900 transition-colors hover:bg-paper"
          >
            Create a new account
          </Link>

          <p className="text-center text-[13px] text-ink-500">
            By signing in you agree to our{" "}
            <Link
              href="#"
              className="text-ink-900 underline decoration-ink-200 underline-offset-2 transition-colors hover:decoration-primary-700"
            >
              Terms
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
