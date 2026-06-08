/**
 * Showcase seeder — wide dummy curriculum across multiple stages.
 * Purpose: any student account lands on a populated dashboard.
 *
 * Run:  pnpm tsx src/db/seed-showcase.ts
 * Idempotent — safe to re-run. UPSERTs by (parent_id, name).
 */
import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "./index";
import {
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

type SubjectSpec = { name: string; isCoding?: boolean };

const CBSE_SCHOOL: SubjectSpec[] = [
  { name: "English" },
  { name: "Mathematics" },
  { name: "Science" },
  { name: "Social Studies" },
];

const INTER_SCIENCE: SubjectSpec[] = [
  { name: "English" },
  { name: "Mathematics" },
  { name: "Physics" },
  { name: "Chemistry" },
];

const BTECH_CS: SubjectSpec[] = [
  { name: "Data Structures", isCoding: true },
  { name: "Algorithms", isCoding: true },
  { name: "Operating Systems", isCoding: true },
  { name: "Database Systems", isCoding: true },
];

const MTECH_CS: SubjectSpec[] = [
  { name: "Advanced Algorithms", isCoding: true },
  { name: "Machine Learning", isCoding: true },
  { name: "Distributed Systems", isCoding: true },
];

const PROFESSIONAL: SubjectSpec[] = [
  { name: "System Design", isCoding: true },
  { name: "Communication Skills" },
];

/** Synthesize 3 chapters × 3 topics with sample content + 5 MCQs each. */
function chaptersFor(subject: string) {
  const themes: Record<string, string[]> = {
    English: [
      "Grammar Foundations",
      "Reading Comprehension",
      "Writing Skills",
    ],
    Mathematics: ["Number Systems", "Algebra Basics", "Geometry"],
    Science: ["Matter and Materials", "Living World", "Energy and Motion"],
    "Social Studies": ["History", "Geography", "Civics"],
    Physics: ["Mechanics", "Thermodynamics", "Electromagnetism"],
    Chemistry: ["Atomic Structure", "Chemical Bonding", "Organic Basics"],
    "Data Structures": ["Arrays and Strings", "Linked Lists", "Trees"],
    Algorithms: ["Sorting", "Searching", "Dynamic Programming"],
    "Operating Systems": ["Processes", "Memory Management", "File Systems"],
    "Database Systems": ["Relational Model", "SQL", "Indexing"],
    "Advanced Algorithms": ["Graph Algorithms", "NP-Completeness", "Randomized"],
    "Machine Learning": ["Supervised Learning", "Neural Networks", "Evaluation"],
    "Distributed Systems": ["Replication", "Consensus", "Coordination"],
    "System Design": ["Scalability", "Caching", "Messaging"],
    "Communication Skills": ["Email Etiquette", "Presentations", "Feedback"],
  };
  const baseChapters = themes[subject] ?? ["Introduction", "Core Concepts", "Applications"];
  return baseChapters.map((c) => ({
    name: c,
    topics: topicsFor(subject, c),
  }));
}

function topicsFor(subject: string, chapter: string) {
  const map: Record<string, string[]> = {
    "Grammar Foundations": ["Tenses", "Voice", "Direct & Indirect Speech"],
    "Reading Comprehension": ["Skimming", "Inference", "Vocabulary in Context"],
    "Writing Skills": ["Paragraph Writing", "Letters", "Essays"],
    "Number Systems": ["Whole Numbers", "Fractions", "Decimals"],
    "Algebra Basics": ["Variables", "Linear Equations", "Polynomials"],
    Geometry: ["Lines and Angles", "Triangles", "Circles"],
    Mechanics: ["Kinematics", "Newton's Laws", "Work, Energy, Power"],
    Thermodynamics: ["Temperature & Heat", "Laws of Thermodynamics", "Entropy"],
    Electromagnetism: ["Electric Charge", "Magnetic Fields", "EM Waves"],
    "Atomic Structure": ["Bohr Model", "Quantum Numbers", "Electron Configuration"],
    "Chemical Bonding": ["Ionic Bonds", "Covalent Bonds", "VSEPR"],
    "Organic Basics": ["Hydrocarbons", "Functional Groups", "Isomerism"],
    "Arrays and Strings": ["Array Basics", "Two-Pointer", "Sliding Window"],
    "Linked Lists": ["Singly Linked List", "Doubly Linked List", "Cycle Detection"],
    Trees: ["Binary Tree", "BST", "Tree Traversal"],
    Sorting: ["Merge Sort", "Quick Sort", "Heap Sort"],
    Searching: ["Binary Search", "BFS", "DFS"],
    "Dynamic Programming": ["Memoization", "Tabulation", "Knapsack"],
    Processes: ["Process States", "Scheduling", "IPC"],
    "Memory Management": ["Paging", "Segmentation", "Virtual Memory"],
    "File Systems": ["Inodes", "Journaling", "Caching"],
    "Relational Model": ["Tables and Keys", "Normalization", "ACID"],
    SQL: ["SELECT and JOIN", "Aggregations", "Subqueries"],
    Indexing: ["B-Trees", "Hash Indexes", "Query Planning"],
    "Graph Algorithms": ["Dijkstra", "MST", "Max Flow"],
    "NP-Completeness": ["Reductions", "SAT", "Approximation"],
    Randomized: ["Monte Carlo", "Las Vegas", "Hashing"],
    "Supervised Learning": ["Linear Regression", "Logistic Regression", "Decision Trees"],
    "Neural Networks": ["Perceptron", "Backpropagation", "CNNs"],
    Evaluation: ["Precision & Recall", "Cross-Validation", "ROC Curves"],
    Replication: ["Leader-Follower", "Multi-Leader", "Conflict Resolution"],
    Consensus: ["Paxos", "Raft", "Two-Phase Commit"],
    Coordination: ["Locking", "Leases", "Vector Clocks"],
    Scalability: ["Vertical vs Horizontal", "Load Balancing", "Sharding"],
    Caching: ["Cache Strategies", "TTL & Eviction", "CDN"],
    Messaging: ["Pub/Sub", "Queues", "Streams"],
    "Email Etiquette": ["Subject Lines", "Tone", "Brevity"],
    Presentations: ["Structure", "Visuals", "Delivery"],
    Feedback: ["Giving Feedback", "Receiving Feedback", "Difficult Conversations"],
    History: ["Ancient India", "Medieval India", "Modern India"],
    Geography: ["Landforms", "Climate", "Resources"],
    Civics: ["Constitution", "Government", "Rights & Duties"],
    "Matter and Materials": ["States of Matter", "Mixtures", "Elements"],
    "Living World": ["Cells", "Plants", "Animals"],
    "Energy and Motion": ["Force", "Energy Forms", "Motion"],
  };
  return (
    map[chapter] ?? ["Introduction", "Core Idea", "Practice"]
  ).map((t) => ({ name: t, content: contentFor(subject, chapter, t), mcqs: mcqsFor(subject, chapter, t) }));
}

function contentFor(subject: string, chapter: string, topic: string) {
  return `# ${topic}

> *${chapter}* &middot; ${subject}

This topic introduces **${topic}**, a core idea within ${chapter.toLowerCase()} for ${subject}.
Read carefully, listen to the audio version (top bar), then attempt the mock test.

## Why it matters

${topic} appears across many real-world problems. Understanding it well unlocks
the rest of the chapter.

## Key ideas

1. Definition — a short, precise statement of what *${topic}* is.
2. Example — a concrete worked-through case showing the idea in action.
3. Counter-example — when the idea **does not** apply, and what to use instead.

## A worked example

Consider a small scenario from everyday life.

- Setup: state the inputs clearly.
- Apply: walk through the step-by-step reasoning.
- Verify: confirm the answer by independent check.

## Practice

Move to the **Mock Test** to attempt 5 questions, or open **Mock Interview**
to speak through the concept with the AI examiner.
`;
}

function mcqsFor(subject: string, chapter: string, topic: string) {
  return [
    {
      q: `Which best describes "${topic}" in the context of ${chapter}?`,
      opts: [
        `${topic} is unrelated to ${chapter}.`,
        `${topic} is the central idea this chapter explores.`,
        `${topic} only matters outside this subject.`,
        `${topic} replaces all other topics in ${subject}.`,
      ],
      correct: 1,
      exp: `${topic} is a focus of ${chapter}.`,
    },
    {
      q: `Pick the WRONG statement about ${topic}.`,
      opts: [
        `It can be illustrated with examples.`,
        `It is a recognised concept in ${subject}.`,
        `It has no real-world application.`,
        `It belongs to the chapter "${chapter}".`,
      ],
      correct: 2,
      exp: `Every topic in this chapter has applications.`,
    },
    {
      q: `Which subject does ${chapter} belong to in this curriculum?`,
      opts: ["Music", subject, "Sports", "None of these"],
      correct: 1,
      exp: `${chapter} belongs to ${subject}.`,
    },
    {
      q: `True or False: ${topic} can be practised through the platform's mock interview.`,
      opts: ["True", "False"],
      correct: 0,
      exp: `Every topic supports voice + text interviews.`,
    },
    {
      q: `What is the recommended next step after reading ${topic}?`,
      opts: [
        "Skip to a different chapter",
        "Attempt the mock test for this topic",
        "Delete your account",
        "Log out",
      ],
      correct: 1,
      exp: `Mock test reinforces what you read.`,
    },
  ];
}

/* ---------- helpers ---------- */

async function ensureSubject(gradeId: string, s: SubjectSpec, idx: number) {
  const existing = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(and(eq(subjects.gradeId, gradeId), eq(subjects.name, s.name)));
  if (existing[0]) return existing[0].id;
  const [row] = await db
    .insert(subjects)
    .values({
      gradeId,
      name: s.name,
      isCoding: !!s.isCoding,
      sortOrder: idx,
    })
    .returning({ id: subjects.id });
  return row.id;
}

async function ensureChapter(subjectId: string, name: string, idx: number) {
  const existing = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.subjectId, subjectId), eq(chapters.name, name)));
  if (existing[0]) return existing[0].id;
  const [row] = await db
    .insert(chapters)
    .values({ subjectId, name, sortOrder: idx })
    .returning({ id: chapters.id });
  return row.id;
}

async function ensureTopic(chapterId: string, name: string, idx: number) {
  const existing = await db
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.chapterId, chapterId), eq(topics.name, name)));
  if (existing[0]) return existing[0].id;
  const [row] = await db
    .insert(topics)
    .values({ chapterId, name, sortOrder: idx })
    .returning({ id: topics.id });
  return row.id;
}

async function ensureContent(topicId: string, body: string) {
  await db
    .insert(topicContent)
    .values({ topicId, bodyHtml: body })
    .onConflictDoNothing({ target: topicContent.topicId });
}

async function ensureMcqs(
  topicId: string,
  list: { q: string; opts: string[]; correct: number; exp?: string }[]
) {
  const existing = await db
    .select({ id: questions.id })
    .from(questions)
    .where(and(eq(questions.topicId, topicId), eq(questions.source, "human")));
  if (existing.length > 0) return; // already seeded
  for (const m of list) {
    const [q] = await db
      .insert(questions)
      .values({
        topicId,
        type: "mcq",
        prompt: m.q,
        explanation: m.exp ?? null,
        difficulty: "medium",
        source: "human",
      })
      .returning({ id: questions.id });
    for (let i = 0; i < m.opts.length; i++) {
      await db.insert(questionOptions).values({
        questionId: q.id,
        text: m.opts[i],
        isCorrect: i === m.correct,
        sortOrder: i,
      });
    }
  }
}

async function seedGradeChain(gradeId: string, subjectsSpec: SubjectSpec[]) {
  let added = { subjects: 0, chapters: 0, topics: 0, questions: 0 };
  for (let i = 0; i < subjectsSpec.length; i++) {
    const subId = await ensureSubject(gradeId, subjectsSpec[i], i);
    added.subjects++;
    const chs = chaptersFor(subjectsSpec[i].name);
    for (let j = 0; j < chs.length; j++) {
      const chId = await ensureChapter(subId, chs[j].name, j);
      added.chapters++;
      for (let k = 0; k < chs[j].topics.length; k++) {
        const t = chs[j].topics[k];
        const tId = await ensureTopic(chId, t.name, k);
        added.topics++;
        await ensureContent(tId, t.content);
        await ensureMcqs(tId, t.mcqs);
        added.questions += t.mcqs.length;
      }
    }
  }
  return added;
}

/* ---------- targets ---------- */

async function findSection(code: "school" | "intermediate" | "college" | "postgrad" | "professional") {
  const [s] = await db.select().from(sections).where(eq(sections.code, code));
  if (!s) throw new Error(`Section ${code} not found`);
  return s;
}

async function findProvider(sectionId: string, name: string) {
  const [p] = await db
    .select()
    .from(providers)
    .where(and(eq(providers.sectionId, sectionId), eq(providers.name, name)));
  if (!p) throw new Error(`Provider ${name} not found in section ${sectionId}`);
  return p;
}

async function listProviderGrades(providerId: string) {
  return db.select().from(grades).where(eq(grades.providerId, providerId));
}

async function seedAllGradesForProvider(
  providerName: string,
  providerId: string,
  spec: SubjectSpec[],
  prefix?: string
) {
  const gs = await listProviderGrades(providerId);
  const filtered = prefix ? gs.filter((g) => g.name.startsWith(prefix)) : gs;
  let total = { subjects: 0, chapters: 0, topics: 0, questions: 0 };
  for (const g of filtered) {
    const a = await seedGradeChain(g.id, spec);
    total = {
      subjects: total.subjects + a.subjects,
      chapters: total.chapters + a.chapters,
      topics: total.topics + a.topics,
      questions: total.questions + a.questions,
    };
  }
  console.log(
    `  ${providerName.padEnd(60)} grades:${filtered.length}  +${total.topics}t +${total.questions}q`
  );
}

async function main() {
  console.log("Showcase seed starting (WIDE) …\n");

  // ---- 1. ALL school boards ----
  console.log("== School (all boards) ==");
  const schoolSec = await findSection("school");
  const schoolBoards = await db
    .select()
    .from(providers)
    .where(eq(providers.sectionId, schoolSec.id));
  for (const b of schoolBoards) {
    await seedAllGradesForProvider(b.name, b.id, CBSE_SCHOOL);
  }

  // ---- 2. ALL intermediate boards ----
  console.log("\n== Intermediate (all boards) ==");
  const interSec = await findSection("intermediate");
  const interBoards = await db
    .select()
    .from(providers)
    .where(eq(providers.sectionId, interSec.id));
  for (const b of interBoards) {
    await seedAllGradesForProvider(b.name, b.id, INTER_SCIENCE);
  }

  // ---- 3. College — Telangana state universities only (B.Tech years) ----
  console.log("\n== College (Telangana universities, B.Tech) ==");
  const collegeSec = await findSection("college");
  const tgColleges = await db
    .select()
    .from(providers)
    .where(
      and(
        eq(providers.sectionId, collegeSec.id),
        eq(providers.state, "Telangana")
      )
    );
  for (const u of tgColleges) {
    await seedAllGradesForProvider(u.name, u.id, BTECH_CS, "B.Tech");
  }

  // ---- 4. Postgrad — Telangana M.Tech ----
  console.log("\n== Postgrad (Telangana universities, M.Tech) ==");
  const pgSec = await findSection("postgrad");
  const tgPg = await db
    .select()
    .from(providers)
    .where(
      and(
        eq(providers.sectionId, pgSec.id),
        eq(providers.state, "Telangana")
      )
    );
  for (const u of tgPg) {
    await seedAllGradesForProvider(u.name, u.id, MTECH_CS, "M.Tech");
  }

  // ---- 5. Professional (all providers, all grades) ----
  console.log("\n== Professional ==");
  const profSec = await findSection("professional");
  const profProviders = await db
    .select()
    .from(providers)
    .where(eq(providers.sectionId, profSec.id));
  for (const p of profProviders) {
    await seedAllGradesForProvider(p.name, p.id, PROFESSIONAL);
  }

  console.log("\n== DONE ==");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
