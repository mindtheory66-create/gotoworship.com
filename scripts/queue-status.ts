import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';

async function main() {
  const admin = createAdminClient();
  const { data: statuses } = await admin.from('job_queue').select('status');
  const counts = statuses?.reduce((acc: any, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as any);
  console.log('counts', counts);
  const { data: processing } = await admin.from('job_queue').select('id,status,attempts,error').eq('status', 'processing').limit(5);
  console.log('processing rows', processing);
  const { data: recent } = await admin.from('job_queue').select('id,status,attempts,error,scheduled_for').order('created_at', { ascending: false }).limit(5);
  console.log('recent rows', recent);
}
main();
