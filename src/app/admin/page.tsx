import Link from "next/link";
import { platformTotals } from "@/modules/analytics/service";
import { listPendingStudents } from "@/modules/auth/service";

export const dynamic = "force-dynamic";

const ICON_BY_TONE: Record<string, string> = {
  primary: "bg-primary-100 text-primary-700",
  coral: "bg-coral-100 text-coral-700",
  indigo: "bg-indigo-100 text-indigo-700",
  ink: "bg-ink-100 text-ink-900",
};

export default async function AdminHome() {
  const totals = await platformTotals();
  const pending = await listPendingStudents();
  const preview = pending.slice(0, 4);

  const stats = [
    {
      label: "Pending approvals",
      value: totals.pending,
      icon: "pending_actions",
      tone: "coral",
      hint:
        totals.pending > 0 ? "Requires attention" : "Inbox zero",
    },
    {
      label: "Approved students",
      value: totals.students,
      icon: "group",
      tone: "primary",
      hint: "Across all grades",
    },
    {
      label: "Open admissions",
      value: pending.length,
      icon: "mark_email_unread",
      tone: "indigo",
      hint: "This view",
    },
    {
      label: "Today",
      value: new Date().getDate(),
      icon: "calendar_today",
      tone: "ink",
      hint: new Date().toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <p
          className="text-[11px] uppercase text-ink-500"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
        >
          01 — Control room
        </p>
        <h1
          className="text-primary-900"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "60px",
            lineHeight: "64px",
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          The platform, at a{" "}
          <span className="hand-drawn-underline">glance.</span>
        </h1>
        <p
          className="max-w-2xl text-ink-700"
          style={{ fontSize: "17px", lineHeight: "28px" }}
        >
          Operational oversight for curriculum, approvals, and student
          progress.
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-4 rounded-[20px] border border-ink-200 bg-white p-5 soft-shadow transition-all hover:-translate-y-0.5 hover:pop-shadow"
          >
            <div className="flex items-start justify-between">
              <span
                className="text-[11px] uppercase text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                {s.label}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${ICON_BY_TONE[s.tone]}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  {s.icon}
                </span>
              </span>
            </div>
            <div
              className="text-primary-900"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "40px",
                lineHeight: "44px",
                fontWeight: 400,
              }}
            >
              {s.value}
            </div>
            <div className="text-[12px] text-ink-500">{s.hint}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 flex flex-col gap-5 rounded-[24px] border border-ink-200 bg-white p-7 soft-shadow">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span
                className="text-[11px] uppercase text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                Approval queue
              </span>
              <h2
                className="text-ink-900"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "22px",
                  lineHeight: "28px",
                  fontWeight: 600,
                }}
              >
                Awaiting review
              </h2>
            </div>
            <Link
              href="/admin/approvals"
              className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-700 transition-colors hover:text-coral-700"
            >
              View all
              <span
                className="material-symbols-outlined transition-transform group-hover:translate-x-1"
                style={{ fontSize: "16px" }}
              >
                arrow_forward
              </span>
            </Link>
          </div>

          {preview.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-ink-300 p-8 text-center text-ink-500">
              Nothing to review.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {preview.map((s) => {
                const initials = s.name
                  .split(" ")
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-4 rounded-[14px] px-3 py-3 transition-colors hover:bg-paper"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[13px] font-semibold text-primary-700">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <div
                          className="truncate text-ink-900"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "15px",
                            fontWeight: 600,
                          }}
                        >
                          {s.name}
                        </div>
                        <div className="truncate text-[12px] text-ink-500">
                          {s.section} · {s.provider} · {s.grade}
                        </div>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-coral-100 px-2.5 py-1 text-[11px] font-semibold uppercase text-coral-700"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-coral-700" />
                      Pending
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 relative flex flex-col gap-5 overflow-hidden rounded-[24px] border border-ink-950 bg-ink-950 p-7 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="absolute -right-6 -top-6 text-coral-300 opacity-10"
            style={{ fontSize: "180px", lineHeight: 1 }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "180px" }}
            >
              history
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            <span
              className="text-[11px] uppercase text-coral-300"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
              }}
            >
              Quick actions
            </span>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "22px",
                lineHeight: "28px",
                fontWeight: 600,
                color: "#EFEEEA",
              }}
            >
              Move the syllabus forward.
            </h2>
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <Link
              href="/admin/curriculum"
              className="group flex items-center justify-between gap-3 rounded-[14px] bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <span className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-coral-300"
                  style={{ fontSize: "22px" }}
                >
                  account_tree
                </span>
                <span className="text-[14px] font-semibold">
                  Edit curriculum tree
                </span>
              </span>
              <span
                className="material-symbols-outlined text-white/40 transition-transform group-hover:translate-x-1"
                style={{ fontSize: "18px" }}
              >
                arrow_forward
              </span>
            </Link>
            <Link
              href="/admin/approvals"
              className="group flex items-center justify-between gap-3 rounded-[14px] bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <span className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-coral-300"
                  style={{ fontSize: "22px" }}
                >
                  verified_user
                </span>
                <span className="text-[14px] font-semibold">
                  Review {totals.pending} applicants
                </span>
              </span>
              <span
                className="material-symbols-outlined text-white/40 transition-transform group-hover:translate-x-1"
                style={{ fontSize: "18px" }}
              >
                arrow_forward
              </span>
            </Link>
            <Link
              href="/admin/analytics"
              className="group flex items-center justify-between gap-3 rounded-[14px] bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <span className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-coral-300"
                  style={{ fontSize: "22px" }}
                >
                  monitoring
                </span>
                <span className="text-[14px] font-semibold">
                  Drill into analytics
                </span>
              </span>
              <span
                className="material-symbols-outlined text-white/40 transition-transform group-hover:translate-x-1"
                style={{ fontSize: "18px" }}
              >
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
