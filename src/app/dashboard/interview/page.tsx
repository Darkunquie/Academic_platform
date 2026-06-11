import Link from "next/link";
import { listGradeTree } from "@/modules/curriculum/admin";
import { studentGradeId } from "@/modules/content/student";
import { InterviewSetup } from "@/components/interview/interview-setup";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

export default async function InterviewSetupPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ topic?: string }>;
}>) {
  const gradeId = await studentGradeId();
  const { topic } = await searchParams;
  const tree = gradeId ? await listGradeTree(gradeId) : [];
  const topicCount = tree.reduce(
    (acc, s) => acc + s.chapters.reduce((a, c) => a + c.topics.length, 0),
    0
  );

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#334155",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <StudentHeader active="interview" />

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-24 pt-4 md:px-6 md:pt-5">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[12px] font-bold text-solar-text/60">
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
          <span className="text-solar-text-dark">Mock Interview</span>
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
              record_voice_over
            </span>
          </div>
          <div className="relative z-10 max-w-2xl">
            <p className="mb-2 text-[10px] font-black text-solar-amber">
              AI Mock Interview · Setup
            </p>
            <h1 className="text-2xl font-black tracking-tighter text-solar-text-dark md:text-3xl">
              Rehearse out loud.
            </h1>
            <p className="mt-2 text-[13px] text-solar-text">
              Pick topics from one or more chapters — questions span your whole
              selection. {topicCount} topics available in your class.
            </p>
          </div>
        </section>

        <div className="solar-card rounded-xxl bg-white p-6 md:p-8">
          <InterviewSetup tree={tree} preselect={topic} />
        </div>
      </main>
    </div>
  );
}
