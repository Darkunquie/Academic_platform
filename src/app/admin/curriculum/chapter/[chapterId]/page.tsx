import { notFound } from "next/navigation";
import {
  getChapterChain,
  getSubjectChain,
  listTopics,
} from "@/modules/curriculum/admin";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { NewTopicForm } from "@/components/curriculum/new-topic-form";
import { TopicRow } from "@/components/curriculum/topic-row";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: Readonly<{
  params: Promise<{ chapterId: string }>;
}>) {
  const { chapterId } = await params;
  const chapter = await getChapterChain(chapterId);
  if (!chapter) notFound();

  const subject = await getSubjectChain(chapter.subjectId);
  const isCoding = subject?.isCoding ?? false;
  const items = await listTopics(chapterId);
  const path = `/admin/curriculum/chapter/${chapterId}`;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          {
            label: chapter.sectionName,
            href: `/admin/curriculum/section/${chapter.sectionId}`,
          },
          {
            label: chapter.providerName,
            href: `/admin/curriculum/provider/${chapter.providerId}`,
          },
          {
            label: chapter.gradeName,
            href: `/admin/curriculum/grade/${chapter.gradeId}`,
          },
          {
            label: chapter.subjectName,
            href: `/admin/curriculum/subject/${chapter.subjectId}`,
          },
          { label: chapter.name },
        ]}
      />

      <header className="flex flex-col gap-2">
        <p
          className="text-[11px] text-ink-500"
          style={{ fontFamily: "var(--font-mono)", }}
        >
          Chapter · {items.length} {items.length === 1 ? "topic" : "topics"}
        </p>
        <h1
          className="text-2xl font-normal leading-tight text-primary-900 md:text-3xl lg:text-[42px] lg:leading-[48px]"
          style={{
            fontFamily: "var(--font-serif)",
            letterSpacing: "-0.01em",
          }}
        >
          {chapter.name}
        </h1>
        <p className="text-[15px] text-ink-700">
          Add a topic. Drop in content + PDFs as you go.
        </p>
      </header>

      <NewTopicForm chapterId={chapterId} revalidate={path} />

      {items.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-ink-300 bg-white/60 p-12 text-center">
          <p
            className="text-ink-900"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "22px",
              lineHeight: "30px",
            }}
          >
            Nothing here yet.
          </p>
          <p className="mt-1 text-[13px] text-ink-500">
            Add the first topic above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((t, i) => (
            <TopicRow
              key={t.id}
              id={t.id}
              name={t.name}
              isCoding={isCoding}
              href={`/admin/curriculum/topic/${t.id}`}
              revalidate={path}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
