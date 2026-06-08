import Link from "next/link";
import { notFound } from "next/navigation";
import { inArray, and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { codingSubmissions } from "@/db/schema";
import { auth } from "@/auth";
import { getTopicChain } from "@/modules/curriculum/admin";
import { listCodingQuestions } from "@/modules/coding/service";
import { studentGradeId } from "@/modules/content/student";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

const DIFFICULTY_CHIP: Record<string, string> = {
  easy: "bg-primary-100 text-primary-700",
  medium: "bg-coral-100 text-coral-700",
  hard: "bg-[#FCE0DE] text-[#B23A3A]",
};

export default async function StudentCodingListPage({
  params,
}: Readonly<{
  params: Promise<{ topicId: string }>;
}>) {
  const { topicId } = await params;
  const gradeId = await studentGradeId();
  const topic = await getTopicChain(topicId);

  if (!topic || !gradeId || topic.gradeId !== gradeId || !topic.isCoding) {
    notFound();
  }

  const session = await auth();
  const items = await listCodingQuestions(topicId);

  // Solved set for current student
  const solved = new Set<string>();
  if (session?.user?.id && items.length > 0) {
    const rows = await db
      .selectDistinct({ id: codingSubmissions.codingQuestionId })
      .from(codingSubmissions)
      .where(
        and(
          eq(codingSubmissions.studentId, session.user.id),
          eq(codingSubmissions.status, "accepted"),
          inArray(codingSubmissions.codingQuestionId, items.map((i) => i.id))
        )
      );
    for (const r of rows) solved.add(r.id);
  }

  const stats = {
    total: items.length,
    solved: solved.size,
    easy: items.filter((i) => i.difficulty === "easy").length,
    medium: items.filter((i) => i.difficulty === "medium").length,
    hard: items.filter((i) => i.difficulty === "hard").length,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <div className="dotted-pattern absolute inset-0 opacity-40" />

      <div className="relative z-10">
        <StudentHeader active="library" />
      </div>

      <div className="relative mx-auto w-full max-w-[1280px] px-6 pb-24 pt-6 md:px-10 md:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
          <Link href="/dashboard" className="hover:text-primary-700">
            My subjects
          </Link>
          <Chev />
          <Link
            href={`/dashboard/subject/${topic.subjectId}`}
            className="hover:text-primary-700"
          >
            {topic.subjectName}
          </Link>
          <Chev />
          <Link
            href={`/dashboard/topic/${topicId}`}
            className="hover:text-primary-700"
          >
            {topic.name}
          </Link>
          <Chev />
          <span className="font-medium text-ink-900">Coding</span>
        </nav>

        <section className="relative mb-10">
          <div
            className="shape-float absolute -top-6 right-0 h-20 w-20 rounded-full bg-indigo-300 opacity-30 blur-2xl"
            style={{ animationDelay: "0s" }}
          />
          <p
            className="mb-3 text-[11px] uppercase text-ink-500"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            Coding · {topic.name}
          </p>
          <h1
            className="text-primary-900"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "52px",
              lineHeight: "56px",
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            <span className="hand-drawn-underline">Practice</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-ink-700">
            Solve problems against hidden test cases. Languages supported:
            Python, JavaScript, C++.
          </p>
        </section>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Total" value={stats.total} tone="ink" />
          <Stat label="Solved" value={stats.solved} tone="primary" />
          <Stat label="Easy" value={stats.easy} tone="primary" />
          <Stat label="Medium" value={stats.medium} tone="coral" />
          <Stat label="Hard" value={stats.hard} tone="danger" />
        </div>

        <div className="overflow-hidden rounded-[20px] border border-ink-200 bg-white soft-shadow">
          <header className="grid grid-cols-[60px_minmax(0,1fr)_120px_120px_60px] items-center gap-4 border-b border-ink-200 bg-ink-900 px-5 py-3 text-[11px] uppercase text-white">
            <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              Status
            </span>
            <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              Title
            </span>
            <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              Difficulty
            </span>
            <span
              className="hidden md:inline"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
            >
              Acceptance
            </span>
            <span />
          </header>

          {items.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p
                className="text-ink-900"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "22px",
                }}
              >
                No problems published yet.
              </p>
              <p className="mt-2 text-[13px] text-ink-500">
                Hard refresh (Ctrl + Shift + R) if you expect some.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-200">
              {items.map((q, i) => {
                const ok = solved.has(q.id);
                const acceptance = mockAcceptance(q.id);
                return (
                  <li key={q.id}>
                    <Link
                      href={`/dashboard/topic/${topicId}/coding/${q.id}`}
                      className="grid grid-cols-[60px_minmax(0,1fr)_120px_120px_60px] items-center gap-4 px-5 py-4 transition-colors hover:bg-paper"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                          ok
                            ? "bg-primary-700 text-white"
                            : "border border-ink-300 text-ink-500"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {ok ? "✓" : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 truncate text-[15px] font-medium text-ink-900 group-hover:text-primary-700">
                        {q.title}
                      </span>
                      <span
                        className={`inline-flex h-7 w-fit items-center rounded-full px-3 text-[11px] font-semibold uppercase ${
                          DIFFICULTY_CHIP[q.difficulty ?? "medium"]
                        }`}
                        style={{
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {q.difficulty ?? "medium"}
                      </span>
                      <span
                        className="hidden text-[13px] text-ink-700 md:inline"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {acceptance}%
                      </span>
                      <span
                        className="material-symbols-outlined justify-self-end text-ink-300 transition-all hover:translate-x-1 hover:text-primary-700"
                        style={{ fontSize: "20px" }}
                      >
                        arrow_forward
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

function Chev() {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
      chevron_right
    </span>
  );
}

function Stat({
  label,
  value,
  tone,
}: Readonly<{ label: string; value: number; tone: "ink" | "primary" | "coral" | "danger" }>) {
  const t =
    tone === "primary"
      ? "text-primary-700"
      : tone === "coral"
        ? "text-coral-700"
        : tone === "danger"
          ? "text-[#B23A3A]"
          : "text-ink-900";
  return (
    <div className="rounded-[16px] border border-ink-200 bg-white px-4 py-3 soft-shadow">
      <p
        className="text-[10px] uppercase text-ink-500"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-[24px] font-semibold ${t}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </p>
    </div>
  );
}

/** Fake but deterministic per-question acceptance % for visual flavour. */
function mockAcceptance(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 30 + (h % 60); // 30..89
}
