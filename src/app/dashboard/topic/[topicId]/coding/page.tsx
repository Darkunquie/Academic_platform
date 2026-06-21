import Link from "next/link";
import { notFound } from "next/navigation";
import { inArray, and, eq } from "drizzle-orm";
import { db } from "@/db";
import { codingSubmissions } from "@/db/schema";
import { auth } from "@/auth";
import { getTopicChain } from "@/modules/curriculum/admin";
import { listCodingQuestions } from "@/modules/coding/service";
import { studentGradeId } from "@/modules/content/student";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

const DIFFICULTY_CHIP: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-700",
  medium: "bg-solar-amber/10 text-solar-amber",
  hard: "bg-solar-orange/10 text-solar-orange",
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

  const solved = new Set<string>();
  if (session?.user?.id && items.length > 0) {
    const rows = await db
      .selectDistinct({ id: codingSubmissions.codingQuestionId })
      .from(codingSubmissions)
      .where(
        and(
          eq(codingSubmissions.studentId, session.user.id),
          eq(codingSubmissions.status, "accepted"),
          inArray(
            codingSubmissions.codingQuestionId,
            items.map((i) => i.id)
          )
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
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#334155",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <StudentHeader active="library" />

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-24 pt-4 md:px-6 md:pt-5">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[12px] font-bold text-solar-text/60">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-solar-amber"
          >
            My Subjects
          </Link>
          <Chev />
          <Link
            href={`/dashboard/subject/${topic.subjectId}`}
            className="transition-colors hover:text-solar-amber"
          >
            {topic.subjectName}
          </Link>
          <Chev />
          <Link
            href={`/dashboard/topic/${topicId}`}
            className="transition-colors hover:text-solar-amber"
          >
            {topic.name}
          </Link>
          <Chev />
          <span className="text-solar-text-dark">Coding</span>
        </nav>

        {/* Hero */}
        <section className="relative mb-10">
          <p className="mb-3 text-[10px] font-black text-solar-orange">
            Coding · {topic.name}
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-solar-text-dark md:text-6xl">
            Practice.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-solar-text">
            Solve problems against hidden test cases. Languages supported:
            Python, JavaScript, C++.
          </p>
        </section>

        {/* Stats command bar */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Total" value={stats.total} accent="#1e40af" />
          <Stat label="Solved" value={stats.solved} accent="#10b981" />
          <Stat label="Easy" value={stats.easy} accent="#10b981" />
          <Stat label="Medium" value={stats.medium} accent="#b58900" />
          <Stat label="Hard" value={stats.hard} accent="#cb4b16" />
        </div>

        {/* Problem table */}
        <div className="solar-card overflow-hidden rounded-xxl bg-white">
          <div className="overflow-x-auto">
          <header className="grid min-w-[640px] grid-cols-[60px_minmax(0,1fr)_120px_120px_60px] items-center gap-4 border-b border-solar-card bg-solar-text-dark px-5 py-3 text-[10px] font-black text-white">
            <span>Status</span>
            <span>Title</span>
            <span>Difficulty</span>
            <span className="hidden md:inline">Acceptance</span>
            <span />
          </header>

          {items.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-2xl font-black text-solar-text-dark">
                No problems published yet.
              </p>
              <p className="mt-2 text-[13px] text-solar-text">
                Hard refresh (Ctrl + Shift + R) if you expect some.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-solar-card">
              {items.map((q, i) => {
                const ok = solved.has(q.id);
                const acceptance = mockAcceptance(q.id);
                return (
                  <li key={q.id}>
                    <Link
                      href={`/dashboard/topic/${topicId}/coding/${q.id}`}
                      className="group grid min-w-[640px] grid-cols-[60px_minmax(0,1fr)_120px_120px_60px] items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                    >
                      <span
                        className={
                          "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black " +
                          (ok
                            ? "bg-emerald-500 text-white"
                            : "border border-solar-ink/40 text-solar-text/60")
                        }
                      >
                        {ok ? "✓" : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 truncate text-sm font-bold text-solar-text-dark group-hover:text-blue-800">
                        {q.title}
                      </span>
                      <span
                        className={
                          "inline-flex h-7 w-fit items-center rounded-full px-3 text-[10px] font-black " +
                          DIFFICULTY_CHIP[q.difficulty ?? "medium"]
                        }
                      >
                        {q.difficulty ?? "medium"}
                      </span>
                      <span
                        className="hidden text-[12px] font-bold text-solar-text md:inline"
                        style={{ fontFamily: "Geist Mono, monospace" }}
                      >
                        {acceptance}%
                      </span>
                      <span
                        className="material-symbols-outlined justify-self-end text-solar-text/30 transition-all group-hover:translate-x-1 group-hover:text-blue-800"
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
    </div>
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
  accent,
}: Readonly<{ label: string; value: number; accent: string }>) {
  return (
    <div
      className="solar-card rounded-xxl bg-white px-4 py-3"
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <p className="text-[10px] font-black text-solar-text/60">
        {label}
      </p>
      <p
        className="mt-1 text-3xl font-black tracking-tighter"
        style={{ color: accent }}
      >
        {value}
      </p>
    </div>
  );
}

function mockAcceptance(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 30 + (h % 60);
}
