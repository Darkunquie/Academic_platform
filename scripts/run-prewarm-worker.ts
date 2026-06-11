/**
 * Groq pre-warm worker. Polls the groq_prewarm_queue table and fires
 * generation jobs ahead of student demand. Cache hit ratio on first student
 * visit goes from ~0% → ~90% with this running.
 *
 * Usage (host cron, runs every 30 seconds):
 *   * * * * * cd /opt/preplyfly && pnpm prewarm:tick >> /var/log/preplyfly-prewarm.log 2>&1
 *   * * * * * sleep 30 && cd /opt/preplyfly && pnpm prewarm:tick >> /var/log/preplyfly-prewarm.log 2>&1
 *
 * Or as a long-running container:
 *   while true; do pnpm prewarm:tick; sleep 30; done
 *
 * Each tick processes up to MAX_PER_TICK jobs sequentially to keep Groq
 * request rate sane. Reset stalled jobs (running > 10 min) at start of tick.
 */

import "dotenv/config";
import { generateMcqs } from "@/modules/assessment/generate";
import { generateInterviewQuestions } from "@/modules/interview/generate";
import {
  claimNextPrewarmJob,
  markPrewarmDone,
  markPrewarmFailed,
  resetStalledPrewarms,
} from "@/modules/assessment/prewarm";

const MAX_PER_TICK = 5;

async function processOne(): Promise<boolean> {
  const job = await claimNextPrewarmJob();
  if (!job) return false;

  console.log(
    `[prewarm] job ${job.id} topic=${job.topicId} kind=${job.kind} diff=${job.difficulty} count=${job.count}`
  );

  try {
    if (job.kind === "mock_test") {
      await generateMcqs(job.topicId, job.count, job.difficulty);
    } else if (job.kind === "interview") {
      await generateInterviewQuestions(
        [job.topicId],
        job.count,
        job.difficulty
      );
    } else {
      throw new Error(`unsupported prewarm kind: ${job.kind}`);
    }
    await markPrewarmDone(job.id);
    console.log(`[prewarm] done ${job.id}`);
  } catch (e) {
    const msg = (e as Error).message ?? "unknown error";
    await markPrewarmFailed(job.id, msg);
    console.error(`[prewarm] failed ${job.id}: ${msg}`);
  }
  return true;
}

async function main() {
  const stalled = await resetStalledPrewarms(10);
  if (stalled > 0) console.log(`[prewarm] reset ${stalled} stalled job(s)`);

  let processed = 0;
  for (let i = 0; i < MAX_PER_TICK; i += 1) {
    const ok = await processOne();
    if (!ok) break;
    processed += 1;
  }
  if (processed === 0) console.log("[prewarm] queue empty");
  else console.log(`[prewarm] tick complete: ${processed} job(s)`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(`[prewarm] fatal: ${(e as Error).message}`);
    process.exit(1);
  });
