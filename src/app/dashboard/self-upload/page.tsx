import Link from "next/link";
import { auth } from "@/auth";
import { StudentHeader } from "@/components/student-header";
import { SelfUploadFlow } from "@/components/self-upload/self-upload-flow";
import { HistoryList } from "@/components/self-upload/history-list";
import { listSelfAttempts } from "@/modules/self-upload/service";

export const dynamic = "force-dynamic";

export default async function SelfUploadPage() {
  const session = await auth();
  const studentId = session?.user?.id;
  const history = studentId ? await listSelfAttempts(studentId) : [];
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

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-24 pt-4 md:px-6 md:pt-5">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[14px] font-black text-solar-text/60">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-solar-amber"
          >
            My Subjects
          </Link>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "14px" }}
          >
            chevron_right
          </span>
          <span className="text-solar-text-dark">Self Upload</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <p className="mb-3 text-[14px] font-black text-solar-amber">
            Self Upload · Practice Your Own Material
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-solar-text-dark md:text-6xl">
            Bring your own PDF.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-solar-text">
            Upload any text-based PDF. We generate a mock test or interview from
            it, save the result to your history, and let you replay or review
            anytime.
          </p>
        </header>

        {history.length > 0 && (
          <section className="mb-10">
            <h2
              className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-solar-text/60"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              Your History · {history.length} attempt{history.length === 1 ? "" : "s"}
            </h2>
            <HistoryList items={history} />
          </section>
        )}

        <div className="solar-card rounded-xxl bg-white p-6 md:p-8">
          <SelfUploadFlow />
        </div>
      </main>
    </div>
  );
}
