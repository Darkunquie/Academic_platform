"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { startInterviewAction } from "@/modules/interview/actions";

type Tree = {
  id: string;
  name: string;
  chapters: { id: string; name: string; topics: { id: string; name: string }[] }[];
}[];

const labelClass = "text-[11px] font-medium uppercase text-ink-700";
const labelStyle = {
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.12em",
} as const;

const DIFFICULTY_ON: Record<"easy" | "medium" | "hard", string> = {
  easy: "bg-primary-700 text-white soft-shadow",
  medium: "bg-indigo-500 text-white soft-shadow",
  hard: "bg-coral-700 text-white soft-shadow",
};

export function InterviewSetup({
  tree,
  preselect,
}: Readonly<{
  tree: Tree;
  preselect?: string;
}>) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(preselect ? [preselect] : [])
  );
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [count, setCount] = useState(5);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleChapter(topicIds: string[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = topicIds.every((t) => next.has(t));
      if (allOn) topicIds.forEach((t) => next.delete(t));
      else topicIds.forEach((t) => next.add(t));
      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function start() {
    setError(null);
    if (selected.size === 0) {
      setError("Select at least one topic.");
      return;
    }
    setStarting(true);
    const res = await startInterviewAction({
      mode,
      topicIds: [...selected],
      difficulty,
      count,
    });
    if (res.ok && res.sessionId) {
      router.push(`/dashboard/interview/${res.sessionId}`);
    } else {
      setStarting(false);
      setError(res.error ?? "Could not start interview.");
    }
  }

  const totalSelectable = useMemo(
    () =>
      tree.reduce(
        (acc, s) => acc + s.chapters.reduce((a, c) => a + c.topics.length, 0),
        0
      ),
    [tree]
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Controls panel */}
      <div className="rounded-[24px] border border-ink-200 bg-white p-6 soft-shadow">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
          {/* Mode */}
          <div className="flex flex-col gap-2">
            <span className={labelClass} style={labelStyle}>
              Mode
            </span>
            <div className="inline-flex rounded-[14px] border border-ink-200 bg-paper p-1">
              {(["text", "voice"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[13px] font-semibold transition-all ${
                    mode === m
                      ? "bg-primary-700 text-white soft-shadow"
                      : "text-ink-700 hover:text-ink-900"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    {m === "text" ? "keyboard" : "mic"}
                  </span>
                  {m === "text" ? "Text" : "Voice"}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-2">
            <span className={labelClass} style={labelStyle}>
              Difficulty
            </span>
            <div className="inline-flex rounded-[14px] border border-ink-200 bg-paper p-1">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`rounded-[10px] px-3 py-1.5 text-[13px] font-semibold capitalize transition-all ${
                    difficulty === d
                      ? DIFFICULTY_ON[d]
                      : "text-ink-700 hover:text-ink-900"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="flex flex-col gap-2">
            <span className={labelClass} style={labelStyle}>
              Questions
            </span>
            <div className="inline-flex rounded-[14px] border border-ink-200 bg-paper p-1">
              {[5, 10, 15].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`rounded-[10px] px-4 py-1.5 text-[13px] font-semibold transition-all ${
                    count === n
                      ? "bg-primary-700 text-white soft-shadow"
                      : "text-ink-700 hover:text-ink-900"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Selection counter */}
          <div className="ml-auto flex flex-col items-end gap-1">
            <span
              className="text-[11px] uppercase text-ink-500"
              style={{ ...labelStyle }}
            >
              Selected
            </span>
            <span
              className="text-primary-900"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "32px",
                lineHeight: "32px",
                fontWeight: 400,
              }}
            >
              {selected.size}
              <span className="text-[14px] font-normal text-ink-500">
                {" "}
                / {totalSelectable}
              </span>
            </span>
            {selected.size > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] uppercase text-coral-700 transition-colors hover:text-coral-500"
                style={labelStyle}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Topic tree */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tree.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-ink-300 bg-white/60 p-12 text-center text-ink-500">
            No topics available for your class yet.
          </div>
        )}
        {tree.map((subject) => {
          const subjectTopicIds = subject.chapters.flatMap((c) =>
            c.topics.map((t) => t.id)
          );
          const subjectSelected = subjectTopicIds.filter((id) =>
            selected.has(id)
          ).length;
          return (
            <section
              key={subject.id}
              className="rounded-[24px] border border-ink-200 bg-white p-7 soft-shadow"
            >
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p
                    className="mb-1 text-[11px] uppercase text-ink-500"
                    style={labelStyle}
                  >
                    Subject
                  </p>
                  <h2
                    className="text-ink-900"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "22px",
                      lineHeight: "28px",
                      fontWeight: 600,
                    }}
                  >
                    {subject.name}
                  </h2>
                </div>
                <span
                  className="rounded-full bg-paper px-3 py-1 text-[11px] text-ink-700"
                  style={labelStyle}
                >
                  {subjectSelected} / {subjectTopicIds.length}
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {subject.chapters.map((ch) => {
                  const chapterTopicIds = ch.topics.map((t) => t.id);
                  const allOn =
                    chapterTopicIds.length > 0 &&
                    chapterTopicIds.every((id) => selected.has(id));
                  return (
                    <div
                      key={ch.id}
                      className="rounded-[16px] border border-ink-100 bg-paper p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3
                          className="text-ink-900"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "15px",
                            fontWeight: 600,
                          }}
                        >
                          {ch.name}
                        </h3>
                        {chapterTopicIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleChapter(chapterTopicIds)}
                            className="text-[10px] uppercase text-primary-700 transition-colors hover:text-coral-700"
                            style={labelStyle}
                          >
                            {allOn ? "Deselect all" : "Select all"}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ch.topics.length === 0 && (
                          <span className="text-[12px] text-ink-500">
                            No topics
                          </span>
                        )}
                        {ch.topics.map((t) => {
                          const on = selected.has(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggle(t.id)}
                              className={`group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                                on
                                  ? "border-primary-500 bg-primary-100 text-primary-900"
                                  : "border-ink-200 bg-white text-ink-700 hover:border-primary-200 hover:bg-primary-50"
                              }`}
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                                  on
                                    ? "bg-primary-700 text-white"
                                    : "border border-ink-300 bg-white"
                                }`}
                              >
                                {on && (
                                  <span
                                    className="material-symbols-outlined"
                                    style={{
                                      fontSize: "12px",
                                      fontVariationSettings: "'FILL' 1",
                                    }}
                                  >
                                    check
                                  </span>
                                )}
                              </span>
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {error && (
        <div className="rounded-[14px] border border-danger/30 bg-coral-100 px-4 py-3 text-[13px] text-coral-700">
          {error}
        </div>
      )}

      {/* Sticky start bar */}
      <div className="sticky bottom-4 z-20 flex justify-center">
        <div className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-full border border-ink-200 bg-white/80 px-5 py-3 pop-shadow backdrop-blur-xl">
          <div className="flex flex-col">
            <span
              className="text-[10px] uppercase text-ink-500"
              style={labelStyle}
            >
              Ready
            </span>
            <span className="text-[14px] font-semibold text-ink-900">
              {selected.size} topic{selected.size === 1 ? "" : "s"} · {count}{" "}
              questions · {difficulty}
            </span>
          </div>
          <button
            type="button"
            onClick={start}
            disabled={starting || selected.size === 0}
            className="group inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-2.5 text-[14px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting ? "Preparing…" : "Start interview"}
            {!starting && (
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
  );
}
