import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { listCodingQuestions } from "@/modules/coding/service";
import {
  createCodingQuestionAction,
  deleteCodingQuestionAction,
} from "@/modules/coding/actions";
import { LANG_KEYS, LANGUAGES } from "@/modules/coding/languages";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function CodingAdminPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await getTopicChain(topicId);
  if (!topic) notFound();

  const items = await listCodingQuestions(topicId);
  const path = `/admin/curriculum/topic/${topicId}/coding`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          { label: topic.name, href: `/admin/curriculum/topic/${topicId}` },
          { label: "Coding" },
        ]}
      />
      <h1 className="text-2xl font-bold">Coding — {topic.name}</h1>
      {!topic.isCoding && (
        <p className="mt-2 rounded bg-amber-50 p-2 text-sm text-amber-700">
          Note: this subject isn’t flagged “coding”, so students won’t see these.
        </p>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Add a coding problem</h2>
        <form action={createCodingQuestionAction} className="mt-3 space-y-3">
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="revalidate" value={path} />
          <div>
            <Label>Title</Label>
            <Input name="title" required placeholder="Two Sum" />
          </div>
          <div>
            <Label>Problem statement</Label>
            <textarea
              name="prompt"
              required
              rows={5}
              placeholder="Read two integers from stdin and print their sum."
              className="w-full rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label>Allowed languages</Label>
            <div className="flex flex-wrap gap-3">
              {LANG_KEYS.map((k) => (
                <label key={k} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="lang"
                    value={k}
                    defaultChecked={k === "python"}
                  />
                  {LANGUAGES[k].label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <Label>Difficulty</Label>
              <select
                name="difficulty"
                defaultValue="easy"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>
            <Button type="submit">Add problem</Button>
          </div>
        </form>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-semibold">Problems</h2>
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            No problems yet.
          </div>
        )}
        {items.map((q) => (
          <div
            key={q.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <Link
              href={`/admin/curriculum/topic/${topicId}/coding/${q.id}`}
              className="font-medium text-blue-700 hover:underline"
            >
              {q.title}
            </Link>
            <div className="flex items-center gap-3">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {q.difficulty} · {(q.languages as string[]).join(", ")}
              </span>
              <form action={deleteCodingQuestionAction}>
                <input type="hidden" name="id" value={q.id} />
                <input type="hidden" name="revalidate" value={path} />
                <Button type="submit" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
