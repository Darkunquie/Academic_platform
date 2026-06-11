"use client";

import { useMemo, useState } from "react";

export function LangCheckboxes({
  options,
  defaultSelected,
  name = "lang",
}: Readonly<{
  options: { key: string; label: string }[];
  defaultSelected: string[];
  name?: string;
}>) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultSelected)
  );
  const allOn = useMemo(
    () => options.every((o) => selected.has(o.key)),
    [options, selected]
  );

  function toggleAll() {
    if (allOn) setSelected(new Set());
    else setSelected(new Set(options.map((o) => o.key)));
  }
  function toggleOne(k: string) {
    const next = new Set(selected);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setSelected(next);
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium">
        <input type="checkbox" checked={allOn} onChange={toggleAll} />
        Select all
      </label>
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <label key={o.key} className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              name={name}
              value={o.key}
              checked={selected.has(o.key)}
              onChange={() => toggleOne(o.key)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}
