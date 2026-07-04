"use client";

import { useEffect, useState } from "react";
import {
  generateSelfTestAction,
  saveTestAttemptAction,
  type SelfMcq,
} from "@/modules/self-upload/actions";

const TEST_COUNT = 10;

export function SelfMockTest({
  text,
  difficulty,
  subject,
  topic,
  pdfHash,
  presetQuestions,
  onExit,
}: Readonly<{
  text: string;
  difficulty: "easy" | "medium" | "hard";
  subject?: string;
  topic?: string;
  pdfHash?: string | null;
  presetQuestions?: SelfMcq[];
  onExit: () => void;
}>) {
  const [loading, setLoading] = useState(!presetQuestions);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SelfMcq[]>(presetQuestions ?? []);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (presetQuestions) return;
    let cancelled = false;
    (async () => {
      const res = await generateSelfTestAction({
        text,
        count: TEST_COUNT,
        difficulty,
      });
      if (cancelled) return;
      if (res.ok) setQuestions(res.questions);
      else setError(res.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [text, difficulty, presetQuestions]);

  function pick(qi: number, oi: number) {
    if (submitted) return;
    setPicks((p) => ({ ...p, [qi]: oi }));
  }

  async function submit() {
    const unanswered = questions.length - Object.keys(picks).length;
    if (
      unanswered > 0 &&
      !globalThis.confirm(
        `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`
      )
    ) {
      return;
    }
    setSubmitted(true);
    if (!saved && subject && topic && !presetQuestions) {
      const res = await saveTestAttemptAction({
        subject,
        topic,
        difficulty,
        pdfHash: pdfHash ?? null,
        questions: questions.map((q, i) => ({
          prompt: q.prompt,
          options: q.options,
          explanation: q.explanation,
          studentChoice: picks[i] ?? null,
        })),
      });
      if (res.ok) setSaved(true);
      else setSaveError(res.error ?? "Failed to save test attempt.");
    }
  }

  function correctIndex(q: SelfMcq): number {
    return q.options.findIndex((o) => o.isCorrect);
  }

  const score = submitted
    ? questions.reduce(
        (s, q, i) => (picks[i] === correctIndex(q) ? s + 1 : s),
        0
      )
    : 0;
  const pct = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="solar-card rounded-xxl bg-white p-10 text-center">
        <div className="mb-4 inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-solar-amber/30 border-t-solar-amber" />
        <p className="text-[15px] font-semibold text-solar-text-dark">
          Generating {TEST_COUNT} questions from your PDF…
        </p>
        <p
          className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-solar-text/60"
          style={{ fontFamily: "Geist Mono, monospace" }}
        >
          Takes ~5–10 seconds.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xxl border border-solar-orange/40 bg-solar-orange/10 p-6">
        <p
          className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-orange"
          style={{ fontFamily: "Geist Mono, monospace" }}
        >
          Generation Failed
        </p>
        <p className="mt-1 text-[14px] font-semibold text-solar-text-dark">
          {error}
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-amber"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            Mock Test · {difficulty}
          </p>
          <h2 className="text-3xl font-black tracking-tighter text-solar-text-dark">
            {questions.length} questions
          </h2>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
        >
          Exit
        </button>
      </div>

      {submitted && (
        <div
          className="solar-card flex items-center justify-between rounded-xxl bg-white px-6 py-5"
          style={{ borderTop: "4px solid #b58900" }}
        >
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-amber"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              Result
            </p>
            <p className="mt-1 text-5xl font-black tracking-tighter text-solar-text-dark">
              {score}/{questions.length}
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-text/60"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              Percentage
            </p>
            <p
              className="text-4xl font-black tracking-tighter text-solar-amber"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              {pct}%
            </p>
          </div>
        </div>
      )}

      <ol className="flex flex-col gap-4">
        {questions.map((q, qi) => {
          const correct = correctIndex(q);
          const userPick = picks[qi];
          return (
            <li
              key={qi}
              className="solar-card rounded-xxl bg-white p-5"
            >
              <p className="mb-3 text-[15px] font-bold text-solar-text-dark">
                {qi + 1}. {q.prompt}
              </p>
              <ul className="space-y-2">
                {q.options.map((o, oi) => {
                  let cls =
                    "border-slate-300 hover:border-blue-800 hover:bg-slate-50";
                  if (submitted) {
                    if (oi === correct)
                      cls = "border-emerald-500 bg-emerald-500/10";
                    else if (oi === userPick && userPick !== correct)
                      cls = "border-solar-orange bg-solar-orange/10";
                    else cls = "border-slate-200 opacity-70";
                  } else if (userPick === oi) {
                    cls = "border-blue-800 bg-blue-50";
                  }
                  return (
                    <li key={oi}>
                      <button
                        type="button"
                        onClick={() => pick(qi, oi)}
                        disabled={submitted}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[14px] transition-all ${cls}`}
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-solar-ink/40 text-[11px] font-black text-solar-text-dark"
                          style={{ fontFamily: "Geist Mono, monospace" }}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="flex-1 text-solar-text-dark">
                          {o.text}
                        </span>
                        {submitted && oi === correct && (
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
                        {submitted &&
                          oi === userPick &&
                          userPick !== correct && (
                            <span
                              className="material-symbols-outlined text-solar-orange"
                              style={{ fontSize: "18px" }}
                            >
                              cancel
                            </span>
                          )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {submitted && q.explanation && (
                <p className="mt-3 rounded-xl border-l-4 border-solar-amber bg-slate-50 px-3 py-2 text-[12px] italic text-solar-text">
                  <span className="font-black not-italic text-solar-amber">
                    Explanation:{" "}
                  </span>
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {saveError && (
        <div className="rounded-xl border border-solar-orange/40 bg-solar-orange/10 px-4 py-3 text-[13px] font-semibold text-solar-orange">
          Save failed: {saveError}
        </div>
      )}

      {!submitted ? (
        <button
          type="button"
          onClick={submit}
          disabled={Object.keys(picks).length === 0}
          className="self-end rounded-xl bg-blue-800 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Submit Test
        </button>
      ) : (
        <button
          type="button"
          onClick={onExit}
          className="self-end rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
        >
          Back to Upload
        </button>
      )}
    </div>
  );
}
