"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black text-solar-text-dark transition-colors hover:border-blue-800 hover:text-blue-800"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
        logout
      </span>
      {" "}Log out
    </button>
  );
}
