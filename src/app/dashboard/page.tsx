import Link from "next/link";
import { auth } from "@/auth";
import { getGradeChain, listSubjects } from "@/modules/curriculum/admin";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  english: "translate",
  math: "calculate",
  science: "science",
  social: "public",
  program: "code",
  computer: "code",
  data: "code",
  history: "history_edu",
  hindi: "translate",
  physics: "experiment",
  chemistry: "biotech",
  biology: "eco",
};
function iconFor(name: string) {
  const k = name.toLowerCase();
  for (const key in ICONS) if (k.includes(key)) return ICONS[key];
  return "menu_book";
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const firstName = (user?.name ?? "there").split(" ")[0];
  const gradeId = user?.role === "student" ? user.gradeId : null;
  const grade = gradeId ? await getGradeChain(gradeId) : null;
  const subjects = gradeId ? await listSubjects(gradeId) : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <div className="dotted-pattern absolute inset-0" />
      <div className="mesh-gradient absolute inset-0 opacity-50" />
      <div
        className="shape-float absolute right-[6%] top-32 h-32 w-32 rounded-full bg-coral-300 opacity-25 blur-3xl"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="shape-float absolute left-[10%] top-[55%] text-indigo-500 opacity-25"
        style={{ animationDelay: "2s" }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "44px", fontVariationSettings: "'wght' 200" }}
        >
          change_history
        </span>
      </div>

      <div className="relative z-10">
        <StudentHeader active="dashboard" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-14 px-6 pb-20 pt-8 md:px-16">
        <section className="flex flex-col gap-4">
          <p
            className="text-[11px] uppercase text-ink-500"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            01 — Welcome back, {firstName}
          </p>
          <h1
            className="text-primary-900"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "76px",
              lineHeight: "78px",
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Pick up where you{" "}
            <span className="hand-drawn-underline">left.</span>
          </h1>
          <p
            className="max-w-xl text-ink-700"
            style={{ fontSize: "17px", lineHeight: "28px" }}
          >
            Read, listen, drill, and rehearse — your library is below.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <Link
            href="/dashboard/interview"
            className="group relative col-span-1 flex flex-col gap-3 overflow-hidden rounded-[24px] border border-ink-200 bg-white p-7 soft-shadow transition-all hover:-translate-y-1 hover:pop-shadow lg:col-span-2"
          >
            <div
              className="absolute -right-8 -top-8 text-primary-100 opacity-60"
              style={{ fontSize: "200px", lineHeight: 1 }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "200px" }}
              >
                record_voice_over
              </span>
            </div>
            <span
              className="relative z-10 text-[11px] uppercase text-coral-700"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
              }}
            >
              AI mock interview
            </span>
            <h2
              className="relative z-10 text-primary-900"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "44px",
                lineHeight: "48px",
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              Rehearse aloud.
            </h2>
            <p className="relative z-10 max-w-md text-[15px] text-ink-700">
              Speak through a topic with an AI examiner — get rubric-scored
              feedback in real time.
            </p>
            <span className="relative z-10 mt-3 inline-flex w-fit items-center gap-2 rounded-[14px] bg-primary-700 px-5 py-2.5 text-[14px] font-semibold text-white transition-all group-hover:-translate-y-0.5 group-hover:bg-primary-900 group-hover:pop-shadow">
              Start interview
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                arrow_forward
              </span>
            </span>
          </Link>

          <div className="flex flex-col gap-5">
            <Stat
              label="Subjects"
              value={subjects.length}
              icon="auto_stories"
              tone="primary"
            />
            <Stat
              label="Coding tracks"
              value={subjects.filter((s) => s.isCoding).length}
              icon="code"
              tone="indigo"
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="text-[11px] uppercase text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                Your library
              </p>
              <h2
                className="text-primary-900"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "38px",
                  lineHeight: "42px",
                  fontWeight: 400,
                }}
              >
                Subjects
              </h2>
            </div>
            {grade && (
              <span
                className="text-[12px] text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.08em",
                }}
              >
                {subjects.length}{" "}
                {subjects.length === 1 ? "subject" : "subjects"} ·{" "}
                {grade.providerName}
              </span>
            )}
          </div>

          {!gradeId ? (
            <Empty text="No class assigned to this account." />
          ) : subjects.length === 0 ? (
            <Empty text="No subjects published for your class yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/subject/${s.id}`}
                  className="group relative flex items-center gap-4 rounded-[20px] border border-ink-200 bg-white p-5 soft-shadow transition-all hover:-translate-y-1 hover:pop-shadow"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-primary-100 text-primary-700">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "26px" }}
                    >
                      {iconFor(s.name)}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-ink-900 transition-colors group-hover:text-coral-700"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "17px",
                        lineHeight: "24px",
                        fontWeight: 600,
                      }}
                    >
                      {s.name}
                    </div>
                    {s.isCoding && (
                      <span
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-medium uppercase text-coral-700"
                        style={{
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Coding
                      </span>
                    )}
                  </div>
                  <span
                    className="material-symbols-outlined text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-primary-700"
                    style={{ fontSize: "22px" }}
                  >
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: Readonly<{
  label: string;
  value: number;
  icon: string;
  tone: "primary" | "indigo";
}>) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-100 text-primary-700"
      : "bg-indigo-100 text-indigo-500";
  return (
    <div className="flex flex-1 flex-col justify-between gap-3 rounded-[20px] border border-ink-200 bg-white p-5 soft-shadow">
      <div className="flex items-start justify-between">
        <span
          className="text-[11px] uppercase text-ink-500"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
        >
          {label}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${toneClass}`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
          >
            {icon}
          </span>
        </span>
      </div>
      <div
        className="text-primary-900"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "44px",
          lineHeight: "48px",
          fontWeight: 400,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Empty({ text }: Readonly<{ text: string }>) {
  return (
    <div className="rounded-[20px] border border-dashed border-ink-300 bg-white/60 p-12 text-center text-ink-500">
      {text}
    </div>
  );
}
