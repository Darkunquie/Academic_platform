import Link from "next/link";
import { auth } from "@/auth";
import { getGradeChain, listSubjects } from "@/modules/curriculum/admin";
import { LogoutButton } from "@/components/logout-button";

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
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const gradeId = user?.role === "student" ? user.gradeId : null;
  const grade = gradeId ? await getGradeChain(gradeId) : null;
  const subjects = gradeId ? await listSubjects(gradeId) : [];
  const codingCount = subjects.filter((s) => s.isCoding).length;
  const readingCount = subjects.length - codingCount;
  const featured = subjects[0];
  const feedItems = subjects.slice(1, 6);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#334155",
        fontFamily: "Geist, sans-serif",
      }}
    >
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-300 bg-slate-50/90 px-4 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="flex items-center gap-4">
            <svg width="40" height="40" viewBox="0 0 32 32" className="shrink-0">
              <rect width="32" height="32" rx="7" fill="#155E45" />
              <path d="M6 16.8 25 6.5 17.4 25.5l-3.2-7.2-8.2-1.5Z" fill="#F6A488" />
              <path d="M14.2 18.3 25 6.5l-10 14.6-.8-2.8Z" fill="#C9462C" />
            </svg>
            <span className="text-2xl font-black tracking-tighter text-solar-text-dark">
              preplyfly
            </span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="/dashboard"
              className="border-b-2 border-blue-800 pb-1 text-sm font-bold text-blue-800"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard#subjects"
              className="text-sm font-bold text-solar-text transition-colors hover:text-solar-amber"
            >
              Subjects
            </Link>
            <Link
              href="/dashboard/interview"
              className="text-sm font-bold text-solar-text transition-colors hover:text-solar-amber"
            >
              Mock Interview
            </Link>
            <Link
              href="/dashboard/self-upload"
              className="text-sm font-bold text-solar-text transition-colors hover:text-solar-amber"
            >
              Self Upload
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          {grade && (
            <div className="hidden w-64 items-center rounded-full border border-solar-ink/20 bg-solar-card px-4 py-2 md:flex">
              <span className="material-symbols-outlined mr-2 text-sm text-solar-amber">
                school
              </span>
              <span className="truncate text-sm font-semibold text-solar-text-dark">
                {grade.name} · {grade.providerName}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-solar-amber p-0.5">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-solar-text-dark text-[11px] font-black text-white">
                {initials || "?"}
              </span>
            </div>
            <div className="hidden lg:block">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-10 pt-4 md:px-6 md:pt-5">
        {/* Welcome */}
        <section className="mb-10 flex flex-col gap-3">
          <p
            className="text-[14px] font-bold"
            style={{
              color: "#073642",
              fontFamily: "Geist, sans-serif",
            }}
          >
            Welcome back, {firstName}
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-solar-text-dark md:text-6xl">
            Pick up where you left.
          </h1>
          <p className="max-w-xl text-[15px] text-solar-text">
            Read, listen, drill, and rehearse — your library is below.
          </p>
        </section>

        {/* Command Bar (Primary Metrics) */}
        <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Subjects */}
          <div className="solar-card flex h-40 flex-col justify-between rounded-xxl border-t-4 border-t-blue-800 bg-white p-6">
            <div className="solar-scanline" />
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-black uppercase tracking-wide text-solar-text-dark">
                Subjects
              </span>
              <span className="material-symbols-outlined text-solar-amber">
                auto_stories
              </span>
            </div>
            <div>
              <div className="text-5xl font-black tracking-tighter text-solar-text-dark">
                {subjects.length}
              </div>
              <div className="mt-1 text-[10px] font-bold text-emerald-600">
                {subjects.length === 1 ? "1 subject live" : `${subjects.length} subjects live`}
              </div>
            </div>
          </div>

          {/* Coding Tracks */}
          <div className="solar-card flex h-40 flex-col justify-between rounded-xxl border-t-4 border-t-solar-orange bg-white p-6">
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-black uppercase tracking-wide text-solar-text-dark">
                Coding Tracks
              </span>
              <span className="material-symbols-outlined text-solar-orange">
                code
              </span>
            </div>
            <div>
              <div className="text-5xl font-black tracking-tighter text-solar-text-dark">
                {codingCount}
              </div>
              <div className="avatar-stack mt-2 flex items-center">
                <span className="bg-solar-amber text-[9px] font-black text-white">
                  R{readingCount}
                </span>
                <span className="bg-solar-orange text-[9px] font-black text-white">
                  C{codingCount}
                </span>
                <span className="border border-solar-orange/20 bg-solar-orange/10 text-[10px] font-bold text-solar-orange">
                  {subjects.length}
                </span>
              </div>
            </div>
          </div>

          {/* Active Class */}
          <div className="solar-card flex h-40 flex-col justify-between rounded-xxl border-t-4 border-t-solar-text-dark bg-white p-6">
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-black uppercase tracking-wide text-solar-text-dark">
                Active Class
              </span>
              <span className="material-symbols-outlined text-solar-text-dark">
                school
              </span>
            </div>
            <div>
              <div className="text-3xl font-black tracking-tighter text-solar-text-dark">
                {grade?.name ?? "—"}
              </div>
              <div className="mt-2 truncate text-[10px] font-bold text-solar-text/60">
                {grade?.providerName ?? "No class assigned"}
              </div>
            </div>
          </div>

          {/* Network Health */}
          <div className="solar-card flex h-40 flex-col justify-between rounded-xxl border-t-4 border-t-emerald-500 bg-white p-6">
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-black uppercase tracking-wide text-solar-text-dark">
                Network Health
              </span>
              <span className="material-symbols-outlined text-emerald-500">
                monitor_heart
              </span>
            </div>
            <div>
              <div className="text-3xl font-black tracking-tighter text-solar-text-dark">
                ONLINE
              </div>
              <div className="mt-1 text-[10px] font-bold text-solar-text/60">
                Optimal range
              </div>
            </div>
          </div>
        </section>

        {/* 2/3 + 1/3 layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Activity Hub */}
          <section className="flex flex-col gap-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-solar-card pb-4">
              <h2 className="text-lg font-black italic text-solar-text-dark">
                Your Library
              </h2>
              <div className="flex gap-4">
                <Link
                  href="/dashboard#subjects"
                  className="rounded-xl bg-blue-800 px-6 py-3 text-xs font-black text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
                >
                  ALL_SUBJECTS
                </Link>
                <Link
                  href="/dashboard/interview"
                  className="rounded-xl bg-blue-800 px-6 py-3 text-xs font-black text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
                >
                  REHEARSE
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Hero: AI Mock Interview */}
              <div className="solar-card group relative rounded-xxl border-2 border-solar-amber/20 bg-white p-8">
                <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex h-24 w-24 flex-shrink-0 rotate-3 items-center justify-center rounded-2xl bg-solar-amber text-white shadow-xl transition-transform group-hover:rotate-0">
                    <span
                      className="material-symbols-outlined font-bold"
                      style={{ fontSize: "48px" }}
                    >
                      record_voice_over
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-[10px] font-black text-solar-amber">
                        AI Mock Interview
                      </span>
                      <span className="text-[10px] font-bold text-solar-text/40">
                        • RUBRIC-SCORED
                      </span>
                    </div>
                    <h3 className="mb-3 text-3xl font-black text-solar-text-dark">
                      Rehearse aloud.
                    </h3>
                    <p className="max-w-xl leading-relaxed text-solar-text">
                      Speak through a topic with an AI examiner — get
                      rubric-scored feedback in real time.
                    </p>
                    <div className="mt-8 flex gap-4">
                      <Link
                        href="/dashboard/interview"
                        className="rounded-xl bg-blue-800 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
                      >
                        Start Interview
                      </Link>
                      <Link
                        href="/dashboard/self-upload"
                        className="rounded-xl bg-blue-800 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
                      >
                        Self Upload
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects Anchor */}
              <div id="subjects" className="-mt-2 scroll-mt-24" />

              {/* Subjects Feed */}
              {!gradeId ? (
                <Empty text="No class assigned to this account." />
              ) : subjects.length === 0 ? (
                <Empty text="No subjects published for your class yet." />
              ) : (
                <>
                  {featured && (
                    <Link
                      href={`/dashboard/subject/${featured.id}`}
                      className="solar-card flex items-center gap-6 rounded-xxl bg-white p-6"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          featured.isCoding
                            ? "bg-solar-orange/10 text-solar-orange"
                            : "bg-solar-amber/10 text-solar-amber"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {iconFor(featured.name)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-solar-text-dark">
                              {featured.name}
                            </h4>
                            <p className="text-xs text-solar-text">
                              {featured.isCoding
                                ? "Coding track · drill problems, ship code."
                                : "Reading track · read, listen, recall."}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-solar-text/40">
                            {featured.isCoding ? "CODE" : "READ"}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-emerald-600">
                        verified
                      </span>
                    </Link>
                  )}
                  {feedItems.map((s) => (
                    <Link
                      key={s.id}
                      href={`/dashboard/subject/${s.id}`}
                      className="solar-card flex items-center gap-6 rounded-xxl bg-white p-6"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          s.isCoding
                            ? "bg-solar-orange/10 text-solar-orange"
                            : "bg-solar-amber/10 text-solar-amber"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {iconFor(s.name)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-solar-text-dark">
                              {s.name}
                            </h4>
                            <p className="text-xs text-solar-text">
                              {s.isCoding
                                ? "Coding track · drill problems, ship code."
                                : "Reading track · read, listen, recall."}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-solar-text/40">
                            {s.isCoding ? "CODE" : "READ"}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-emerald-600">
                        verified
                      </span>
                    </Link>
                  ))}
                  {subjects.length > 6 && (
                    <div className="solar-card flex items-center justify-center gap-2 rounded-xxl bg-white p-6 text-xs font-black text-solar-text-dark">
                      Showing 6 of {subjects.length} subjects
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Right Sidebar */}
          <section className="flex flex-col gap-6 lg:col-span-1">
            <div className="solar-card relative flex flex-col gap-6 rounded-xxl bg-white p-8">
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-solar-amber/5 blur-3xl" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-solar-text/60">
                  Student Node
                </span>
                <span className="rounded bg-solar-amber/10 px-2 py-1 text-[9px] font-black text-solar-amber">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-solar-text-dark text-2xl font-black text-white">
                  {initials || "?"}
                </span>
                <div>
                  <div className="text-2xl font-black text-solar-text-dark">
                    {firstName}
                  </div>
                  <div className="text-[11px] font-bold text-solar-text">
                    {grade?.name ?? "Unassigned"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-solar-card/50 p-3">
                  <div className="text-[9px] font-black text-solar-text/60">
                    Subjects
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-solar-text-dark">
                    {subjects.length}
                  </div>
                </div>
                <div className="rounded-xl bg-solar-card/50 p-3">
                  <div className="text-[9px] font-black text-solar-text/60">
                    Coding
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-solar-text-dark">
                    {codingCount}
                  </div>
                </div>
              </div>
              <p className="border-l-2 border-solar-amber/20 pl-4 text-sm font-bold italic leading-relaxed text-solar-text">
                &ldquo;Pick a subject, open a chapter, drill a topic.
                Compounding clarity outranks cramming.&rdquo;
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-solar-card pt-6">
                <span className="text-[10px] font-bold text-solar-text">
                  {grade?.providerName ?? "—"}
                </span>
                <Link
                  href="/dashboard/interview"
                  className="rounded-xl bg-blue-800 px-6 py-3 text-xs font-black text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
                >
                  Rehearse
                </Link>
              </div>
            </div>

            {/* Verification Card */}
            <div className="solar-card rounded-xxl border-l-8 border-l-emerald-500 bg-emerald-50/30 p-8">
              <div className="mb-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-emerald-600">
                  verified
                </span>
                <span className="text-[10px] font-black text-emerald-800">
                  Curriculum Synced
                </span>
              </div>
              <p className="text-sm font-medium italic text-emerald-900">
                &ldquo;{grade?.name ?? "Class"} curriculum aligned. All
                published subjects authorized for your account.&rdquo;
              </p>
            </div>

            {/* Cohort Pulse Accent */}
            <div className="solar-card relative flex h-48 items-center justify-center overflow-hidden rounded-xxl">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #cb4b16 0%, #b58900 100%)",
                }}
              />
              <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                <span className="mb-2 text-[10px] font-black text-white">
                  Cohort Pulse
                </span>
                <span className="text-lg font-bold leading-tight text-white">
                  Read, listen, drill, rehearse — daily compounding wins.
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto flex w-full flex-col items-center justify-between border-t border-slate-300 bg-slate-200/50 px-4 py-16 md:flex-row md:px-6">
        <div className="mb-8 flex flex-col gap-3 md:mb-0">
          <div className="text-4xl font-bold text-solar-text-dark">
            Preplyfly
          </div>
          <p className="text-sm font-bold text-solar-text/70">
            v1.0.0 — Read · Listen · Drill · Rehearse
          </p>
          <p className="text-[15px] font-semibold text-solar-text/80">
            © {new Date().getFullYear()}{" "}
            <a
              href="https://alphabetmobility.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-solar-text-dark underline decoration-solar-amber/40 underline-offset-2 transition-colors hover:text-solar-amber hover:decoration-solar-amber"
            >
              Alphabet Mobility
            </a>
            . All rights reserved.
          </p>
        </div>
        <div className="flex gap-12">
          <Link
            href="/dashboard"
            className="text-sm font-black text-solar-text transition-colors hover:text-solar-amber"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/interview"
            className="text-sm font-black text-solar-text transition-colors hover:text-solar-amber"
          >
            Interview
          </Link>
          <Link
            href="/dashboard/self-upload"
            className="text-sm font-black text-solar-text transition-colors hover:text-solar-amber"
          >
            Self Upload
          </Link>
        </div>
      </footer>

      {/* Sync status badge (fixed). Hidden on mobile so it doesn't crowd content. */}
      <div className="fixed bottom-8 left-8 z-50 hidden items-center gap-3 rounded-full border border-white/10 bg-solar-text-dark px-5 py-2.5 text-[10px] font-black text-white shadow-2xl md:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        SYNC_CONNECTED
      </div>
    </div>
  );
}

function Empty({ text }: Readonly<{ text: string }>) {
  return (
    <div className="solar-card rounded-xxl border-dashed bg-white p-12 text-center text-solar-text">
      {text}
    </div>
  );
}
