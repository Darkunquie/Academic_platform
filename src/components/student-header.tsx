import Link from "next/link";
import { auth } from "@/auth";
import { getGradeChain } from "@/modules/curriculum/admin";
import { LogoutButton } from "./logout-button";

export async function StudentHeader({
  active,
}: Readonly<{ active?: "dashboard" | "interview" | "library" }>) {
  const session = await auth();
  const user = session?.user;
  const gradeId = user?.role === "student" ? user.gradeId : null;
  const grade = gradeId ? await getGradeChain(gradeId) : null;
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const NavLink = ({
    href,
    label,
    icon,
    isActive,
  }: {
    href: string;
    label: string;
    icon: string;
    isActive: boolean;
  }) => (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 rounded-[12px] px-3 py-2 text-[14px] font-medium transition-colors ${
        isActive
          ? "bg-ink-900 text-white"
          : "text-ink-700 hover:bg-paper hover:text-ink-900"
      }`}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "18px" }}
      >
        {icon}
      </span>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/80 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-6 px-6 py-3 md:px-12">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary-700"
              style={{ fontSize: "22px" }}
            >
              menu_book
            </span>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
                lineHeight: "26px",
              }}
              className="text-ink-900"
            >
              Academic
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              href="/dashboard"
              label="Dashboard"
              icon="dashboard"
              isActive={active === "dashboard"}
            />
            <NavLink
              href="/dashboard#subjects"
              label="Subjects"
              icon="auto_stories"
              isActive={active === "library"}
            />
            <NavLink
              href="/dashboard/interview"
              label="Mock interview"
              icon="record_voice_over"
              isActive={active === "interview"}
            />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {grade && (
            <span
              className="hidden items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-700 md:inline-flex"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span
                className="material-symbols-outlined text-primary-700"
                style={{ fontSize: "14px" }}
              >
                school
              </span>
              {grade.name} · {grade.providerName}
            </span>
          )}
          <div className="hidden items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-3 sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-700 text-[11px] font-semibold text-white">
              {initials || "?"}
            </span>
            <span className="text-[13px] font-medium text-ink-900">
              {user?.name?.split(" ")[0] ?? "Account"}
            </span>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
