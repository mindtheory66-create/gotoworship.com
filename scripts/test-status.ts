import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';

async function main() {
  const admin = createAdminClient();
  const { data: places, error } = await admin.from('places').select('name, status, content_long').order('updated_at', { ascending: false }).limit(3);
  console.log('Recent places:', places);
  const { count: publishedCount } = await admin.from('places').select('*', { count: 'exact', head: true }).eq('status', 'published');
  const { count: queuePending } = await admin.from('job_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  console.log('Published count:', publishedCount);
  console.log('Queue pending:', queuePending);
  if (places && places[0]?.content_long) {
    console.log('Word count last:', places[0].content_long.split(/\s+/).filter(Boolean).length);
  }
}

main().catch(console.error);
