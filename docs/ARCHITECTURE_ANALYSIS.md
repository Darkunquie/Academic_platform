# Architecture Analysis Report

> **Generated:** 2026-06-11
> **Project:** Preplyfly (academic-platform)
> **Analyzer:** Claude `/arch-analyzer` skill
> **Purpose:** Audit current codebase against locked infra plan in `INFRASTRUCTURE.md` §0. Confirm that Phase B blockers (B1-B8) are adapter-level swaps, not structural refactors.

---

## Executive summary

**Overall health score: 8/10**

The codebase is structurally sound for the locked Hetzner + Neon + Upstash + R2 stack. Module boundaries are clean, the `src/lib/` adapter pattern is consistent, and all pre-launch blockers can be fixed inside their respective adapter files without touching domain modules. The eight `INFRASTRUCTURE.md` §0.4 blockers map 1-to-1 to specific files; none requires a cross-cutting refactor.

**Critical issues:** 0 (no data loss, no active security breach without an attacker AND a working blocker bypass)
**Major issues:** 5 (all already tracked as B1-B8 in INFRASTRUCTURE.md §0.4)
**Moderate issues:** 4 (consistency, naming, structural cleanup)
**Minor issues:** 3 (style, dead code, doc drift)

**Top 3 priorities to fix first (in order):**
1. **B2 — Add `middleware.ts`** at project root. JWT check + revocation list. Without it, all other RBAC is server-component-only and admin UI bundles are still served to non-admins.
2. **B4 — Wire Upstash Redis** via `src/lib/cache.ts` + `src/lib/rate-limit-redis.ts`. Unblocks B7 (token cap) and unblocks H1.10-12 hardening items.
3. **B1 — Add `rehype-sanitize` to topic body render**. Stored-XSS gap. One file, one library.

After those three, the remaining five blockers (B3, B5, B6, B7, B8) are all <1h each.

---

## 1. Architecture overview

### 1.1 Tech stack identified

- **Frontend:** Next.js 16 (App Router, RSC), React 19, TailwindCSS 4
- **Backend:** Next.js server actions + route handlers, Node 22 standalone
- **Auth:** NextAuth v5 beta (Credentials provider, JWT session, no DB sessions)
- **DB:** PostgreSQL 16 via Drizzle ORM (drizzle-kit migrations)
- **AI:** Groq API (Llama 3.3-70b + Llama 3.1-8b + Whisper)
- **Code sandbox:** Piston (privileged Docker, internal only) with Judge0 fallback
- **Storage:** Local disk (target: Cloudflare R2)
- **Email:** None yet (target: Resend)
- **Errors:** None yet (target: Sentry)
- **Cache + rate limit:** In-memory Map (target: Upstash Redis)
- **Package manager:** pnpm, frozen lockfile

### 1.2 Folder structure (verified)

```
src/
├── app/                      # Next.js App Router (thin route components)
│   ├── (public)              # landing, login, signup, pending
│   ├── dashboard/            # student-facing routes
│   ├── admin/                # admin routes
│   └── api/                  # route handlers (assets, health, signup)
├── components/               # shared UI components
├── modules/                  # domain modules — business logic lives here
│   ├── auth/                 # guard, password, service
│   ├── curriculum/           # admin tree CRUD + student traversal
│   ├── content/              # topic body + assets
│   ├── assessment/           # MCQ gen, scoring, cache
│   ├── interview/            # session, gen, scoring
│   ├── coding/               # questions, sandbox runner
│   ├── web/                  # HTML/CSS/JS challenges
│   ├── admin/                # user mgmt, scope
│   ├── analytics/            # progress rollups
│   └── self-upload/          # PDF → ephemeral test
├── lib/                      # external integrations + adapters
│   ├── groq.ts               # LLM + Whisper client
│   ├── sandbox.ts            # Piston client
│   ├── judge0.ts             # Judge0 fallback
│   ├── storage.ts            # local disk (→ R2)
│   ├── rate-limit.ts         # in-memory (→ Upstash)
│   └── markdown.ts           # marked + katex
├── db/                       # Drizzle schema + migrations + seed
│   ├── schema.ts             # 27 tables, enums, indexes
│   └── seed*.ts              # initial data
├── auth.ts                   # NextAuth entry
└── auth.config.ts            # edge-safe NextAuth config (JWT callbacks)
```

### 1.3 Request lifecycle (verified clean)

```
Browser
  → Cloudflare CDN (planned)
  → Next.js server component (renders page)
     → calls modules/<domain>/service.ts (reads via Drizzle)
     → returns JSX
  → React serializes HTML
  → Browser interacts → server action
     → modules/<domain>/actions.ts
        → requireStudent() / requireAdmin() guard at entry
        → service.ts mutation
        → returns ok/error
     → revalidatePath() if needed
  → React re-renders
```

This is a textbook modular monolith request flow. No layer-jumping, no logic in routes, no DB access in components.

### 1.4 Dependency direction (verified)

```
app/  →  modules/  →  lib/  →  db/  →  schema.ts
```

Top-down only. No reverse imports. `lib/` doesn't import from `modules/` or `app/`. Modules don't cross-import (e.g. `interview/` doesn't reach into `coding/`). This is what makes Phase B blocker fixes mechanical — each blocker lives in one layer.

---

## 2. Findings by category

### 2.1 🟠 Major — Security: No edge auth, admin bundles served to non-admins

**Severity:** 🟠 Major
**Files affected:** *missing* `middleware.ts` at project root; redirect logic scattered in `src/app/admin/layout.tsx` and individual server components
**Category:** Security, Architecture

**Symptom:**
A non-admin student can request `/admin/users`. Next.js still serves the admin layout JS bundle to the browser, then the server component does the role check and redirects. The redirect happens after the bundle is downloaded and partially rendered.

**Root cause chain:**
- Symptom: admin UI bundle reachable by non-admins → WHY?
- Auth check happens in React server components, not at edge → WHY?
- No `middleware.ts` at project root → WHY?
- Originally deferred to "after launch" in the build plan → WHY?
- NextAuth v5 docs make middleware look optional; team relied on `requireAdmin()` calls in actions → **ROOT CAUSE: missing edge-level auth boundary. RBAC is enforced at action entry (correct for mutation safety) but not at route entry (incorrect for bundle isolation and revocation).**

**Root cause fix:**

Create `middleware.ts` at the project root:

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { redis } from "@/lib/cache"; // from B4

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // Public routes — pass through
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // JWT revocation check (B4 dependency)
  const jti = session.user.jti;
  if (jti) {
    const revoked = await redis.exists(`sess:revoke:${jti}`);
    if (revoked) {
      return NextResponse.redirect(new URL("/login?revoked=1", req.url));
    }
  }

  // Student status gate
  if (
    session.user.role === "student" &&
    session.user.status !== "approved" &&
    !pathname.startsWith("/pending")
  ) {
    return NextResponse.redirect(new URL("/pending", req.url));
  }

  // Admin route gate
  if (pathname.startsWith("/admin")) {
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
```

This is **purely additive** — existing `requireAdmin()` / `requireStudent()` guards in actions stay as defense in depth.

**Rejected patch fixes:**
- ❌ "Move role check into root layout.tsx" — still ships bundle, just earlier blocked. Same problem.
- ❌ "Use Next.js route groups" — segments UI but no auth boundary.

---

### 2.2 🟠 Major — Security: Topic body rendered as unsanitized HTML

**Severity:** 🟠 Major
**Files affected:** `src/app/dashboard/topic/[topicId]/page.tsx:182`, `src/lib/markdown.ts`
**Category:** Security

**Symptom:**
Admin-authored topic body HTML is passed to `dangerouslySetInnerHTML={{ __html: html }}`. `marked` v13 does not sanitize. Admin account compromise → stored XSS on every student who opens the topic.

**Root cause chain:**
- Symptom: raw HTML rendered → WHY?
- `marked()` returns trusted-by-convention HTML → WHY?
- Convention assumes admin is trusted → WHY?
- Author-trust assumption is fine for content authenticity but ignores XSS via compromised admin account or admin keyboard slip → **ROOT CAUSE: no sanitization layer between markdown rendering and browser. Trust boundary collapsed.**

**Root cause fix:**

Add `rehype-sanitize` (or `isomorphic-dompurify`) to `src/lib/markdown.ts`:

```ts
// src/lib/markdown.ts
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ["target", "rel"],
    ADD_TAGS: ["math", "annotation", "semantics"], // for katex
  });
}
```

Existing callers of `renderMarkdown` continue to work unchanged. The output of `dangerouslySetInnerHTML` is now safe.

**Rejected patch fixes:**
- ❌ "Validate input at admin form" — admin convenience suffers, and JS-stripping is unreliable. Sanitize at render boundary.
- ❌ "Use a separate iframe for content" — overkill, breaks intra-page navigation.

---

### 2.3 🟠 Major — Reliability: Two server actions missing rate limit

**Severity:** 🟠 Major
**Files affected:** `src/modules/coding/actions.ts:117` (`runCodeAction`), `src/modules/interview/actions.ts:66` (`submitAnswerAction`)
**Category:** Cost control, Reliability

**Symptom:**
`runCodeAction` calls Piston with no rate limit — a student can spam-submit, exhausting the privileged sandbox container and inflating Piston wall-time budget. `submitAnswerAction` calls Groq scoring (Llama 70b, expensive) with no rate limit — a student can hold the answer field and spam submit, burning tokens at $0.79/M output.

Note: `startInterviewAction` (line 16) and `transcribeAction` (line 51) DO have rate limits. The two referenced actions were missed in the same pass.

**Root cause chain:**
- Symptom: two actions unprotected → WHY?
- Each `actions.ts` decides its own rate-limit policy → WHY?
- No central rate-limit configuration (a "what's protected and at what rate" table) → WHY?
- Rate-limit was added reactively per action, not as a default-on policy → **ROOT CAUSE: missing rate-limit policy registry. Each new server action requires the author to remember to call `rateLimit()`.**

**Root cause fix:**

Two parts.

Part 1 — fix the immediate gap (`runCodeAction`, `submitAnswerAction`):

```ts
// src/modules/coding/actions.ts:125 (inside runCodeAction)
const user = await requireStudent();
if (!rateLimit(`code:${user.id}`, 20, 60_000)) {
  return { ok: false, error: "Rate limit hit. Slow down a moment." };
}
```

```ts
// src/modules/interview/actions.ts:70 (inside submitAnswerAction)
const user = await requireStudent();
if (!rateLimit(`grade:${user.id}`, 30, 60_000)) {
  return { ok: false, error: "Rate limit hit. Slow down a moment." };
}
```

Part 2 — root fix to prevent recurrence. Introduce a typed rate-limit registry in `src/lib/rate-limit-redis.ts` (B4 work):

```ts
// src/lib/rate-limit-redis.ts
export const LIMITS = {
  signupIp:    { limit: 5,  window: "1h" },
  signupEmail: { limit: 3,  window: "1h" },
  loginIp:     { limit: 10, window: "1m" },
  gen:         { limit: 10, window: "1m" },
  code:        { limit: 20, window: "1m" },
  grade:       { limit: 30, window: "1m" },
  stt:         { limit: 60, window: "1m" },
  selfUpload:  { limit: 3,  window: "24h" },
} as const;

export type LimitKey = keyof typeof LIMITS;

export async function guardRate(key: LimitKey, id: string): Promise<void> {
  const { limit, window } = LIMITS[key];
  const ok = await checkLimit(`rl:${key}:${id}`, limit, window);
  if (!ok) throw new RateLimitError(key);
}
```

Then each `*Action` does:
```ts
await guardRate("code", user.id);
```

The registry makes it impossible to add a new rate-limited surface without explicitly choosing the policy. The default of "no rate limit" is replaced by "you must pick a key."

**Rejected patch fixes:**
- ❌ "Add a global middleware rate limiter on /api/*" — doesn't cover server actions (different transport).
- ❌ "Trust Cloudflare WAF to handle it" — WAF is per-IP, not per-user. Logged-in students share NAT.

---

### 2.4 🟠 Major — Security: Upstream API error bodies leak to client

**Severity:** 🟠 Major
**Files affected:** `src/lib/groq.ts:44`, `src/lib/groq.ts:80`, indirectly all `actions.ts` files that surface error messages
**Category:** Security, Error Handling

**Symptom:**
On Groq failure:
```ts
throw new Error(`Groq error ${res.status}: ${text.slice(0, 300)}`);
```
That `text.slice(0, 300)` is the upstream response body. It can contain quota info, internal request IDs, organization hints. Server actions catch this and return `error: (e as Error).message` to the client, where it lands in toast notifications.

**Root cause chain:**
- Symptom: upstream body in client-visible error → WHY?
- `Error.message` includes raw body → WHY?
- Adapter layer doesn't distinguish "log-safe" from "client-safe" errors → WHY?
- No structural error type with `userMessage` vs `internalDetail` separation → **ROOT CAUSE: missing error contract at adapter boundary. Adapters throw generic `Error` and callers can't tell what's safe to show.**

**Root cause fix:**

Introduce a typed adapter error:

```ts
// src/lib/errors.ts
export class UpstreamError extends Error {
  constructor(
    public readonly service: "groq" | "piston" | "judge0" | "r2" | "resend",
    public readonly status: number,
    public readonly userMessage: string,
    public readonly internalDetail: string
  ) {
    super(`${service} ${status}: ${userMessage}`);
  }
}
```

```ts
// src/lib/groq.ts:44 (rewritten)
if (!res.ok) {
  const text = await res.text();
  throw new UpstreamError(
    "groq",
    res.status,
    "AI service unavailable. Please retry shortly.",
    text.slice(0, 1000) // logged server-side only
  );
}
```

Actions surface `err.userMessage` to client. Sentry captures `err.internalDetail` server-side.

**Rejected patch fixes:**
- ❌ "Just delete the slice(0, 300)" — caller still throws raw message text.
- ❌ "Add a try-catch in each action that masks the error" — pushes responsibility to every caller, easy to miss.

---

### 2.5 🟠 Major — Operability: In-memory rate limiter, no Groq cache, no metrics

**Severity:** 🟠 Major
**Files affected:** `src/lib/rate-limit.ts`, indirect across all `actions.ts`
**Category:** Reliability, Cost control

**Symptom:**
`src/lib/rate-limit.ts` uses a per-process `Map`. Resets on redeploy (every push to main). Bypassable across deploys, bypassable across containers (when horizontal scale arrives), invisible to ops.

**Root cause chain:**
- Symptom: rate-limit ineffective → WHY?
- Map is single-process state → WHY?
- Adopted as "we'll move to Redis later" → WHY?
- Phase B blocker B4 already covers this; the root cause is **scheduling, not architecture**.

**Root cause fix:**
Already specified in `INFRASTRUCTURE.md` §6a (Redis design) and §0.4 blocker B4. The current `rate-limit.ts` stays as the in-memory fallback for the Upstash circuit-breaker.

**Status:** NOT a structural issue. Tracked.

---

### 2.6 🟡 Moderate — Architecture: Postgres cache is duplicated by upcoming Redis layer

**Severity:** 🟡 Moderate
**Files affected:** `src/modules/assessment/cache.ts`, will be referenced by future `src/lib/cache.ts`
**Category:** Architecture, Code Duplication

**Symptom:**
`assessment/cache.ts` has `cacheKey()`, `getCached()`, `saveCached()` — module-scoped Postgres cache. The new Redis layer (B4) will add another wrapper. Risk: two cache APIs that look similar but behave differently.

**Root cause chain:**
- Symptom: about to grow second cache wrapper → WHY?
- Postgres cache was written before Redis was on the roadmap → WHY?
- Now Redis is locked in → **ROOT CAUSE: incoming Redis layer must consciously be designed as a thin hot layer ABOVE the Postgres cache, not as a replacement.**

**Root cause fix:**

Layer them in `src/lib/cache.ts`:

```ts
// src/lib/cache.ts (Phase B target)
export async function getOrSetGroqCache<T>(
  key: string,
  type: "mock_test" | "interview" | "coding",
  fetcher: () => Promise<T>
): Promise<{ value: T; source: "redis" | "postgres" | "fresh" }> {
  // 1. Redis hot
  const hot = await redis.get<T>(`cache:groq:${key}`);
  if (hot) return { value: hot, source: "redis" };

  // 2. Postgres cold
  const cold = await getCached(key);
  if (cold) {
    await redis.set(`cache:groq:${key}`, cold.payload, { ex: 3600 });
    return { value: cold.payload as T, source: "postgres" };
  }

  // 3. Fresh fetch
  const fresh = await fetcher();
  await saveCached(key, type, fresh, "<model>");
  await redis.set(`cache:groq:${key}`, fresh, { ex: 3600 });
  return { value: fresh, source: "fresh" };
}
```

Existing callers of `getCached`/`saveCached` migrate to `getOrSetGroqCache`. Old functions stay as internal building blocks.

**Rejected patch fixes:**
- ❌ "Replace Postgres cache with Redis-only" — loses cross-deploy persistence, breaks pre-warm strategy.
- ❌ "Keep them separate, callers pick" — invites inconsistency, every gen flow hand-rolls the lookup.

---

### 2.7 🟡 Moderate — Architecture: Storage adapter is local-disk, R2 swap pending

**Severity:** 🟡 Moderate
**Files affected:** `src/lib/storage.ts`
**Category:** Architecture (already clean), DevOps

**Symptom:**
`src/lib/storage.ts` writes to local `./storage/` directory. Survives container restart only if the volume is mounted; survives nothing else.

**Root cause chain:**
Not a root cause issue. Adapter is already shaped to swap.

**Root cause fix:**

Adapter shape verified — 3 functions (`saveFile`, `readFile`, `deleteFile`). R2 swap is **mechanical, not structural**:

```ts
// src/lib/storage.ts (R2 version, B6)
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET!;

export async function saveFile(file: File) {
  const ext = path.extname(file.name) || "";
  const key = `${randomUUID()}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: buf, ContentType: file.type,
  }));
  return { key, size: buf.length, mime: file.type || "application/octet-stream" };
}

export async function readFile(key: string): Promise<Buffer> {
  const safe = path.basename(key);
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: safe }));
  const chunks: Uint8Array[] = [];
  for await (const c of res.Body as AsyncIterable<Uint8Array>) chunks.push(c);
  return Buffer.concat(chunks);
}

export async function deleteFile(key: string) {
  const safe = path.basename(key);
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: safe }));
}
```

Callers (`saveFile(file)` / `readFile(key)` / `deleteFile(key)`) unchanged. **This is the canonical example of the "adapter pattern paying off" — zero domain-module edits.**

---

### 2.8 🟡 Moderate — Naming: Inconsistent rate-limit key prefixes

**Severity:** 🟡 Moderate
**Files affected:** `src/modules/interview/actions.ts:16` (`interview:`), `src/modules/interview/actions.ts:51` (`stt:`)
**Category:** Consistency

**Symptom:**
Rate-limit keys use different naming styles: `interview:<userId>`, `stt:<userId>`. The infra plan §6a Redis namespace spec uses `rl:gen:<userId>`, `rl:stt:<userId>`, `rl:code:<userId>`.

**Root cause chain:**
- Symptom: ad-hoc keys → WHY?
- No registry yet → covered in finding 2.3 root fix.

**Root cause fix:**
Subsumed by 2.3 (rate-limit policy registry). When `guardRate("gen", id)` is the only way to apply a limit, naming is enforced.

---

### 2.9 🟡 Moderate — Type safety: SessionUser type narrower than reality

**Severity:** 🟡 Moderate
**Files affected:** `src/modules/auth/guard.ts:3-8`
**Category:** Type Safety

**Symptom:**
`SessionUser` type only declares `id`, `role`, `status`, `gradeId`. The actual JWT has `providerId`, `sectionId`, `email`, `name`, and (soon) `jti` for revocation. Callers reach for `user.sectionId` and TypeScript can't catch typos.

**Root cause chain:**
- Symptom: ad-hoc type drift → WHY?
- Two sources of truth (NextAuth callback in `auth.ts:36-45` and the type alias in `guard.ts`) → WHY?
- No single `User` type derived from the JWT shape → **ROOT CAUSE: missing single source of type truth for the session user.**

**Root cause fix:**

Define once in `src/auth.config.ts` (already edge-safe), import everywhere:

```ts
// src/auth.config.ts (additions)
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: "super_admin" | "admin" | "student";
    status: "pending" | "approved" | "rejected";
    providerId: string | null;
    gradeId: string | null;
    sectionId: string | null;
    jti?: string; // for revocation check
  }
  interface Session {
    user: User;
  }
}
```

`guard.ts` imports `User` from `next-auth` instead of redefining.

---

### 2.10 🔵 Minor — Storage: `path.basename` guard is OK but no defense in depth

**Severity:** 🔵 Minor
**Files affected:** `src/lib/storage.ts:24, 29`
**Category:** Security

**Symptom:**
`path.basename(key)` prevents traversal but the comment is the only documentation of why. After R2 swap, the guard is unnecessary (R2 keys are not paths) but harmless.

**Fix:** Add a one-line comment block explaining the contract. No code change required.

---

### 2.11 🔵 Minor — Dead code: `judge0.ts` if Piston is canonical

**Severity:** 🔵 Minor
**Files affected:** `src/lib/judge0.ts`, `src/modules/coding/service.ts`
**Category:** Code Duplication

**Symptom:**
Both Piston and Judge0 adapters exist. Service layer picks based on env config. If Piston is the production choice (which §0 locks), Judge0 becomes dead weight that adds review burden.

**Fix:** Decide. Either:
- Keep both as runtime-switchable (current state, costs nothing) — document why in `src/lib/sandbox.ts` header.
- Delete Judge0 entirely once Piston is production-validated.

Defer to post-launch. Not blocking.

---

### 2.12 🔵 Minor — Audit log: still missing on curriculum mutations

**Severity:** 🔵 Minor
**Files affected:** `src/modules/curriculum/actions.ts` (all mutators)
**Category:** Observability

**Symptom:**
H0.15 in `POST-FEATURE-HARDENING.md` tracks this. Curriculum CRUD doesn't write `auditLog` entries. Admin actions for user mgmt do.

**Fix:** Already tracked in hardening doc.

---

## 3. Architecture recommendations

### 3.1 Keep what's working

The codebase has **textbook clean modular monolith structure**. The `app → modules → lib → db` dependency direction is enforced informally but consistently. The `actions.ts` / `service.ts` / `cache.ts` split inside each module is the right pattern. Do not refactor any of this.

### 3.2 Three small structural adds

| Add | Where | Purpose | Replaces |
|---|---|---|---|
| `src/lib/errors.ts` | New | `UpstreamError` typed error class | ad-hoc `throw new Error(...)` in adapters |
| `src/lib/cache.ts` | New | Redis client + `getOrSetGroqCache` wrapper | extends existing `assessment/cache.ts` |
| `src/lib/rate-limit-redis.ts` | New | Policy registry + `guardRate(key, id)` | extends existing `rate-limit.ts` (kept as fallback) |
| `middleware.ts` | Project root | Edge auth + revocation | nothing existed |

All four are **purely additive**. No existing file gets renamed or moved.

### 3.3 No refactor needed

- Module boundaries: keep as-is
- Service / action split: keep as-is
- Drizzle schema: keep as-is
- NextAuth setup: keep as-is, just extend the `User` interface (finding 2.9)
- Storage adapter: shape is right, just swap impl (finding 2.7)
- Postgres cache: stays as cold layer (finding 2.6)
- Domain modules: zero edits required for any Phase B blocker

---

## 4. Fix priority roadmap

Ordered by `INFRASTRUCTURE.md` §0.4 blocker labels, augmented with findings above.

| Priority | Blocker | Issue | Effort | Impact | Depends on |
|---|---|---|---|---|---|
| P0 | B4 | Redis wire-up (`cache.ts` + `rate-limit-redis.ts` + policy registry) | 4h | Unblocks B2, B7, fixes 2.3, 2.5, 2.6, 2.8 | none |
| P0 | B2 | `middleware.ts` at root (JWT + revocation) | 2h | Closes finding 2.1 | B4 (for revocation check) |
| P0 | B1 | `rehype-sanitize` on topic render | 1h | Closes 2.2 | none |
| P0 | B3 | `UpstreamError` class + Groq/Judge0 adoption | 1h | Closes 2.4 | none |
| P0 | B5 | Groq L1 model switch + L3 context truncate | 1h | $110 → $35/mo Groq | none |
| P1 | B6 | R2 storage swap in `storage.ts` | 2h | Closes 2.7 | none |
| P1 | B7 | Daily token cap + Sentry alert | 1h | Hard cost ceiling | B4 |
| P1 | B8 | Daily `pg_dump` → R2 cron | 1h | RPO 24h target | B6 |
| P2 | finding 2.3 part 2 | Rate-limit policy registry adoption | 1h | Prevents recurrence | B4 |
| P2 | finding 2.9 | Single-source `User` type | 30m | Type safety hardening | none |
| P3 | finding 2.11 | Decide Judge0 keep / delete | 30m | Cleanup | post-launch |
| P3 | finding 2.12 | Audit log on curriculum mutations | 2h | H0.15 fold-in | post-launch |

**Total P0 + P1 = 13 hours.** Matches `INFRASTRUCTURE.md` §0.4 estimate of "~12 hours of focused work" within 5% margin.

---

## 5. Positive findings

This section is non-negotiable. Things this codebase does WELL:

1. **Adapter pattern is consistently applied.** Every external integration (`groq`, `sandbox`, `judge0`, `storage`, `rate-limit`) lives in `src/lib/` with a thin function-call API. Domain modules never reach for `process.env.GROQ_API_KEY` directly. This is what makes the entire Phase B work mechanical.

2. **RBAC pattern is consistent.** Every server action begins with `requireStudent()` / `requireAdmin()`. No "I'll add the check later" half-implementations.

3. **SQL is parameterized everywhere.** Drizzle template tags used correctly; no string-interpolated queries found. The advisory CVE on drizzle 0.38 (H0.3) is not exploitable in this build.

4. **Module boundaries are clean.** `interview/` doesn't import from `coding/`. `assessment/` doesn't reach into `interview/`. Each domain owns its tables.

5. **Schema design is well thought out.** Cascading deletes set correctly. Indexes on hot query paths (`user_id`, `topic_id`, `status`, `provider_id`). UUID PKs with `defaultRandom()`. Timestamps timezoned with `defaultNow()`. The `progress` table will be the first to feel pressure but has the right shape.

6. **Cache abstraction already exists in the right place.** `assessment/cache.ts` is a clean precursor to the Redis layer — same key derivation pattern, same get/set shape.

7. **Auth shape is JWT-payload-ready.** All the fields needed by the upcoming `middleware.ts` (role, status, gradeId, sectionId) are already populated in the `authorize()` callback.

8. **Drizzle migrations versioned and reversible.** Every schema change is a versioned SQL file with a clear up/down path. No `db.execute('ALTER TABLE ...')` hacks.

9. **No "any" abuse.** TypeScript strict mode active. Adapter return types declared. Server action return types are discriminated unions (`{ ok: true, ... } | { ok: false, error }`).

10. **Docs match code.** `INFRASTRUCTURE.md`, `ARCHITECTURE.md`, and `POST-FEATURE-HARDENING.md` reference the actual file paths that exist. Documentation is not aspirational fiction.

---

## 6. Verdict

**Codebase is ready for Phase B.** No structural refactor is required. All eight pre-launch blockers map to specific adapter files and can be completed in ~13 hours of focused work. The architecture's "swap behind `src/lib/` adapters" promise (made in `ARCHITECTURE.md` and `INFRASTRUCTURE.md`) is **verified true**, not aspirational.

The only finding that warrants a small structural addition is the **rate-limit policy registry** (finding 2.3 part 2) — a 1-hour add that prevents the class of bug that produced two unprotected actions.

**No "rewrite this section" recommendations.** No "you're holding it wrong" critiques. The build is in good shape for the locked infra.

Proceed with B1 → B4 → B2 → B3 → B5 → B6 → B7 → B8.
