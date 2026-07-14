import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { PlacesTable } from '@/components/admin/places-table';

export const metadata = {
  title: 'Manage Places | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function AdminPlacesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold">Manage Places</h1>
        <p className="text-slate-600">Supabase is not configured.</p>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from('places').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Manage Places</h1>
      <PlacesTable places={data || []} />
    </div>
  );
}
