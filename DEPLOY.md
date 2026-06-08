# Deployment guide (Hetzner + Coolify)

Solo-friendly, ~€8/mo. Coolify gives Vercel-like git-push deploys on your own VPS.

## 1. Provision the server
- Create a **Hetzner Cloud CPX21** (or larger) — Ubuntu 24.04.
- Install **Coolify**:
  ```bash
  curl -fsSL https://cdn.coolify.io/v4/install.sh | bash
  ```
- Open Coolify at `https://<server-ip>:8000`, create an account.

## 2. Add the app
- New Resource → **Docker Compose** (or connect this Git repo).
- Point it at `docker-compose.prod.yml`.
- Set a domain; Coolify provisions HTTPS automatically.

## 3. Environment (`.env.production`)
Copy from `.env.example` and fill:
```
DATABASE_URL=postgresql://app:STRONGPASS@postgres:5432/academic
AUTH_SECRET=<openssl rand -hex 32>
GROQ_API_KEY=gsk_...
PISTON_URL=http://piston:2000
# storage: switch local disk → Cloudflare R2 (see below)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=academic-content
```
Set `POSTGRES_PASSWORD` to match `DATABASE_URL`.

## 4. First boot
```bash
# run migrations against the prod DB
pnpm db:migrate
# seed sections/boards + super admin
pnpm db:seed
# install sandbox languages (once)
curl -X POST http://piston:2000/api/v2/packages -H 'content-type: application/json' -d '{"language":"python","version":"3.12.0"}'
curl -X POST http://piston:2000/api/v2/packages -H 'content-type: application/json' -d '{"language":"node","version":"20.11.1"}'
curl -X POST http://piston:2000/api/v2/packages -H 'content-type: application/json' -d '{"language":"gcc","version":"10.2.0"}'
```
Then change the super-admin password.

## 5. Production hardening checklist
- [ ] Switch storage from local disk (`src/lib/storage.ts`) to **Cloudflare R2** (S3 client). Local disk is dev-only.
- [ ] Set a strong `AUTH_SECRET` and DB password.
- [ ] Daily `pg_dump` backup cron → off-box (R2/B2).
- [ ] Restrict Piston to the internal Docker network (no public port — already the case in `docker-compose.prod.yml`).
- [ ] Sanitize admin Markdown if you ever allow non-trusted authors (add `rehype-sanitize`).
- [ ] Move the in-memory rate limiter (`src/lib/rate-limit.ts`) to Redis if you run >1 app instance.
- [ ] Add error monitoring (Sentry) and uptime checks on `/api/health`.

## Notes
- The Dockerfile uses Next.js **standalone** output (`output: "standalone"`), so the image is small.
- Piston needs `privileged: true` to sandbox code; that's expected and isolated to that container.
- Phase roadmap & architecture: `ARCHITECTURE-RECOMMENDATION.md`, `docs/PHASE-PLAN.md`.
