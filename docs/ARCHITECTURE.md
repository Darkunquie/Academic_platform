# Architecture — Preplyfly (Academic Platform)

**Status:** Finalized 2026-06-10 · Phase 8 build complete · Pre-production hardening pending
**Stack:** Next.js 16 (App Router, RSC) · React 19 · TypeScript 5.7 · PostgreSQL 16 · Drizzle ORM · NextAuth v5
**Deploy target:** Single-VPS Docker (Hetzner + Coolify); R2 + Redis swap for horizontal scale

---

## 1. System overview

Modular monolith. Server-rendered Next.js App Router with thin route components delegating to `src/modules/<domain>/` for business logic. Single PostgreSQL DB. Three external services: Groq (LLM + Whisper STT), Piston (code sandbox; Judge0 fallback), Cloudflare R2 (file storage; not yet wired — local disk in current build).

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser (React 19 RSC)                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS (Coolify Caddy)
┌──────────────────────────────┴──────────────────────────────────┐
│   Next.js standalone (node:22-alpine, non-root)  :3000           │
│   ├── App Router routes (server components + actions)            │
│   ├── src/modules/<domain>/  (auth, curriculum, content,         │
│   │      assessment, interview, coding, web, admin,              │
│   │      analytics, self-upload)                                 │
│   └── src/lib/  (groq, sandbox, judge0, storage, rate-limit)     │
└────┬─────────────┬────────────────┬────────────────┬─────────────┘
     │             │                │                │
     ▼             ▼                ▼                ▼
  Postgres 16   Piston :2000   Groq API         Local disk
  (drizzle)    (privileged)    (Llama 3.3 +     /app/storage
                                Whisper)         (→ R2 prod)
```

---

## 2. Module boundaries

| Module | Responsibility |
|---|---|
| `auth` | Credentials signup/login (bcryptjs), JWT session, RBAC guards (`requireStudent` / `requireAdmin` / `requireSuperAdmin`), approval workflow |
| `curriculum` | Tree: sections → providers → grades → subjects → chapters → topics. Admin CRUD + student traversal |
| `content` | Topic body HTML, markdown rendering, asset attachments (PDF/image/audio) |
| `assessment` | MCQ generation (Groq), DOCX/MD import, scoring, student attempts, LLM cache |
| `interview` | Multi-topic session lifecycle, Groq question generation, Whisper STT, AI answer scoring |
| `coding` | Coding question CRUD, test cases, Piston/Judge0 submission grading, language mapping |
| `web` | HTML/CSS/JS challenges with DOM assertion checks |
| `admin` | User approve/reject/role/scope, audit log writes |
| `analytics` | Read-only aggregations (progress, drill-down) |
| `self-upload` | Student PDF → text → Groq → ephemeral MCQ/interview (3/day quota) |

**Rule:** routes contain only data fetch + render. All mutations go through `actions.ts` (server actions) which call `service.ts`. RBAC enforced at action entry.

---

## 3. Data model (Drizzle, 27 tables)

**Identity:** `users`, `admin_scope`
**Curriculum tree:** `sections`, `providers`, `grades`, `subjects`, `chapters`, `topics` (FK cascading deletes)
**Content:** `topic_content`, `content_assets`
**Assessment:** `questions`, `question_options`, `test_attempts`, `test_answers`
**Coding:** `coding_questions`, `coding_test_cases`, `coding_submissions`
**Web:** `web_questions`, `web_checks`, `web_submissions`
**Interview:** `interview_sessions`, `interview_session_topics`, `interview_questions`, `interview_answers`
**Progress / cache / audit:** `progress`, `generated_content` (Groq cache), `audit_log`

All PKs are UUID, timestamps timezoned, queries parameterized via Drizzle template tags (verified — no string-interpolated SQL).

---

## 4. Auth + RBAC

- NextAuth v5 beta — Credentials provider, JWT strategy (no DB sessions).
- JWT payload: `id`, `role`, `status`, `gradeId`, `sectionId`, `providerId`.
- `src/modules/auth/guard.ts` exposes `requireStudent()` / `requireAdmin()` / `requireSuperAdmin()` — called at server action entry and at top of admin server components.
- Approval flow: signup → `status=pending` → admin approves → `status=approved` → next login carries new status.
- Audit log entries written for `set_admin_scope`, `change_role`, `set_status_*`, `reset_password`, `create_admin`, `create_super_admin`.

**Gap:** no project-root `middleware.ts`. All gating happens in server components / actions. Adding edge middleware is the recommended next step (see §8).

---

## 5. External integrations

| Service | File | Notes |
|---|---|---|
| Groq (LLM) | `src/lib/groq.ts` | `groqChat()`, `groqJson()`, `groqTranscribe()`. Models: `llama-3.3-70b-versatile` (default), `llama-3.1-8b-instant` (fast). JSON mode forced for all generation calls |
| Whisper STT | same file | `whisper-large-v3-turbo` via Groq audio endpoint |
| Piston | `src/lib/sandbox.ts` | Internal Docker network, `http://piston:2000`. Per-language CPU caps |
| Judge0 | `src/lib/judge0.ts` | Fallback if Piston not configured. Optional RapidAPI headers |
| R2 (planned) | `src/lib/storage.ts` | Currently writes to `./storage/`. R2 env vars defined but client not wired |

**Secrets:** all via `process.env.*` at runtime. `.env` + `.env.local` gitignored. Only `.env.example` tracked. No leaked credential patterns found in source.

---

## 6. AI usage paths

| Flow | User input → prompt | Output destination |
|---|---|---|
| MCQ generation | Topic content (admin-authored) + count + difficulty | `questions` + `question_options` + Groq cache |
| Interview question generation | Selected topicIds + difficulty + count → topic content chunks | `interview_questions` + Groq cache |
| Interview scoring | Question + ideal answer + student transcript | `interview_answers.score` + `feedback` |
| Self-upload pipeline | Student PDF text (truncated 12k) → Groq | Ephemeral MCQ / interview, not persisted to curriculum |

All Groq calls use forced JSON output mode. Cache key includes provider/grade/subject/topic chain to prevent cross-tenant cache hits.

---

## 7. Deployment

- **Dockerfile:** multi-stage (deps → build → runner). Final image `node:22-alpine`, non-root `app` user, copies `.next/standalone` + `.next/static` + `public` + `drizzle/`.
- **docker-compose.prod.yml:** three services — `app` (3000), `postgres:16-alpine` (volume `pgdata`), `piston` (privileged, no public port).
- **Migrations:** `pnpm db:migrate` (manual or pre-start hook).
- **Secrets:** Coolify UI or `.env.production` on host.

---

## 8. Pre-production hardening (must ship before public launch)

Cross-referenced with `docs/POST-FEATURE-HARDENING.md`. Listed in fix-order priority.

| # | Risk | Location | Fix |
|---|---|---|---|
| 1 | XSS via raw HTML render of topic body | `src/app/dashboard/topic/[topicId]/page.tsx:182` (`dangerouslySetInnerHTML`) | Add `rehype-sanitize` or DOMPurify pass on `bodyHtml` before render. Admin account compromise currently equals stored XSS on every student |
| 2 | No edge auth | project root | Add `middleware.ts` with route matchers — reject unauthenticated at edge, redirect pending/non-approved to `/pending`, reject non-admin from `/admin/*` |
| 3 | In-memory rate limit | `src/lib/rate-limit.ts` | Swap to Redis token bucket before scaling beyond one container. Current limiter resets on deploy and is bypassable across instances |
| 4 | Local-disk storage | `src/lib/storage.ts` | Wire R2 S3 client. Redeploys currently lose uploaded PDFs / assets |
| 5 | Error leakage | `src/lib/groq.ts`, `judge0.ts` | Mask upstream response bodies in user-facing errors. Log raw text server-side only |
| 6 | Audit log coverage gap | `src/modules/curriculum/*` | Extend audit log to curriculum mutations (delete topic / chapter / subject), self-upload events, interview session start |
| 7 | Piston container escape risk | `docker-compose.prod.yml` | Keep `privileged: true` (sandbox needs it) but pin image SHA + monthly update cadence; add ulimits at compose level |
| 8 | No email verification | `src/modules/auth/service.ts` | Add email link activation before approval queue. Currently anyone can submit any email |
| 9 | JWT TTL not explicit | `src/auth.config.ts` | Set `session.maxAge` (e.g., 7d) + `updateAge` explicitly. Don't rely on NextAuth defaults |
| 10 | DB backups | infra | Coolify daily `pg_dump` cron + offsite copy (R2 or B2) |

---

## 9. Scale headroom

Current single-VPS topology comfortably handles ~500 concurrent students per Hetzner CX42. Horizontal scaling requires:

1. R2 storage (kills local-disk dependency)
2. Redis session store (NextAuth JWT works stateless, but rate limiter + Groq cache hits benefit)
3. Externalize Piston (one pod per N containers, queue via Redis)
4. Postgres read replica for analytics drill-down queries

See `docs/scale-analysis.md` for capacity math.

---

## 10. Verdict

**Architecture is finalized and production-viable** for the initial Hetzner + Coolify single-instance deployment, conditional on completing items 1–5 in §8 before public launch. Module boundaries are clean, RBAC enforcement is consistent, data model is normalized with cascading deletes, and external dependencies are isolated behind `src/lib/` adapters that can be swapped without touching domain modules.

**No structural refactors needed.** All remaining work is hardening, observability, and the R2 wire-up.
