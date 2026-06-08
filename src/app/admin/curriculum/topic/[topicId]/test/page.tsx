import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { listQuestionsWithOptions } from "@/modules/assessment/service";
import {
  createQuestionAction,
  deleteQuestionAction,
} from "@/modules/assessment/actions";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { GenerateButton } from "@/components/assessment/generate-button";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function TopicTestAdminPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await getTopicChain(topicId);
  if (!topic) notFound();

  const items = await listQuestionsWithOptions(topicId);
  const path = `/admin/curriculum/topic/${topicId}/test`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          {
            label: topic.chapterName,
            href: `/admin/curriculum/chapter/${topic.chapterId}`,
          },
          { label: topic.name, href: `/admin/curriculum/topic/${topicId}` },
          { label: "Mock test" },
        ]}
      />
      <h1 className="text-2xl font-bold">Mock test — {topic.name}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {items.length} question(s) in the bank.
      </p>

      <section className="mt-5">
        <GenerateButton topicId={topicId} />
      </section>

      {/* Manual add */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Add a question (MCQ)</h2>
        <form action={createQuestionAction} className="mt-3 space-y-3">
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="revalidate" value={path} />
          <div>
            <Label>Question</Label>
            <Input name="prompt" required placeholder="What is…?" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  value={i}
                  defaultChecked={i === 0}
                  title="Mark correct"
                />
                <Input name={`opt${i}`} placeholder={`Option ${i + 1}`} />
              </div>
            ))}
          </div>
          <div className="flex items-end gap-3">
            <div>
              <Label>Difficulty</Label>
              <select
                name="difficulty"
                defaultValue="medium"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>
            <Button type="submit">Add question</Button>
          </div>
          <p className="text-xs text-gray-500">
            Select the radio next to the correct option.
          </p>
        </form>
      </section>

      {/* Bank */}
      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-semibold">Question bank</h2>
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            No questions yet.
          </div>
        )}
        {items.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium">
                {idx + 1}. {q.prompt}
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {q.source} · {q.difficulty}
                </span>
                <form action={deleteQuestionAction}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="revalidate" value={path} />
                  <Button type="submit" variant="danger">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {q.options.map((o) => (
                <li
                  key={o.id}
                  className={
                    o.isCorrect
                      ? "rounded bg-emerald-50 px-2 py-1 text-emerald-800"
                      : "px-2 py-1 text-gray-600"
                  }
                >
                  {o.isCorrect ? "✓ " : "• "}
                  {o.text}
                </li>
              ))}
            </ul>
            {q.explanation && (
              <p className="mt-2 text-xs text-gray-500">{q.explanation}</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
