"use client";

import { deleteSelfAttemptAction } from "@/modules/self-upload/actions";

export function DeleteAttemptButton({
  attemptId,
  label,
}: Readonly<{ attemptId: string; label: string }>) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        `Delete attempt "${label}"? This cannot be undone.`
      )
    ) {
      e.preventDefault();
    }
  }
  return (
    <form action={deleteSelfAttemptAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={attemptId} />
      <button
        type="submit"
        className="rounded-xl border border-solar-orange/40 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-solar-orange transition-colors hover:bg-solar-orange/10"
      >
        Delete
      </button>
    </form>
  );
}
