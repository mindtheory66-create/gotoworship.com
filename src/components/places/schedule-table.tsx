'use client';

import { Card } from '@/components/ui/card';
import { Clock, AlertCircle } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function normalizeSchedule(value: unknown): Record<string, string> {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return { notes: value };
    }
  }
  return value as Record<string, string>;
}

function getDayTimes(schedule: Record<string, string>): { day: string; times: string }[] {
  return DAYS.map((day) => {
    const key = Object.keys(schedule).find(
      (k) => k.toLowerCase() === day.toLowerCase()
    );
    return { day, times: key ? schedule[key] : '' };
  });
}

export function ScheduleTable({ schedule }: { schedule: Record<string, unknown> }) {
  const parsed = normalizeSchedule(schedule);
  const status = typeof parsed.status === 'string' ? parsed.status.toLowerCase() : '';
  const dayRows = getDayTimes(parsed).filter((r) => r.times);

  const statusBadge =
    status.includes('open') && !status.includes('close') ? (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
        Open
      </span>
    ) : status.includes('temporarily') ? (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
        Temporarily Closed
      </span>
    ) : status.includes('close') || status.includes('closed') ? (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-rose-700">
        Closed
      </span>
    ) : null;

  return (
    <Card className="overflow-hidden border border-slate-200 bg-white p-0 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-bold text-slate-900 md:text-xl">Service Hours</h2>
        </div>
        {statusBadge}
      </div>

      <div className="p-5">
        {dayRows.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {dayRows.map((row) => (
                <tr key={row.day} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 pr-4 font-semibold text-slate-700">{row.day}</td>
                  <td className="py-2.5 text-right text-slate-600">
                    {row.times.split(',').map((t, i) => (
                      <span key={i} className="block">
                        {t.trim()}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : parsed.notes ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{parsed.notes}</p>
        ) : (
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>Service hours are not available. Please contact the place directly.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
