import Link from "next/link";
import { DeleteAttemptButton } from "./delete-attempt-button";

type Attempt = {
  id: string;
  subject: string;
  topic: string;
  mode: "test" | "interview";
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
  correctCount: number;
  scorePct: number;
  createdAt: Date;
};

export function HistoryList({ items }: Readonly<{ items: Attempt[] }>) {
  if (items.length === 0) {
    return (
      <div className="rounded-xxl border border-dashed border-slate-300 bg-white p-6 text-center text-[13px] text-solar-text/60">
        No past attempts yet. Upload a PDF below to get started.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((a) => (
        <div
          key={a.id}
          className="solar-card flex flex-wrap items-center gap-3 rounded-xl bg-white p-4"
        >
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
              a.mode === "test"
                ? "bg-solar-amber/15 text-solar-amber"
                : "bg-solar-orange/15 text-solar-orange"
            }`}
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            {a.mode}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-black text-solar-text-dark">
              {a.subject} · {a.topic}
            </p>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.1em] text-solar-text/60"
              style={{ fontFamily: "Geist Mono, monospace" }}
            >
              {a.difficulty} · {a.totalQuestions} Qs ·{" "}
              {new Date(a.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-[12px] font-black text-emerald-700"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            {a.scorePct}%
          </span>
          <Link
            href={`/dashboard/self-upload/attempt/${a.id}`}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
          >
            Review
          </Link>
          <Link
            href={`/dashboard/self-upload/attempt/${a.id}/replay`}
            className="rounded-xl bg-blue-800 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-blue-700"
          >
            Replay
          </Link>
          <DeleteAttemptButton
            attemptId={a.id}
            label={`${a.subject} · ${a.topic}`}
          />
        </div>
      ))}
    </div>
  );
}
