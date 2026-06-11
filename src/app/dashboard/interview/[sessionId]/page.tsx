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
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#334155",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <StudentHeader active="interview" />

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
            href="/dashboard/interview"
            className="transition-colors hover:text-solar-amber"
          >
            Mock Interview
          </Link>
          <Chev />
          <span className="text-solar-text-dark">
            {completed ? "Result" : "In Progress"}
          </span>
        </nav>

        {/* Hero */}
        <header className="mb-10 flex flex-col gap-3">
          <p className="text-[10px] font-black text-solar-amber">
            {completed ? "Session Complete" : "Live · Interviewer Listening"}
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-solar-text-dark md:text-6xl">
            {completed ? "Your verdict." : "Mock interview."}
          </h1>
        </header>

        {questions.length === 0 ? (
          <div className="solar-card rounded-xxl border-dashed bg-white p-12 text-center text-solar-text">
            No questions were generated. Try starting again.
          </div>
        ) : completed ? (
          <CompletedView
            questions={questions}
            answers={answers}
            overall={s.overallScore}
          />
        ) : (
          <div className="solar-card rounded-xxl bg-white p-6 md:p-8">
            <InterviewRunner
              sessionId={sessionId}
              mode={s.mode}
              questions={questions.map((q) => ({
                id: q.id,
                question: q.question,
              }))}
            />
          </div>
        )}
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

function scoreTone(n: number): { accent: string; chip: string; label: string } {
  if (n >= 8)
    return {
      accent: "#10b981",
      chip: "bg-emerald-500/10 text-emerald-700",
      label: "Strong",
    };
  if (n >= 5)
    return {
      accent: "#b58900",
      chip: "bg-solar-amber/10 text-solar-amber",
      label: "Partial",
    };
  return {
    accent: "#cb4b16",
    chip: "bg-solar-orange/10 text-solar-orange",
    label: "Off-Mark",
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
      <div className="solar-card relative overflow-hidden rounded-xxl border-t-4 border-t-blue-800 bg-white p-8 md:p-10">
        <div className="solar-scanline" />
        <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black text-solar-amber">
              Overall Interview Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black tracking-tighter text-solar-text-dark md:text-[96px]">
                {overall ?? "—"}
              </span>
              <span className="text-2xl font-bold text-solar-text/40">
                / 100
              </span>
            </div>
            <p className="mt-2 text-[15px] text-solar-text">
              {questions.length} questions ·{" "}
              {answers.filter((a) => a.transcript).length} answered
            </p>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-1 flex items-center justify-between text-[10px] font-black text-solar-text/60">
              <span>Mastery</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-solar-card">
              <div
                className="h-full rounded-full bg-solar-amber transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Per-question cards */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-solar-card pb-4">
          <h2 className="text-lg font-black italic text-solar-text-dark">
            Per-Question Breakdown
          </h2>
        </div>
        {questions.map((q, i) => {
          const a = byQ.get(q.id);
          const score = Number(a?.score ?? 0);
          const tone = scoreTone(score);
          return (
            <article
              key={q.id}
              className="solar-card rounded-xxl bg-white p-6"
              style={{ borderLeft: `4px solid ${tone.accent}` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-solar-text-dark">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-bold leading-relaxed text-solar-text-dark">
                    {q.question}
                  </h3>
                </div>
                <span
                  className={
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black " +
                    tone.chip
                  }
                >
                  {a?.score ?? 0}/10
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-solar-card bg-slate-50 p-4">
                <p className="mb-1 text-[10px] font-black text-solar-text/60">
                  Your Answer
                </p>
                <p className="text-[14px] leading-[22px] text-solar-text-dark">
                  {a?.transcript || (
                    <em className="text-solar-text/60">No answer was given.</em>
                  )}
                </p>
              </div>

              {a?.feedback && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-solar-card bg-white p-4">
                  <span
                    className="material-symbols-outlined mt-0.5 text-solar-amber"
                    style={{ fontSize: "20px" }}
                  >
                    auto_awesome
                  </span>
                  <div className="flex-1">
                    <p className="mb-1 text-[10px] font-black text-solar-amber">
                      Examiner Feedback · {tone.label}
                    </p>
                    <p className="text-[13px] leading-[20px] text-solar-text">
                      {a.feedback}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-solar-card pt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[11px] font-black text-solar-text transition-colors hover:text-solar-amber"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            arrow_back
          </span>
          {" "}Back to Dashboard
        </Link>
        <Link
          href="/dashboard/interview"
          className="group inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
        >
          Run Another Interview{" "}
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
