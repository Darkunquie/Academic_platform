import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { listWebQuestions } from "@/modules/web/service";
import {
  createWebQuestionAction,
  deleteWebQuestionAction,
} from "@/modules/web/actions";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function WebAdminPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await getTopicChain(topicId);
  if (!topic) notFound();

  const items = await listWebQuestions(topicId);
  const path = `/admin/curriculum/topic/${topicId}/web`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          { label: topic.name, href: `/admin/curriculum/topic/${topicId}` },
          { label: "Web (HTML/CSS/JS)" },
        ]}
      />
      <h1 className="text-2xl font-bold">Web — {topic.name}</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Add a web problem</h2>
        <form action={createWebQuestionAction} className="mt-3 space-y-3">
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="revalidate" value={path} />
          <div>
            <Label>Title</Label>
            <Input name="title" required placeholder="Centered card layout" />
          </div>
          <div>
            <Label>Problem statement</Label>
            <textarea
              name="prompt"
              required
              rows={4}
              placeholder="Build a card that is centered on the page with a 16px gap between title and body."
              className="w-full rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <div>
              <Label>HTML starter</Label>
              <textarea
                name="htmlStarter"
                rows={6}
                placeholder="<div class='card'>...</div>"
                className="w-full rounded-md border border-gray-300 p-2 font-mono text-xs"
              />
            </div>
            <div>
              <Label>CSS starter</Label>
              <textarea
                name="cssStarter"
                rows={6}
                placeholder="body { font-family: sans-serif; }"
                className="w-full rounded-md border border-gray-300 p-2 font-mono text-xs"
              />
            </div>
            <div>
              <Label>JS starter</Label>
              <textarea
                name="jsStarter"
                rows={6}
                placeholder="// optional"
                className="w-full rounded-md border border-gray-300 p-2 font-mono text-xs"
              />
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
            No web problems yet.
          </div>
        )}
        {items.map((q) => (
          <div
            key={q.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <Link
              href={`/admin/curriculum/topic/${topicId}/web/${q.id}`}
              className="font-medium text-blue-700 hover:underline"
            >
              {q.title}
            </Link>
            <div className="flex items-center gap-3">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {q.difficulty}
              </span>
              <form action={deleteWebQuestionAction}>
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
