import { notFound } from "next/navigation";
import { getGradeChain, listSubjects } from "@/modules/curriculum/admin";
import {
  createSubjectAction,
  renameSubjectAction,
  deleteSubjectAction,
  toggleSubjectCodingAction,
} from "@/modules/curriculum/actions";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { ItemCard } from "@/components/curriculum/item-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function GradePage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;
  const grade = await getGradeChain(gradeId);
  if (!grade) notFound();

  const items = await listSubjects(gradeId);
  const path = `/admin/curriculum/grade/${gradeId}`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          {
            label: grade.sectionName,
            href: `/admin/curriculum/section/${grade.sectionId}`,
          },
          {
            label: grade.providerName,
            href: `/admin/curriculum/provider/${grade.providerId}`,
          },
          { label: grade.name },
        ]}
      />
      <h1 className="text-2xl font-bold">{grade.name}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Subjects. Tick “coding” to unlock the coding module for that subject.
      </p>

      <form action={createSubjectAction} className="mt-5 flex items-end gap-3">
        <input type="hidden" name="gradeId" value={gradeId} />
        <input type="hidden" name="revalidate" value={path} />
        <div className="flex-1">
          <Label>Add subject</Label>
          <Input name="name" placeholder="e.g. Maths, Data Structures" required />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-gray-600">
          <input type="checkbox" name="isCoding" /> Coding
        </label>
        <Button type="submit">Add</Button>
      </form>

      {items.length === 0 ? (
        <div className="mt-6 rounded-[16px] border border-dashed border-ink-300 p-10 text-center text-ink-500">
          No subjects yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <ItemCard
              key={s.id}
              id={s.id}
              name={s.name}
              icon="menu_book"
              href={`/admin/curriculum/subject/${s.id}`}
              revalidate={path}
              renameAction={renameSubjectAction}
              deleteAction={deleteSubjectAction}
              badge={
                <form action={toggleSubjectCodingAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="isCoding" value={(!s.isCoding).toString()} />
                  <input type="hidden" name="revalidate" value={path} />
                  <button
                    type="submit"
                    className={
                      s.isCoding
                        ? "rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                        : "rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-200"
                    }
                    title="Toggle coding module"
                  >
                    {s.isCoding ? "coding ✓" : "mark coding"}
                  </button>
                </form>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
