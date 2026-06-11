# Preplyfly — Deployment guide (Hetzner CPX21 + Coolify)

Single VPS, ~€8/mo. Everything runs on one box: app + Postgres + Piston
sandbox + uploads. Only external dependency: Groq (AI).

---

## 0. Pre-flight (do BEFORE the first deploy)

### 0.1 Server
- Hetzner Cloud **CPX21** (3 vCPU / 4GB), **Ubuntu 24.04**. Note the public IP.

### 0.2 Swap — REQUIRED on 4GB
`next build` needs 1.5–3GB on top of the running stack. Without swap the
first Coolify build **OOM-kills** (possibly taking Postgres with it):
```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 0.3 DNS
A-record `@` (and `www`) → server IP. Coolify auto-issues HTTPS.

### 0.4 Groq
Add a card at console.groq.com (stays free) → **10× rate limits**. Without it,
~3 simultaneous interviews exhaust the 30 req/min free tier.

---

## 1. Install Coolify
```bash
curl -fsSL https://cdn.coolify.io/v4/install.sh | bash
```
Open `http://<ip>:8000`, create the admin account.

## 2. Add the app
New Resource → **Docker Compose** → connect the GitHub repo →
compose file: `docker-compose.prod.yml`. Set the domain on the app service.

## 3. Environment — HARD CHECKLIST
Every one of these is required. Missing `AUTH_TRUST_HOST` = login redirect
loop. Missing `DATABASE_URL` = app boots but 500s on first query.

```bash
DATABASE_URL=postgresql://app:<STRONG_PASS>@postgres:5432/academic
POSTGRES_USER=app
POSTGRES_PASSWORD=<STRONG_PASS>          # must match DATABASE_URL
POSTGRES_DB=academic
AUTH_SECRET=<openssl rand -hex 32>       # NEW value, never the dev one
AUTH_TRUST_HOST=true                     # REQUIRED behind Coolify's proxy
AUTH_URL=https://preplyfly.com
GROQ_API_KEY=gsk_...
PISTON_URL=http://piston:2000

# Optional — model overrides (change here if Groq retires a model; no redeploy)
# GROQ_MODEL=llama-3.3-70b-versatile
# GROQ_FAST_MODEL=llama-3.1-8b-instant
# GROQ_STT_MODEL=whisper-large-v3-turbo

# Optional — Cloudflare R2 (otherwise uploads use the local volume)
# R2_ENDPOINT=...  R2_ACCESS_KEY_ID=...  R2_SECRET_ACCESS_KEY=...  R2_BUCKET=...
```

## 4. First boot — run ONCE, in order
Shell into the **app** container (Coolify → Terminal):
```bash
pnpm db:migrate                              # create all tables

# Create the one super admin from env vars (idempotent).
SUPER_ADMIN_EMAIL=you@yourdomain.com \
SUPER_ADMIN_PASSWORD='<24+ char random>' \
SUPER_ADMIN_NAME='Your Name' \
  pnpm bootstrap:super-admin

ALLOW_PROD_SEED=1 pnpm db:seed               # (optional) sections + boards + classes
ALLOW_PROD_SEED=1 pnpm db:seed:universities  # (optional) UGC universities CSV
```
Install sandbox languages (from inside the app container or any container on
the Docker network — `piston` resolves only inside the compose network, not
from the VPS host):
```bash
for L in '{"language":"python","version":"3.12.0"}' \
         '{"language":"node","version":"20.11.1"}' \
         '{"language":"gcc","version":"10.2.0"}'; do
  curl -s -X POST http://piston:2000/api/v2/packages \
    -H 'content-type: application/json' -d "$L"
done
```
Log in as the super admin with the email + password you passed to
`bootstrap:super-admin`. No default credentials exist in this build.

## 5. Backups — night one, not later
```bash
mkdir -p /opt/preplyfly/scripts /backups
# copy scripts/backup.sh to the server, then:
chmod +x /opt/preplyfly/scripts/backup.sh
crontab -e   # add:
# 0 3 * * * /opt/preplyfly/scripts/backup.sh >> /var/log/preplyfly-backup.log 2>&1
```
Also enable Hetzner snapshot backups (+20% server cost) for whole-disk
recovery. Periodically copy `/backups` off-box (Hetzner Storage Box / R2).

## 6. Post-deploy smoke test
1. `https://domain/api/health` → `{"database":"up"}`
2. Login super admin → Approvals/Curriculum/Analytics load
3. Signup a student (state filter works) → approve → student login
4. Topic: content + read-aloud + video render
5. Mock test: take + AI generate (cached on second run)
6. Interview: text mode, then voice (mic needs HTTPS — use the domain)
7. Coding: run the seeded "Sum Two Numbers" → 3/3 accepted

## Operational notes
- Postgres is tuned for this 4GB box in `docker-compose.prod.yml`
  (`shared_buffers=512MB`). If you resize the server, retune.
- App container has a healthcheck on `/api/health` → restarts on hang.
- Local uploads refuse writes when free disk < 5GB (guard in `storage.ts`).
- Groq calls retry 429/5xx twice with backoff (`lib/groq.ts`).
- Upgrade path: CPX21 → CPX31 (8GB) is a 2-minute Hetzner resize when
  concurrent users grow.
