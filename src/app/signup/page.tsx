import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="relative flex w-full flex-col justify-between overflow-hidden bg-paper p-6 md:w-1/2 md:p-16">
        <div className="dotted-pattern absolute inset-0" />
        <div className="mesh-gradient absolute inset-0" />

        <div
          className="shape-float absolute right-16 top-20 h-20 w-20 rounded-full bg-coral-300 opacity-25"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="shape-float absolute right-24 top-1/3 text-indigo-500 opacity-25"
          style={{ animationDelay: "2s" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "40px", fontVariationSettings: "'wght' 200" }}
          >
            change_history
          </span>
        </div>
        <div
          className="shape-float absolute bottom-1/3 left-1/3 text-primary-500 opacity-30"
          style={{ animationDelay: "1s" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "28px", fontVariationSettings: "'wght' 200" }}
          >
            add
          </span>
        </div>

        <div className="relative z-10 mt-12 flex max-w-lg flex-col gap-6">
          <p
            className="text-[11px] font-medium uppercase text-ink-700"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            02 — Join
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
            Begin your{" "}
            <span className="hand-drawn-underline">journey.</span>
          </h1>
          <p
            className="max-w-sm text-ink-700"
            style={{ fontSize: "17px", lineHeight: "28px" }}
          >
            Tell us where you study — we will match the right syllabus.
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

      <section className="flex w-full items-center justify-center overflow-y-auto bg-white p-6 md:w-1/2 md:p-16">
        <div className="flex w-full max-w-[480px] flex-col gap-10 py-6">
          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] uppercase tracking-widest text-ink-500"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
            >
              Create account
            </span>
            <h2
              className="text-ink-900"
              style={{ fontSize: "28px", lineHeight: "36px", fontWeight: 600 }}
            >
              Sign up
            </h2>
            <p className="text-[15px] text-ink-700">
              After signup an admin reviews and approves your access.
            </p>
          </div>

          <SignupForm />

          <p className="text-center text-[13px] text-ink-500">
            Already a member?{" "}
            <Link
              href="/login"
              className="font-semibold text-ink-900 underline decoration-coral-300 underline-offset-2 transition-colors hover:decoration-coral-700"
            >
              Sign in.
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
