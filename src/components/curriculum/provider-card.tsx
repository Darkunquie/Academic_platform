"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { landmarkFor } from "@/lib/state-landmarks";

type ServerAction = (formData: FormData) => Promise<void>;

export function ProviderCard({
  id,
  name,
  href,
  kind,
  state,
  revalidate,
  renameAction,
  deleteAction,
}: {
  id: string;
  name: string;
  href: string;
  kind: string;
  state: string | null;
  revalidate: string;
  renameAction: ServerAction;
  deleteAction: ServerAction;
}) {
  const [editing, setEditing] = useState(false);
  const lm = landmarkFor(state);

  return (
    <div className="overflow-hidden rounded-[18px] border border-ink-200 bg-white soft-shadow transition-all hover:-translate-y-0.5 hover:pop-shadow">
      {/* Landmark poster */}
      <Link
        href={href}
        className="relative flex h-24 items-end overflow-hidden p-3"
        style={{
          background: `linear-gradient(135deg, ${lm.from}, ${lm.to})`,
        }}
      >
        <span
          className="absolute -right-2 -top-3 select-none opacity-90"
          style={{ fontSize: "72px", lineHeight: 1 }}
        >
          {lm.emoji}
        </span>
        <span
          className="relative z-10 text-[11px] font-semibold uppercase text-white/90"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
        >
          {lm.landmark}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5">
        {editing ? (
          <form
            action={renameAction}
            className="flex flex-col gap-2"
            onSubmit={() => setEditing(false)}
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="revalidate" value={revalidate} />
            <Input name="name" defaultValue={name} autoFocus />
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <Link
                href={href}
                className="text-[17px] font-semibold text-ink-900 hover:text-primary-700"
              >
                {name}
              </Link>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] text-ink-500">
                  {kind}
                </span>
                <span
                  className={
                    state
                      ? "rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-700"
                      : "rounded-full bg-coral-100 px-2 py-0.5 text-[11px] font-medium text-coral-700"
                  }
                >
                  {state ?? "National"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setEditing(true)}>
                Rename
              </Button>
              <form
                action={deleteAction}
                onSubmit={(e) => {
                  if (!confirm("Delete this board and everything under it?"))
                    e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="revalidate" value={revalidate} />
                <Button type="submit" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
