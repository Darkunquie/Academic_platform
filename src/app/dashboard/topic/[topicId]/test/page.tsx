import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { getStudentTest } from "@/modules/assessment/service";
import { studentGradeId } from "@/modules/content/student";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { TestRunner } from "@/components/assessment/test-runner";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

export default async function StudentTestPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const gradeId = await studentGradeId();
  const topic = await getTopicChain(topicId);

  if (!topic || !gradeId || topic.gradeId !== gradeId) notFound();

  const questions = await getStudentTest(topicId);

  return (
    <main className="min-h-screen bg-paper">
      <StudentHeader active="library" />
      <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
      <Breadcrumb
        items={[
          { label: "My Subjects", href: "/dashboard" },
          {
            label: topic.chapterName,
            href: `/dashboard/chapter/${topic.chapterId}`,
          },
          { label: topic.name, href: `/dashboard/topic/${topicId}` },
          { label: "Mock test" },
        ]}
      />
      <h1 className="text-2xl font-bold">Mock test — {topic.name}</h1>

      {questions.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No questions published for this topic yet.
          <div className="mt-3">
            <Link
              href={`/dashboard/topic/${topicId}`}
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              ← Back to topic
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <TestRunner topicId={topicId} questions={questions} />
        </div>
      )}
      </div>
    </main>
  );
}
