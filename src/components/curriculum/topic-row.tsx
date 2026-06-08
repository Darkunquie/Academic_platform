"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  renameTopicAction,
  deleteTopicAction,
} from "@/modules/curriculum/actions";

export function TopicRow({
  id,
  name,
  isCoding,
  href,
  revalidate,
  index,
}: Readonly<{
  id: string;
  name: string;
  isCoding: boolean;
  href: string;
  revalidate: string;
  index: number;
}>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [pending, start] = useTransition();

  async function rename() {
    if (!draft.trim() || draft === name) {
      setEditing(false);
      setDraft(name);
      return;
    }
    const fd = new FormData();
    fd.append("id", id);
    fd.append("name", draft.trim());
    fd.append("revalidate", revalidate);
    start(async () => {
      await renameTopicAction(fd);
      setEditing(false);
    });
  }

  async function remove() {
    if (!confirm(`Delete topic "${name}"? This removes its content and tests.`))
      return;
    const fd = new FormData();
    fd.append("id", id);
    fd.append("revalidate", revalidate);
    start(async () => {
      await deleteTopicAction(fd);
    });
  }

  const Quick = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: string;
    label: string;
  }) => (
    <Link
      href={href}
      className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-ink-200 bg-white px-2.5 text-[12px] font-medium text-ink-700 transition-colors hover:border-primary-500 hover:text-primary-700"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
        {icon}
      </span>
      {label}
    </Link>
  );

  return (
    <div className="group flex items-center gap-3 rounded-[16px] border border-ink-200 bg-white p-3 soft-shadow transition-colors hover:border-primary-200">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-paper text-[12px] font-semibold text-ink-700"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            disabled={pending}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={rename}
            onKeyDown={(e) => {
              if (e.key === "Enter") rename();
              if (e.key === "Escape") {
                setEditing(false);
                setDraft(name);
              }
            }}
            className="h-9 w-full rounded-[10px] border-[1.5px] border-primary-500 bg-white px-2.5 text-[14px] text-ink-900 outline-none ring-4 ring-primary-100"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="block w-full truncate text-left text-[15px] font-medium text-ink-900 transition-colors hover:text-primary-700"
            title="Click to rename"
          >
            {name}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Quick href={href} icon="edit_note" label="Content" />
        <Quick href={`${href}/test`} icon="quiz" label="Test" />
        {isCoding && (
          <Quick href={`${href}/coding`} icon="code" label="Coding" />
        )}
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-ink-200 bg-white text-ink-500 transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
          aria-label="Delete topic"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            delete
          </span>
        </button>
      </div>
    </div>
  );
}
