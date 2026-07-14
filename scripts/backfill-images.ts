import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';
import { processPlaceImages } from '@/lib/image/image-processor';

async function main() {
  const admin = createAdminClient();
  const { data: jobs, error } = await admin.from('job_queue').select('id, payload, status').eq('status', 'completed');
  if (error || !jobs) {
    console.error('Failed to fetch jobs', error);
    return;
  }

  let processed = 0;
  let uploadedTotal = 0;

  for (const job of jobs as any[]) {
    const placeId = job.payload.placeId as string;
    const row = (job.payload.row || {}) as Record<string, string>;
    const imageUrls = [row.image_url1, row.image_url2, row.image_url3].filter(Boolean) as string[];
    if (imageUrls.length === 0) continue;

    const { count } = await admin.from('place_images').select('*', { count: 'exact', head: true }).eq('place_id', placeId);
    if ((count || 0) > 0) continue;

    console.log(`[${++processed}] Backfilling images for ${row.name || placeId}`);
    try {
      const uploaded = await processPlaceImages(placeId, imageUrls);
      for (let idx = 0; idx < uploaded.length; idx++) {
        await admin.from('place_images').insert({
          place_id: placeId,
          url: uploaded[idx].url,
          alt_text: uploaded[idx].alt_text || row.name,
          is_primary: idx === 0,
        });
      }
      uploadedTotal += uploaded.length;
      console.log(`  Uploaded ${uploaded.length} image(s)`);
    } catch (err) {
      console.error('  Failed:', err);
    }
  }

  console.log(`Backfill complete. Processed ${processed} places, uploaded ${uploadedTotal} images.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
