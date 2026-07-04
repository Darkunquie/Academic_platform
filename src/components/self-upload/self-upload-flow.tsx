"use client";

import { useState } from "react";
import { parsePdfAction } from "@/modules/self-upload/actions";
import { SelfMockTest } from "./self-mock-test";
import { SelfMockInterview } from "./self-mock-interview";

type Stage = "upload" | "choose" | "test" | "interview";

export function SelfUploadFlow() {
  const [stage, setStage] = useState<Stage>("upload");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [pdfHash, setPdfHash] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [meta, setMeta] = useState<{ pages: number; chars: number } | null>(
    null
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [interviewMode, setInterviewMode] = useState<"text" | "voice">("text");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    if (!subject.trim() || !topic.trim()) {
      setError("Enter subject and topic before uploading.");
      e.target.value = "";
      return;
    }
    // Client-side guard: if any PDF is in the set, only allow a single file.
    const hasPdf = picked.some((f) =>
      f.name.toLowerCase().endsWith(".pdf") || f.type.includes("pdf")
    );
    if (hasPdf && picked.length > 1) {
      setError("Upload a single PDF, or multiple images — not both.");
      e.target.value = "";
      return;
    }
    if (!hasPdf && picked.length > 5) {
      setError("Too many images (max 5 per upload).");
      e.target.value = "";
      return;
    }
    setBusy(true);
    setError(null);
    const fd = new FormData();
    for (const f of picked) fd.append("file", f);
    const res = await parsePdfAction(fd);
    setBusy(false);
    e.target.value = "";
    if (res.ok) {
      setText(res.text);
      setPdfHash(res.pdfHash);
      setMeta({ pages: res.pages, chars: res.chars });
      setStage("choose");
    } else {
      setError(res.error);
    }
  }

  function reset() {
    setStage("upload");
    setText("");
    setPdfHash(null);
    setMeta(null);
    setError(null);
  }

  if (stage === "test") {
    return (
      <SelfMockTest
        text={text}
        difficulty={difficulty}
        subject={subject}
        topic={topic}
        pdfHash={pdfHash}
        onExit={() => setStage("choose")}
      />
    );
  }
  if (stage === "interview") {
    return (
      <SelfMockInterview
        text={text}
        difficulty={difficulty}
        mode={interviewMode}
        subject={subject}
        topic={topic}
        pdfHash={pdfHash}
        onExit={() => setStage("choose")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-xl border border-solar-orange/40 bg-solar-orange/10 px-4 py-3 text-[13px] font-semibold text-solar-orange">
          {error}
        </div>
      )}

      {stage === "upload" && (
        <div>
          <p
            className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-solar-amber"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            Step 1 of 2 · Upload
          </p>
          <h2 className="mb-3 text-3xl font-black tracking-tighter text-solar-text-dark md:text-4xl">
            Drop a PDF or images of your study material.
          </h2>
          <p className="mb-6 max-w-xl text-[14px] leading-[22px] text-solar-text">
            One text-PDF, or up to 5 clear images (photos of notes,
            screenshots, diagrams). 20 MB total. We merge them into one
            transcript, generate a mock test or interview, and save your
            results to your history so you can replay or review them later.
          </p>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div>
              <p
                className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-solar-text/60"
                style={{ fontFamily: "Geist Mono, monospace" }}
              >
                Subject *
              </p>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-blue-800"
              />
            </div>
            <div>
              <p
                className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-solar-text/60"
                style={{ fontFamily: "Geist Mono, monospace" }}
              >
                Topic *
              </p>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Newton's Laws"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-blue-800"
              />
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-800 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700">
            <input
              type="file"
              accept="application/pdf,.pdf,image/*"
              multiple
              className="hidden"
              onChange={onFile}
              disabled={busy}
            />
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              upload_file
            </span>
            {" "}{busy ? "Reading file…" : "Choose PDF or images"}
          </label>

          <ul
            className="mt-6 grid gap-2 sm:grid-cols-3"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            <li className="rounded-xl border border-solar-ink/20 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-solar-text">
              <span className="text-emerald-600">✓</span> PDF or up to 5 images
            </li>
            <li className="rounded-xl border border-solar-ink/20 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-solar-text">
              <span className="text-emerald-600">✓</span> Up to 20 MB total
            </li>
            <li className="rounded-xl border border-solar-ink/20 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-solar-text">
              <span className="text-emerald-600">✓</span> 3 uploads per day
            </li>
          </ul>
        </div>
      )}

      {stage === "choose" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-emerald-600"
                style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <div>
                <p className="text-[13px] font-black uppercase tracking-[0.1em] text-solar-text-dark">
                  Content Extracted
                </p>
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.1em] text-solar-text/70"
                  style={{ fontFamily: "Geist Mono, monospace" }}
                >
                  {meta?.chars.toLocaleString()} chars extracted
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
            >
              Re-upload
            </button>
          </div>

          <div>
            <p
              className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-solar-amber"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              Step 2 of 2 · Choose practice mode
            </p>
            <h2 className="mb-6 text-3xl font-black tracking-tighter text-solar-text-dark md:text-4xl">
              How do you want to practise?
            </h2>

            <div className="mb-6 flex flex-wrap items-end gap-4">
              <div>
                <p
                  className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-solar-text/60"
                  style={{ fontFamily: "Geist Mono, monospace" }}
                >
                  Difficulty
                </p>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(
                      e.target.value as "easy" | "medium" | "hard"
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] font-semibold text-solar-text-dark"
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </div>
              <div>
                <p
                  className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-solar-text/60"
                  style={{ fontFamily: "Geist Mono, monospace" }}
                >
                  Interview mode
                </p>
                <select
                  value={interviewMode}
                  onChange={(e) =>
                    setInterviewMode(e.target.value as "text" | "voice")
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] font-semibold text-solar-text-dark"
                >
                  <option value="text">text</option>
                  <option value="voice">voice</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ModeCard
                title="Mock Test"
                description="10 MCQs from your PDF. Auto-graded. See score + explanations."
                icon="quiz"
                accent="#b58900"
                onClick={() => setStage("test")}
              />
              <ModeCard
                title="Mock Interview"
                description="5 open-ended questions. AI-scored answers + feedback."
                icon="record_voice_over"
                accent="#cb4b16"
                onClick={() => setStage("interview")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModeCard({
  title,
  description,
  icon,
  accent,
  onClick,
}: Readonly<{
  title: string;
  description: string;
  icon: string;
  accent: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="solar-card group flex flex-col items-start gap-3 rounded-xxl bg-white p-6 text-left transition-all hover:-translate-y-1"
      style={{ borderLeft: `8px solid ${accent}` }}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "26px" }}
        >
          {icon}
        </span>
      </span>
      <h3
        className="text-sm font-black uppercase tracking-[0.15em] text-solar-text-dark"
        style={{ fontFamily: "Geist Mono, monospace" }}
      >
        {title}
      </h3>
      <p className="text-[13px] leading-[20px] text-solar-text">
        {description}
      </p>
      <span
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest transition-colors group-hover:opacity-100"
        style={{ color: accent }}
      >
        Start
        <span
          className="material-symbols-outlined transition-transform group-hover:translate-x-1"
          style={{ fontSize: "16px" }}
        >
          arrow_forward
        </span>
      </span>
    </button>
  );
}
