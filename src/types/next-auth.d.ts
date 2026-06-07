import type { DefaultSession } from "next-auth";

type Role = "super_admin" | "admin" | "student";
type Status = "pending" | "approved" | "rejected";

declare module "next-auth" {
  interface User {
    role: Role;
    status: Status;
    providerId?: string | null;
    gradeId?: string | null;
    sectionId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      status: Status;
      providerId?: string | null;
      gradeId?: string | null;
      sectionId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: Role;
    status?: Status;
    providerId?: string | null;
    gradeId?: string | null;
    sectionId?: string | null;
  }
}
