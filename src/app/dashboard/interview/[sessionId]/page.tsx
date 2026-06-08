import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getSessionForStudent } from "@/modules/interview/service";
import { InterviewRunner } from "@/components/interview/interview-runner";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

export default async function InterviewSessionPage({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const data = await getSessionForStudent(sessionId, session.user.id);
  if (!data) notFound();

  const { session: s, questions, answers } = data;
  const completed = s.status === "completed";

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <div className="dotted-pattern absolute inset-0" />
      <div className="mesh-gradient absolute inset-0 opacity-40" />
      <div
        className="shape-float absolute right-[6%] top-32 h-28 w-28 rounded-full bg-coral-300 opacity-20 blur-3xl"
        style={{ animationDelay: "0s" }}
      />

      <div className="relative z-10">
        <StudentHeader active="interview" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-6 pb-24 pt-10 md:px-16 md:pt-14">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary-700"
          >
            My subjects
          </Link>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <Link
            href="/dashboard/interview"
            className="transition-colors hover:text-primary-700"
          >
            Mock interview
          </Link>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <span className="font-medium text-ink-900">
            {completed ? "Result" : "In progress"}
          </span>
        </nav>

        <header className="flex flex-col gap-3">
          <p
            className="text-[11px] uppercase text-coral-700"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            {completed ? "Session complete" : "Live · interviewer is listening"}
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
            {completed ? (
              <>
                Your{" "}
                <span className="hand-drawn-underline">verdict.</span>
              </>
            ) : (
              <>
                Mock{" "}
                <span className="hand-drawn-underline">interview.</span>
              </>
            )}
          </h1>
        </header>

        {questions.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-ink-300 bg-white/60 p-12 text-center text-ink-500">
            No questions were generated. Try starting again.
          </div>
        ) : completed ? (
          <CompletedView
            questions={questions}
            answers={answers}
            overall={s.overallScore}
          />
        ) : (
          <InterviewRunner
            sessionId={sessionId}
            mode={s.mode}
            questions={questions.map((q) => ({ id: q.id, question: q.question }))}
          />
        )}
      </div>
    </main>
  );
}

function scoreTone(n: number): { ring: string; chip: string; label: string } {
  if (n >= 8)
    return {
      ring: "ring-primary-500",
      chip: "bg-primary-100 text-primary-700",
      label: "Strong",
    };
  if (n >= 5)
    return {
      ring: "ring-indigo-300",
      chip: "bg-indigo-100 text-indigo-700",
      label: "Partial",
    };
  return {
    ring: "ring-coral-300",
    chip: "bg-coral-100 text-coral-700",
    label: "Off-mark",
  };
}

function CompletedView({
  questions,
  answers,
  overall,
}: Readonly<{
  questions: { id: string; question: string; seq: number }[];
  answers: {
    interviewQuestionId: string;
    transcript: string | null;
    score: string | null;
    feedback: string | null;
  }[];
  overall: string | null;
}>) {
  const byQ = new Map(answers.map((a) => [a.interviewQuestionId, a]));
  const overallNum = Number(overall ?? 0);
  const pct = Math.max(0, Math.min(100, overallNum));

  return (
    <div className="flex flex-col gap-8">
      {/* Hero score card */}
      <div className="relative overflow-hidden rounded-[28px] border border-ink-200 bg-white p-8 pop-shadow md:p-10">
        <div
          className="absolute -right-8 -top-8 text-primary-100 opacity-60"
          style={{ fontSize: "220px", lineHeight: 1 }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "220px" }}
          >
            military_tech
          </span>
        </div>
        <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="mb-2 text-[11px] uppercase text-ink-500"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
              }}
            >
              Overall interview score
            </p>
            <div
              className="flex items-baseline gap-2 text-primary-900"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ fontSize: "96px", lineHeight: "96px" }}>
                {overall ?? "—"}
              </span>
              <span className="text-[28px] text-ink-500">/ 100</span>
            </div>
            <p className="mt-2 text-[15px] text-ink-700">
              {questions.length} questions ·{" "}
              {answers.filter((a) => a.transcript).length} answered
            </p>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-1 flex items-center justify-between text-[11px] uppercase text-ink-500"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
              }}>
              <span>Mastery</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-primary-700 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Per-question cards */}
      <div className="flex flex-col gap-4">
        <p
          className="text-[11px] uppercase text-ink-500"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
        >
          Per-question breakdown
        </p>
        {questions.map((q, i) => {
          const a = byQ.get(q.id);
          const score = Number(a?.score ?? 0);
          const tone = scoreTone(score);
          return (
            <article
              key={q.id}
              className={`rounded-[20px] border border-ink-200 bg-white p-6 soft-shadow ring-1 ${tone.ring}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-[12px] font-semibold text-ink-700"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {i + 1}
                  </span>
                  <h3
                    className="text-ink-900"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "17px",
                      lineHeight: "26px",
                      fontWeight: 600,
                    }}
                  >
                    {q.question}
                  </h3>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${tone.chip}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {a?.score ?? 0}/10
                </span>
              </div>

              <div className="mt-5 rounded-[14px] border border-ink-100 bg-paper p-4">
                <p
                  className="mb-1 text-[10px] uppercase text-ink-500"
                  style={{
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.12em",
                  }}
                >
                  Your answer
                </p>
                <p className="text-[15px] leading-[24px] text-ink-900">
                  {a?.transcript || (
                    <em className="text-ink-500">No answer was given.</em>
                  )}
                </p>
              </div>

              {a?.feedback && (
                <div className="mt-3 flex items-start gap-3 rounded-[14px] border border-ink-100 bg-white p-4">
                  <span
                    className="mt-0.5 material-symbols-outlined text-coral-700"
                    style={{ fontSize: "20px" }}
                  >
                    auto_awesome
                  </span>
                  <div className="flex-1">
                    <p
                      className="mb-1 text-[10px] uppercase text-coral-700"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Examiner feedback · {tone.label}
                    </p>
                    <p className="text-[14px] leading-[22px] text-ink-700">
                      {a.feedback}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] uppercase text-ink-500 transition-colors hover:text-coral-700"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            arrow_back
          </span>
          Back to dashboard
        </Link>
        <Link
          href="/dashboard/interview"
          className="group inline-flex items-center gap-2 rounded-[14px] bg-primary-700 px-5 py-2.5 text-[14px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow"
        >
          Run another interview
          <span
            className="material-symbols-outlined transition-transform group-hover:translate-x-1"
            style={{ fontSize: "18px" }}
          >
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}
