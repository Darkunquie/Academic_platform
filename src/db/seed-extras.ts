/**
 * Add coding questions to every coding topic + extra MCQs to every topic.
 * Idempotent — skips topics that already have N+ items.
 *
 * Run:  pnpm tsx src/db/seed-extras.ts
 */
import "dotenv/config";
import { and, eq, sql } from "drizzle-orm";
import { db } from "./index";
import {
  subjects,
  chapters,
  topics,
  questions,
  questionOptions,
  codingQuestions,
  codingTestCases,
} from "./schema";

/* ----------------------------- coding pool ----------------------------- */

type Problem = {
  title: string;
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  starter: Record<string, string>;
  tests: { stdin: string; expected: string; sample?: boolean }[];
};

const PROBLEMS: Problem[] = [
  {
    title: "Sum of Two Numbers",
    prompt:
      "Read two integers separated by a space on one line. Print their sum.\n\nExample:\nInput: 3 5\nOutput: 8",
    difficulty: "easy",
    starter: {
      python: "a, b = map(int, input().split())\nprint(a + b)\n",
      javascript:
        "process.stdin.on('data', d => {\n  const [a, b] = d.toString().trim().split(/\\s+/).map(Number);\n  console.log(a + b);\n});\n",
      cpp: "#include <iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b;return 0;}\n",
    },
    tests: [
      { stdin: "3 5", expected: "8", sample: true },
      { stdin: "0 0", expected: "0" },
      { stdin: "-7 12", expected: "5" },
      { stdin: "1000000 1000000", expected: "2000000" },
    ],
  },
  {
    title: "Reverse a String",
    prompt:
      "Read a single line string. Print it reversed.\n\nExample:\nInput: hello\nOutput: olleh",
    difficulty: "easy",
    starter: {
      python: "s = input()\nprint(s[::-1])\n",
      javascript:
        "process.stdin.on('data', d => console.log(d.toString().trim().split('').reverse().join('')));\n",
      cpp: "#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main(){string s;getline(cin,s);reverse(s.begin(),s.end());cout<<s;return 0;}\n",
    },
    tests: [
      { stdin: "hello", expected: "olleh", sample: true },
      { stdin: "a", expected: "a" },
      { stdin: "racecar", expected: "racecar" },
      { stdin: "Academic", expected: "cimedacA" },
    ],
  },
  {
    title: "FizzBuzz",
    prompt:
      "Read N. Print numbers 1..N, but replace multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', multiples of both with 'FizzBuzz'. One per line.",
    difficulty: "easy",
    starter: {
      python:
        "n = int(input())\nfor i in range(1, n+1):\n    if i%15==0: print('FizzBuzz')\n    elif i%3==0: print('Fizz')\n    elif i%5==0: print('Buzz')\n    else: print(i)\n",
      javascript:
        "process.stdin.on('data', d => {\n  const n = +d.toString().trim();\n  for (let i=1;i<=n;i++) {\n    if (i%15===0) console.log('FizzBuzz');\n    else if (i%3===0) console.log('Fizz');\n    else if (i%5===0) console.log('Buzz');\n    else console.log(i);\n  }\n});\n",
      cpp: "#include <iostream>\nusing namespace std;\nint main(){int n;cin>>n;for(int i=1;i<=n;i++){if(i%15==0)cout<<\"FizzBuzz\\n\";else if(i%3==0)cout<<\"Fizz\\n\";else if(i%5==0)cout<<\"Buzz\\n\";else cout<<i<<\"\\n\";}return 0;}\n",
    },
    tests: [
      { stdin: "5", expected: "1\n2\nFizz\n4\nBuzz", sample: true },
      { stdin: "3", expected: "1\n2\nFizz" },
      { stdin: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
    ],
  },
  {
    title: "Palindrome Check",
    prompt:
      "Read a string. Print 'YES' if it reads the same forward and backward, else 'NO'. Case-sensitive.",
    difficulty: "easy",
    starter: {
      python:
        "s = input()\nprint('YES' if s == s[::-1] else 'NO')\n",
      javascript:
        "process.stdin.on('data', d => {\n  const s = d.toString().trim();\n  console.log(s === s.split('').reverse().join('') ? 'YES' : 'NO');\n});\n",
      cpp: "#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main(){string s;getline(cin,s);string r=s;reverse(r.begin(),r.end());cout<<(s==r?\"YES\":\"NO\");return 0;}\n",
    },
    tests: [
      { stdin: "madam", expected: "YES", sample: true },
      { stdin: "hello", expected: "NO" },
      { stdin: "a", expected: "YES" },
      { stdin: "abba", expected: "YES" },
    ],
  },
  {
    title: "Count Vowels",
    prompt:
      "Read a string. Print the number of vowels (a,e,i,o,u — lowercase only).",
    difficulty: "easy",
    starter: {
      python:
        "s = input()\nprint(sum(1 for c in s if c in 'aeiou'))\n",
      javascript:
        "process.stdin.on('data', d => {\n  const s = d.toString().trim();\n  console.log([...s].filter(c => 'aeiou'.includes(c)).length);\n});\n",
      cpp: "#include <iostream>\nusing namespace std;\nint main(){string s;getline(cin,s);int c=0;for(char ch:s)if(ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u')c++;cout<<c;return 0;}\n",
    },
    tests: [
      { stdin: "hello", expected: "2", sample: true },
      { stdin: "academy", expected: "3" },
      { stdin: "xyz", expected: "0" },
      { stdin: "aeiou", expected: "5" },
    ],
  },
  {
    title: "Maximum in Array",
    prompt:
      "Read N on the first line, then N space-separated integers on the second line. Print the largest.",
    difficulty: "easy",
    starter: {
      python:
        "n = int(input())\narr = list(map(int, input().split()))\nprint(max(arr))\n",
      javascript:
        "let buf='';\nprocess.stdin.on('data', d => buf += d);\nprocess.stdin.on('end', () => {\n  const [n, line] = buf.trim().split('\\n');\n  const arr = line.split(/\\s+/).map(Number);\n  console.log(Math.max(...arr));\n});\n",
      cpp: "#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main(){int n;cin>>n;int mx=-2e9;for(int i=0;i<n;i++){int x;cin>>x;mx=max(mx,x);}cout<<mx;return 0;}\n",
    },
    tests: [
      { stdin: "5\n3 1 4 1 5", expected: "5", sample: true },
      { stdin: "1\n42", expected: "42" },
      { stdin: "4\n-1 -5 -2 -10", expected: "-1" },
    ],
  },
  {
    title: "Factorial",
    prompt:
      "Read N (0 ≤ N ≤ 12). Print N!.",
    difficulty: "easy",
    starter: {
      python:
        "n = int(input())\nf = 1\nfor i in range(2, n+1): f *= i\nprint(f)\n",
      javascript:
        "process.stdin.on('data', d => {\n  let n = +d.toString().trim(), f = 1;\n  for (let i = 2; i <= n; i++) f *= i;\n  console.log(f);\n});\n",
      cpp: "#include <iostream>\nusing namespace std;\nint main(){int n;cin>>n;long long f=1;for(int i=2;i<=n;i++)f*=i;cout<<f;return 0;}\n",
    },
    tests: [
      { stdin: "5", expected: "120", sample: true },
      { stdin: "0", expected: "1" },
      { stdin: "1", expected: "1" },
      { stdin: "10", expected: "3628800" },
    ],
  },
  {
    title: "Fibonacci (nth term)",
    prompt:
      "Read N. Print the Nth Fibonacci number (F(0)=0, F(1)=1).",
    difficulty: "medium",
    starter: {
      python:
        "n = int(input())\na, b = 0, 1\nfor _ in range(n): a, b = b, a+b\nprint(a)\n",
      javascript:
        "process.stdin.on('data', d => {\n  let n = +d.toString().trim();\n  let a = 0n, b = 1n;\n  for (let i = 0; i < n; i++) [a, b] = [b, a + b];\n  console.log(a.toString());\n});\n",
      cpp: "#include <iostream>\nusing namespace std;\nint main(){int n;cin>>n;long long a=0,b=1;for(int i=0;i<n;i++){long long t=a+b;a=b;b=t;}cout<<a;return 0;}\n",
    },
    tests: [
      { stdin: "10", expected: "55", sample: true },
      { stdin: "0", expected: "0" },
      { stdin: "1", expected: "1" },
      { stdin: "20", expected: "6765" },
    ],
  },
  {
    title: "Two Sum (existence)",
    prompt:
      "Read N and a target T on the first line. Read N integers on the second line. Print 'YES' if any two distinct elements sum to T, else 'NO'.",
    difficulty: "medium",
    starter: {
      python:
        "n, t = map(int, input().split())\narr = list(map(int, input().split()))\nseen = set()\nfound = False\nfor x in arr:\n    if t - x in seen:\n        found = True\n        break\n    seen.add(x)\nprint('YES' if found else 'NO')\n",
      javascript:
        "let buf='';\nprocess.stdin.on('data', d => buf += d);\nprocess.stdin.on('end', () => {\n  const [first, second] = buf.trim().split('\\n');\n  const [n, t] = first.split(/\\s+/).map(Number);\n  const arr = second.split(/\\s+/).map(Number);\n  const seen = new Set();\n  for (const x of arr) {\n    if (seen.has(t - x)) { console.log('YES'); return; }\n    seen.add(x);\n  }\n  console.log('NO');\n});\n",
      cpp: "#include <iostream>\n#include <unordered_set>\nusing namespace std;\nint main(){int n,t;cin>>n>>t;unordered_set<int> seen;bool ok=false;for(int i=0;i<n;i++){int x;cin>>x;if(seen.count(t-x)){ok=true;}seen.insert(x);}cout<<(ok?\"YES\":\"NO\");return 0;}\n",
    },
    tests: [
      { stdin: "4 9\n2 7 11 15", expected: "YES", sample: true },
      { stdin: "3 6\n1 2 3", expected: "NO" },
      { stdin: "5 0\n-3 1 4 3 0", expected: "YES" },
    ],
  },
  {
    title: "Binary Search",
    prompt:
      "Read N and target T on the first line. Read N sorted (ascending) integers on the second. Print the 0-based index of T, or -1 if absent.",
    difficulty: "medium",
    starter: {
      python:
        "n, t = map(int, input().split())\narr = list(map(int, input().split()))\nlo, hi = 0, n-1\nans = -1\nwhile lo <= hi:\n    m = (lo + hi)//2\n    if arr[m] == t:\n        ans = m\n        break\n    if arr[m] < t: lo = m+1\n    else: hi = m-1\nprint(ans)\n",
      javascript:
        "let buf='';\nprocess.stdin.on('data', d => buf += d);\nprocess.stdin.on('end', () => {\n  const [first, second] = buf.trim().split('\\n');\n  const [n, t] = first.split(/\\s+/).map(Number);\n  const arr = second.split(/\\s+/).map(Number);\n  let lo = 0, hi = n-1, ans = -1;\n  while (lo <= hi) {\n    const m = (lo + hi) >> 1;\n    if (arr[m] === t) { ans = m; break; }\n    if (arr[m] < t) lo = m+1; else hi = m-1;\n  }\n  console.log(ans);\n});\n",
      cpp: "#include <iostream>\nusing namespace std;\nint main(){int n,t;cin>>n>>t;int a[100005];for(int i=0;i<n;i++)cin>>a[i];int lo=0,hi=n-1,ans=-1;while(lo<=hi){int m=(lo+hi)/2;if(a[m]==t){ans=m;break;}if(a[m]<t)lo=m+1;else hi=m-1;}cout<<ans;return 0;}\n",
    },
    tests: [
      { stdin: "5 4\n1 2 3 4 5", expected: "3", sample: true },
      { stdin: "5 6\n1 2 3 4 5", expected: "-1" },
      { stdin: "1 1\n1", expected: "0" },
      { stdin: "6 -2\n-5 -2 0 3 7 9", expected: "1" },
    ],
  },
];

const EXTRA_MCQS = (subject: string, chapter: string, topic: string) => [
  {
    q: `In ${subject}, which best explains the role of ${topic}?`,
    opts: [
      `It is purely decorative and adds no value.`,
      `It builds toward the larger goals of ${chapter}.`,
      `It is the only topic students must learn.`,
      `It belongs to a different subject.`,
    ],
    correct: 1,
  },
  {
    q: `A student who understands ${topic} should next be able to:`,
    opts: [
      `Apply it to a small problem in ${chapter}.`,
      `Skip the rest of ${subject}.`,
      `Forget about it immediately.`,
      `Teach an unrelated subject.`,
    ],
    correct: 0,
  },
  {
    q: `Which feature of this platform helps you practise ${topic} aloud?`,
    opts: ["Mock Test", "Mock Interview", "PDF download", "Email notifications"],
    correct: 1,
  },
];

/* ----------------------------- helpers ----------------------------- */

async function existingCodingCount(topicId: string) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(codingQuestions)
    .where(eq(codingQuestions.topicId, topicId));
  return row?.n ?? 0;
}

async function existingMcqCount(topicId: string) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(questions)
    .where(and(eq(questions.topicId, topicId), eq(questions.source, "human")));
  return row?.n ?? 0;
}

function pickProblems(topicName: string, n = 3): Problem[] {
  // deterministic per-topic-name: hash → rotate pool
  let h = 0;
  for (const c of topicName) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const start = h % PROBLEMS.length;
  const out: Problem[] = [];
  for (let i = 0; i < n; i++) out.push(PROBLEMS[(start + i) % PROBLEMS.length]);
  return out;
}

async function addCoding(topicId: string, problems: Problem[]) {
  for (const p of problems) {
    const [q] = await db
      .insert(codingQuestions)
      .values({
        topicId,
        title: p.title,
        prompt: p.prompt,
        difficulty: p.difficulty,
        languages: Object.keys(p.starter),
        starterCode: p.starter,
        timeLimitMs: 2000,
        memLimitKb: 128000,
        source: "human",
      })
      .returning({ id: codingQuestions.id });
    for (let i = 0; i < p.tests.length; i++) {
      const t = p.tests[i];
      await db.insert(codingTestCases).values({
        codingQuestionId: q.id,
        stdin: t.stdin,
        expectedOutput: t.expected,
        isSample: !!t.sample,
        weight: 1,
      });
    }
  }
}

async function addMcqs(
  topicId: string,
  list: { q: string; opts: string[]; correct: number }[]
) {
  for (const m of list) {
    const [q] = await db
      .insert(questions)
      .values({
        topicId,
        type: "mcq",
        prompt: m.q,
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

/* ----------------------------- main ----------------------------- */

async function main() {
  console.log("Seeding extras (coding questions + extra MCQs) …\n");

  // Find all coding topics
  const codingTopics = await db
    .select({
      topicId: topics.id,
      topicName: topics.name,
      chapterName: chapters.name,
      subjectName: subjects.name,
    })
    .from(topics)
    .innerJoin(chapters, eq(topics.chapterId, chapters.id))
    .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
    .where(eq(subjects.isCoding, true));

  console.log(`Coding topics: ${codingTopics.length}`);

  let codingAdded = 0;
  let skipped = 0;
  for (const t of codingTopics) {
    const has = await existingCodingCount(t.topicId);
    if (has >= 3) {
      skipped++;
      continue;
    }
    const probs = pickProblems(t.topicName, 3 - has);
    await addCoding(t.topicId, probs);
    codingAdded += probs.length;
  }
  console.log(`Coding questions added: ${codingAdded} (${skipped} topics already had ≥3)`);

  // Extra MCQs across ALL topics (not just coding)
  const allTopics = await db
    .select({
      topicId: topics.id,
      topicName: topics.name,
      chapterName: chapters.name,
      subjectName: subjects.name,
    })
    .from(topics)
    .innerJoin(chapters, eq(topics.chapterId, chapters.id))
    .innerJoin(subjects, eq(chapters.subjectId, subjects.id));

  let mcqAdded = 0;
  let mcqSkipped = 0;
  for (const t of allTopics) {
    const has = await existingMcqCount(t.topicId);
    if (has >= 8) {
      mcqSkipped++;
      continue;
    }
    const extras = EXTRA_MCQS(t.subjectName, t.chapterName, t.topicName);
    await addMcqs(t.topicId, extras);
    mcqAdded += extras.length;
  }
  console.log(`MCQs added: ${mcqAdded} (${mcqSkipped} topics already had ≥8)`);

  console.log("\n== DONE ==");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
