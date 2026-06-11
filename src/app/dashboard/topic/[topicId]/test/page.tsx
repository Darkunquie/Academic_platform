import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { getStudentTest } from "@/modules/assessment/service";
import { studentGradeId } from "@/modules/content/student";
import { TestRunner } from "@/components/assessment/test-runner";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

export default async function StudentTestPage({
  params,
}: Readonly<{
  params: Promise<{ topicId: string }>;
}>) {
  const { topicId } = await params;
  const gradeId = await studentGradeId();
  const topic = await getTopicChain(topicId);

  if (!topic || !gradeId || topic.gradeId !== gradeId) notFound();

  const questions = await getStudentTest(topicId);

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

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-10 pt-4 md:pb-14 md:pt-5">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[12px] font-bold text-solar-text/60">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-solar-amber"
          >
            My Subjects
          </Link>
          <Chev />
          <Link
            href={`/dashboard/chapter/${topic.chapterId}`}
            className="transition-colors hover:text-solar-amber"
          >
            {topic.chapterName}
          </Link>
          <Chev />
          <Link
            href={`/dashboard/topic/${topicId}`}
            className="transition-colors hover:text-solar-amber"
          >
            {topic.name}
          </Link>
          <Chev />
          <span className="text-solar-text-dark">Mock Test</span>
        </nav>

        {/* Hero */}
        <section className="mb-8 flex flex-col gap-3">
          <p className="text-[10px] font-black text-solar-amber">
            Mock Test · {topic.name}
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-solar-text-dark md:text-5xl">
            Drill yourself.
          </h1>
        </section>

        {questions.length === 0 ? (
          <div className="solar-card rounded-xxl border-dashed bg-white p-12 text-center text-solar-text">
            No questions published for this topic yet.
            <div className="mt-4">
              <Link
                href={`/dashboard/topic/${topicId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-800 px-5 py-2.5 text-[11px] font-black text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-700"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  arrow_back
                </span>
                {" "}Back to topic
              </Link>
            </div>
          </div>
        ) : (
          <div className="solar-card rounded-xxl bg-white p-6">
            <TestRunner topicId={topicId} questions={questions} />
          </div>
        )}
      </main>
    </div>
  );
}

function Chev() {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
      chevron_right
    </span>
  );
}
