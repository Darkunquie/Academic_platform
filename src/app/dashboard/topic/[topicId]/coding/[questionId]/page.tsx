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
  easy: "bg-primary-100 text-primary-700",
  medium: "bg-coral-100 text-coral-700",
  hard: "bg-[#FCE0DE] text-[#B23A3A]",
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
    <main className="flex min-h-screen flex-col bg-paper">
      <StudentHeader active="library" />

      {/* Compact toolbar */}
      <div className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-4 px-6 py-3">
          <nav className="flex flex-wrap items-center gap-2 text-[12px] text-ink-500">
            <Link
              href={`/dashboard/topic/${topicId}/coding`}
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                arrow_back
              </span>
              Problem list
            </Link>
            <Chev />
            <Link
              href={`/dashboard/topic/${topicId}`}
              className="hover:text-primary-700"
            >
              {topic.name}
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {prev && (
              <Link
                href={`/dashboard/topic/${topicId}/coding/${prev.id}`}
                className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-ink-200 bg-white px-2.5 text-[12px] font-medium text-ink-700 transition-colors hover:border-primary-500 hover:text-primary-700"
                title={prev.title}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  chevron_left
                </span>
                Prev
              </Link>
            )}
            <span
              className="text-[11px] uppercase text-ink-500"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
            >
              {idx + 1} / {siblings.length}
            </span>
            {next && (
              <Link
                href={`/dashboard/topic/${topicId}/coding/${next.id}`}
                className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-ink-200 bg-white px-2.5 text-[12px] font-medium text-ink-700 transition-colors hover:border-primary-500 hover:text-primary-700"
                title={next.title}
              >
                Next
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
        <section className="flex flex-col overflow-hidden rounded-[16px] border border-ink-200 bg-white soft-shadow">
          {/* Tabs */}
          <div className="flex items-center border-b border-ink-200 bg-paper px-2">
            <Tab label="Description" active icon="description" />
            <Tab label="Submissions" icon="history" />
            <Tab label="Solutions" icon="lightbulb" />
            <Tab label="Hints" icon="help" />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <header className="mb-5 flex items-start justify-between gap-3">
              <h1
                className="text-ink-900"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "28px",
                  lineHeight: "34px",
                  letterSpacing: "-0.01em",
                  fontWeight: 400,
                }}
              >
                {idx + 1}. {question.title}
              </h1>
              <span
                className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[10px] font-semibold uppercase ${
                  DIFFICULTY_CHIP[question.difficulty ?? "medium"]
                }`}
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                }}
              >
                {question.difficulty ?? "medium"}
              </span>
            </header>

            <article
              className="whitespace-pre-wrap text-[14px] leading-[22px] text-ink-900"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {question.prompt}
            </article>

            {samples.length > 0 && (
              <section className="mt-7">
                <h2
                  className="mb-3 text-[11px] uppercase text-ink-500"
                  style={{
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.12em",
                  }}
                >
                  Examples
                </h2>
                <div className="flex flex-col gap-4">
                  {samples.map((s, i) => (
                    <div
                      key={s.id}
                      className="rounded-[12px] border border-ink-200 bg-paper p-3"
                    >
                      <p
                        className="mb-2 text-[11px] font-semibold uppercase text-ink-700"
                        style={{
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Example {i + 1}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Block
                          label="Input"
                          value={s.stdin || "(empty)"}
                        />
                        <Block label="Output" value={s.expectedOutput} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-7">
              <h2
                className="mb-2 text-[11px] uppercase text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                Constraints
              </h2>
              <ul className="list-disc pl-5 text-[13px] text-ink-700">
                <li>
                  Time limit:{" "}
                  <code
                    className="rounded bg-ink-100 px-1 text-[12px]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {question.timeLimitMs ?? 2000} ms
                  </code>
                </li>
                <li>
                  Memory limit:{" "}
                  <code
                    className="rounded bg-ink-100 px-1 text-[12px]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {(question.memLimitKb ?? 128000) / 1024} MB
                  </code>
                </li>
                <li>
                  Languages:{" "}
                  <span
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {(question.languages as string[]).join(", ")}
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </section>

        {/* RIGHT — Editor + console */}
        <section className="flex min-h-[640px] flex-col">
          <CodeRunner
            questionId={questionId}
            languages={question.languages as string[]}
            starterCode={
              (question.starterCode as Record<string, string> | null) ?? null
            }
          />
        </section>
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

function Tab({
  label,
  active,
  icon,
}: Readonly<{ label: string; active?: boolean; icon: string }>) {
  return (
    <span
      className={`inline-flex h-10 items-center gap-1.5 border-b-2 px-3 text-[13px] font-medium transition-colors ${
        active
          ? "border-coral-500 text-ink-900"
          : "border-transparent text-ink-500"
      }`}
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
    <div className="rounded-[10px] bg-white p-2.5">
      <div
        className="mb-1 text-[10px] uppercase text-ink-500"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
      >
        {label}
      </div>
      <pre
        className="whitespace-pre-wrap break-all text-[12px] text-ink-900"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </pre>
    </div>
  );
}
