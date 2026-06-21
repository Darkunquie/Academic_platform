import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import {
  getStudentCoding,
  listCodingQuestions,
} from "@/modules/coding/service";
import { studentGradeId } from "@/modules/content/student";
import { CodeRunner } from "@/components/coding/code-runner";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

const DIFFICULTY_CHIP: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-700",
  medium: "bg-solar-amber/10 text-solar-amber",
  hard: "bg-solar-orange/10 text-solar-orange",
};

export default async function StudentCodingSolvePage({
  params,
}: Readonly<{
  params: Promise<{ topicId: string; questionId: string }>;
}>) {
  const { topicId, questionId } = await params;
  const gradeId = await studentGradeId();
  const topic = await getTopicChain(topicId);

  if (!topic || !gradeId || topic.gradeId !== gradeId || !topic.isCoding) {
    notFound();
  }

  const [data, siblings] = await Promise.all([
    getStudentCoding(questionId),
    listCodingQuestions(topicId),
  ]);
  if (!data || data.question.topicId !== topicId) notFound();

  const { question, samples } = data;
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

      {/* Compact toolbar */}
      <div className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-4 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-solar-text/60">
            <Link
              href={`/dashboard/topic/${topicId}/coding`}
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
                href={`/dashboard/topic/${topicId}/coding/${prev.id}`}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-[11px] font-black text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800 md:h-8 md:px-2.5"
                title={prev.title}
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
                href={`/dashboard/topic/${topicId}/coding/${next.id}`}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-[11px] font-black text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800 md:h-8 md:px-2.5"
                title={next.title}
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

      {/* Split layout */}
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        {/* LEFT — Problem panel */}
        <section className="solar-card flex flex-col overflow-hidden rounded-xxl bg-white">
          {/* Tabs */}
          <div className="flex items-center border-b border-solar-card bg-slate-50 px-2">
            <Tab label="Description" active icon="description" />
            <Tab label="Submissions" icon="history" />
            <Tab label="Solutions" icon="lightbulb" />
            <Tab label="Hints" icon="help" />
          </div>

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

            {samples.length > 0 && (
              <section className="mt-7">
                <h2 className="mb-3 text-[10px] font-black text-solar-amber">
                  Examples
                </h2>
                <div className="flex flex-col gap-4">
                  {samples.map((s, i) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-solar-card bg-slate-50 p-3"
                    >
                      <p className="mb-2 text-[10px] font-black text-solar-text/60">
                        Example {i + 1}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Block label="Input" value={s.stdin || "(empty)"} />
                        <Block label="Output" value={s.expectedOutput} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-7">
              <h2 className="mb-2 text-[10px] font-black text-solar-amber">
                Constraints
              </h2>
              <ul
                className="list-disc pl-5 text-[13px] text-solar-text"
                style={{ fontFamily: "Geist Mono, monospace" }}
              >
                {(question.constraints ?? "")
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                <li>
                  Time limit:{" "}
                  <code className="rounded bg-slate-200 px-1 text-[12px]">
                    {question.timeLimitMs ?? 2000} ms
                  </code>
                </li>
                <li>
                  Memory limit:{" "}
                  <code className="rounded bg-slate-200 px-1 text-[12px]">
                    {(question.memLimitKb ?? 128000) / 1024} MB
                  </code>
                </li>
                <li>
                  Languages:{" "}
                  <span>{((question.languages as string[] | null) ?? []).join(", ")}</span>
                </li>
              </ul>
            </section>
          </div>
        </section>

        {/* RIGHT — Editor + console */}
        <section className="flex min-h-[400px] flex-col md:min-h-[640px]">
          <CodeRunner
            questionId={questionId}
            languages={question.languages as string[]}
            starterCode={
              (question.starterCode as Record<string, string> | null) ?? null
            }
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

function Tab({
  label,
  active,
  icon,
}: Readonly<{ label: string; active?: boolean; icon: string }>) {
  return (
    <span
      className={
        "inline-flex h-10 items-center gap-1.5 border-b-2 px-3 text-[12px] font-bold transition-colors " +
        (active
          ? "border-blue-800 text-solar-text-dark"
          : "border-transparent text-solar-text/60")
      }
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "16px" }}
      >
        {icon}
      </span>
      {label}
    </span>
  );
}

function Block({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl bg-white p-2.5">
      <div className="mb-1 text-[10px] font-black text-solar-text/60">
        {label}
      </div>
      <pre
        className="whitespace-pre-wrap break-all text-[12px] text-solar-text-dark"
        style={{ fontFamily: "Geist Mono, monospace" }}
      >
        {value}
      </pre>
    </div>
  );
}
