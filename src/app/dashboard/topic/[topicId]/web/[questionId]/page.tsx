import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { getStudentWeb, listWebQuestions } from "@/modules/web/service";
import { studentGradeId } from "@/modules/content/student";
import { WebRunner } from "@/components/web/web-runner";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

const DIFFICULTY_CHIP: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-700",
  medium: "bg-solar-amber/10 text-solar-amber",
  hard: "bg-solar-orange/10 text-solar-orange",
};

export default async function StudentWebSolvePage({
  params,
}: Readonly<{
  params: Promise<{ topicId: string; questionId: string }>;
}>) {
  const { topicId, questionId } = await params;
  const gradeId = await studentGradeId();
  const topic = await getTopicChain(topicId);

  if (!topic || !gradeId || topic.gradeId !== gradeId) notFound();

  const [data, siblings] = await Promise.all([
    getStudentWeb(questionId),
    listWebQuestions(topicId),
  ]);
  if (!data || data.question.topicId !== topicId) notFound();

  const { question, checks } = data;
  const idx = siblings.findIndex((q) => q.id === questionId);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

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

      <div className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-4 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-solar-text/60">
            <Link
              href={`/dashboard/topic/${topicId}/web`}
              className="inline-flex items-center gap-1 transition-colors hover:text-solar-amber"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                arrow_back
              </span>
              {" "}Problem List
            </Link>
            <Chev />
            <Link
              href={`/dashboard/topic/${topicId}`}
              className="transition-colors hover:text-solar-amber"
            >
              {topic.name}
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {prev && (
              <Link
                href={`/dashboard/topic/${topicId}/web/${prev.id}`}
                className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 text-[11px] font-black text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  chevron_left
                </span>
                {" "}Prev
              </Link>
            )}
            <span className="text-[10px] font-black text-solar-text/60">
              {idx + 1} / {siblings.length}
            </span>
            {next && (
              <Link
                href={`/dashboard/topic/${topicId}/web/${next.id}`}
                className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 text-[11px] font-black text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
              >
                Next{" "}
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  chevron_right
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[420px_1fr]">
        <section className="solar-card flex flex-col overflow-hidden rounded-xxl bg-white">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <header className="mb-5 flex items-start justify-between gap-3">
              <h1 className="text-2xl font-black tracking-tighter text-solar-text-dark">
                {idx + 1}. {question.title}
              </h1>
              <span
                className={
                  "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[10px] font-black " +
                  DIFFICULTY_CHIP[question.difficulty ?? "medium"]
                }
              >
                {question.difficulty ?? "medium"}
              </span>
            </header>

            <article className="whitespace-pre-wrap text-[14px] leading-[22px] text-solar-text-dark">
              {question.prompt}
            </article>

            <section className="mt-7">
              <h2 className="mb-2 text-[10px] font-black text-solar-amber">
                Checks ({checks.length})
              </h2>
              <ul className="space-y-1.5 text-[13px] text-solar-text">
                {checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    <span
                      className="material-symbols-outlined mt-0.5 text-solar-text/30"
                      style={{ fontSize: "16px" }}
                    >
                      radio_button_unchecked
                    </span>
                    <span>
                      {c.label}{" "}
                      <span className="text-[11px] text-solar-text/60">
                        (weight {c.weight})
                      </span>
                    </span>
                  </li>
                ))}
                {checks.length === 0 && (
                  <li className="text-solar-text/60">
                    No checks defined yet — preview only.
                  </li>
                )}
              </ul>
            </section>
          </div>
        </section>

        <section className="flex min-h-[680px] flex-col">
          <WebRunner
            questionId={questionId}
            htmlStarter={question.htmlStarter}
            cssStarter={question.cssStarter}
            jsStarter={question.jsStarter}
            checks={checks}
          />
        </section>
      </div>
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
