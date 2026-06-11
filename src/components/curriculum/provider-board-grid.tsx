"use client";

import { useMemo, useState } from "react";
import { ProviderCard } from "./provider-card";

type ServerAction = (formData: FormData) => Promise<void>;
type Item = { id: string; name: string; kind: string; state: string | null };

const NATIONAL = "__national__";

export function ProviderBoardGrid({
  items,
  path,
  hrefBase,
  renameAction,
  deleteAction,
}: {
  items: Item[];
  path: string;
  hrefBase: string;
  renameAction: ServerAction;
  deleteAction: ServerAction;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { states, hasNational } = useMemo(() => {
    const s = new Set<string>();
    let national = false;
    for (const it of items) {
      if (it.state) s.add(it.state);
      else national = true;
    }
    return { states: [...s].sort(), hasNational: national };
  }, [items]);

  const filtered = useMemo(() => {
    if (selected.size === 0) return items;
    return items.filter((it) =>
      it.state ? selected.has(it.state) : selected.has(NATIONAL)
    );
  }, [items, selected]);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const chip = (active: boolean) =>
    active
      ? "rounded-full bg-primary-700 px-3 py-1.5 text-[13px] font-medium text-white"
      : "rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[13px] text-ink-700 hover:bg-paper";

  return (
    <div>
      {/* Filter bar */}
      {(states.length > 0 || hasNational) && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className="mr-1 text-[11px] text-ink-500"
            style={{ fontFamily: "var(--font-mono)", }}
          >
            Filter by state
          </span>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className={chip(selected.size === 0)}
          >
            All
          </button>
          {hasNational && (
            <button
              type="button"
              onClick={() => toggle(NATIONAL)}
              className={chip(selected.has(NATIONAL))}
            >
              National
            </button>
          )}
          {states.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => toggle(st)}
              className={chip(selected.has(st))}
            >
              {st}
            </button>
          ))}
          {selected.size > 0 && (
            <span className="ml-1 text-[12px] text-ink-500">
              {filtered.length} shown
            </span>
          )}
        </div>
      )}

      {/* Cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProviderCard
            key={p.id}
            id={p.id}
            name={p.name}
            href={`${hrefBase}/${p.id}`}
            kind={p.kind}
            state={p.state}
            revalidate={path}
            renameAction={renameAction}
            deleteAction={deleteAction}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-5 rounded-[18px] border border-dashed border-ink-300 p-10 text-center text-ink-500">
          No boards match the selected state(s).
        </div>
      )}
    </div>
  );
}
