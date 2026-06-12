"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wrapper = "fixed left-0 right-0 top-4 z-50 px-4 transition-all duration-300";

  const pillBase =
    "mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6 rounded-full border px-3 py-2 pl-5 backdrop-blur-2xl transition-all duration-300";

  const pillCls = scrolled
    ? `${pillBase} border-ink-200/60 bg-white/85 text-ink-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)]`
    : `${pillBase} border-white/25 bg-white/10 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]`;

  return (
    <div className={wrapper}>
      <nav className={pillCls}>
        <Link
          href="/"
          className="font-serif-warm shrink-0 text-xl font-bold tracking-tight"
        >
          <Logo size={26} withWordmark={true} />
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <NavItem href="#philosophy" label="Mentorship" icon="diversity_3" />
          <NavItem href="#stories" label="Wellbeing" icon="favorite" />
          <NavItem href="#join" label="Community" icon="groups" />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/login"
            className="font-sans-rounded hidden text-sm font-semibold transition-colors hover:text-coral-accent sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="font-sans-rounded inline-flex items-center rounded-full bg-coral-accent px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            Start for free
          </Link>
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
}: Readonly<{ href: string; label: string; icon: string }>) {
  return (
    <Link
      href={href}
      className="font-sans-rounded group inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors hover:text-coral-accent"
    >
      <span
        className="material-symbols-outlined opacity-80 transition-opacity group-hover:opacity-100"
        style={{ fontSize: "16px" }}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
