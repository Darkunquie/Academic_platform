/**
 * Bootstrap a single super_admin row from env vars. Idempotent — if a user
 * with SUPER_ADMIN_EMAIL already exists, the script promotes them to
 * super_admin/approved and resets their password to SUPER_ADMIN_PASSWORD.
 *
 * Run (first deploy):
 *   SUPER_ADMIN_EMAIL=admin@yourdomain.com \
 *   SUPER_ADMIN_PASSWORD='<strong-random-24-chars>' \
 *   SUPER_ADMIN_NAME='Yash Wargad' \
 *   pnpm bootstrap:super-admin
 *
 * Password policy (enforced here, not in NextAuth):
 *   - at least 16 characters
 *   - at least one digit
 *   - at least one symbol
 *
 * After running, set SUPER_ADMIN_PASSWORD to an empty string in your env file
 * and remove it from your secrets manager. The hash lives in the DB.
 */

import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/modules/auth/password";

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

function validatePassword(pw: string): void {
  const issues: string[] = [];
  if (pw.length < 16) issues.push("must be at least 16 characters");
  if (!/\d/.test(pw)) issues.push("must include at least one digit");
  if (!/[^a-zA-Z0-9]/.test(pw)) issues.push("must include at least one symbol");
  if (issues.length > 0) {
    console.error("SUPER_ADMIN_PASSWORD policy violations:");
    for (const i of issues) console.error("  -", i);
    process.exit(1);
  }
}

async function main() {
  const email = required("SUPER_ADMIN_EMAIL").toLowerCase().trim();
  const password = required("SUPER_ADMIN_PASSWORD");
  const name = process.env.SUPER_ADMIN_NAME?.trim() || "Super Admin";

  validatePassword(password);

  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        passwordHash,
        role: "super_admin",
        status: "approved",
        name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
    console.log(`Updated existing user → super_admin (${email})`);
    return;
  }

  await db.insert(users).values({
    email,
    passwordHash,
    role: "super_admin",
    status: "approved",
    name,
  });
  console.log(`Created super_admin (${email})`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(`bootstrap failed: ${(e as Error).message}`);
    process.exit(1);
  });
