import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';
import { processAndUploadImage } from '@/lib/image/image-processor';

const CONCURRENCY = 3;

async function runBatch<T>(items: T[], fn: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(fn));
  }
}

async function main() {
  const admin = createAdminClient();

  const { data: jobs, error } = await admin
    .from('job_queue')
    .select('id, payload')
    .eq('status', 'completed')
    .order('id');

  if (error || !jobs) {
    console.error('Failed to fetch jobs', error);
    return;
  }

  const withImages = (jobs as any[]).filter((job) => {
    const row = (job.payload?.row || {}) as Record<string, string>;
    return row.image_url1;
  });

  console.log(`Found ${withImages.length} jobs with images. Re-backfilling hi-res versions (concurrency=${CONCURRENCY})...`);

  let processed = 0;
  let uploadedTotal = 0;
  let failed = 0;

  await runBatch(withImages, async (job) => {
    const placeId = job.payload.placeId as string;
    const row = (job.payload.row || {}) as Record<string, string>;
    const imageUrl = row.image_url1;

    console.log(`[${++processed}/${withImages.length}] ${row.name || placeId} :: ${imageUrl.slice(0, 80)}`);
    try {
      const uploaded = await processAndUploadImage(placeId, imageUrl, row.name);
      if (!uploaded) {
        console.log(`  -> skipped/failed`);
        failed++;
        return;
      }

      await admin.from('place_images').delete().eq('place_id', placeId);
      await admin.from('place_images').insert({
        place_id: placeId,
        url: uploaded.url,
        alt_text: uploaded.alt_text || row.name,
        is_primary: true,
      });
      uploadedTotal++;
      console.log(`  -> uploaded ${uploaded.url.slice(-40)}`);
    } catch (err: any) {
      console.error(`  -> error: ${err.message || err}`);
      failed++;
    }
  });

  console.log(`\nDone. Jobs: ${withImages.length}, uploaded: ${uploadedTotal}, failed: ${failed}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
