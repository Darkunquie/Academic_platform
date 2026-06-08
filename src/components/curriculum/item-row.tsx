"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ServerAction = (formData: FormData) => Promise<void>;

export function ItemRow({
  id,
  name,
  href,
  revalidate,
  renameAction,
  deleteAction,
  badge,
}: {
  id: string;
  name: string;
  href?: string;
  revalidate: string;
  renameAction: ServerAction;
  deleteAction: ServerAction;
  badge?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      {editing ? (
        <form
          action={renameAction}
          className="flex flex-1 items-center gap-2"
          onSubmit={() => setEditing(false)}
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="revalidate" value={revalidate} />
          <Input name="name" defaultValue={name} autoFocus className="max-w-sm" />
          <Button type="submit">Save</Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <div className="flex flex-1 items-center gap-2">
            {href ? (
              <Link href={href} className="font-medium text-blue-700 hover:underline">
                {name}
              </Link>
            ) : (
              <span className="font-medium">{name}</span>
            )}
            {badge}
          </div>
          <div className="flex items-center gap-2">
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
    </li>
  );
}
