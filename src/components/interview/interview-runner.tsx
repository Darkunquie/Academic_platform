"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  submitAnswerAction,
  transcribeAction,
  completeInterviewAction,
} from "@/modules/interview/actions";

type Q = { id: string; question: string };
type Res = { question: string; answer: string; score: number; feedback: string };

const labelStyle = {
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.12em",
} as const;

function submitLabel(submitting: boolean, hasNext: boolean): string {
  if (submitting) return "Scoring…";
  return hasNext ? "Submit & next" : "Submit & finish";
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

export function InterviewRunner({
  sessionId,
  mode,
  questions,
}: Readonly<{
  sessionId: string;
  mode: "voice" | "text";
  questions: Q[];
}>) {
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState<Res[]>([]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [overall, setOverall] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const q = questions[idx];

  useEffect(() => {
    if (mode === "voice" && q && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(q.question));
    }
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [idx, mode, q]);

  async function startRec() {
    setError(null);
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
        const res = await transcribeAction(fd);
        setTranscribing(false);
        if (res.ok) setDraft((d) => (d ? d + " " : "") + (res.text ?? ""));
        else setError(res.error ?? "Transcription failed.");
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
    } catch {
      setError("Microphone access denied.");
    }
  }

  function stopRec() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function readAloud() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(q.question));
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    const res = await submitAnswerAction({
      interviewQuestionId: q.id,
      transcript: draft,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Could not submit.");
      return;
    }
    const next = [
      ...results,
      {
        question: q.question,
        answer: draft,
        score: res.score ?? 0,
        feedback: res.feedback ?? "",
      },
    ];
    setResults(next);
    setDraft("");

    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      const done = await completeInterviewAction(sessionId);
      if (done.ok) setOverall(done.overall ?? null);
      setFinished(true);
    }
  }

  if (finished) {
    const pct = Math.max(0, Math.min(100, overall ?? 0));
    return (
      <div className="flex flex-col gap-8">
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
                style={labelStyle}
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
            </div>
            <div className="w-full max-w-xs">
              <div
                className="mb-1 flex items-center justify-between text-[11px] uppercase text-ink-500"
                style={labelStyle}
              >
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

        <div className="flex flex-col gap-4">
          {results.map((r, i) => {
            const tone = scoreTone(r.score);
            return (
              <article
                key={`res-${i}-${r.question.slice(0, 16)}`}
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
                      {r.question}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-semibold ${tone.chip}`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.score}/10
                  </span>
                </div>
                <div className="mt-5 rounded-[14px] border border-ink-100 bg-paper p-4">
                  <p
                    className="mb-1 text-[10px] uppercase text-ink-500"
                    style={labelStyle}
                  >
                    Your answer
                  </p>
                  <p className="text-[15px] leading-[24px] text-ink-900">
                    {r.answer || (
                      <em className="text-ink-500">No answer was given.</em>
                    )}
                  </p>
                </div>
                {r.feedback && (
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
                        style={labelStyle}
                      >
                        Examiner feedback · {tone.label}
                      </p>
                      <p className="text-[14px] leading-[22px] text-ink-700">
                        {r.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="border-t border-ink-200 pt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] uppercase text-ink-500 transition-colors hover:text-coral-700"
            style={labelStyle}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              arrow_back
            </span>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const pct = ((idx + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress strip */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] uppercase text-ink-500"
          style={labelStyle}>
          <span>
            Question {idx + 1} / {questions.length}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                recording ? "bg-coral-500 animate-pulse" : "bg-primary-500"
              }`}
            />
            {mode === "voice" ? "Voice mode" : "Text mode"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-primary-700 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="relative overflow-hidden rounded-[24px] border border-ink-200 bg-white p-7 pop-shadow md:p-9">
        <div
          className="absolute -right-6 -top-6 text-primary-100 opacity-50"
          style={{ fontSize: "140px", lineHeight: 1 }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "140px" }}
          >
            record_voice_over
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p
                className="mb-2 text-[11px] uppercase text-coral-700"
                style={labelStyle}
              >
                Interviewer asks
              </p>
              <h2
                className="text-ink-900"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "22px",
                  lineHeight: "30px",
                  letterSpacing: "-0.01em",
                  fontWeight: 600,
                }}
              >
                {q.question}
              </h2>
            </div>
            <button
              type="button"
              onClick={readAloud}
              title="Read question aloud"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-2 text-[12px] font-semibold text-ink-700 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700 hover:soft-shadow"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                volume_up
              </span>
              Read aloud
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-ink-200 bg-paper p-2">
            {!recording ? (
              <button
                type="button"
                onClick={startRec}
                disabled={transcribing}
                className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "16px",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  mic
                </span>
                Speak answer
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRec}
                className="inline-flex items-center gap-2 rounded-full bg-coral-700 px-4 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-coral-500"
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "16px",
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  stop_circle
                </span>
                Stop recording
              </button>
            )}
            <div className="flex flex-1 items-center gap-[3px]" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={`wf-${i}`}
                  className={`block w-[3px] rounded-full ${
                    recording ? "bg-coral-700" : "bg-ink-200"
                  }`}
                  style={{
                    height: `${6 + ((i * 5) % 16)}px`,
                    animation: recording
                      ? `wave 1s ease-in-out ${i * 0.05}s infinite`
                      : "none",
                  }}
                />
              ))}
            </div>
            {transcribing && (
              <span
                className="pr-3 text-[11px] uppercase text-ink-500"
                style={labelStyle}
              >
                Transcribing…
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span
              className="ml-1 text-[11px] uppercase text-ink-700"
              style={labelStyle}
            >
              Your answer
            </span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              placeholder="Type your answer, or use the mic to speak it…"
              className="w-full rounded-[14px] border-[1.5px] border-ink-200 bg-white p-4 text-[15px] leading-[24px] text-ink-900 outline-none transition-all placeholder:text-ink-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            />
          </div>

          {error && (
            <div className="rounded-[14px] border border-danger/30 bg-coral-100 px-4 py-3 text-[13px] text-coral-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-ink-500">
              {draft.length} characters · {draft.split(/\s+/).filter(Boolean).length}{" "}
              words
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={submitting || transcribing}
              className="group inline-flex items-center gap-2 rounded-[14px] bg-primary-700 px-5 py-2.5 text-[14px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLabel(submitting, idx + 1 < questions.length)}
              {!submitting && (
                <span
                  className="material-symbols-outlined transition-transform group-hover:translate-x-1"
                  style={{ fontSize: "18px" }}
                >
                  arrow_forward
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes wave {
        0%, 100% { transform: scaleY(0.4); }
        50% { transform: scaleY(1.5); }
      }`}</style>
    </div>
  );
}
