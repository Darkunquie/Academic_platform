import { notFound } from "next/navigation";
import { getProviderChain, listGrades } from "@/modules/curriculum/admin";
import {
  createGradeAction,
  renameGradeAction,
  deleteGradeAction,
} from "@/modules/curriculum/actions";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { ItemCard } from "@/components/curriculum/item-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  const provider = await getProviderChain(providerId);
  if (!provider) notFound();

  const items = await listGrades(providerId);
  const path = `/admin/curriculum/provider/${providerId}`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          {
            label: provider.sectionName,
            href: `/admin/curriculum/section/${provider.sectionId}`,
          },
          { label: provider.name },
        ]}
      />
      <h1 className="text-2xl font-bold">{provider.name}</h1>
      <p className="mt-1 text-sm text-gray-500">Classes / years.</p>

      <form action={createGradeAction} className="mt-5 flex items-end gap-3">
        <input type="hidden" name="providerId" value={providerId} />
        <input type="hidden" name="revalidate" value={path} />
        <div className="flex-1">
          <Label>Add class / year</Label>
          <Input name="name" placeholder="e.g. Class 5, B.Tech Year 2" required />
        </div>
        <div className="w-24">
          <Label>Order</Label>
          <Input name="level" type="number" defaultValue={0} />
        </div>
        <Button type="submit">Add</Button>
      </form>

      {items.length === 0 ? (
        <div className="mt-6 rounded-[16px] border border-dashed border-ink-300 p-10 text-center text-ink-500">
          No classes/years yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((g) => (
            <ItemCard
              key={g.id}
              id={g.id}
              name={g.name}
              icon="school"
              href={`/admin/curriculum/grade/${g.id}`}
              revalidate={path}
              renameAction={renameGradeAction}
              deleteAction={deleteGradeAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
