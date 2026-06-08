import Link from "next/link";
import { notFound } from "next/navigation";
import { inArray, and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { progress as progressTable } from "@/db/schema";
import { getTopicChain, listTopics } from "@/modules/curriculum/admin";
import {
  getTopicContent,
  listTopicAssets,
  markContentViewed,
} from "@/modules/content/service";
import { studentGradeId } from "@/modules/content/student";
import { renderMarkdown, toPlainText } from "@/lib/markdown";
import { TtsReader } from "@/components/tts-reader";
import { StudentHeader } from "@/components/student-header";

export const dynamic = "force-dynamic";

export default async function StudentTopicPage({
  params,
}: Readonly<{
  params: Promise<{ topicId: string }>;
}>) {
  const { topicId } = await params;
  const gradeId = await studentGradeId();
  const topic = await getTopicChain(topicId);

  if (!topic || !gradeId || topic.gradeId !== gradeId) notFound();

  const session = await auth();
  if (session?.user?.id) {
    await markContentViewed(session.user.id, topicId);
  }

  const [content, assets, siblings] = await Promise.all([
    getTopicContent(topicId),
    listTopicAssets(topicId),
    listTopics(topic.chapterId),
  ]);

  const studentId = session?.user?.id;
  const progressMap = new Map<
    string,
    { viewed: boolean; testBest: number | null; interviewBest: number | null }
  >();
  if (studentId && siblings.length > 0) {
    const rows = await db
      .select()
      .from(progressTable)
      .where(
        and(
          eq(progressTable.studentId, studentId),
          inArray(
            progressTable.topicId,
            siblings.map((t) => t.id)
          )
        )
      );
    for (const r of rows) {
      progressMap.set(r.topicId, {
        viewed: !!r.contentViewed,
        testBest: r.testBest as number | null,
        interviewBest: r.interviewBest as number | null,
      });
    }
  }

  const currentIdx = siblings.findIndex((t) => t.id === topicId);
  const prevTopic = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextTopic =
    currentIdx >= 0 && currentIdx < siblings.length - 1
      ? siblings[currentIdx + 1]
      : null;
  const completedCount = siblings.filter((t) =>
    t.id === topicId ? true : progressMap.get(t.id)?.viewed
  ).length;
  const totalCount = siblings.length;
  const pctComplete = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const md = content?.bodyHtml ?? "";
  const html = renderMarkdown(md);
  const plain = toPlainText(md);

  const pdfs = assets.filter((a) => a.kind === "pdf");
  const images = assets.filter((a) => a.kind === "image");

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <div className="dotted-pattern absolute inset-0 opacity-40" />

      <div className="relative z-10">
        <StudentHeader active="library" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-24 pt-6 md:px-10 md:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary-700"
          >
            My subjects
          </Link>
          <Chev />
          <Link
            href={`/dashboard/subject/${topic.subjectId}`}
            className="transition-colors hover:text-primary-700"
          >
            {topic.subjectName}
          </Link>
          <Chev />
          <Link
            href={`/dashboard/chapter/${topic.chapterId}`}
            className="transition-colors hover:text-primary-700"
          >
            {topic.chapterName}
          </Link>
          <Chev />
          <span className="font-medium text-ink-900">{topic.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — main reading column */}
          <div className="flex min-w-0 flex-col">
            {plain && (
              <div className="sticky top-4 z-30 mb-8 flex justify-start">
                <TtsReader text={plain} />
              </div>
            )}

            <section className="relative mb-10">
              <div
                className="shape-float absolute -top-8 right-0 h-24 w-24 rounded-full bg-coral-300 opacity-20 blur-2xl"
                style={{ animationDelay: "0s" }}
              />
              <p
                className="mb-3 text-[11px] uppercase text-ink-500"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                Topic · {topic.chapterName}
              </p>
              <h1
                className="text-primary-900"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "60px",
                  lineHeight: "64px",
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                }}
              >
                <span className="hand-drawn-underline">{topic.name}</span>
              </h1>
            </section>

            <article
              className="reading-prose"
              dangerouslySetInnerHTML={{
                __html:
                  html ||
                  "<p style='color:#6B7280'>No content yet — check back soon.</p>",
              }}
            />

            {images.length > 0 && (
              <section className="mt-12 grid gap-4 sm:grid-cols-2">
                {images.map((a) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <figure
                    key={a.id}
                    className="overflow-hidden rounded-[20px] border border-ink-200 bg-white soft-shadow"
                  >
                    <img
                      src={`/api/assets/${a.id}`}
                      alt={a.filename}
                      className="block w-full"
                    />
                    <figcaption
                      className="px-4 py-3 text-[12px] text-ink-500"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {a.filename}
                    </figcaption>
                  </figure>
                ))}
              </section>
            )}

            {pdfs.length > 0 && (
              <section className="mt-12 flex flex-col gap-6">
                <p
                  className="text-[11px] uppercase text-ink-500"
                  style={{
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.12em",
                  }}
                >
                  Attachments
                </p>
                {pdfs.map((a) => (
                  <article
                    key={a.id}
                    className="overflow-hidden rounded-[20px] border border-ink-200 bg-white soft-shadow"
                  >
                    <header className="flex items-center justify-between gap-4 border-b border-ink-200 bg-paper px-5 py-3">
                      <span className="flex items-center gap-3 truncate">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-coral-100 text-coral-700">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "20px" }}
                          >
                            picture_as_pdf
                          </span>
                        </span>
                        <span className="truncate text-[14px] font-semibold text-ink-900">
                          {a.filename}
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/assets/${a.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-ink-200 bg-white px-3 text-[12px] font-medium text-ink-700 transition-colors hover:border-primary-500 hover:text-primary-700"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            open_in_new
                          </span>
                          Full screen
                        </a>
                        <a
                          href={`/api/assets/${a.id}?download=1`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary-700 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-primary-900"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            download
                          </span>
                          Download
                        </a>
                      </div>
                    </header>
                    <iframe
                      src={`/api/assets/${a.id}#toolbar=1&navpanes=0&view=FitH`}
                      title={a.filename}
                      className="h-[820px] w-full bg-ink-100"
                      loading="lazy"
                    />
                  </article>
                ))}
              </section>
            )}

            <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-8">
              {prevTopic ? (
                <Link
                  href={`/dashboard/topic/${prevTopic.id}`}
                  className="group inline-flex items-center gap-2 rounded-[14px] border border-ink-200 bg-white px-4 py-2.5 text-[13px] font-medium text-ink-900 transition-all hover:-translate-y-0.5 hover:border-primary-500 hover:pop-shadow"
                >
                  <span
                    className="material-symbols-outlined transition-transform group-hover:-translate-x-1"
                    style={{ fontSize: "18px" }}
                  >
                    arrow_back
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span
                      className="text-[10px] uppercase text-ink-500"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Previous
                    </span>
                    <span>{prevTopic.name}</span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {nextTopic ? (
                <Link
                  href={`/dashboard/topic/${nextTopic.id}`}
                  className="group inline-flex items-center gap-2 rounded-[14px] bg-primary-700 px-5 py-3 text-[13px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow"
                >
                  <span className="flex flex-col items-end leading-tight">
                    <span
                      className="text-[10px] uppercase text-primary-100"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Next topic
                    </span>
                    <span>{nextTopic.name}</span>
                  </span>
                  <span
                    className="material-symbols-outlined transition-transform group-hover:translate-x-1"
                    style={{ fontSize: "18px" }}
                  >
                    arrow_forward
                  </span>
                </Link>
              ) : (
                <Link
                  href={`/dashboard/chapter/${topic.chapterId}`}
                  className="group inline-flex items-center gap-2 rounded-[14px] bg-primary-700 px-5 py-3 text-[13px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow"
                >
                  Back to chapter
                  <span
                    className="material-symbols-outlined transition-transform group-hover:translate-x-1"
                    style={{ fontSize: "18px" }}
                  >
                    arrow_forward
                  </span>
                </Link>
              )}
            </footer>
          </div>

          {/* RIGHT — sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 flex flex-col gap-5">
              {/* Progress ring + chapter label */}
              <div className="rounded-[20px] border border-ink-200 bg-white p-5 soft-shadow">
                <div className="flex items-center gap-4">
                  <ProgressRing pct={pctComplete} />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[10px] uppercase text-ink-500"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Chapter progress
                    </p>
                    <p className="mt-1 truncate text-[15px] font-semibold text-ink-900">
                      {topic.chapterName}
                    </p>
                    <p
                      className="text-[12px] text-ink-500"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {completedCount} of {totalCount} viewed
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/dashboard/topic/${topicId}/test`}
                  className="group inline-flex items-center gap-3 rounded-[14px] border border-ink-200 bg-white px-4 py-3 text-[14px] font-semibold text-ink-900 transition-all hover:-translate-y-0.5 hover:border-primary-500 hover:pop-shadow"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-100 text-primary-700">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px" }}
                    >
                      quiz
                    </span>
                  </span>
                  Mock test
                  <span
                    className="material-symbols-outlined ml-auto text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-primary-700"
                    style={{ fontSize: "18px" }}
                  >
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href={`/dashboard/interview?topic=${topicId}`}
                  className="group inline-flex items-center gap-3 rounded-[14px] border border-ink-200 bg-white px-4 py-3 text-[14px] font-semibold text-ink-900 transition-all hover:-translate-y-0.5 hover:border-coral-300 hover:pop-shadow"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-coral-100 text-coral-700">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px" }}
                    >
                      record_voice_over
                    </span>
                  </span>
                  Mock interview
                  <span
                    className="material-symbols-outlined ml-auto text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-coral-700"
                    style={{ fontSize: "18px" }}
                  >
                    arrow_forward
                  </span>
                </Link>
                {topic.isCoding && (
                  <Link
                    href={`/dashboard/topic/${topicId}/coding`}
                    className="group inline-flex items-center gap-3 rounded-[14px] border border-ink-200 bg-white px-4 py-3 text-[14px] font-semibold text-ink-900 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:pop-shadow"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-100 text-indigo-500">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px" }}
                      >
                        code
                      </span>
                    </span>
                    Coding
                    <span
                      className="material-symbols-outlined ml-auto text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-500"
                      style={{ fontSize: "18px" }}
                    >
                      arrow_forward
                    </span>
                  </Link>
                )}
              </div>

              {/* Chapter TOC */}
              <div className="rounded-[20px] border border-ink-200 bg-white soft-shadow">
                <div className="border-b border-ink-200 px-5 py-3">
                  <p
                    className="text-[10px] uppercase text-ink-500"
                    style={{
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    In this chapter
                  </p>
                </div>
                <ul className="flex max-h-[480px] flex-col overflow-y-auto p-2">
                  {siblings.map((t, i) => {
                    const active = t.id === topicId;
                    const viewed = progressMap.get(t.id)?.viewed || active;
                    return (
                      <li key={t.id}>
                        <Link
                          href={`/dashboard/topic/${t.id}`}
                          className={`group flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition-colors ${
                            active
                              ? "bg-primary-100 text-primary-900"
                              : "text-ink-700 hover:bg-paper hover:text-ink-900"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                              viewed
                                ? "bg-primary-700 text-white"
                                : "border border-ink-300 text-ink-500"
                            }`}
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {viewed ? "✓" : String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`truncate ${active ? "font-semibold" : ""}`}
                          >
                            {t.name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Up a level */}
              <Link
                href={`/dashboard/chapter/${topic.chapterId}`}
                className="group inline-flex items-center justify-center gap-2 rounded-[14px] border border-ink-200 bg-white px-4 py-2.5 text-[12px] uppercase text-ink-700 transition-colors hover:border-primary-500 hover:text-primary-700"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px" }}
                >
                  arrow_upward
                </span>
                Back to chapter
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Chev() {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
      chevron_right
    </span>
  );
}

function ProgressRing({ pct }: Readonly<{ pct: number }>) {
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E2E4E8"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#155E45"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 400ms ease-out" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
        fill="#0B3D2E"
        fontSize="14"
        fontFamily="Geist Mono, monospace"
        fontWeight="600"
      >
        {pct}%
      </text>
    </svg>
  );
}
