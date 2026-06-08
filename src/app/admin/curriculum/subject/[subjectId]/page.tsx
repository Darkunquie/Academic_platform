import { notFound } from "next/navigation";
import { getSubjectChain, listChapters } from "@/modules/curriculum/admin";
import {
  createChapterAction,
  renameChapterAction,
  deleteChapterAction,
} from "@/modules/curriculum/actions";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { ItemCard } from "@/components/curriculum/item-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = await getSubjectChain(subjectId);
  if (!subject) notFound();

  const items = await listChapters(subjectId);
  const path = `/admin/curriculum/subject/${subjectId}`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          {
            label: subject.sectionName,
            href: `/admin/curriculum/section/${subject.sectionId}`,
          },
          {
            label: subject.providerName,
            href: `/admin/curriculum/provider/${subject.providerId}`,
          },
          {
            label: subject.gradeName,
            href: `/admin/curriculum/grade/${subject.gradeId}`,
          },
          { label: subject.name },
        ]}
      />
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        {subject.name}
        {subject.isCoding && (
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            coding
          </span>
        )}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Chapters.</p>

      <form action={createChapterAction} className="mt-5 flex items-end gap-3">
        <input type="hidden" name="subjectId" value={subjectId} />
        <input type="hidden" name="revalidate" value={path} />
        <div className="flex-1">
          <Label>Add chapter</Label>
          <Input name="name" placeholder="New chapter name" required />
        </div>
        <Button type="submit">Add</Button>
      </form>

      {items.length === 0 ? (
        <div className="mt-6 rounded-[16px] border border-dashed border-ink-300 p-10 text-center text-ink-500">
          No chapters yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <ItemCard
              key={c.id}
              id={c.id}
              name={c.name}
              icon="article"
              href={`/admin/curriculum/chapter/${c.id}`}
              revalidate={path}
              renameAction={renameChapterAction}
              deleteAction={deleteChapterAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
