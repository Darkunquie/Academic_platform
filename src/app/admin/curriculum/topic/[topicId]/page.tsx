import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { getTopicContent, listTopicAssets } from "@/modules/content/service";
import {
  saveTopicContentAction,
  uploadAssetAction,
  deleteAssetAction,
} from "@/modules/content/actions";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TopicAdminPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await getTopicChain(topicId);
  if (!topic) notFound();

  const content = await getTopicContent(topicId);
  const assets = await listTopicAssets(topicId);
  const path = `/admin/curriculum/topic/${topicId}`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          {
            label: topic.providerName,
            href: `/admin/curriculum/provider/${topic.providerId}`,
          },
          {
            label: topic.subjectName,
            href: `/admin/curriculum/subject/${topic.subjectId}`,
          },
          {
            label: topic.chapterName,
            href: `/admin/curriculum/chapter/${topic.chapterId}`,
          },
          { label: topic.name },
        ]}
      />
      <h1 className="text-2xl font-bold">{topic.name}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {topic.providerName} · {topic.gradeName} · {topic.subjectName} ·{" "}
        {topic.chapterName}
      </p>

      {/* Content editor */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Content</h2>
        <p className="text-sm text-gray-500">
          Markdown. This is what students read (and hear via text-to-speech).
        </p>
        <form action={saveTopicContentAction} className="mt-3 space-y-3">
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="revalidate" value={path} />
          <textarea
            name="body"
            defaultValue={content?.bodyHtml ?? ""}
            rows={14}
            placeholder="# Tenses&#10;&#10;A tense shows the time of an action…"
            className="w-full rounded-md border border-gray-300 p-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Button type="submit">Save content</Button>
        </form>
      </section>

      {/* Assets */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Attachments (PDF / images)</h2>
        <form
          action={uploadAssetAction}
          className="mt-3 flex items-center gap-3"
        >
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="revalidate" value={path} />
          <input
            type="file"
            name="file"
            required
            accept=".pdf,image/*,audio/*"
            className="text-sm"
          />
          <Button type="submit">Upload</Button>
        </form>

        <ul className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {assets.length === 0 && (
            <li className="px-4 py-5 text-center text-sm text-gray-400">
              No attachments.
            </li>
          )}
          {assets.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <a
                href={`/api/assets/${a.id}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-700 hover:underline"
              >
                {a.filename}
              </a>
              <div className="flex items-center gap-3">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {a.kind}
                </span>
                <form action={deleteAssetAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="revalidate" value={path} />
                  <Button type="submit" variant="danger">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <a
          href={`/admin/curriculum/topic/${topicId}/test`}
          className="rounded-lg border border-gray-200 bg-white p-5 text-sm font-medium text-blue-700 hover:border-blue-400"
        >
          Mock test questions →
        </a>
        <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-400">
          Mock interview — Phase 5
        </div>
        {topic.isCoding ? (
          <a
            href={`/admin/curriculum/topic/${topicId}/coding`}
            className="rounded-lg border border-gray-200 bg-white p-5 text-sm font-medium text-blue-700 hover:border-blue-400"
          >
            Coding problems →
          </a>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-400">
            Coding (subject not flagged)
          </div>
        )}
      </section>
    </div>
  );
}
