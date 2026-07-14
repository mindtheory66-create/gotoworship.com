import { createAdminClient } from '@/lib/supabase/admin';
import { ProcessPlacePayload } from './types';

export async function enqueueProcessPlace(payload: ProcessPlacePayload) {
  const admin = createAdminClient();
  const { data, error } = await admin.from('job_queue').insert({
    type: 'process_place',
    payload,
    status: 'pending',
    attempts: 0,
    scheduled_for: new Date().toISOString(),
  }).select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getQueueStats(): Promise<Record<string, number>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('job_queue')
    .select('status', { count: 'exact' });

  if (error || !data) return {};

  return (data as { status: string }[]).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});
}

export async function getPendingJobs(limit = 100) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('job_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data;
}
