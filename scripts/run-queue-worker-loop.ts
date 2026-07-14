import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';
import { runWorkerLoop } from '@/lib/queue/worker';

async function main() {
  const batchSize = parseInt(process.env.QUEUE_BATCH_SIZE || '12', 10);
  const concurrency = parseInt(process.env.QUEUE_CONCURRENCY || '3', 10);
  const admin = createAdminClient();

  while (true) {
    const processed = await runWorkerLoop(batchSize, concurrency);
    if (processed === 0) break;

    const { data: pending } = await admin.from('job_queue').select('id').eq('status', 'pending');
    console.log(`Remaining pending: ${pending?.length ?? 0}`);
    if ((pending?.length ?? 0) === 0) break;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('All jobs processed');
  process.exit(0);
}

main().catch((err) => {
  console.error('Worker loop error:', err);
  process.exit(1);
});
