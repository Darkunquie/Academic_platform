"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/approvals", label: "Approvals", icon: "verified_user" },
  { href: "/admin/curriculum", label: "Curriculum", icon: "menu_book" },
  { href: "/admin/analytics", label: "Analytics", icon: "monitoring" },
] as const;

export function SidebarNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] transition-all ${
              active
                ? "bg-primary-700 text-white font-semibold"
                : "text-ink-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {active && (
              <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-coral-500" />
            )}
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "20px",
                fontVariationSettings: active
                  ? "'FILL' 1"
                  : "'wght' 300",
              }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
