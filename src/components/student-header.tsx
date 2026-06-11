import Link from "next/link";
import { auth } from "@/auth";
import { getGradeChain } from "@/modules/curriculum/admin";
import { LogoutButton } from "./logout-button";

export async function StudentHeader({
  active,
}: Readonly<{
  active?: "dashboard" | "interview" | "library" | "self-upload";
}>) {
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
    isActive,
  }: {
    href: string;
    label: string;
    isActive: boolean;
  }) => (
    <Link
      href={href}
      className={
        isActive
          ? "border-b-2 border-blue-800 pb-1 text-sm font-bold text-blue-800"
          : "text-sm font-bold text-solar-text transition-colors hover:text-solar-amber"
      }
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-300 bg-slate-50/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-12">
        <Link href="/dashboard" className="flex items-center gap-4">
          <svg width="40" height="40" viewBox="0 0 32 32" className="shrink-0">
            <rect width="32" height="32" rx="7" fill="#155E45" />
            <path d="M6 16.8 25 6.5 17.4 25.5l-3.2-7.2-8.2-1.5Z" fill="#F6A488" />
            <path d="M14.2 18.3 25 6.5l-10 14.6-.8-2.8Z" fill="#C9462C" />
          </svg>
          <span className="text-2xl font-black tracking-tighter text-solar-text-dark">
            preplyfly
          </span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink
            href="/dashboard"
            label="Dashboard"
            isActive={active === "dashboard"}
          />
          <NavLink
            href="/dashboard#subjects"
            label="Subjects"
            isActive={active === "library"}
          />
          <NavLink
            href="/dashboard/interview"
            label="Mock Interview"
            isActive={active === "interview"}
          />
          <NavLink
            href="/dashboard/self-upload"
            label="Self Upload"
            isActive={active === "self-upload"}
          />
        </nav>
      </div>
      <div className="flex items-center gap-6">
        {grade && (
          <div className="hidden items-center gap-2 rounded-full border border-solar-ink/20 bg-solar-card px-4 py-2 md:flex">
            <span
              className="material-symbols-outlined text-sm text-solar-amber"
              style={{ fontSize: "16px" }}
            >
              school
            </span>
            <span className="truncate text-xs font-semibold text-solar-text-dark">
              {grade.name} · {grade.providerName}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-solar-amber p-0.5">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-solar-text-dark text-[11px] font-black text-white">
              {initials || "?"}
            </span>
          </div>
          <span className="hidden text-sm font-bold text-solar-text-dark md:inline">
            {user?.name?.split(" ")[0] ?? "Account"}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
