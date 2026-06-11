import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { StudentHeader } from "@/components/student-header";
import { getSelfAttempt } from "@/modules/self-upload/service";

export const dynamic = "force-dynamic";

type Option = { text: string; isCorrect: boolean };

export default async function AttemptReviewPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const session = await auth();
  const studentId = session?.user?.id;
  if (!studentId) notFound();
  const data = await getSelfAttempt(id, studentId);
  if (!data) notFound();
  const { attempt, questions } = data;

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#334155",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <StudentHeader active="self-upload" />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-24 pt-6 md:px-6">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-solar-text/60">
          <Link
            href="/dashboard/self-upload"
            className="transition-colors hover:text-solar-amber"
          >
            Self Upload
          </Link>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <span className="text-solar-text-dark">Review</span>
        </nav>

        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-solar-amber"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              {attempt.mode === "test" ? "Mock Test" : "Mock Interview"} · {attempt.difficulty}
            </p>
            <h1 className="text-4xl font-black tracking-tighter text-solar-text-dark md:text-5xl">
              {attempt.subject}
              <span className="text-solar-amber"> · </span>
              {attempt.topic}
            </h1>
            <p
              className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-solar-text/60"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              {new Date(attempt.createdAt).toLocaleString()} ·{" "}
              {attempt.totalQuestions} questions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="rounded-full bg-emerald-500/15 px-4 py-2 text-[20px] font-black text-emerald-700"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              {attempt.scorePct}%
            </span>
            <Link
              href={`/dashboard/self-upload/attempt/${id}/replay`}
              className="rounded-xl bg-blue-800 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-blue-700"
            >
              Replay
            </Link>
          </div>
        </header>

        <ol className="flex flex-col gap-4">
          {questions.map((q, i) => {
            if (attempt.mode === "test") {
              const opts = (q.options as Option[] | null) ?? [];
              return (
                <li
                  key={q.id}
                  className="solar-card rounded-xxl bg-white p-5"
                >
                  <p className="mb-3 text-[15px] font-bold text-solar-text-dark">
                    {i + 1}. {q.prompt}
                  </p>
                  <ul className="space-y-2">
                    {opts.map((o, oi) => {
                      const isCorrect = oi === q.correctIndex;
                      const isPicked = oi === q.studentChoice;
                      let cls = "border-slate-200 opacity-70";
                      if (isCorrect)
                        cls = "border-emerald-500 bg-emerald-500/10";
                      else if (isPicked)
                        cls = "border-solar-orange bg-solar-orange/10";
                      return (
                        <li
                          key={oi}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-[14px] ${cls}`}
                        >
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-solar-ink/30 text-[11px] font-black"
                            style={{ fontFamily: "Geist Mono, monospace" }}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="flex-1">{o.text}</span>
                          {isCorrect && (
                            <span
                              className="material-symbols-outlined text-emerald-600"
                              style={{
                                fontSize: "18px",
                                fontVariationSettings: "'FILL' 1",
                              }}
                            >
                              check_circle
                            </span>
                          )}
                          {isPicked && !isCorrect && (
                            <span
                              className="material-symbols-outlined text-solar-orange"
                              style={{ fontSize: "18px" }}
                            >
                              cancel
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {q.explanation && (
                    <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[12px] italic text-solar-text">
                      <span className="font-bold not-italic">Explanation: </span>
                      {q.explanation}
                    </p>
                  )}
                </li>
              );
            }
            return (
              <li
                key={q.id}
                className="solar-card rounded-xxl bg-white p-5"
                style={{
                  borderLeft:
                    (q.score ?? 0) >= 8
                      ? "4px solid #10b981"
                      : (q.score ?? 0) >= 5
                        ? "4px solid #b58900"
                        : "4px solid #cb4b16",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-bold text-solar-text-dark">
                    {i + 1}. {q.prompt}
                  </h3>
                  <span
                    className="shrink-0 rounded-full bg-solar-amber/15 px-3 py-1 text-[12px] font-black text-solar-amber"
                    style={{ fontFamily: "Geist Mono, monospace" }}
                  >
                    {q.score ?? 0}/10
                  </span>
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <p
                    className="mb-1 text-[10px] font-black uppercase tracking-[0.15em] text-solar-text/60"
                    style={{ fontFamily: "Geist Mono, monospace" }}
                  >
                    Your Answer
                  </p>
                  <p className="text-[13px] text-solar-text-dark">
                    {q.studentAnswer || (
                      <em className="text-solar-text/50">No answer given.</em>
                    )}
                  </p>
                </div>
                {q.idealAnswer && (
                  <div className="mt-2 rounded-xl border border-emerald-500/30 bg-white p-3">
                    <p
                      className="mb-1 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700"
                      style={{ fontFamily: "Geist Mono, monospace" }}
                    >
                      Model Answer
                    </p>
                    <p className="text-[13px] text-solar-text">{q.idealAnswer}</p>
                  </div>
                )}
                {q.feedback && (
                  <div className="mt-2 rounded-xl border border-solar-orange/30 bg-white p-3">
                    <p
                      className="mb-1 text-[10px] font-black uppercase tracking-[0.15em] text-solar-orange"
                      style={{ fontFamily: "Geist Mono, monospace" }}
                    >
                      Feedback
                    </p>
                    <p className="text-[13px] text-solar-text">{q.feedback}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
