import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/modules/auth/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const [u] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!u) return null;

        const ok = await verifyPassword(password, u.passwordHash);
        if (!ok) return null;

        // Pending/rejected students may sign in but are routed to /pending
        // by middleware. Status travels in the JWT.
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          status: u.status,
          providerId: u.providerId,
          gradeId: u.gradeId,
          sectionId: u.sectionId,
        };
      },
    }),
  ],
});
