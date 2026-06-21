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

  const wrapper = "absolute left-0 right-0 top-4 z-50 px-3";

  const pillBase =
    "relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-full border backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:rounded-t-full before:bg-gradient-to-b before:from-white/60 before:to-transparent after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_1px_rgba(0,0,0,0.04)]";

  const pillCls = scrolled
    ? `${pillBase} border-white/50 bg-white/55 text-ink-900 shadow-[0_10px_40px_rgba(15,30,40,0.12),0_2px_8px_rgba(15,30,40,0.06)]`
    : `${pillBase} border-white/40 bg-white/35 text-ink-900 shadow-[0_10px_40px_rgba(15,30,40,0.1),0_2px_8px_rgba(15,30,40,0.05)]`;

  return (
    <div className={wrapper}>
      <nav className={pillCls}>
        <div className="relative z-10 flex w-full items-center justify-between gap-6 px-3 py-2 pl-5">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight"
          >
            <Logo size={22} withWordmark={true} />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <NavItem href="#philosophy" label="Mentorship" icon="diversity_3" />
            <NavItem href="#stories" label="Wellbeing" icon="favorite" />
            <NavItem href="#join" label="Community" icon="groups" />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold transition-colors hover:text-coral-accent sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-full bg-coral-accent px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-95"
            >
              Start for free
            </Link>
          </div>
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
      className="group inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors hover:text-coral-accent"
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
