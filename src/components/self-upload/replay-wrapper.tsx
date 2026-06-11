"use client";

import { useRouter } from "next/navigation";
import { SelfMockTest } from "./self-mock-test";
import { SelfMockInterview } from "./self-mock-interview";
import type {
  SelfMcq,
  SelfInterviewQ,
} from "@/modules/self-upload/actions";

export function ReplayTestWrapper({
  attemptId,
  questions,
  difficulty,
}: Readonly<{
  attemptId: string;
  questions: SelfMcq[];
  difficulty: "easy" | "medium" | "hard";
}>) {
  const router = useRouter();
  return (
    <SelfMockTest
      text=""
      difficulty={difficulty}
      presetQuestions={questions}
      onExit={() => router.push(`/dashboard/self-upload/attempt/${attemptId}`)}
    />
  );
}

export function ReplayInterviewWrapper({
  attemptId,
  questions,
  difficulty,
}: Readonly<{
  attemptId: string;
  questions: SelfInterviewQ[];
  difficulty: "easy" | "medium" | "hard";
}>) {
  const router = useRouter();
  return (
    <SelfMockInterview
      text=""
      difficulty={difficulty}
      mode="text"
      presetQuestions={questions}
      onExit={() => router.push(`/dashboard/self-upload/attempt/${attemptId}`)}
    />
  );
}
