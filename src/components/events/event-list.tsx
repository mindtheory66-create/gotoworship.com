import { EventItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface EventListProps {
  events: EventItem[];
  emptyText?: string;
}

export function EventList({ events, emptyText = 'No events found.' }: EventListProps) {
  if (events.length === 0) {
    return <p className="text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">{event.title}</h4>
              <p className="text-sm text-slate-500">
                {new Date(event.start_datetime).toLocaleString()}
                {event.end_datetime && ` - ${new Date(event.end_datetime).toLocaleString()}`}
              </p>
              {event.category && (
                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {event.category}
                </span>
              )}
              {event.description && <p className="mt-2 text-sm text-slate-700">{event.description}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
