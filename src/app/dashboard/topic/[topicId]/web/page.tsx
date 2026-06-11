import Link from "next/link";
import { notFound } from "next/navigation";
import { inArray, and, eq } from "drizzle-orm";
import { db } from "@/db";
import { webSubmissions } from "@/db/schema";
import { auth } from "@/auth";
import { getTopicChain } from "@/modules/curriculum/admin";
import { listWebQuestions } from "@/modules/web/service";
import { studentGradeId } from "@/modules/content/student";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

const DIFFICULTY_CHIP: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-700",
  medium: "bg-solar-amber/10 text-solar-amber",
  hard: "bg-solar-orange/10 text-solar-orange",
};

export default async function StudentWebListPage({
  params,
}: Readonly<{
  params: Promise<{ topicId: string }>;
}>) {
  const { topicId } = await params;
  const gradeId = await studentGradeId();
  const topic = await getTopicChain(topicId);

  if (!topic || !gradeId || topic.gradeId !== gradeId) notFound();

  const session = await auth();
  const items = await listWebQuestions(topicId);

  const solved = new Set<string>();
  if (session?.user?.id && items.length > 0) {
    const rows = await db
      .selectDistinct({ id: webSubmissions.webQuestionId })
      .from(webSubmissions)
      .where(
        and(
          eq(webSubmissions.studentId, session.user.id),
          eq(webSubmissions.status, "accepted"),
          inArray(
            webSubmissions.webQuestionId,
            items.map((i) => i.id)
          )
        )
      );
    for (const r of rows) solved.add(r.id);
  }

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
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[12px] font-bold text-solar-text/60">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-solar-amber"
          >
            My Subjects
          </Link>
          <Chev />
          <Link
            href={`/dashboard/topic/${topicId}`}
            className="transition-colors hover:text-solar-amber"
          >
            {topic.name}
          </Link>
          <Chev />
          <span className="text-solar-text-dark">Web</span>
        </nav>

        <section className="relative mb-10">
          <p className="mb-3 text-[10px] font-black text-emerald-600">
            Web · {topic.name}
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-solar-text-dark md:text-6xl">
            HTML / CSS / JS.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-solar-text">
            Build live in the browser. Each problem ships with visual + DOM
            checks that run inside a sandboxed preview.
          </p>
        </section>

        <div className="solar-card overflow-hidden rounded-xxl bg-white">
          <header className="grid grid-cols-[60px_minmax(0,1fr)_120px_60px] items-center gap-4 border-b border-solar-card bg-solar-text-dark px-5 py-3 text-[10px] font-black text-white">
            <span>Status</span>
            <span>Title</span>
            <span>Difficulty</span>
            <span />
          </header>
          {items.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-2xl font-black text-solar-text-dark">
                No web problems published yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-solar-card">
              {items.map((q, i) => {
                const ok = solved.has(q.id);
                return (
                  <li key={q.id}>
                    <Link
                      href={`/dashboard/topic/${topicId}/web/${q.id}`}
                      className="group grid grid-cols-[60px_minmax(0,1fr)_120px_60px] items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
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
