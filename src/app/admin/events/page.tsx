import { getPendingEvents } from '@/lib/db/events';
import { EventsTable } from '@/components/admin/events-table';

export const metadata = {
  title: 'Moderate Events | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const events = await getPendingEvents();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Event Moderation</h1>
      <EventsTable events={events} />
    </div>
  );
}
