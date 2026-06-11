/**
 * One-shot seeder: ingest UGC universities CSV into providers + grades.
 * Source: github.com/saptarshimazumdar/UGC_Indian-University-Dataset
 *
 * Run:   pnpm db:seed:universities
 *
 * Production safety: refuses to run with NODE_ENV=production unless
 * ALLOW_PROD_SEED=1. Real curriculum data — safe to seed in prod once
 * confirmed, but require explicit opt-in to prevent accidents.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { db } from "./index";
import { sections, providers, grades, users } from "./schema";
import { eq, and } from "drizzle-orm";
import { INDIAN_STATES } from "../lib/states";

function checkProdGuard() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PROD_SEED !== "1"
  ) {
    throw new Error(
      "Refusing to run seed-universities.ts in production. Set ALLOW_PROD_SEED=1 to override."
    );
  }
}

const CSV_PATH = "data/raw/ugc-universities.csv";

const STATE_ALIASES: Record<string, string> = {
  Pondicherry: "Puducherry",
  "Pondicherry (UT)": "Puducherry",
  "Jammu & Kashmir": "Jammu and Kashmir",
  "J & K": "Jammu and Kashmir",
  "J&K": "Jammu and Kashmir",
  Tamilnadu: "Tamil Nadu",
  "Tamil  Nadu": "Tamil Nadu",
  Orissa: "Odisha",
  Uttranchal: "Uttarakhand",
  Uttaranchal: "Uttarakhand",
  "NCT of Delhi": "Delhi",
  "New Delhi": "Delhi",
};

type Row = {
  Name: string;
  Address: string;
  Website: string;
};

function normWS(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function extractState(addr: string): string | null {
  const norm = normWS(addr);
  // Match a known state name anywhere as whole word. Longest first to beat "Andhra" vs "Andhra Pradesh".
  const candidates: string[] = [...INDIAN_STATES, ...Object.keys(STATE_ALIASES)];
  const sorted = [...candidates].sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    const re = new RegExp(`\\b${name.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (re.test(norm)) {
      return STATE_ALIASES[name] ?? name;
    }
  }
  return null;
}

function extractCity(addr: string, state: string | null): string | null {
  if (!state) return null;
  const norm = normWS(addr);
  // Trim from the LAST pincode-like 6-digit number onward
  const stripped = norm.replace(/\s*[-–—]?\s*\d{3}\s?\d{3}\s*$/, "").trim();
  const idx = stripped.toLowerCase().lastIndexOf(state.toLowerCase());
  if (idx <= 0) return null;
  const left = stripped.slice(0, idx).replace(/[,\s-]+$/, "");
  const tokens = left.split(/[,]|\s{2,}/).map((t) => t.trim()).filter(Boolean);
  return tokens.at(-1) ?? null;
}

/** Best-effort university type from name keywords. */
function inferType(name: string): string {
  const n = name.toLowerCase();
  if (/^(indian institute of technology|iit|nit|aiims|iiit|iisc|iim|niser|isi)/i.test(name))
    return "INI";
  if (/national/.test(n) || /^central university/.test(n)) return "central";
  if (/deemed/.test(n)) return "deemed";
  if (/private/.test(n)) return "private";
  return "state";
}

/** Default grade names per stage. */
const COLLEGE_GRADES = [
  { name: "B.Tech Year 1", level: 1 },
  { name: "B.Tech Year 2", level: 2 },
  { name: "B.Tech Year 3", level: 3 },
  { name: "B.Tech Year 4", level: 4 },
  { name: "B.Sc Year 1", level: 11 },
  { name: "B.Sc Year 2", level: 12 },
  { name: "B.Sc Year 3", level: 13 },
  { name: "B.A Year 1", level: 21 },
  { name: "B.A Year 2", level: 22 },
  { name: "B.A Year 3", level: 23 },
  { name: "B.Com Year 1", level: 31 },
  { name: "B.Com Year 2", level: 32 },
  { name: "B.Com Year 3", level: 33 },
];

const POSTGRAD_GRADES = [
  { name: "M.Tech Year 1", level: 1 },
  { name: "M.Tech Year 2", level: 2 },
  { name: "M.Sc Year 1", level: 11 },
  { name: "M.Sc Year 2", level: 12 },
  { name: "M.A Year 1", level: 21 },
  { name: "M.A Year 2", level: 22 },
  { name: "MBA Year 1", level: 31 },
  { name: "MBA Year 2", level: 32 },
  { name: "PhD", level: 99 },
];

async function ensureGradesForProvider(
  providerId: string,
  list: typeof COLLEGE_GRADES
) {
  for (const g of list) {
    await db
      .insert(grades)
      .values({
        providerId,
        name: g.name,
        level: g.level,
      })
      .onConflictDoNothing({ target: [grades.providerId, grades.name] });
  }
}

async function main() {
  checkProdGuard();
  console.log("Reading", CSV_PATH);
  const raw = readFileSync(CSV_PATH, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Row[];

  console.log("Parsed", rows.length, "rows");

  const [collegeSection] = await db
    .select()
    .from(sections)
    .where(eq(sections.code, "college"));
  const [pgSection] = await db
    .select()
    .from(sections)
    .where(eq(sections.code, "postgrad"));

  if (!collegeSection || !pgSection)
    throw new Error("Sections 'college' + 'postgrad' must exist; run seed.ts first.");

  let okCollege = 0;
  let okPg = 0;
  let skipped = 0;
  const stateCounts: Record<string, number> = {};
  const unparsedStates: string[] = [];

  for (const r of rows) {
    const name = normWS(r.Name ?? "");
    const addr = r.Address ?? "";
    const site = normWS(r.Website ?? "") || null;
    if (!name) {
      skipped++;
      continue;
    }
    const state = extractState(addr);
    if (!state) {
      unparsedStates.push(name);
    }
    const city = extractCity(addr, state);
    const type = inferType(name);

    // Insert under college section (everyone gets undergrad slot)
    const [inserted] = await db
      .insert(providers)
      .values({
        sectionId: collegeSection.id,
        kind: "university",
        name,
        state: state ?? null,
        city: city ?? null,
        universityType: type,
        website: site,
        country: "India",
      })
      .onConflictDoUpdate({
        target: [providers.sectionId, providers.name],
        set: {
          state: state ?? null,
          city: city ?? null,
          universityType: type,
          website: site,
          country: "India",
        },
      })
      .returning({ id: providers.id });

    if (inserted) {
      okCollege++;
      stateCounts[state ?? "Unknown"] = (stateCounts[state ?? "Unknown"] ?? 0) + 1;
      await ensureGradesForProvider(inserted.id, COLLEGE_GRADES);
    }

    // Also under postgrad section
    const [insertedPg] = await db
      .insert(providers)
      .values({
        sectionId: pgSection.id,
        kind: "university",
        name,
        state: state ?? null,
        city: city ?? null,
        universityType: type,
        website: site,
        country: "India",
      })
      .onConflictDoUpdate({
        target: [providers.sectionId, providers.name],
        set: {
          state: state ?? null,
          city: city ?? null,
          universityType: type,
          website: site,
          country: "India",
        },
      })
      .returning({ id: providers.id });

    if (insertedPg) {
      okPg++;
      await ensureGradesForProvider(insertedPg.id, POSTGRAD_GRADES);
    }
  }

  console.log("\n== DONE ==");
  console.log("College providers inserted:", okCollege);
  console.log("Postgrad providers inserted:", okPg);
  console.log("Skipped rows:", skipped);
  console.log("Unparsed-state count:", unparsedStates.length);
  console.log("\n-- per-state college counts --");
  for (const [s, c] of Object.entries(stateCounts).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${s.padEnd(28)} ${c}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
