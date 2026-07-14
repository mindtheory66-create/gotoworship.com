import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { moderateEventText } from '@/lib/ai/deepseek';

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();
    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: event, error } = await admin.from('events').select('*').eq('id', eventId).single();
    if (error || !event) {
      return NextResponse.json({ error: error?.message || 'Event not found' }, { status: 404 });
    }

    const text = `${event.title} ${event.description || ''}`;
    const moderation = await moderateEventText(text);

    const { error: updateError } = await admin
      .from('events')
      .update({
        status: moderation.approved ? 'approved' : 'rejected',
        ai_reason: moderation.reason,
      })
      .eq('id', eventId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, eventId, ...moderation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
