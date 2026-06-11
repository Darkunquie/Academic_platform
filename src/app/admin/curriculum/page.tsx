import Link from "next/link";
import { listSections } from "@/modules/curriculum/admin";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";

export const dynamic = "force-dynamic";

const ICON_BY_CODE: Record<string, string> = {
  SCHOOL: "school",
  INTERMEDIATE: "biotech",
  COLLEGE: "menu_book",
  POSTGRAD: "history_edu",
  PROFESSIONAL: "workspace_premium",
};

export default async function CurriculumPage() {
  const sections = await listSections();

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: "Curriculum" }]} />

      <header className="flex flex-col gap-3">
        <p
          className="text-[11px] text-ink-500"
          style={{ fontFamily: "var(--font-mono)", }}
        >
          Curriculum editor
        </p>
        <h1
          className="text-primary-900"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "52px",
            lineHeight: "56px",
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          Build the{" "}
          <span className="hand-drawn-underline">syllabus tree.</span>
        </h1>
        <p
          className="max-w-xl text-ink-700"
          style={{ fontSize: "17px", lineHeight: "28px" }}
        >
          Pick a section to manage its boards/universities, classes, subjects,
          chapters, and topics.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.id}
            href={`/admin/curriculum/section/${s.id}`}
            className="group relative flex flex-col gap-5 overflow-hidden rounded-[24px] border border-ink-200 bg-white p-7 soft-shadow transition-all hover:-translate-y-1 hover:pop-shadow"
          >
            <div
              className="absolute -right-6 -top-6 text-primary-100 transition-opacity group-hover:opacity-90"
              style={{ fontSize: "120px", lineHeight: 1, opacity: 0.55 }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "120px" }}
              >
                {ICON_BY_CODE[s.code ?? ""] ?? "menu_book"}
              </span>
            </div>

            <span
              className="relative z-10 text-[11px] text-ink-500"
              style={{
                fontFamily: "var(--font-mono)",
                }}
            >
              {s.code ?? "Section"}
            </span>
            <h2
              className="relative z-10 text-ink-900 transition-colors group-hover:text-coral-700"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "22px",
                lineHeight: "28px",
                fontWeight: 600,
              }}
            >
              {s.name}
            </h2>
            <span
              className="relative z-10 mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-700 transition-transform group-hover:translate-x-1"
            >
              Open editor
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                arrow_forward
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
