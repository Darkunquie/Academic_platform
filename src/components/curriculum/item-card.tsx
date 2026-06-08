"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ServerAction = (formData: FormData) => Promise<void>;

export function ItemCard({
  id,
  name,
  href,
  revalidate,
  renameAction,
  deleteAction,
  badge,
  icon = "folder",
}: {
  id: string;
  name: string;
  href?: string;
  revalidate: string;
  renameAction: ServerAction;
  deleteAction: ServerAction;
  badge?: React.ReactNode;
  icon?: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="overflow-hidden rounded-[16px] border border-ink-200 bg-white soft-shadow transition-all hover:-translate-y-0.5 hover:pop-shadow">
      <div className="h-1.5 w-full bg-primary-500" />
      <div className="flex flex-col gap-3 p-4">
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
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-100 text-primary-700">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  {icon}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                {href ? (
                  <Link
                    href={href}
                    className="block truncate text-[15px] font-semibold text-ink-900 hover:text-primary-700"
                  >
                    {name}
                  </Link>
                ) : (
                  <span className="block truncate text-[15px] font-semibold text-ink-900">
                    {name}
                  </span>
                )}
                {badge && <div className="mt-1">{badge}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-ink-100 pt-3">
              <Button variant="ghost" onClick={() => setEditing(true)}>
                Rename
              </Button>
              <form
                action={deleteAction}
                onSubmit={(e) => {
                  if (
                    !confirm(
                      "Delete this item? Everything nested under it is also deleted."
                    )
                  )
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
