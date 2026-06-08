import { notFound } from "next/navigation";
import { getSection, listProviders } from "@/modules/curriculum/admin";
import {
  createProviderAction,
  renameProviderAction,
  deleteProviderAction,
} from "@/modules/curriculum/actions";
import { INDIAN_STATES } from "@/lib/states";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { ProviderBoardGrid } from "@/components/curriculum/provider-board-grid";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = await getSection(sectionId);
  if (!section) notFound();

  const items = await listProviders(sectionId);
  const path = `/admin/curriculum/section/${sectionId}`;
  const isBoard = section.code === "school" || section.code === "intermediate";
  const childLabel = isBoard ? "Board" : "University";

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          { label: section.name },
        ]}
      />
      <h1 className="text-2xl font-bold text-ink-900">{section.name}</h1>
      <p className="mt-1 text-sm text-ink-500">
        {childLabel}s in this section. Tag a state board with its state so only
        students from that state see it. Leave state empty for national boards
        (CBSE, ICSE…).
      </p>

      <form
        action={createProviderAction}
        className="mt-5 flex flex-wrap items-end gap-3 rounded-[16px] border border-ink-200 bg-white p-4"
      >
        <input type="hidden" name="sectionId" value={sectionId} />
        <input type="hidden" name="revalidate" value={path} />
        <div className="flex-1 min-w-[200px]">
          <Label>Add {childLabel.toLowerCase()}</Label>
          <Input name="name" placeholder={`New ${childLabel.toLowerCase()} name`} required />
        </div>
        <div>
          <Label>State {isBoard ? "" : "(optional)"}</Label>
          <select
            name="state"
            defaultValue=""
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">National / all states</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Add</Button>
      </form>

      {items.length === 0 ? (
        <div className="mt-6 rounded-[18px] border border-dashed border-ink-300 p-10 text-center text-ink-500">
          No {childLabel.toLowerCase()}s yet.
        </div>
      ) : (
        <ProviderBoardGrid
          items={items}
          path={path}
          hrefBase="/admin/curriculum/provider"
          renameAction={renameProviderAction}
          deleteAction={deleteProviderAction}
        />
      )}
    </div>
  );
}
