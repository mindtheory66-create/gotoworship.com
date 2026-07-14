import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { EventItem } from '@/types';

export async function getEventsByPlace(placeId: string): Promise<{ upcoming: EventItem[]; past: EventItem[] }> {
  if (!isSupabaseConfigured()) return { upcoming: [], past: [] };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('events')
    .select('*')
    .eq('place_id', placeId)
    .eq('status', 'approved')
    .order('start_datetime', { ascending: false });

  if (error || !data) return { upcoming: [], past: [] };

  const now = new Date().toISOString();
  const events = data as EventItem[];
  return {
    upcoming: events.filter((e) => e.start_datetime >= now),
    past: events.filter((e) => e.start_datetime < now),
  };
}

export async function getPendingEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('events')
    .select('*, place:places(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as EventItem[];
}

export async function getContributorEvents(userId: string): Promise<EventItem[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('events')
    .select('*, place:places(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as EventItem[];
}
