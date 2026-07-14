import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';

async function main() {
  const admin = createAdminClient();
  const { data } = await admin.from('place_images').select('url, place_id').limit(20);
  for (const img of data || []) {
    const { data: place } = await admin.from('places').select('name').eq('id', img.place_id).single();
    console.log(place?.name, img.url);
  }
}
main();
