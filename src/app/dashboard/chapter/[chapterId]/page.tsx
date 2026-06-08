import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterChain, listTopics } from "@/modules/curriculum/admin";
import { studentGradeId } from "@/modules/content/student";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

export default async function StudentChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const gradeId = await studentGradeId();
  const chapter = await getChapterChain(chapterId);

  if (!chapter || !gradeId || chapter.gradeId !== gradeId) notFound();

  const topics = await listTopics(chapterId);
  const featured = topics[0];
  const rest = topics.slice(1);

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <div className="dotted-pattern absolute inset-0" />

      <div className="relative z-10">
        <StudentHeader active="library" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-10 md:px-16 md:py-14">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary-700"
          >
            My subjects
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            chevron_right
          </span>
          <Link
            href={`/dashboard/subject/${chapter.subjectId}`}
            className="transition-colors hover:text-primary-700"
          >
            {chapter.subjectName}
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            chevron_right
          </span>
          <span className="font-medium text-ink-900">{chapter.name}</span>
        </nav>

        <section className="mb-12 flex flex-col gap-3">
          <p
            className="text-[11px] uppercase text-ink-500"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            Chapter · Topics
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
            <span >{chapter.name}</span>
            <span className="hand-drawn-underline"> .</span>
          </h1>
          <p
            className="max-w-xl text-ink-700"
            style={{ fontSize: "17px", lineHeight: "28px" }}
          >
            {topics.length === 0
              ? "No topics yet."
              : `${topics.length} ${
                  topics.length === 1 ? "topic" : "topics"
                } — read, listen, and test yourself.`}
          </p>
        </section>

        {topics.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-ink-300 bg-white/60 p-12 text-center text-ink-500">
            No topics published yet.
          </div>
        ) : (
          <>
            {featured && (
              <Link
                href={`/dashboard/topic/${featured.id}`}
                className="group mb-6 block overflow-hidden rounded-[28px] border-[1.5px] border-coral-300 bg-white p-10 pop-shadow transition-all hover:-translate-y-0.5"
                style={{ transform: "rotate(-0.4deg)" }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <p
                      className="mb-3 text-[11px] uppercase text-coral-700"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Next up · Topic 01
                    </p>
                    <h2
                      className="text-ink-900 transition-colors group-hover:text-coral-700"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "28px",
                        lineHeight: "34px",
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {featured.name}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-2 self-start rounded-[14px] bg-primary-700 px-5 py-3 text-[15px] font-semibold text-white soft-shadow transition-all group-hover:-translate-y-0.5 group-hover:bg-primary-900 group-hover:pop-shadow md:self-end">
                    Start reading
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "20px" }}
                    >
                      arrow_forward
                    </span>
                  </span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((t, idx) => (
                  <Link
                    key={t.id}
                    href={`/dashboard/topic/${t.id}`}
                    className="group flex flex-col gap-4 rounded-[20px] border border-ink-200 bg-white p-6 soft-shadow transition-all hover:-translate-y-1 hover:pop-shadow"
                  >
                    <p
                      className="text-[11px] uppercase text-ink-500"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {String(idx + 2).padStart(2, "0")} /{" "}
                      {String(topics.length).padStart(2, "0")}
                    </p>
                    <h3
                      className="text-ink-900 transition-colors group-hover:text-coral-700"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "17px",
                        lineHeight: "24px",
                        fontWeight: 600,
                      }}
                    >
                      {t.name}
                    </h3>
                    <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-4">
                      <span
                        className="text-[11px] uppercase text-ink-500"
                        style={{
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.12em",
                        }}
                      >
                        Open topic
                      </span>
                      <span
                        className="material-symbols-outlined text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-primary-700"
                        style={{ fontSize: "20px" }}
                      >
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
