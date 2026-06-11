"use client";

import { useState } from "react";
import {
  bulkImportMcqsAction,
  parseMcqUploadAction,
} from "@/modules/assessment/actions";
import type { ParsedMcq } from "@/modules/assessment/import";

export function McqImporter({ topicId }: Readonly<{ topicId: string }>) {
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<ParsedMcq[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ inserted: number; skipped: number } | null>(
    null
  );
  const [skipFlags, setSkipFlags] = useState<Set<number>>(new Set());

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setDone(null);
    setItems(null);
    setSkipFlags(new Set());
    const fd = new FormData();
    fd.append("file", file);
    const res = await parseMcqUploadAction(fd);
    setBusy(false);
    if (res.ok) setItems(res.items);
    else setError(res.error);
    e.target.value = "";
  }

  function toggleSkip(i: number) {
    const next = new Set(skipFlags);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSkipFlags(next);
  }

  function updateItem(i: number, patch: Partial<ParsedMcq>) {
    setItems((prev) =>
      prev ? prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) : prev
    );
  }
  function updateOption(qi: number, oi: number, text: string) {
    setItems((prev) =>
      prev
        ? prev.map((q, idx) =>
            idx === qi
              ? {
                  ...q,
                  options: q.options.map((o, j) =>
                    j === oi ? { ...o, text } : o
                  ),
                }
              : q
          )
        : prev
    );
  }
  function setCorrect(qi: number, oi: number) {
    setItems((prev) =>
      prev
        ? prev.map((q, idx) =>
            idx === qi
              ? {
                  ...q,
                  options: q.options.map((o, j) => ({
                    ...o,
                    isCorrect: j === oi,
                  })),
                }
              : q
          )
        : prev
    );
  }
  function addOption(qi: number) {
    setItems((prev) =>
      prev
        ? prev.map((q, idx) =>
            idx === qi
              ? {
                  ...q,
                  options: [...q.options, { text: "", isCorrect: false }],
                }
              : q
          )
        : prev
    );
  }
  function removeOption(qi: number, oi: number) {
    setItems((prev) =>
      prev
        ? prev.map((q, idx) =>
            idx === qi
              ? { ...q, options: q.options.filter((_, j) => j !== oi) }
              : q
          )
        : prev
    );
  }

  async function commit() {
    if (!items) return;
    setBusy(true);
    setError(null);
    const keep = items.filter((_, i) => !skipFlags.has(i));
    const res = await bulkImportMcqsAction({ topicId, items: keep });
    setBusy(false);
    if (res.ok) {
      setDone({
        inserted: res.inserted ?? 0,
        skipped: (res.skipped ?? 0) + skipFlags.size,
      });
      setItems(null);
      setSkipFlags(new Set());
    } else {
      setError(res.error ?? "Import failed");
    }
  }

  const keepCount = items ? items.length - skipFlags.size : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-blue-500 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
          <input
            type="file"
            accept=".docx,.md,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain"
            className="hidden"
            onChange={onUpload}
            disabled={busy}
          />
          {busy ? "Parsing…" : "Upload .docx / .md"}
        </label>
        <a
          href="/templates/mcq-template.docx"
          download
          className="text-sm text-blue-700 hover:underline"
        >
          Download template (.docx)
        </a>
        <a
          href="/templates/mcq-template.md"
          download
          className="text-sm text-blue-700 hover:underline"
        >
          Download template (.md)
        </a>
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {done && (
        <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Imported {done.inserted} question(s). Skipped {done.skipped}.
        </div>
      )}

      {items && items.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm">
              <span className="font-semibold">{keepCount}</span> question(s)
              ready to import. Edit anything wrong before committing.
            </p>
            <button
              type="button"
              onClick={commit}
              disabled={busy || keepCount === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Importing…" : `Import ${keepCount} questions`}
            </button>
          </div>
          <ul className="space-y-3">
            {items.map((q, qi) => {
              const skipped = skipFlags.has(qi);
              return (
                <li
                  key={qi}
                  className={`rounded-md border p-3 ${
                    skipped
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                      {qi + 1}
                    </span>
                    <textarea
                      value={q.prompt}
                      onChange={(e) =>
                        updateItem(qi, { prompt: e.target.value })
                      }
                      rows={2}
                      className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
                      disabled={skipped}
                    />
                    <select
                      value={q.difficulty}
                      onChange={(e) =>
                        updateItem(qi, {
                          difficulty: e.target.value as
                            | "easy"
                            | "medium"
                            | "hard",
                        })
                      }
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                      disabled={skipped}
                    >
                      <option value="easy">easy</option>
                      <option value="medium">medium</option>
                      <option value="hard">hard</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleSkip(qi)}
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        skipped
                          ? "border-gray-300 bg-white text-gray-700"
                          : "border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
                      }`}
                    >
                      {skipped ? "Restore" : "Skip"}
                    </button>
                  </div>

                  {q.warnings.length > 0 && (
                    <ul className="ml-8 mt-2 list-disc text-xs text-amber-700">
                      {q.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}

                  <ul className="ml-8 mt-2 space-y-1">
                    {q.options.map((o, oi) => (
                      <li key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={o.isCorrect}
                          onChange={() => setCorrect(qi, oi)}
                          disabled={skipped}
                          title="Mark correct"
                        />
                        <input
                          value={o.text}
                          onChange={(e) =>
                            updateOption(qi, oi, e.target.value)
                          }
                          disabled={skipped}
                          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(qi, oi)}
                          disabled={skipped || q.options.length <= 2}
                          className="text-xs text-gray-500 hover:text-rose-700 disabled:opacity-30"
                        >
                          remove
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onClick={() => addOption(qi)}
                        disabled={skipped}
                        className="ml-6 text-xs text-blue-700 hover:underline"
                      >
                        + add option
                      </button>
                    </li>
                  </ul>

                  {q.explanation && (
                    <p className="ml-8 mt-2 text-xs italic text-gray-600">
                      Explanation: {q.explanation}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
