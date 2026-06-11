import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectChain, listChapters } from "@/modules/curriculum/admin";
import { studentGradeId } from "@/modules/content/student";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

export default async function StudentSubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const gradeId = await studentGradeId();
  const subject = await getSubjectChain(subjectId);

  if (!subject || !gradeId || subject.gradeId !== gradeId) notFound();

  const chapters = await listChapters(subjectId);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#334155",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <StudentHeader active="library" />

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-10 pt-4 md:px-6 md:pb-14 md:pt-5">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-[12px] font-bold text-solar-text/60">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-solar-amber"
          >
            My Subjects
          </Link>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <span className="text-solar-text-dark">{subject.name}</span>
        </nav>

        {/* Hero card */}
        <section className="solar-card relative mb-8 overflow-hidden rounded-xxl border-2 border-solar-amber/20 bg-white p-6">
          <div className="solar-scanline" />
          <div
            className="absolute -right-4 -top-4 text-solar-amber/10"
            style={{ fontSize: "140px", lineHeight: 1 }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "140px" }}
            >
              auto_stories
            </span>
          </div>
          <div className="relative z-10 max-w-2xl">
            <p className="mb-2 text-[10px] font-black text-solar-amber">
              Subject Node · {subject.name}
            </p>
            <h1 className="text-2xl font-black tracking-tighter text-solar-text-dark md:text-3xl">
              Your library.
            </h1>
            <p className="mt-2 text-[13px] text-solar-text">
              {chapters.length}{" "}
              {chapters.length === 1 ? "chapter" : "chapters"}
              {subject.isCoding ? " · Coding subject" : ""}
            </p>
          </div>
        </section>

        {/* Section header */}
        <div className="mb-6 flex items-center justify-between border-b border-solar-card pb-4">
          <h2 className="text-xl font-bold text-solar-text-dark">
            Chapter Index
          </h2>
          <span className="text-[13px] font-semibold text-solar-text/70">
            {chapters.length}{" "}
            {chapters.length === 1 ? "chapter" : "chapters"}
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="solar-card rounded-xxl border-dashed bg-white p-12 text-center text-solar-text">
            No chapters published yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {chapters.map((c, idx) => (
              <Link
                key={c.id}
                href={`/dashboard/chapter/${c.id}`}
                className="solar-card group flex items-center gap-6 rounded-xxl bg-white p-6 transition-all hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-solar-amber/10 text-solar-amber">
                  <span
                    className="material-symbols-outlined font-bold"
                    style={{ fontSize: "20px" }}
                  >
                    bookmark
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-solar-text/60">
                    Ch {String(idx + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-lg font-bold text-solar-text-dark transition-colors group-hover:text-solar-amber">
                    {c.name}
                  </h3>
                </div>
                <span className="rounded-xl bg-blue-800 px-6 py-3 text-[11px] font-black text-white shadow-lg shadow-blue-900/20 transition-all group-hover:bg-blue-700">
                  Open
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
