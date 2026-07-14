import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';

async function main() {
  const admin = createAdminClient();
  const { count: placesCount, error: pErr } = await admin.from('places').select('*', { count: 'exact', head: true });
  const { count: queueCount, error: qErr } = await admin.from('job_queue').select('*', { count: 'exact', head: true });
  console.log('Places count:', placesCount, 'error:', pErr);
  console.log('Queue count:', queueCount, 'error:', qErr);
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
}

main().catch(console.error);
