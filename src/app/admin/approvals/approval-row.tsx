"use client";

import { useTransition } from "react";
import { approveAction, rejectAction } from "./actions";

export function ApprovalActions({ studentId }: Readonly<{ studentId: string }>) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => approveAction(studentId))}
        className="group inline-flex items-center gap-1.5 rounded-[12px] bg-primary-700 px-4 py-2 text-[13px] font-semibold text-white soft-shadow transition-all hover:-translate-y-0.5 hover:bg-primary-900 hover:pop-shadow disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "16px" }}
        >
          check
        </span>
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => rejectAction(studentId))}
        className="inline-flex items-center gap-1.5 rounded-[12px] border border-ink-200 bg-white px-4 py-2 text-[13px] font-semibold text-coral-700 transition-all hover:-translate-y-0.5 hover:border-coral-300 hover:bg-coral-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "16px" }}
        >
          close
        </span>
        Reject
      </button>
    </div>
  );
}
