import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { UsersTable } from '@/components/admin/users-table';

export const metadata = {
  title: 'Manage Users | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold">Manage Users</h1>
        <p className="text-slate-600">Supabase is not configured.</p>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Manage Users</h1>
      <UsersTable users={data || []} />
    </div>
  );
}
