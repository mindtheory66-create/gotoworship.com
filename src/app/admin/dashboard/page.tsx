import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  MapPin,
  CheckCircle,
  Clock,
  Users,
  FileText,
  BookOpen,
  Layers,
  ArrowRight,
  AlertCircle,
  Upload,
  CalendarDays,
  UserCog,
} from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | GoToWorship',
};
export const dynamic = 'force-dynamic';

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    published: 'bg-emerald-100 text-emerald-700',
    approved: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-slate-100 text-slate-700',
    ai_generated: 'bg-primary-100 text-primary-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  );
}

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600">Supabase is not configured. Please set your environment variables.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const [
    placesRes,
    eventsRes,
    profilesRes,
    postsRes,
    pagesRes,
    queueRes,
    recentPlacesRes,
    pendingEventsRes,
    recentUsersRes,
    profileRes,
  ] = await Promise.all([
    admin.from('places').select('status', { count: 'exact' }),
    admin.from('events').select('status', { count: 'exact' }),
    admin.from('profiles').select('role, approved', { count: 'exact' }),
    admin.from('blog_posts').select('status', { count: 'exact' }),
    admin.from('pages').select('status', { count: 'exact' }),
    admin.from('job_queue').select('status'),
    admin.from('places').select('id, name, city, state, status, created_at').order('created_at', { ascending: false }).limit(5),
    admin.from('events').select('id, title, status, created_at, place:places(name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    admin.from('profiles').select('id, full_name, role, approved, created_at').order('created_at', { ascending: false }).limit(5),
    user ? admin.from('profiles').select('full_name').eq('id', user.id).single() : { data: null, error: null },
  ]);

  const placesByStatus = (placesRes.data || []).reduce<Record<string, number>>((acc, row: any) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const eventsByStatus = (eventsRes.data || []).reduce<Record<string, number>>((acc, row: any) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const queueByStatus = (queueRes.data || []).reduce<Record<string, number>>((acc, row: any) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const totalUsers = profilesRes.count || 0;
  const contributors = ((profilesRes.data || []) as any[]).filter((r) => r.role === 'contributor').length;
  const pendingContributors = ((profilesRes.data || []) as any[]).filter(
    (r) => r.role === 'contributor' && !r.approved
  ).length;

  const stats = [
    { label: 'Total Places', value: placesRes.count || 0, icon: MapPin, color: 'text-primary-600', bg: 'bg-primary-100' },
    { label: 'Published', value: placesByStatus.published || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Pending Events', value: eventsByStatus.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Contributors', value: contributors, icon: Users, color: 'text-accent-600', bg: 'bg-accent-100' },
  ];

  const recentPlaces = (recentPlacesRes.data || []) as any[];
  const pendingEvents = (pendingEventsRes.data || []) as any[];
  const recentUsers = (recentUsersRes.data || []) as any[];
  const adminName = (profileRes.data as any)?.full_name || user?.email || 'Admin';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">Welcome back, {adminName}. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/import">
            <Button variant="secondary" size="sm">
              <Upload className="mr-2 h-4 w-4" /> Import CSV
            </Button>
          </Link>
          <Link href="/admin/places">
            <Button variant="secondary" size="sm">
              <MapPin className="mr-2 h-4 w-4" /> Places
            </Button>
          </Link>
          <Link href="/admin/events">
            <Button variant="secondary" size="sm">
              <CalendarDays className="mr-2 h-4 w-4" /> Events
            </Button>
          </Link>
          <Link href="/admin/blog/posts/new">
            <Button size="sm">
              <BookOpen className="mr-2 h-4 w-4" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 p-5 transition-colors hover:border-primary-300">
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Places</h2>
            </div>
            <Link href="/admin/places" className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentPlaces.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">No places yet.</td>
                  </tr>
                )}
                {recentPlaces.map((place: any) => (
                  <tr key={place.id}>
                    <td className="py-3 font-medium text-slate-900">{place.name}</td>
                    <td className="py-3 text-slate-500">{place.city}{place.state ? `, ${place.state}` : ''}</td>
                    <td className="py-3">{statusBadge(place.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">Pending Events</h2>
            </div>
            <Link href="/admin/events" className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline">
              Moderate <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingEvents.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No pending events.</p>
            )}
            {pendingEvents.map((event: any) => (
              <div key={event.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="font-medium text-slate-900">{event.title}</p>
                <p className="text-xs text-slate-500">{event.place?.name || 'Unknown place'}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Users</h2>
            </div>
            <Link href="/admin/users" className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline">
              Manage <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">No users yet.</td>
                  </tr>
                )}
                {recentUsers.map((u: any) => (
                  <tr key={u.id}>
                    <td className="py-3 font-medium text-slate-900">{u.full_name || '-'}</td>
                    <td className="py-3">{statusBadge(u.role)}</td>
                    <td className="py-3">
                      {u.approved ? (
                        <span className="inline-flex items-center text-emerald-600"><CheckCircle className="mr-1 h-4 w-4" /> Yes</span>
                      ) : (
                        <span className="inline-flex items-center text-slate-500"><Clock className="mr-1 h-4 w-4" /> No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900">System Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Users</span>
              <span className="font-semibold text-slate-900">{totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Pending Contributors</span>
              <span className="font-semibold text-amber-600">{pendingContributors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Blog Posts</span>
              <span className="font-semibold text-slate-900">{postsRes.count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Static Pages</span>
              <span className="font-semibold text-slate-900">{pagesRes.count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Queue Pending</span>
              <span className="font-semibold text-slate-900">{queueByStatus.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Queue Failed</span>
              <span className="font-semibold text-red-600">{queueByStatus.failed || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
