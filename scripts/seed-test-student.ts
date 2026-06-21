/**
 * Idempotent demo student creator. Picks the first CBSE Class 5 (or any first
 * available grade) so the student gets a working scope. Safe to re-run.
 *
 * Usage:  pnpm tsx scripts/seed-test-student.ts
 *
 * Creates / refreshes:
 *   email:    student@demo.local
 *   password: Student@12345
 *   role:     student
 *   status:   approved
 */

import "dotenv/config";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, sections, providers, grades } from "@/db/schema";
import { hashPassword } from "@/modules/auth/password";

const EMAIL = "student@demo.local";
const PASSWORD = "Student@12345";
const NAME = "Demo Student";

async function main() {
  // Find a sensible scope: school section → CBSE provider → Class 5 grade.
  const [school] = await db
    .select()
    .from(sections)
    .where(eq(sections.code, "school"))
    .limit(1);

  if (!school) {
    console.error("No 'school' section. Run main seed first.");
    process.exit(1);
  }

  const [cbse] = await db
    .select()
    .from(providers)
    .where(
      and(eq(providers.sectionId, school.id), eq(providers.name, "CBSE"))
    )
    .limit(1);

  if (!cbse) {
    console.error("No CBSE provider found. Run main seed first.");
    process.exit(1);
  }

  const [class5] = await db
    .select()
    .from(grades)
    .where(
      and(eq(grades.providerId, cbse.id), eq(grades.name, "Class 5"))
    )
    .limit(1);

  if (!class5) {
    console.error("No CBSE Class 5 grade found. Run main seed first.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(PASSWORD);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, EMAIL))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        passwordHash,
        role: "student",
        status: "approved",
        name: NAME,
        sectionId: school.id,
        providerId: cbse.id,
        gradeId: class5.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
    console.log(`Updated demo student (${EMAIL})`);
  } else {
    await db.insert(users).values({
      email: EMAIL,
      name: NAME,
      passwordHash,
      role: "student",
      status: "approved",
      sectionId: school.id,
      providerId: cbse.id,
      gradeId: class5.id,
    });
    console.log(`Created demo student (${EMAIL})`);
  }

  console.log("");
  console.log("Login at /login with:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(`seed-test-student failed: ${(e as Error).message}`);
    process.exit(1);
  });
