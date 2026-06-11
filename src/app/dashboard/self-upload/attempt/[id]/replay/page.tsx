import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { StudentHeader } from "@/components/student-header";
import {
  ReplayTestWrapper,
  ReplayInterviewWrapper,
} from "@/components/self-upload/replay-wrapper";
import { getSelfAttempt } from "@/modules/self-upload/service";
import type {
  SelfMcq,
  SelfInterviewQ,
} from "@/modules/self-upload/actions";

export const dynamic = "force-dynamic";

type Option = { text: string; isCorrect: boolean };

export default async function ReplayPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const session = await auth();
  const studentId = session?.user?.id;
  if (!studentId) notFound();
  const data = await getSelfAttempt(id, studentId);
  if (!data) notFound();
  const { attempt, questions } = data;

  const presetTest: SelfMcq[] = questions.map((q) => ({
    prompt: q.prompt,
    options: Array.isArray(q.options)
      ? q.options.filter(
          (o): o is Option =>
            typeof o === "object" &&
            o !== null &&
            "text" in o &&
            "isCorrect" in o &&
            typeof o.text === "string" &&
            typeof o.isCorrect === "boolean"
        )
      : [],
    explanation: q.explanation ?? undefined,
  }));
  const presetInterview: SelfInterviewQ[] = questions.map((q) => ({
    question: q.prompt,
    idealAnswer: q.idealAnswer ?? "",
  }));

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#334155",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <StudentHeader active="self-upload" />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-24 pt-6 md:px-6">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-solar-text/60">
          <Link
            href="/dashboard/self-upload"
            className="transition-colors hover:text-solar-amber"
          >
            Self Upload
          </Link>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <Link
            href={`/dashboard/self-upload/attempt/${id}`}
            className="transition-colors hover:text-solar-amber"
          >
            Review
          </Link>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <span className="text-solar-text-dark">Replay</span>
        </nav>

        <header className="mb-6">
          <p
            className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-solar-amber"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            Replay · {attempt.subject} · {attempt.topic}
          </p>
          <p className="text-[12px] text-solar-text/70">
            Same questions as the original attempt. Results are not saved as a
            new attempt.
          </p>
        </header>

        {attempt.mode === "test" ? (
          <ReplayTestWrapper
            attemptId={id}
            questions={presetTest}
            difficulty={attempt.difficulty}
          />
        ) : (
          <ReplayInterviewWrapper
            attemptId={id}
            questions={presetInterview}
            difficulty={attempt.difficulty}
          />
        )}
      </main>
    </div>
  );
}
