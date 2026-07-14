import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { EventSubmissionForm } from '@/components/events/event-submission-form';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Submit Event | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <h1 className="mb-6 text-2xl font-bold">Submit New Event</h1>
          <p className="text-slate-600">Supabase is not configured.</p>
        </Card>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('places')
    .select('id, name')
    .eq('status', 'published')
    .order('name');

  const places = (data || []) as { id: string; name: string }[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <h1 className="mb-6 text-2xl font-bold">Submit New Event</h1>
        <EventSubmissionForm places={places} />
      </Card>
    </div>
  );
}
