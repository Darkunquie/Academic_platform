/**
 * Nightly Postgres backup → Cloudflare R2.
 *
 * Runs `pg_dump` against DATABASE_URL, gzips the output, and uploads to R2
 * with a date-stamped key. Retains 30 days of dumps via R2 lifecycle policy
 * (configure once in Cloudflare dashboard — this script does not delete).
 *
 * Usage (host cron):
 *   0 2 * * *  cd /opt/preplyfly && pnpm db:backup >> /var/log/preplyfly-backup.log 2>&1
 *
 * Required env:
 *   DATABASE_URL
 *   R2_ENDPOINT
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET           (must include backup prefix or use BACKUP_BUCKET below)
 * Optional env:
 *   BACKUP_BUCKET       (defaults to R2_BUCKET)
 *   BACKUP_PREFIX       (defaults to "backups/postgres/")
 */

import { spawn } from "node:child_process";
import { createGzip } from "node:zlib";
import { Readable } from "node:stream";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const dbUrl = env("DATABASE_URL");
  const endpoint = env("R2_ENDPOINT");
  const accessKeyId = env("R2_ACCESS_KEY_ID");
  const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
  const bucket = process.env.BACKUP_BUCKET || env("R2_BUCKET");
  const prefix = process.env.BACKUP_PREFIX ?? "backups/postgres/";

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const key = `${prefix}preplyfly-${stamp}.sql.gz`;

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  console.log(`[backup] starting pg_dump → r2://${bucket}/${key}`);
  const startedAt = Date.now();

  const dbUrlParsed = new URL(dbUrl);
  const pgEnv = {
    PGHOST: dbUrlParsed.hostname,
    PGPORT: dbUrlParsed.port || "5432",
    PGDATABASE: decodeURIComponent(dbUrlParsed.pathname.slice(1)),
    PGUSER: decodeURIComponent(dbUrlParsed.username),
    PGPASSWORD: decodeURIComponent(dbUrlParsed.password),
  };

  const dump = spawn("pg_dump", ["--no-owner", "--no-acl", "--format=plain"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...pgEnv },
  });

  let stderrBuf = "";
  dump.stderr.on("data", (chunk) => {
    stderrBuf += chunk.toString();
  });

  const dumpExit = new Promise<void>((resolve, reject) => {
    dump.on("error", reject);
    dump.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pg_dump exited ${code}: ${stderrBuf.slice(0, 500)}`));
    });
  });

  const gzip = createGzip({ level: 6 });
  dump.stdout.pipe(gzip);

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Readable.toWeb(gzip) as unknown as ReadableStream,
        ContentType: "application/gzip",
      })
    );
    await dumpExit;
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`[backup] done in ${elapsed}s → r2://${bucket}/${key}`);
  } catch (e) {
    console.error(`[backup] failed: ${(e as Error).message}`);
    if (stderrBuf) console.error(`[backup] pg_dump stderr: ${stderrBuf.slice(0, 1000)}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`[backup] fatal: ${(e as Error).message}`);
  process.exit(1);
});
