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
import { youtubeEmbed } from "@/lib/youtube";
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
  const ringR = 42;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (completedCount / Math.max(1, totalCount)) * ringC;

  const md = content?.bodyHtml ?? "";
  const html = renderMarkdown(md);
  const plain = toPlainText(md);
  const embed = youtubeEmbed(content?.videoUrl);

  const pdfs = assets.filter((a) => a.kind === "pdf");
  const images = assets.filter((a) => a.kind === "image");

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#334155",
        fontFamily: "Geist, sans-serif",
      }}
    >
      <StudentHeader active="library" />

      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-10 px-4 pb-10 pt-4 md:px-6 md:pt-5 lg:flex-row">
        {/* LEFT — main reading column (OLD design) */}
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]">
            <Link
              href="/dashboard"
              className="text-solar-text/60 transition-colors hover:text-solar-amber"
            >
              My Subjects
            </Link>
            <Chev />
            <Link
              href={`/dashboard/subject/${topic.subjectId}`}
              className="text-solar-text/60 transition-colors hover:text-solar-amber"
            >
              {topic.subjectName}
            </Link>
            <Chev />
            <Link
              href={`/dashboard/chapter/${topic.chapterId}`}
              className="text-solar-text/60 transition-colors hover:text-solar-amber"
            >
              {topic.chapterName}
            </Link>
            <Chev />
            <span className="font-black text-solar-amber">{topic.name}</span>
          </nav>

          {/* TTS pill — white, scrolls with content */}
          {plain && (
            <div>
              <div className="rounded-full border border-solar-ink/25 bg-white/90 p-2 shadow-lg backdrop-blur-xl">
                <TtsReader text={plain} />
              </div>
            </div>
          )}

          {/* Hero — big headline */}
          <section className="flex flex-col gap-3">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-solar-amber">
              Topic · {topic.chapterName}
            </span>
            <h1
              className="text-solar-text-dark"
              style={{
                fontSize: "80px",
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
              }}
            >
              {topic.name}
            </h1>
          </section>

          {/* Video lesson */}
          {embed && (
            <section className="solar-card overflow-hidden rounded-xxl bg-black">
              <div
                className="relative w-full"
                style={{ aspectRatio: "16 / 9" }}
              >
                <iframe
                  src={embed}
                  title="Lesson video"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </section>
          )}

          {/* Article */}
          <article className="solar-card rounded-xxl bg-white p-8 md:p-12">
            <div
              className="solar-prose drop-cap"
              dangerouslySetInnerHTML={{
                __html:
                  html ||
                  "<p style='color:#586e75'>No content yet — check back soon.</p>",
              }}
            />

            {/* Images with VISUAL AID caption */}
            {images.length > 0 && (
              <section className="mt-10 flex flex-col gap-6">
                {images.map((a, i) => (
                  <figure
                    key={a.id}
                    className="relative overflow-hidden rounded-xl border border-solar-ink/25 bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/assets/${a.id}`}
                      alt={a.filename}
                      className="block max-h-[480px] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-solar-text-dark/60 to-transparent" />
                    <figcaption className="absolute bottom-4 left-4">
                      <span
                        className="rounded-full bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md"
                        style={{ fontFamily: "Geist Mono, monospace" }}
                      >
                        Visual Aid {String(i + 1).padStart(2, "0")}: {a.filename}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </section>
            )}

            {/* PDFs */}
            {pdfs.length > 0 && (
              <section className="mt-10 flex flex-col gap-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-amber">
                  Attachments
                </h4>
                {pdfs.map((a) => (
                  <article
                    key={a.id}
                    className="overflow-hidden rounded-xl border border-solar-ink/25"
                  >
                    <header className="flex items-center justify-between gap-4 border-b border-solar-card bg-slate-50 px-5 py-3">
                      <span className="flex items-center gap-3 truncate">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-solar-orange/10 text-solar-orange">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "20px" }}
                          >
                            picture_as_pdf
                          </span>
                        </span>
                        <span className="truncate text-sm font-bold text-solar-text-dark">
                          {a.filename}
                        </span>
                      </span>
                      <a
                        href={`/api/assets/${a.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "14px" }}
                        >
                          open_in_new
                        </span>
                        {" "}Open
                      </a>
                    </header>
                    <iframe
                      src={`/api/assets/${a.id}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                      title={a.filename}
                      className="h-[820px] w-full bg-slate-100"
                      loading="lazy"
                    />
                  </article>
                ))}
              </section>
            )}
          </article>

          {/* Prev/Next nav */}
          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-solar-card pt-8">
            {prevTopic ? (
              <Link
                href={`/dashboard/topic/${prevTopic.id}`}
                className="solar-card group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold text-solar-text-dark transition-all hover:-translate-y-0.5"
              >
                <span
                  className="material-symbols-outlined transition-transform group-hover:-translate-x-1"
                  style={{ fontSize: "18px" }}
                >
                  arrow_back
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-solar-text/60">
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
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <span className="flex flex-col items-end leading-tight">
                  <span className="text-[9px] tracking-[0.2em] text-blue-200">
                    Next Topic
                  </span>
                  <span className="normal-case tracking-normal">
                    {nextTopic.name}
                  </span>
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
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
              >
                Back to Chapter{" "}
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

        {/* RIGHT — sticky sidebar 320px (NEW design) */}
        <aside className="hidden w-full lg:block lg:w-80">
          <div className="sticky top-24 flex flex-col gap-6">
            {/* Module Progress ring */}
            <div className="solar-card rounded-xxl bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-text/60">
                  Module Progress
                </span>
                <span
                  className="text-sm font-black text-solar-amber"
                  style={{ fontFamily: "Geist Mono, monospace" }}
                >
                  {Math.round((completedCount / Math.max(1, totalCount)) * 100)}%
                </span>
              </div>
              <div className="mb-4 flex justify-center">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={ringR}
                      fill="transparent"
                      stroke="#eee8d5"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={ringR}
                      fill="transparent"
                      stroke="#b58900"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={ringC}
                      strokeDashoffset={ringOffset}
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 0.35s" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-solar-text-dark">
                      {String(completedCount).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-solar-text/60">
                      Of {String(totalCount).padStart(2, "0")} steps
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {siblings.slice(0, 3).map((t) => {
                  const v = progressMap.get(t.id)?.viewed || t.id === topicId;
                  const isCurrent = t.id === topicId;
                  if (isCurrent) {
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 text-[12px] font-bold text-solar-amber"
                      >
                        <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-solar-amber">
                          <div className="h-1.5 w-1.5 rounded-full bg-solar-amber" />
                        </div>
                        <span className="truncate">{t.name}</span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-[12px] text-solar-text/70"
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{
                          color: v ? "#10b981" : "#93a1a1",
                          fontVariationSettings: v ? "'FILL' 1" : undefined,
                        }}
                      >
                        {v ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className="truncate">{t.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contents */}
            <div className="solar-card rounded-xxl bg-white p-6">
              <h4 className="mb-4 border-b border-solar-card pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-solar-text/60">
                Contents
              </h4>
              <nav className="space-y-1">
                {siblings.map((t, i) => {
                  const active = t.id === topicId;
                  const viewed = progressMap.get(t.id)?.viewed || active;
                  let statusIcon;
                  if (active) {
                    statusIcon = (
                      <span
                        className="material-symbols-outlined text-[18px] text-solar-amber"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_circle
                      </span>
                    );
                  } else if (viewed) {
                    statusIcon = (
                      <span
                        className="material-symbols-outlined text-[18px] text-emerald-500"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    );
                  } else {
                    statusIcon = (
                      <span className="material-symbols-outlined text-[18px] text-solar-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
                        arrow_forward
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={t.id}
                      href={`/dashboard/topic/${t.id}`}
                      className={
                        "group flex items-center justify-between rounded-lg p-2 transition-colors " +
                        (active
                          ? "bg-solar-amber/15"
                          : "hover:bg-slate-100")
                      }
                    >
                      <span
                        className={
                          "truncate text-[13px] " +
                          (active
                            ? "font-bold text-solar-amber"
                            : "text-solar-text")
                        }
                      >
                        {String(i + 1).padStart(2, "0")} {t.name}
                      </span>
                      {statusIcon}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Action buttons — solid colored */}
            <div className="grid grid-cols-1 gap-3">
              <ActionButton
                href={`/dashboard/topic/${topicId}/test`}
                label="Mock Test"
                tag="Practice"
                icon="quiz"
                bg="#b58900"
              />
              <ActionButton
                href={`/dashboard/interview?topic=${topicId}`}
                label="Mock Interview"
                tag="Challenge"
                icon="record_voice_over"
                bg="#cb4b16"
              />
              {topic.isCoding ? (
                <ActionButton
                  href={`/dashboard/topic/${topicId}/coding`}
                  label="Coding"
                  tag="Practice"
                  icon="code"
                  bg="#073642"
                />
              ) : (
                <ActionButton
                  href={`/dashboard/topic/${topicId}/web`}
                  label="Web HTML"
                  tag="Resources"
                  icon="web"
                  bg="#10b981"
                />
              )}
            </div>

            {/* Back to chapter */}
            <Link
              href={`/dashboard/chapter/${topic.chapterId}`}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-solar-text-dark transition-all hover:border-blue-800 hover:bg-blue-800 hover:text-white"
            >
              <span
                className="material-symbols-outlined transition-transform group-hover:-translate-x-1"
                style={{ fontSize: "18px" }}
              >
                arrow_back
              </span>
              {" "}Back to Chapter
            </Link>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer
        className="mt-12 border-t border-white/10 py-16"
        style={{ backgroundColor: "#1e343a" }}
      >
        <div className="mx-auto flex w-full max-w-[1500px] flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <div className="text-center md:text-left">
            <span className="block text-2xl font-black tracking-tight text-white">
              PREPLYFLY.
            </span>
            <p className="text-xs text-white/60">
              © 2026 PREPLYFLY Academic Systems. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8">
            <Link
              href="/dashboard"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
            >
              Academic Integrity
            </Link>
            <Link
              href="/dashboard"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/dashboard/self-upload"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
            >
              Technical Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Chev() {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
      chevron_right
    </span>
  );
}

function ActionButton({
  href,
  label,
  tag,
  icon,
  bg,
}: Readonly<{
  href: string;
  label: string;
  tag: string;
  icon: string;
  bg: string;
}>) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl p-4 text-white transition-all hover:brightness-110 active:scale-95"
      style={{ backgroundColor: bg }}
    >
      <div className="text-left">
        <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
          {tag}
        </span>
        <span className="text-sm font-black">{label}</span>
      </div>
      <span className="material-symbols-outlined">{icon}</span>
    </Link>
  );
}
