# Preplyfly — Prep. Fly.

> Prepare yourself.

Multi-board learning platform: School → Professional. Content, mock tests,
voice/text AI interviews, and a coding sandbox.

## Stack
Next.js 16 (App Router, TS) · Drizzle + PostgreSQL · Auth.js · Groq (Llama + Whisper)
· browser SpeechSynthesis TTS · Judge0 sandbox · Cloudflare R2 · Hetzner + Coolify.

## Local development

Prereqs: Node 20+, pnpm, Docker.

```powershell
# 1. Start Postgres
docker compose up -d

# 2. Install deps
pnpm install

# 3. Create the database schema
pnpm db:push        # pushes schema.ts straight to the DB (dev)
# or: pnpm db:generate && pnpm db:migrate   (versioned migrations)

# 4. Run the app
pnpm dev
```

Open http://localhost:3000 — and http://localhost:3000/api/health
(should report `"database": "up"`).

`pnpm db:studio` opens Drizzle Studio to browse data.

## Project layout
```
src/
  app/            # routes + pages (thin) + /api route handlers
  db/             # schema.ts (single source of truth) + client
  lib/            # shared helpers (cn, scope guards, ...)
  modules/        # domain logic by phase (auth, curriculum, content, ...)
```

## Build phases
0. Scaffold (this) · 1. Auth+RBAC+approval · 2. Curriculum CRUD ·
3. Content+TTS · 4. Mock test+AI · 5. Interview (voice/text) ·
6. Coding sandbox · 7. Analytics+deploy.

See `ARCHITECTURE-RECOMMENDATION.md` for the full plan.
