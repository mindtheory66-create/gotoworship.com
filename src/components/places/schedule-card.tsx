import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export function ScheduleCard({ schedule }: { schedule: Record<string, unknown> }) {
  const notes = schedule?.notes as string | undefined;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-bold text-slate-900 md:text-xl">Regular Schedule</h2>
      </div>
      {notes ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{notes}</p>
      ) : (
        <p className="text-sm text-slate-500">Schedule information not available. Please contact the place directly.</p>
      )}
    </Card>
  );
}
