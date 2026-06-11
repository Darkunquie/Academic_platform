"use client";

import { useEffect, useRef, useState } from "react";
import {
  generateSelfInterviewAction,
  saveInterviewAttemptAction,
  scoreSelfAnswerAction,
  transcribeSelfAudioAction,
  type SelfInterviewQ,
} from "@/modules/self-upload/actions";
import {
  startWebSpeech,
  webSpeechAvailable,
  type WebSpeechSession,
} from "@/lib/web-speech";

const INTERVIEW_COUNT = 5;

type Result = {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  idealAnswer: string;
};

export function SelfMockInterview({
  text,
  difficulty,
  mode,
  subject,
  topic,
  pdfHash,
  presetQuestions,
  onExit,
}: Readonly<{
  text: string;
  difficulty: "easy" | "medium" | "hard";
  mode: "text" | "voice";
  subject?: string;
  topic?: string;
  pdfHash?: string | null;
  presetQuestions?: SelfInterviewQ[];
  onExit: () => void;
}>) {
  const [loading, setLoading] = useState(!presetQuestions);
  const [genError, setGenError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SelfInterviewQ[]>(
    presetQuestions ?? []
  );
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [finished, setFinished] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechRef = useRef<WebSpeechSession | null>(null);
  useEffect(() => {
    if (presetQuestions) return;
    let cancelled = false;
    (async () => {
      const res = await generateSelfInterviewAction({
        text,
        count: INTERVIEW_COUNT,
        difficulty,
      });
      if (cancelled) return;
      if (res.ok) setQuestions(res.questions);
      else setGenError(res.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [text, difficulty, presetQuestions]);

  const q = questions[idx];

  useEffect(() => {
    if (mode === "voice" && q && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(q.question));
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [idx, mode, q]);

  async function startRec() {
    setError(null);

    if (webSpeechAvailable()) {
      const session = startWebSpeech({
        onTranscript: (text) => setDraft(text),
        onError: (err) => setError(err),
        onEnd: () => setRecording(false),
      });
      if (session) {
        speechRef.current = session;
        setRecording(true);
        return;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "answer.webm", { type: "audio/webm" });
        setTranscribing(true);
        const fd = new FormData();
        fd.append("audio", file);
        const res = await transcribeSelfAudioAction(fd);
        setTranscribing(false);
        if (res.ok) setDraft((d) => (d ? d + " " : "") + res.text);
        else setError(res.error);
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
    } catch {
      setError("Microphone access denied.");
    }
  }

  function stopRec() {
    if (speechRef.current) {
      speechRef.current.stop();
      speechRef.current = null;
      setRecording(false);
      return;
    }
    recorderRef.current?.stop();
    setRecording(false);
  }

  function readAloud() {
    if (!q || typeof window === "undefined" || !("speechSynthesis" in window))
      return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(q.question));
  }

  async function submit() {
    if (!q) return;
    setSubmitting(true);
    setError(null);
    const res = await scoreSelfAnswerAction({
      question: q.question,
      idealAnswer: q.idealAnswer,
      answer: draft,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const next = [
      ...results,
      {
        question: q.question,
        answer: draft,
        score: res.score,
        feedback: res.feedback,
        idealAnswer: q.idealAnswer,
      },
    ];
    setResults(next);
    setDraft("");
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      setFinished(true);
      if (subject && topic && !presetQuestions) {
        await saveInterviewAttemptAction({
          subject,
          topic,
          difficulty,
          pdfHash: pdfHash ?? null,
          questions: next.map((r) => ({
            prompt: r.question,
            idealAnswer: r.idealAnswer,
            studentAnswer: r.answer,
            score: r.score,
            feedback: r.feedback,
          })),
        });
      }
    }
  }

  if (loading) {
    return (
      <div className="solar-card rounded-xxl bg-white p-10 text-center">
        <div className="mb-4 inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-solar-orange/30 border-t-solar-orange" />
        <p className="text-[15px] font-semibold text-solar-text-dark">
          Generating {INTERVIEW_COUNT} interview questions…
        </p>
      </div>
    );
  }

  if (genError) {
    return (
      <div className="rounded-xxl border border-solar-orange/40 bg-solar-orange/10 p-6">
        <p
          className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-orange"
          style={{ fontFamily: "Geist Mono, monospace" }}
        >
          Generation Failed
        </p>
        <p className="mt-1 text-[14px] font-semibold text-solar-text-dark">
          {genError}
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

  if (finished) {
    const total = results.reduce((s, r) => s + r.score, 0);
    const pct = results.length
      ? Math.round((total / (results.length * 10)) * 100)
      : 0;
    return (
      <div className="flex flex-col gap-5">
        <div
          className="solar-card rounded-xxl bg-white p-7"
          style={{ borderTop: "4px solid #cb4b16" }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-orange"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            Interview Complete
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-7xl font-black tracking-tighter text-solar-orange">
              {pct}%
            </span>
            <span className="text-[14px] text-solar-text">
              ({total}/{results.length * 10} total points)
            </span>
          </div>
        </div>
        {results.map((r, i) => (
          <div
            key={i}
            className="solar-card rounded-xxl bg-white p-5"
            style={{
              borderLeft:
                r.score >= 8
                  ? "4px solid #10b981"
                  : r.score >= 5
                    ? "4px solid #b58900"
                    : "4px solid #cb4b16",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[15px] font-bold text-solar-text-dark">
                {i + 1}. {r.question}
              </h3>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${
                  r.score >= 8
                    ? "bg-emerald-500/10 text-emerald-700"
                    : r.score >= 5
                      ? "bg-solar-amber/10 text-solar-amber"
                      : "bg-solar-orange/10 text-solar-orange"
                }`}
                style={{ fontFamily: "Geist Mono, monospace" }}
              >
                {r.score}/10
              </span>
            </div>
            <div className="mt-3 rounded-xl border border-solar-card bg-slate-50 p-3">
              <p
                className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-solar-text/60"
                style={{ fontFamily: "Geist Mono, monospace" }}
              >
                Your Answer
              </p>
              <p className="text-[13px] text-solar-text-dark">
                {r.answer || (
                  <em className="text-solar-text/60">No answer given.</em>
                )}
              </p>
            </div>
            {r.feedback && (
              <div className="mt-2 rounded-xl border border-solar-amber/30 bg-white p-3">
                <p
                  className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-solar-amber"
                  style={{ fontFamily: "Geist Mono, monospace" }}
                >
                  Feedback
                </p>
                <p className="text-[13px] text-solar-text">{r.feedback}</p>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onExit}
          className="self-end rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
        >
          Back to Upload
        </button>
      </div>
    );
  }

  const pct = ((idx + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-orange"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            Mock Interview · {difficulty} · {mode}
          </p>
          <h2 className="text-2xl font-black tracking-tighter text-solar-text-dark">
            Question {idx + 1} of {questions.length}
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

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-solar-card">
        <div
          className="h-full rounded-full bg-solar-orange transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="solar-card rounded-xxl bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[17px] font-bold leading-[26px] text-solar-text-dark">
            {q?.question}
          </p>
          {mode === "voice" && (
            <button
              type="button"
              onClick={readAloud}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-solar-text-dark hover:border-blue-800 hover:text-blue-800"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                volume_up
              </span>
              {" "}Read Aloud
            </button>
          )}
        </div>

        {mode === "voice" && (
          <div className="mt-4 flex items-center gap-3 rounded-full border border-slate-300 bg-slate-50 p-2">
            {!recording ? (
              <button
                type="button"
                onClick={startRec}
                disabled={transcribing || submitting}
                className="inline-flex items-center gap-2 rounded-full bg-blue-800 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 disabled:opacity-60"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  mic
                </span>
                {" "}Speak Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRec}
                className="inline-flex items-center gap-2 rounded-full bg-solar-orange px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:opacity-90"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  stop_circle
                </span>
                {" "}Stop
              </button>
            )}
            {transcribing && (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.15em] text-solar-text/60"
                style={{ fontFamily: "Geist Mono, monospace" }}
              >
                Transcribing…
              </span>
            )}
          </div>
        )}

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          placeholder={
            mode === "voice"
              ? "Use the mic, or type your answer here…"
              : "Type your answer here…"
          }
          className="mt-4 w-full rounded-xl border border-slate-300 bg-white p-3 text-[14px] text-solar-text-dark outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200"
        />

        {error && (
          <div className="mt-3 rounded-xl border border-solar-orange/40 bg-solar-orange/10 px-3 py-2 text-[12px] font-semibold text-solar-orange">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-solar-text/60"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            {draft.split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || transcribing}
            className="rounded-xl bg-blue-800 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? "Scoring…"
              : idx + 1 < questions.length
                ? "Submit & Next"
                : "Submit & Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
