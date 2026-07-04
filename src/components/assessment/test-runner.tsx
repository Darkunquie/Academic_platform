"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitTestAction } from "@/modules/assessment/actions";

type Q = { id: string; prompt: string; options: { id: string; text: string }[] };
type Result = Awaited<ReturnType<typeof submitTestAction>>;

export function TestRunner({
  topicId,
  questions,
}: {
  topicId: string;
  questions: Q[];
}) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const unansweredCount = questions.filter((q) => picks[q.id] == null).length;
  const allEmpty = unansweredCount === questions.length;

  async function submit() {
    if (allEmpty) return;
    if (
      unansweredCount > 0 &&
      !globalThis.confirm(
        `You have ${unansweredCount} unanswered question${unansweredCount === 1 ? "" : "s"}. Submit anyway?`
      )
    ) {
      return;
    }
    setSubmitting(true);
    const answers = questions.map((q) => ({
      questionId: q.id,
      optionId: picks[q.id] ?? null,
    }));
    const res = await submitTestAction(topicId, answers);
    setResult(res);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    const byId = new Map(result.results.map((r) => [r.questionId, r]));
    return (
      <div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <div className="text-4xl font-bold">
            {result.score}/{result.total}
          </div>
          <div className="mt-1 text-sm text-gray-500">{result.pct}% correct</div>
        </div>

        <div className="mt-6 space-y-3">
          {questions.map((q, idx) => {
            const r = byId.get(q.id);
            return (
              <div
                key={q.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="font-medium">
                  {idx + 1}. {q.prompt}{" "}
                  <span className={r?.isCorrect ? "text-emerald-600" : "text-red-600"}>
                    {r?.isCorrect ? "✓" : "✗"}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {q.options.map((o) => {
                    const correct = r?.correctOptionId === o.id;
                    const chosen = r?.selectedOptionId === o.id;
                    return (
                      <li
                        key={o.id}
                        className={
                          correct
                            ? "rounded bg-emerald-50 px-2 py-1 text-emerald-800"
                            : chosen
                              ? "rounded bg-red-50 px-2 py-1 text-red-700"
                              : "px-2 py-1 text-gray-600"
                        }
                      >
                        {correct ? "✓ " : chosen ? "✗ " : "• "}
                        {o.text}
                      </li>
                    );
                  })}
                </ul>
                {r?.explanation && (
                  <p className="mt-2 text-xs text-gray-500">{r.explanation}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Button onClick={() => { setResult(null); setPicks({}); }}>
            Retake
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="font-medium">
            {idx + 1}. {q.prompt}
          </div>
          <div className="mt-3 space-y-2">
            {q.options.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={picks[q.id] === o.id}
                  onChange={() => setPicks((p) => ({ ...p, [q.id]: o.id }))}
                />
                {o.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={submitting || allEmpty}>
          {submitting ? "Submitting…" : "Submit test"}
        </Button>
        {unansweredCount > 0 && !allEmpty && (
          <span className="text-xs text-gray-500">
            {unansweredCount} unanswered
          </span>
        )}
        {allEmpty && (
          <span className="text-xs text-gray-500">Answer at least one question to submit</span>
        )}
      </div>
    </div>
  );
}
