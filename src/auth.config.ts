import type { NextAuthConfig } from "next-auth";

type Role = "super_admin" | "admin" | "student";
type Status = "pending" | "approved" | "rejected";

/**
 * Edge-safe auth config (NO database imports).
 * Used by middleware and extended by src/auth.ts with the Credentials provider.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.status = user.status;
        token.providerId = user.providerId ?? null;
        token.gradeId = user.gradeId ?? null;
        token.sectionId = user.sectionId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = (token.role as Role) ?? "student";
        session.user.status = (token.status as Status) ?? "pending";
        session.user.providerId = (token.providerId as string | null) ?? null;
        session.user.gradeId = (token.gradeId as string | null) ?? null;
        session.user.sectionId = (token.sectionId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
