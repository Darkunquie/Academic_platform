import { listPendingStudents } from "@/modules/auth/service";
import { ApprovalActions } from "./approval-row";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const pending = await listPendingStudents();

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <p
          className="text-[11px] text-ink-500"
          style={{ fontFamily: "var(--font-mono)", }}
        >
          Pending review · {pending.length} applicant
          {pending.length === 1 ? "" : "s"}
        </p>
        <h1
          className="text-3xl font-normal leading-tight text-primary-900 md:text-4xl lg:text-[52px] lg:leading-[56px]"
          style={{
            fontFamily: "var(--font-serif)",
            letterSpacing: "-0.02em",
          }}
        >
          Approvals{" "}
          <span className="hand-drawn-underline">queue.</span>
        </h1>
        <p
          className="max-w-xl text-ink-700"
          style={{ fontSize: "17px", lineHeight: "28px" }}
        >
          Review applicant details and confirm access. Approved students gain
          access to their grade-scoped curriculum immediately.
        </p>
      </header>

      {pending.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-ink-300 bg-white/60 p-16 text-center">
          <p
            className="mb-3 text-[11px] text-ink-500"
            style={{ fontFamily: "var(--font-mono)", }}
          >
            Inbox zero
          </p>
          <p
            className="text-ink-900"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "22px",
              lineHeight: "30px",
              fontWeight: 600,
            }}
          >
            Nothing to review.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {pending.map((s) => {
            const initials = s.name
              .split(" ")
              .map((p) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <article
                key={s.id}
                className="flex flex-col gap-6 rounded-[24px] border border-ink-200 bg-white p-6 soft-shadow transition-all hover:-translate-y-0.5 hover:pop-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-[14px] font-semibold text-primary-700">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <h2
                        className="text-ink-900"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "17px",
                          lineHeight: "24px",
                          fontWeight: 600,
                        }}
                      >
                        {s.name}
                      </h2>
                      <p className="truncate text-[13px] text-ink-500">
                        {s.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-coral-100 px-2.5 py-1 text-[11px] font-semibold text-coral-700"
                    style={{
                      fontFamily: "var(--font-mono)",
                      }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-coral-700" />
                    Pending
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-4 rounded-[14px] bg-paper p-4">
                  <Detail label="Section" value={s.section} />
                  <Detail label="Board / Univ." value={s.provider} />
                  <Detail label="Grade" value={s.grade} />
                  <Detail label="Phone" value={s.phone} />
                  <Detail label="Location" value={`${s.state}, ${s.country}`} />
                </dl>

                <div className="flex items-center justify-end">
                  <ApprovalActions studentId={s.id} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
}: Readonly<{ label: string; value: string | null | undefined }>) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span
        className="text-[10px] text-ink-500"
        style={{ fontFamily: "var(--font-mono)", }}
      >
        {label}
      </span>
      <span className="truncate text-[14px] font-semibold text-ink-900">
        {value ?? "—"}
      </span>
    </div>
  );
}
