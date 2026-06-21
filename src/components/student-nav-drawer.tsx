"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  key: "dashboard" | "interview" | "library" | "self-upload";
};

const ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", key: "dashboard" },
  { href: "/dashboard#subjects", label: "Subjects", icon: "library_books", key: "library" },
  { href: "/dashboard/interview", label: "Mock Interview", icon: "record_voice_over", key: "interview" },
  { href: "/dashboard/self-upload", label: "Self Upload", icon: "upload_file", key: "self-upload" },
];

export function StudentNavDrawer({
  active,
  gradeLabel,
  userName,
  initials,
}: Readonly<{
  active?: "dashboard" | "interview" | "library" | "self-upload";
  gradeLabel?: string;
  userName?: string;
  initials: string;
}>) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-solar-text-dark transition-colors hover:bg-solar-card lg:hidden"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
          menu
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
          />
          <aside
            className="fixed right-0 top-0 z-[70] flex h-full w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-solar-text-dark text-[11px] font-black text-white">
                  {initials || "?"}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-solar-text-dark">
                    {userName ?? "Account"}
                  </div>
                  {gradeLabel && (
                    <div className="truncate text-[11px] font-semibold text-solar-text/70">
                      {gradeLabel}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-solar-card"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                  close
                </span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {ITEMS.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={
                          isActive
                            ? "flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800"
                            : "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-solar-text-dark transition-colors hover:bg-solar-card"
                        }
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "20px" }}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-slate-200 px-5 py-4">
              <LogoutButton />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
