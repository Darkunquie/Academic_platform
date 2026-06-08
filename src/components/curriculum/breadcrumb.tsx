import Link from "next/link";

export function Breadcrumb({
  items,
}: Readonly<{
  items: { label: string; href?: string }[];
}>) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {it.href ? (
            <Link
              href={it.href}
              className="transition-colors hover:text-primary-700"
            >
              {it.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-900">{it.label}</span>
          )}
          {i < items.length - 1 && (
            <span
              className="material-symbols-outlined text-ink-300"
              style={{ fontSize: "14px" }}
            >
              chevron_right
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
