"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateQuestionsAction } from "@/modules/assessment/actions";

export function GenerateButton({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(fresh = false) {
    setLoading(true);
    setMsg(null);
    const res = await generateQuestionsAction({
      topicId,
      count,
      difficulty,
      fresh,
    });
    setLoading(false);
    if (res.ok) {
      setMsg(
        fresh
          ? `✅ Regenerated ${res.count} fresh question(s).`
          : `✅ Generated ${res.count} question(s).`
      );
      router.refresh();
    } else {
      setMsg(`⚠ ${res.error}`);
    }
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Count</label>
          <input
            type="number"
            min={1}
            max={15}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as "easy" | "medium" | "hard")
            }
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </div>
        <Button onClick={() => run(false)} disabled={loading}>
          {loading ? "Generating…" : "✨ Generate with AI"}
        </Button>
        <Button
          variant="outline"
          onClick={() => run(true)}
          disabled={loading}
          title="Ignore the cached set and generate brand-new questions"
        >
          ♻ Regenerate fresh
        </Button>
      </div>
      {msg && <p className="mt-2 text-sm text-gray-700">{msg}</p>}
      <p className="mt-1 text-xs text-gray-500">
        Generate reuses the cached set (free). Regenerate fresh replaces it with
        new questions.
      </p>
    </div>
  );
}
