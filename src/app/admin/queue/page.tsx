import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { Card } from '@/components/ui/card';
import { Clock, CheckCircle, Loader2, AlertCircle, Terminal } from 'lucide-react';

export const metadata = {
  title: 'Queue Monitor | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function QueueMonitorPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold">Queue Monitor</h1>
        <p className="text-slate-600">Supabase is not configured.</p>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: statsData } = await admin.from('job_queue').select('status', { count: 'exact' });

  const { data: recentJobs } = await admin
    .from('job_queue')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const stats = (statsData || []).reduce<Record<string, number>>((acc, row: any) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const statCards = [
    { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Processing', value: stats.processing || 0, icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Completed', value: stats.completed || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Failed', value: stats.failed || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Queue Monitor</h1>
      <p className="mb-6 text-slate-500">Track background import jobs.</p>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50 p-4">
        <Terminal className="h-5 w-5 text-primary-600" />
        <p className="text-sm text-primary-800">
          Run worker: <code className="rounded-lg bg-white px-2 py-1 font-semibold text-primary-700">npm run queue:worker</code>
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 font-bold text-slate-700">Type</th>
              <th className="px-5 py-4 font-bold text-slate-700">Status</th>
              <th className="px-5 py-4 font-bold text-slate-700">Attempts</th>
              <th className="px-5 py-4 font-bold text-slate-700">Error</th>
              <th className="px-5 py-4 font-bold text-slate-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {(recentJobs || []).map((job: any) => (
              <tr key={job.id} className="border-t border-slate-100">
                <td className="px-5 py-4">{job.type}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      job.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : job.status === 'processing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-4">{job.attempts}</td>
                <td className="max-w-xs truncate px-5 py-4 text-red-600">{job.error || '-'}</td>
                <td className="px-5 py-4 text-slate-500">{new Date(job.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
