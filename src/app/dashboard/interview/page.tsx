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
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <div className="dotted-pattern absolute inset-0" />
      <div className="mesh-gradient absolute inset-0 opacity-40" />
      <div
        className="shape-float absolute right-[6%] top-32 h-28 w-28 rounded-full bg-coral-300 opacity-25 blur-3xl"
        style={{ animationDelay: "0s" }}
      />

      <div className="relative z-10">
        <StudentHeader active="interview" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-6 pb-24 pt-10 md:px-16 md:pt-14">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary-700"
          >
            My subjects
          </Link>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <span className="font-medium text-ink-900">Mock interview</span>
        </nav>

        <header className="flex flex-col gap-4">
          <p
            className="text-[11px] uppercase text-coral-700"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            AI mock interview · Setup
          </p>
          <h1
            className="text-primary-900"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "68px",
              lineHeight: "72px",
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Rehearse{" "}
            <span className="hand-drawn-underline">out loud.</span>
          </h1>
          <p
            className="max-w-2xl text-ink-700"
            style={{ fontSize: "17px", lineHeight: "28px" }}
          >
            Pick topics from one or more chapters — questions span your whole
            selection. {topicCount} topics available in your class.
          </p>
        </header>

        <InterviewSetup tree={tree} preselect={topic} />
      </div>
    </main>
  );
}
