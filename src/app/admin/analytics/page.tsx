import Link from "next/link";
import {
  sectionStats,
  providerStats,
  gradeStats,
  platformTotals,
  getSectionName,
  getProviderName,
} from "@/modules/analytics/service";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ sectionId?: string; providerId?: string }>;
}>) {
  const { sectionId, providerId } = await searchParams;

  if (providerId) return <GradeLevel providerId={providerId} />;
  if (sectionId) return <ProviderLevel sectionId={sectionId} />;
  return <SectionLevel />;
}

/* ------------------------------- Header ------------------------------- */

function PageHeader({
  eyebrow,
  title,
  underline,
  subtitle,
}: Readonly<{
  eyebrow: string;
  title: string;
  underline?: string;
  subtitle?: string;
}>) {
  return (
    <header className="flex flex-col gap-3">
      <p
        className="text-[11px] text-ink-500"
        style={{ fontFamily: "var(--font-mono)", }}
      >
        {eyebrow}
      </p>
      <h1
        className="text-3xl font-normal leading-tight text-primary-900 md:text-4xl lg:text-[52px] lg:leading-[56px]"
        style={{
          fontFamily: "var(--font-serif)",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
        {underline && (
          <>
            {" "}
            <span className="hand-drawn-underline">{underline}</span>
          </>
        )}
      </h1>
      {subtitle && (
        <p
          className="max-w-xl text-ink-700"
          style={{ fontSize: "17px", lineHeight: "28px" }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}

/* ---------------------------- Section Level --------------------------- */

async function SectionLevel() {
  const rows = await sectionStats();
  const totals = await platformTotals();
  const totalStudents = rows.reduce((acc, r) => acc + r.students, 0);
  const populated = rows.filter((r) => r.students > 0).length;

  return (
    <div className="flex flex-col gap-12">
      <Breadcrumb items={[{ label: "Analytics" }]} />
      <PageHeader
        eyebrow="01 — Analytics overview"
        title="The platform, in"
        underline="numbers."
        subtitle="Drill from sections down to grade-level outcomes."
      />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Approved students"
          value={totals.students}
          icon="group"
          tone="primary"
          hint="All sections"
        />
        <Kpi
          label="Pending approvals"
          value={totals.pending}
          icon="pending_actions"
          tone="coral"
          hint={totals.pending > 0 ? "Needs review" : "Inbox zero"}
        />
        <Kpi
          label="Sections"
          value={rows.length}
          icon="account_tree"
          tone="indigo"
          hint={`${populated} populated`}
        />
        <Kpi
          label="Aggregate"
          value={totalStudents}
          icon="insights"
          tone="ink"
          hint="Across sections"
        />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p
              className="text-[11px] text-ink-500"
              style={{
                fontFamily: "var(--font-mono)",
                }}
            >
              By section
            </p>
            <h2
              className="text-ink-900"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "22px",
                lineHeight: "28px",
                fontWeight: 600,
              }}
            >
              Sections
            </h2>
          </div>
          <span
            className="text-[12px] text-ink-500"
            style={{
              fontFamily: "var(--font-mono)",
              }}
          >
            {rows.length} sections
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/admin/analytics?sectionId=${r.id}`}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-[20px] border border-ink-200 bg-white p-6 soft-shadow transition-all hover:-translate-y-1 hover:pop-shadow"
            >
              <div className="flex items-start justify-between">
                <span
                  className="text-[11px] text-ink-500"
                  style={{
                    fontFamily: "var(--font-mono)",
                    }}
                >
                  {r.code ?? "Section"}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary-100 text-primary-700">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    account_tree
                  </span>
                </span>
              </div>
              <h3
                className="text-ink-900 transition-colors group-hover:text-coral-700"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "20px",
                  lineHeight: "26px",
                  fontWeight: 600,
                }}
              >
                {r.name}
              </h3>
              <div className="mt-auto flex items-end justify-between">
                <div
                  className="text-primary-900"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "34px",
                    lineHeight: "36px",
                    fontWeight: 400,
                  }}
                >
                  {r.students}
                  <span className="ml-1 text-[13px] font-normal text-ink-500">
                    students
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary-700 transition-transform group-hover:translate-x-1">
                  Drill in
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    arrow_forward
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------------------- Provider Level -------------------------- */

async function ProviderLevel({ sectionId }: Readonly<{ sectionId: string }>) {
  const rows = await providerStats(sectionId);
  const name = await getSectionName(sectionId);
  const total = rows.reduce((acc, r) => acc + r.students, 0);

  return (
    <div className="flex flex-col gap-12">
      <Breadcrumb
        items={[
          { label: "Analytics", href: "/admin/analytics" },
          { label: name ?? "Section" },
        ]}
      />
      <PageHeader
        eyebrow="02 — Section drilldown"
        title={name ?? "Section"}
        subtitle={`${rows.length} boards / universities · ${total} students total`}
      />

      {rows.length === 0 ? (
        <Empty text="No boards or universities yet for this section." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/admin/analytics?providerId=${r.id}`}
              className="group flex items-center gap-4 rounded-[20px] border border-ink-200 bg-white p-5 soft-shadow transition-all hover:-translate-y-1 hover:pop-shadow"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-indigo-100 text-indigo-500">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "22px" }}
                >
                  {r.kind === "university" ? "school" : "menu_book"}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-ink-900 transition-colors group-hover:text-coral-700"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "17px",
                    lineHeight: "24px",
                    fontWeight: 600,
                  }}
                >
                  {r.name}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="text-[10px] text-ink-500"
                    style={{
                      fontFamily: "var(--font-mono)",
                      }}
                  >
                    {r.kind}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-ink-300" />
                  <span className="text-[12px] text-ink-700">
                    {r.students} students
                  </span>
                </div>
              </div>
              <span
                className="material-symbols-outlined text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-primary-700"
                style={{ fontSize: "22px" }}
              >
                arrow_forward
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Grade Level ---------------------------- */

async function GradeLevel({ providerId }: Readonly<{ providerId: string }>) {
  const rows = await gradeStats(providerId);
  const info = await getProviderName(providerId);

  return (
    <div className="flex flex-col gap-12">
      <Breadcrumb
        items={[
          { label: "Analytics", href: "/admin/analytics" },
          {
            label: info?.sectionName ?? "Section",
            href: info ? `/admin/analytics?sectionId=${info.sectionId}` : undefined,
          },
          { label: info?.name ?? "Provider" },
        ]}
      />
      <PageHeader
        eyebrow="03 — Provider drilldown"
        title={info?.name ?? "Provider"}
        subtitle={`${rows.length} classes · drill-down of student outcomes`}
      />

      {rows.length === 0 ? (
        <Empty text="No data for this provider yet." />
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-ink-200 bg-white soft-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-primary-900 text-white">
                <tr>
                  <Th>Class / Year</Th>
                  <Th>Students</Th>
                  <Th>Avg test</Th>
                  <Th>Avg interview</Th>
                  <Th>Coding solved</Th>
                  <Th>Topics viewed</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-paper"
                    } transition-colors hover:bg-primary-50`}
                  >
                    <td className="px-5 py-4">
                      <span
                        className="text-ink-900"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "15px",
                          fontWeight: 600,
                        }}
                      >
                        {r.name}
                      </span>
                    </td>
                    <Td value={r.students} />
                    <Td value={`${r.avgTest}%`} accent={r.avgTest >= 80} />
                    <Td value={`${r.avgInterview}/100`} />
                    <Td value={r.codingSolved} />
                    <Td value={r.topicsViewed} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Helpers ------------------------------ */

const TONE_CLASS: Record<string, string> = {
  primary: "bg-primary-100 text-primary-700",
  coral: "bg-coral-100 text-coral-700",
  indigo: "bg-indigo-100 text-indigo-500",
  ink: "bg-ink-100 text-ink-900",
};

function Kpi({
  label,
  value,
  icon,
  tone,
  hint,
}: Readonly<{
  label: string;
  value: number;
  icon: string;
  tone: keyof typeof TONE_CLASS;
  hint: string;
}>) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-ink-200 bg-white p-5 soft-shadow transition-all hover:-translate-y-0.5 hover:pop-shadow">
      <div className="flex items-start justify-between">
        <span
          className="text-[11px] text-ink-500"
          style={{ fontFamily: "var(--font-mono)", }}
        >
          {label}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${TONE_CLASS[tone]}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            {icon}
          </span>
        </span>
      </div>
      <div
        className="text-primary-900"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "40px",
          lineHeight: "44px",
          fontWeight: 400,
        }}
      >
        {value}
      </div>
      <div className="text-[12px] text-ink-500">{hint}</div>
    </div>
  );
}

function Th({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <th
      className="px-5 py-3 text-[11px] text-coral-300"
      style={{ fontFamily: "var(--font-mono)", }}
    >
      {children}
    </th>
  );
}

function Td({
  value,
  accent,
}: Readonly<{ value: string | number; accent?: boolean }>) {
  return (
    <td
      className={`px-5 py-4 ${accent ? "text-primary-700 font-semibold" : "text-ink-700"}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {value}
    </td>
  );
}

function Empty({ text }: Readonly<{ text: string }>) {
  return (
    <div className="rounded-[24px] border border-dashed border-ink-300 bg-white/60 p-16 text-center">
      <p
        className="mb-2 text-[11px] text-ink-500"
        style={{ fontFamily: "var(--font-mono)", }}
      >
        Empty
      </p>
      <p
        className="text-ink-900"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "20px",
          lineHeight: "28px",
          fontWeight: 600,
        }}
      >
        {text}
      </p>
    </div>
  );
}
