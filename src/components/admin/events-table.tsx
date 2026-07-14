'use client';

import { useState } from 'react';
import { EventItem } from '@/types';
import { updateEventStatus } from '@/lib/admin/actions';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Check, X, Sparkles, Calendar } from 'lucide-react';

interface EventsTableProps {
  events: EventItem[];
}

export function EventsTable({ events }: EventsTableProps) {
  const [items, setItems] = useState(events);

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateEventStatus(id, status);
      setItems((prev) => prev.filter((e) => e.id !== id));
      toast.success(`Event ${status}`);
    } catch {
      toast.error('Failed to update event');
    }
  };

  const moderateWithAI = async (id: string) => {
    try {
      const res = await fetch('/api/events/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems((prev) => prev.filter((e) => e.id !== id));
      toast.success(`AI moderation: ${data.approved ? 'approved' : 'rejected'}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
        No pending events. Great job!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((event) => (
        <div key={event.id} className="rounded-2xl border border-slate-100 bg-white p-6">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.start_datetime).toLocaleString()}
                </span>
                <span className="text-slate-400">{event.place?.name}</span>
              </div>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              {event.status}
            </span>
          </div>
          <p className="mb-5 text-slate-600">{event.description}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setStatus(event.id, 'approved')}>
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="danger" onClick={() => setStatus(event.id, 'rejected')}>
              <X className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button size="sm" variant="secondary" onClick={() => moderateWithAI(event.id)}>
              <Sparkles className="mr-2 h-4 w-4" /> Moderate with AI
            </Button>
          </div>
          {event.ai_reason && <p className="mt-3 text-xs text-slate-500">AI reason: {event.ai_reason}</p>}
        </div>
      ))}
    </div>
  );
}
