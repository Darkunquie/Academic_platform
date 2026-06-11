import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { getWebQuestion, listWebChecks } from "@/modules/web/service";
import {
  addWebCheckAction,
  deleteWebCheckAction,
  updateWebStartersAction,
} from "@/modules/web/actions";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function WebQuestionAdminPage({
  params,
}: {
  params: Promise<{ topicId: string; questionId: string }>;
}) {
  const { topicId, questionId } = await params;
  const topic = await getTopicChain(topicId);
  const question = await getWebQuestion(questionId);
  if (!topic || !question) notFound();

  const checks = await listWebChecks(questionId);
  const path = `/admin/curriculum/topic/${topicId}/web/${questionId}`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          { label: topic.name, href: `/admin/curriculum/topic/${topicId}` },
          { label: "Web", href: `/admin/curriculum/topic/${topicId}/web` },
          { label: question.title },
        ]}
      />
      <h1 className="text-2xl font-bold">{question.title}</h1>
      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
        {question.prompt}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Starter code</h2>
        <form action={updateWebStartersAction} className="mt-3 space-y-3">
          <input type="hidden" name="id" value={questionId} />
          <input type="hidden" name="revalidate" value={path} />
          <div className="grid gap-3 lg:grid-cols-3">
            <div>
              <Label>HTML</Label>
              <textarea
                name="htmlStarter"
                rows={10}
                defaultValue={question.htmlStarter}
                className="w-full rounded-md border border-gray-300 p-2 font-mono text-xs"
              />
            </div>
            <div>
              <Label>CSS</Label>
              <textarea
                name="cssStarter"
                rows={10}
                defaultValue={question.cssStarter}
                className="w-full rounded-md border border-gray-300 p-2 font-mono text-xs"
              />
            </div>
            <div>
              <Label>JS</Label>
              <textarea
                name="jsStarter"
                rows={10}
                defaultValue={question.jsStarter}
                className="w-full rounded-md border border-gray-300 p-2 font-mono text-xs"
              />
            </div>
          </div>
          <Button type="submit">Save starters</Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Add check</h2>
        <p className="mt-1 text-xs text-gray-500">
          Expression is JavaScript evaluated inside the preview iframe. Must
          return truthy when the student passes. May be async — return a
          Promise and the harness will await it. Globals available:{" "}
          <code className="font-mono">document</code>,{" "}
          <code className="font-mono">window</code>, plus any globals from
          student JS. Examples:
        </p>
        <ul className="mt-1 list-disc pl-5 text-xs text-gray-500">
          <li>
            <code className="font-mono">
              document.querySelectorAll(&apos;button&apos;).length === 3
            </code>
          </li>
          <li>
            <code className="font-mono">
              getComputedStyle(document.querySelector(&apos;.card&apos;)).display === &apos;flex&apos;
            </code>
          </li>
          <li>
            Event-driven:{" "}
            <code className="font-mono">
              (document.querySelector(&apos;button&apos;).click(), document.body.textContent.includes(&apos;Hello&apos;))
            </code>
          </li>
        </ul>
        <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-800">
          Trust note: expressions execute with full DOM access inside the
          iframe. Only admins can author them — never expose this form to
          students. Iframe sandbox excludes <code>allow-same-origin</code> so
          eval cannot reach parent storage, but treat checks as code you ship.
        </p>
        <form action={addWebCheckAction} className="mt-3 space-y-3">
          <input type="hidden" name="questionId" value={questionId} />
          <input type="hidden" name="revalidate" value={path} />
          <div>
            <Label>Label</Label>
            <Input
              name="label"
              required
              placeholder="Page has exactly 3 buttons"
            />
          </div>
          <div>
            <Label>JS expression</Label>
            <textarea
              name="expression"
              required
              rows={3}
              placeholder="document.querySelectorAll('button').length === 3"
              className="w-full rounded-md border border-gray-300 p-2 font-mono text-xs"
            />
          </div>
          <div className="flex items-end gap-3">
            <div>
              <Label>Weight</Label>
              <Input name="weight" type="number" defaultValue={1} className="w-20" />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input name="sortOrder" type="number" defaultValue={0} className="w-20" />
            </div>
            <Button type="submit">Add check</Button>
          </div>
        </form>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold">Checks ({checks.length})</h2>
        {checks.map((c) => (
          <div
            key={c.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-3 text-sm"
          >
            <div className="flex-1">
              <div className="font-medium">{c.label}</div>
              <pre className="mt-1 whitespace-pre-wrap rounded bg-gray-50 p-2 font-mono text-xs">
                {c.expression}
              </pre>
              <div className="mt-1 text-xs text-gray-500">
                weight {c.weight} · order {c.sortOrder}
              </div>
            </div>
            <form action={deleteWebCheckAction}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="revalidate" value={path} />
              <Button type="submit" variant="danger">
                Delete
              </Button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
