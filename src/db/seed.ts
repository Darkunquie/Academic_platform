import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { sections, providers, grades, users } from "./schema";
import { hashPassword } from "../modules/auth/password";

type Kind = "board" | "university";
type SectionCode =
  | "school"
  | "intermediate"
  | "college"
  | "postgrad"
  | "professional";

async function upsertSection(
  code: SectionCode,
  name: string,
  sortOrder: number
) {
  await db.insert(sections).values({ code, name, sortOrder }).onConflictDoNothing();
  const [row] = await db.select().from(sections).where(eq(sections.code, code));
  return row;
}

async function upsertProvider(
  sectionId: string,
  kind: Kind,
  name: string,
  createdBy: string,
  state: string | null = null
) {
  await db
    .insert(providers)
    .values({ sectionId, kind, name, createdBy, state })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(providers)
    .where(and(eq(providers.sectionId, sectionId), eq(providers.name, name)));
  return row;
}

async function upsertGrade(
  providerId: string,
  name: string,
  level: number,
  createdBy: string
) {
  await db
    .insert(grades)
    .values({ providerId, name, level, createdBy })
    .onConflictDoNothing();
}

async function ensureSuperAdmin(): Promise<string> {
  const email = "superadmin@academic.local";
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return existing.id;

  const passwordHash = await hashPassword("Admin@12345");
  const [created] = await db
    .insert(users)
    .values({
      name: "Super Admin",
      email,
      passwordHash,
      role: "super_admin",
      status: "approved",
    })
    .returning({ id: users.id });
  return created.id;
}

async function main() {
  const adminId = await ensureSuperAdmin();

  const school = await upsertSection("school", "School", 1);
  const inter = await upsertSection("intermediate", "Intermediate", 2);
  const college = await upsertSection("college", "College", 3);
  const pg = await upsertSection("postgrad", "Postgrad", 4);
  const prof = await upsertSection("professional", "Professional", 5);

  // --- School boards: Class 1..10 (state = null means national) ---
  const schoolBoards: { name: string; state: string | null }[] = [
    { name: "CBSE", state: null },
    { name: "ICSE", state: null },
    { name: "Telangana State Board (SSC)", state: "Telangana" },
    { name: "Andhra Pradesh State Board", state: "Andhra Pradesh" },
    { name: "Karnataka State Board (KSEEB)", state: "Karnataka" },
    { name: "Tamil Nadu State Board", state: "Tamil Nadu" },
    { name: "Maharashtra State Board", state: "Maharashtra" },
    { name: "Rajasthan State Board (RBSE)", state: "Rajasthan" },
    { name: "Uttar Pradesh State Board", state: "Uttar Pradesh" },
    { name: "Kerala State Board (SCERT)", state: "Kerala" },
    { name: "West Bengal Board (WBBSE)", state: "West Bengal" },
    { name: "Gujarat State Board (GSEB)", state: "Gujarat" },
    { name: "Punjab School Education Board", state: "Punjab" },
    { name: "Delhi (Directorate of Education)", state: "Delhi" },
  ];
  for (const b of schoolBoards) {
    const p = await upsertProvider(school.id, "board", b.name, adminId, b.state);
    for (let i = 1; i <= 10; i++) {
      await upsertGrade(p.id, `Class ${i}`, i, adminId);
    }
  }

  // --- Intermediate boards: 1st / 2nd year ---
  const interBoards: { name: string; state: string | null }[] = [
    { name: "Telangana Board of Intermediate Education", state: "Telangana" },
    { name: "Andhra Board of Intermediate Education", state: "Andhra Pradesh" },
    { name: "CBSE (Class 11–12)", state: null },
  ];
  for (const b of interBoards) {
    const p = await upsertProvider(inter.id, "board", b.name, adminId, b.state);
    await upsertGrade(p.id, "1st Year", 1, adminId);
    await upsertGrade(p.id, "2nd Year", 2, adminId);
  }

  // --- College universities: B.Tech Year 1..4 ---
  const collegeUnis = [
    "JNTU Hyderabad",
    "Osmania University",
    "Anna University",
  ];
  for (const name of collegeUnis) {
    const p = await upsertProvider(college.id, "university", name, adminId);
    for (let i = 1; i <= 4; i++) {
      await upsertGrade(p.id, `B.Tech Year ${i}`, i, adminId);
    }
  }

  // --- Postgrad universities ---
  const pgUnis = ["JNTU Hyderabad (PG)", "Osmania University (PG)"];
  for (const name of pgUnis) {
    const p = await upsertProvider(pg.id, "university", name, adminId);
    await upsertGrade(p.id, "M.Tech Year 1", 1, adminId);
    await upsertGrade(p.id, "M.Tech Year 2", 2, adminId);
    await upsertGrade(p.id, "PhD", 3, adminId);
  }

  // --- Professional ---
  const profP = await upsertProvider(
    prof.id,
    "university",
    "Professional Programs",
    adminId
  );
  await upsertGrade(profP.id, "Foundation", 1, adminId);
  await upsertGrade(profP.id, "Advanced", 2, adminId);

  console.log("\n✅ Seed complete.");
  console.log("   Super admin login:");
  console.log("     email:    superadmin@academic.local");
  console.log("     password: Admin@12345\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
