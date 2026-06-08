"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-1.5 rounded-[14px] border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:bg-paper"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        logout
      </span>
      Log out
    </button>
  );
}
