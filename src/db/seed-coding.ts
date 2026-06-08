import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  sections,
  providers,
  grades,
  subjects,
  chapters,
  topics,
  codingQuestions,
  codingTestCases,
} from "./schema";

async function main() {
  // 1. Approve the test student.
  await db
    .update(users)
    .set({ status: "approved" })
    .where(eq(users.email, "teststudent@example.com"));
  console.log("✓ test student approved");

  // 2. Locate CBSE → Class 5.
  const [school] = await db
    .select()
    .from(sections)
    .where(eq(sections.code, "school"));
  const [cbse] = await db
    .select()
    .from(providers)
    .where(and(eq(providers.sectionId, school.id), eq(providers.name, "CBSE")));
  const [class5] = await db
    .select()
    .from(grades)
    .where(and(eq(grades.providerId, cbse.id), eq(grades.name, "Class 5")));

  // 3. Coding subject (idempotent-ish).
  let [subject] = await db
    .select()
    .from(subjects)
    .where(
      and(eq(subjects.gradeId, class5.id), eq(subjects.name, "Programming Basics"))
    );
  if (!subject) {
    [subject] = await db
      .insert(subjects)
      .values({
        gradeId: class5.id,
        name: "Programming Basics",
        isCoding: true,
      })
      .returning();
  }

  let [chapter] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.subjectId, subject.id), eq(chapters.name, "Basics")));
  if (!chapter) {
    [chapter] = await db
      .insert(chapters)
      .values({ subjectId: subject.id, name: "Basics" })
      .returning();
  }

  let [topic] = await db
    .select()
    .from(topics)
    .where(and(eq(topics.chapterId, chapter.id), eq(topics.name, "Input / Output")));
  if (!topic) {
    [topic] = await db
      .insert(topics)
      .values({ chapterId: chapter.id, name: "Input / Output" })
      .returning();
  }

  // 4. Coding problem + test cases.
  const [existing] = await db
    .select()
    .from(codingQuestions)
    .where(
      and(
        eq(codingQuestions.topicId, topic.id),
        eq(codingQuestions.title, "Sum Two Numbers")
      )
    );
  if (!existing) {
    const [q] = await db
      .insert(codingQuestions)
      .values({
        topicId: topic.id,
        title: "Sum Two Numbers",
        prompt:
          "Read two integers separated by a space from standard input and print their sum.",
        languages: ["python", "cpp", "c", "javascript"],
        difficulty: "easy",
        source: "human",
      })
      .returning();

    await db.insert(codingTestCases).values([
      { codingQuestionId: q.id, stdin: "2 3", expectedOutput: "5", isSample: true, weight: 1 },
      { codingQuestionId: q.id, stdin: "10 20", expectedOutput: "30", isSample: true, weight: 1 },
      { codingQuestionId: q.id, stdin: "100 250", expectedOutput: "350", isSample: false, weight: 1 },
    ]);
    console.log("✓ coding problem + 3 test cases created");
  } else {
    console.log("• coding problem already exists");
  }

  console.log("\nDone. Login as student: teststudent@example.com / Passw0rd!");
  console.log("Path: Programming Basics → Basics → Input / Output → Coding");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("seed-coding failed:", e);
    process.exit(1);
  });
