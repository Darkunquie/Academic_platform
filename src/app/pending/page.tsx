import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function PendingPage() {
  const session = await auth();
  const name = session?.user?.name ?? "Applicant";
  const email = session?.user?.email ?? "—";
  const shortId = session?.user?.id
    ? `#${session.user.id.slice(0, 8).toUpperCase()}`
    : "#PENDING";

  return (
    <main className="relative flex min-h-screen flex-col bg-paper">
      <div className="dotted-pattern absolute inset-0 opacity-50" />
      <div className="mesh-gradient absolute inset-0 opacity-60" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#155E45" />
            <path d="M6 16.8 25 6.5 17.4 25.5l-3.2-7.2-8.2-1.5Z" fill="#F6A488" />
            <path d="M14.2 18.3 25 6.5l-10 14.6-.8-2.8Z" fill="#C9462C" />
          </svg>
          <span
            className="text-ink-900"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "22px",
              lineHeight: "28px",
            }}
          >
            Preplyfly
          </span>
        </Link>
        <span
          className="text-[11px] text-ink-500"
          style={{ fontFamily: "var(--font-mono)", }}
        >
          03 — Pending
        </span>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 md:px-12">
        <div className="relative w-full max-w-[640px]">
          <div
            className="shape-float absolute -right-6 -top-6 h-12 w-12 rounded-full bg-coral-300 opacity-70"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="shape-float absolute -left-8 top-1/2 -translate-y-1/2 text-indigo-500 opacity-60"
            style={{ animationDelay: "1.5s" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "36px", fontVariationSettings: "'wght' 200" }}
            >
              add
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-ink-200 bg-white p-8 pop-shadow md:p-12">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-coral-100 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-coral-700" />
                <span
                  className="text-[11px] font-medium text-coral-700"
                  style={{
                    fontFamily: "var(--font-mono)",
                    }}
                >
                  Pending review
                </span>
              </div>
              <span
                className="text-[11px] text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  }}
              >
                ID: {shortId}
              </span>
            </div>

            <div className="mb-8 flex flex-col gap-3">
              <p
                className="text-[11px] text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  }}
              >
                03 — Pending review
              </p>
              <h1
                className="text-primary-900"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "56px",
                  lineHeight: "60px",
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                }}
              >
                A moment in the{" "}
                <span className="hand-drawn-underline">
                  waiting room.
                </span>
              </h1>
              <p
                className="max-w-md text-ink-700"
                style={{ fontSize: "17px", lineHeight: "28px" }}
              >
                Your application is with an administrator. You will be able to
                access your dashboard once approved.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 rounded-[20px] border border-ink-200 bg-paper p-6 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span
                  className="text-[11px] text-ink-500"
                  style={{
                    fontFamily: "var(--font-mono)",
                    }}
                >
                  Applicant name
                </span>
                <span className="text-[17px] font-semibold text-primary-900">
                  {name}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className="text-[11px] text-ink-500"
                  style={{
                    fontFamily: "var(--font-mono)",
                    }}
                >
                  Email
                </span>
                <span className="text-[17px] font-semibold text-primary-900">
                  {email}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-ink-100 pt-6 md:flex-row md:items-center">
              <LogoutButton />
              <p className="text-[13px] text-ink-500 md:ml-3">
                We will notify you the moment you are approved.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
            <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
            <span className="h-1.5 w-1.5 rounded-full bg-coral-300" />
          </div>
        </div>
      </section>
    </main>
  );
}
