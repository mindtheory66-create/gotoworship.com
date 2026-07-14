import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';

async function main() {
  const admin = createAdminClient();
  const { data: jobs, error } = await admin.from('job_queue').select('payload').limit(5);
  if (error) { console.error(error); return; }
  for (const j of jobs || []) {
    const row = (j.payload as any).row || {};
    console.log('name:', (j.payload as any).row?.name);
    console.log('image_url1:', row.image_url1);
  }
}
main();
