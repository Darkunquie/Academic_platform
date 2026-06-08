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
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <div className="dotted-pattern absolute inset-0" />

      <div className="relative z-10">
        <StudentHeader active="library" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-10 md:px-16 md:py-14">
        <nav className="mb-8 flex items-center gap-2 text-[13px] text-ink-500">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary-700"
          >
            My subjects
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            chevron_right
          </span>
          <span className="font-medium text-ink-900">{subject.name}</span>
        </nav>

        <section className="relative mb-12 overflow-hidden rounded-[28px] border border-ink-200 bg-white p-10 soft-shadow">
          <div className="mesh-gradient absolute inset-0 opacity-60" />
          <div
            className="absolute -right-12 -top-8 text-primary-500 opacity-10"
            style={{ fontSize: "240px", lineHeight: 1 }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "240px", fontVariationSettings: "'wght' 200" }}
            >
              auto_stories
            </span>
          </div>
          <div className="relative z-10 max-w-2xl">
            <p
              className="mb-3 text-[11px] uppercase text-ink-500"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
            >
              Subject · {subject.name}
            </p>
            <h1
              className="text-primary-900"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "64px",
                lineHeight: "68px",
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              Your library,{" "}
              <span className="hand-drawn-underline">
                {subject.name}.
              </span>
            </h1>
            <p
              className="mt-4 text-ink-700"
              style={{ fontSize: "17px", lineHeight: "28px" }}
            >
              {chapters.length}{" "}
              {chapters.length === 1 ? "chapter" : "chapters"}
              {subject.isCoding ? " · Coding subject" : ""}
            </p>
          </div>
        </section>

        {chapters.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-ink-300 bg-white/60 p-12 text-center text-ink-500">
            No chapters published yet.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {chapters.map((c, idx) => (
              <Link
                key={c.id}
                href={`/dashboard/chapter/${c.id}`}
                className="group flex flex-col gap-6 rounded-[20px] border border-ink-200 bg-white p-7 soft-shadow transition-all hover:-translate-y-0.5 hover:pop-shadow md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1">
                  <p
                    className="mb-2 text-[11px] uppercase text-ink-500"
                    style={{
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Ch {String(idx + 1).padStart(2, "0")}
                  </p>
                  <h2
                    className="text-ink-900 transition-colors group-hover:text-coral-700"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "20px",
                      lineHeight: "28px",
                      fontWeight: 600,
                    }}
                  >
                    {c.name}
                  </h2>
                </div>
                <span
                  className="inline-flex items-center gap-2 text-[15px] font-semibold text-primary-700 transition-transform group-hover:translate-x-1"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Open
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    arrow_forward
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
