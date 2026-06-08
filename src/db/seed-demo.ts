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
  topicContent,
  questions,
  questionOptions,
} from "./schema";
import { hashPassword } from "../modules/auth/password";

type Mcq = {
  q: string;
  opts: string[];
  correct: number;
  exp?: string;
};
type Topic = { name: string; content: string; mcqs: Mcq[] };
type Subject = {
  name: string;
  isCoding?: boolean;
  chapters: { name: string; topics: Topic[] }[];
};

const CURRICULUM: Subject[] = [
  {
    name: "English",
    chapters: [
      {
        name: "Grammar",
        topics: [
          {
            name: "Tenses",
            content:
              "# Tenses\n\nA **tense** tells us *when* an action happens.\n\n- **Present**: I eat an apple.\n- **Past**: I ate an apple.\n- **Future**: I will eat an apple.\n\nEach tense also has continuous and perfect forms, but start with these three.",
            mcqs: [
              {
                q: 'Which sentence is in the past tense?',
                opts: ["I play cricket.", "I played cricket.", "I will play cricket.", "I am playing cricket."],
                correct: 1,
                exp: "'played' is the past form of 'play'.",
              },
              {
                q: "The future tense of 'go' is:",
                opts: ["went", "going", "will go", "goes"],
                correct: 2,
              },
              {
                q: "'She is reading a book' is in which tense?",
                opts: ["Simple past", "Present continuous", "Simple future", "Past perfect"],
                correct: 1,
              },
            ],
          },
          {
            name: "Nouns",
            content:
              "# Nouns\n\nA **noun** is the name of a person, place, animal or thing.\n\n- Person: *teacher*\n- Place: *school*\n- Animal: *tiger*\n- Thing: *book*",
            mcqs: [
              {
                q: "Which of these is a noun?",
                opts: ["quickly", "blue", "elephant", "run"],
                correct: 2,
              },
              {
                q: "A name of a place is a:",
                opts: ["verb", "noun", "adjective", "adverb"],
                correct: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Mathematics",
    chapters: [
      {
        name: "Numbers",
        topics: [
          {
            name: "Fractions",
            content:
              "# Fractions\n\nA **fraction** shows a part of a whole.\n\nIn `3/4`, the **numerator** is 3 (parts taken) and the **denominator** is 4 (total parts).\n\nHalf is `1/2`, a quarter is `1/4`.",
            mcqs: [
              {
                q: "In the fraction 3/5, what is the denominator?",
                opts: ["3", "5", "8", "2"],
                correct: 1,
              },
              {
                q: "Which fraction is equal to one half?",
                opts: ["1/3", "2/4", "3/5", "1/4"],
                correct: 1,
                exp: "2/4 simplifies to 1/2.",
              },
              {
                q: "Which is the largest?",
                opts: ["1/4", "1/2", "1/3", "1/8"],
                correct: 1,
              },
            ],
          },
          {
            name: "Multiplication",
            content:
              "# Multiplication\n\nMultiplication is repeated addition.\n\n`4 × 3` means 4 added 3 times = 4 + 4 + 4 = **12**.",
            mcqs: [
              {
                q: "What is 6 × 7?",
                opts: ["42", "36", "48", "13"],
                correct: 0,
              },
              {
                q: "9 × 0 = ?",
                opts: ["9", "0", "90", "1"],
                correct: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Science",
    chapters: [
      {
        name: "Living World",
        topics: [
          {
            name: "Parts of a Plant",
            content:
              "# Parts of a Plant\n\nA plant has these main parts:\n\n- **Roots** – absorb water and hold the plant.\n- **Stem** – carries water and supports the plant.\n- **Leaves** – make food using sunlight.\n- **Flower** – helps the plant make seeds.",
            mcqs: [
              {
                q: "Which part of the plant makes food?",
                opts: ["Roots", "Stem", "Leaves", "Flower"],
                correct: 2,
                exp: "Leaves make food by photosynthesis.",
              },
              {
                q: "Which part absorbs water from the soil?",
                opts: ["Leaves", "Roots", "Flower", "Fruit"],
                correct: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Social Studies",
    chapters: [
      {
        name: "Geography",
        topics: [
          {
            name: "Rivers of India",
            content:
              "# Rivers of India\n\nIndia has many important rivers:\n\n- **Ganga** – the longest river in India.\n- **Yamuna** – a major tributary of the Ganga.\n- **Godavari** – the longest river in South India.",
            mcqs: [
              {
                q: "Which is the longest river in India?",
                opts: ["Yamuna", "Godavari", "Ganga", "Kaveri"],
                correct: 2,
              },
              {
                q: "The Godavari is the longest river in:",
                opts: ["North India", "South India", "East India", "West India"],
                correct: 1,
              },
            ],
          },
        ],
      },
    ],
  },
];

async function getOrCreateSubject(gradeId: string, name: string, isCoding: boolean) {
  const [found] = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.gradeId, gradeId), eq(subjects.name, name)));
  if (found) return found;
  const [row] = await db
    .insert(subjects)
    .values({ gradeId, name, isCoding })
    .returning();
  return row;
}

async function getOrCreateChapter(subjectId: string, name: string) {
  const [found] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.subjectId, subjectId), eq(chapters.name, name)));
  if (found) return found;
  const [row] = await db
    .insert(chapters)
    .values({ subjectId, name })
    .returning();
  return row;
}

async function getOrCreateTopic(chapterId: string, name: string) {
  const [found] = await db
    .select()
    .from(topics)
    .where(and(eq(topics.chapterId, chapterId), eq(topics.name, name)));
  if (found) return found;
  const [row] = await db
    .insert(topics)
    .values({ chapterId, name })
    .returning();
  return row;
}

async function addMcq(topicId: string, m: Mcq) {
  // Skip if a question with the same prompt already exists for this topic.
  const [exists] = await db
    .select({ id: questions.id })
    .from(questions)
    .where(and(eq(questions.topicId, topicId), eq(questions.prompt, m.q)));
  if (exists) return;

  const [q] = await db
    .insert(questions)
    .values({
      topicId,
      type: "mcq",
      prompt: m.q,
      explanation: m.exp,
      difficulty: "medium",
      source: "human",
    })
    .returning({ id: questions.id });

  await db.insert(questionOptions).values(
    m.opts.map((text, i) => ({
      questionId: q.id,
      text,
      isCorrect: i === m.correct,
      sortOrder: i,
    }))
  );
}

async function extraStudents(
  sectionId: string,
  providerId: string,
  gradeId: string
) {
  const people = [
    { name: "Asha Reddy", email: "asha@example.com" },
    { name: "Rahul Verma", email: "rahul@example.com" },
  ];
  const hash = await hashPassword("Passw0rd!");
  for (const p of people) {
    const [exists] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, p.email));
    if (exists) continue;
    await db.insert(users).values({
      name: p.name,
      email: p.email,
      phone: "9000000000",
      country: "India",
      state: "Telangana",
      passwordHash: hash,
      role: "student",
      status: "approved",
      sectionId,
      providerId,
      gradeId,
    });
  }
}

async function main() {
  const [school] = await db.select().from(sections).where(eq(sections.code, "school"));
  const [cbse] = await db
    .select()
    .from(providers)
    .where(and(eq(providers.sectionId, school.id), eq(providers.name, "CBSE")));
  const [class5] = await db
    .select()
    .from(grades)
    .where(and(eq(grades.providerId, cbse.id), eq(grades.name, "Class 5")));

  let nSub = 0,
    nTop = 0,
    nQ = 0;

  for (const s of CURRICULUM) {
    const subject = await getOrCreateSubject(class5.id, s.name, !!s.isCoding);
    nSub++;
    for (const ch of s.chapters) {
      const chapter = await getOrCreateChapter(subject.id, ch.name);
      for (const t of ch.topics) {
        const topic = await getOrCreateTopic(chapter.id, t.name);
        nTop++;
        await db
          .insert(topicContent)
          .values({ topicId: topic.id, bodyHtml: t.content })
          .onConflictDoUpdate({
            target: topicContent.topicId,
            set: { bodyHtml: t.content, updatedAt: new Date() },
          });
        for (const m of t.mcqs) {
          await addMcq(topic.id, m);
          nQ++;
        }
      }
    }
  }

  await extraStudents(school.id, cbse.id, class5.id);

  console.log(`\n✅ Demo seed complete for CBSE Class 5`);
  console.log(`   subjects: ${nSub}, topics: ${nTop}, questions: ~${nQ}`);
  console.log(`   + 2 extra approved students (asha@, rahul@ / Passw0rd!)`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("seed-demo failed:", e);
    process.exit(1);
  });
