import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "./sidebar-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "super_admin") redirect("/login");

  const name = session?.user?.name ?? "Admin";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[260px] flex-col gap-8 border-r border-ink-950/40 bg-ink-950 p-6 md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-1">
          <Link href="/admin" className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-coral-300"
              style={{ fontSize: "26px" }}
            >
              menu_book
            </span>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "24px",
                lineHeight: "28px",
                color: "#EFEEEA",
              }}
            >
              Academic
            </span>
          </Link>
          <span
            className="text-[10px] uppercase text-ink-300"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}
          >
            Admin · v1
          </span>
        </div>

        <div className="relative z-10 flex-1">
          <SidebarNav />
        </div>

        <div className="relative z-10 flex flex-col gap-3 rounded-[16px] border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-300 text-[12px] font-semibold text-ink-950">
              {initials || "AD"}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-semibold text-white">
                {name}
              </span>
              <span
                className="text-[10px] uppercase text-coral-300"
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                {role === "super_admin" ? "Super admin" : "Admin"}
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-ink-200 bg-paper/80 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary-700"
              style={{ fontSize: "22px" }}
            >
              menu_book
            </span>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
              }}
              className="text-primary-900"
            >
              Academic
            </span>
          </Link>
          <LogoutButton />
        </div>
        <div className="border-t border-ink-200 px-2 py-2">
          <SidebarNav />
        </div>
      </header>

      <main className="md:ml-[260px]">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-12 md:py-14">
          {children}
        </div>
      </main>
    </div>
  );
}
