import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: true });

import { runWorkerLoop } from '@/lib/queue/worker';

async function main() {
  const batchSize = parseInt(process.env.QUEUE_BATCH_SIZE || '10', 10);
  const concurrency = parseInt(process.env.QUEUE_CONCURRENCY || '2', 10);
  const pollIntervalMs = parseInt(process.env.QUEUE_POLL_INTERVAL_MS || '15000', 10);

  console.log(`Queue worker started. Polling every ${pollIntervalMs}ms for pending jobs...`);
  console.log('Press Ctrl+C to stop.');

  let idleCycles = 0;
  const idleLogInterval = 6; // log "no jobs" roughly every 6 cycles to reduce noise

  // Graceful shutdown
  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log('\nShutting down queue worker...');
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  while (!shuttingDown) {
    try {
      const processed = await runWorkerLoop(batchSize, concurrency);

      if (processed > 0) {
        idleCycles = 0;
        // Immediately poll again in case more jobs were queued while we worked.
        continue;
      }

      idleCycles++;
      if (idleCycles % idleLogInterval === 1) {
        console.log(`No pending jobs. Waiting ${pollIntervalMs}ms...`);
      }
    } catch (err) {
      console.error('Worker loop error:', err);
      // Wait before retrying so a persistent error does not spin the CPU.
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

main().catch((err) => {
  console.error('Fatal worker error:', err);
  process.exit(1);
});
