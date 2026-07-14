import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildPlaceContentPrompt, buildFallbackContent } from '@/lib/ai/content-prompt';
import { deepSeekChatCompletion } from '@/lib/ai/deepseek';
import { fetchNearestStations } from '@/lib/geo/transit';
import { cleanAiContent } from '@/lib/utils/clean-ai-content';

export async function POST(request: NextRequest) {
  try {
    const { placeId } = await request.json();
    if (!placeId) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: place, error } = await admin.from('places').select('*').eq('id', placeId).single();
    if (error || !place) {
      return NextResponse.json({ error: error?.message || 'Place not found' }, { status: 404 });
    }

    const stations = await fetchNearestStations(place.latitude, place.longitude);
    const transportInfo = {
      ...place.transport_info,
      nearestStations: stations.map((s) => s.name),
    };

    const row = {
      name: place.name,
      address: place.address,
      city: place.city,
      state: place.state,
      zip: place.zip,
      religion: place.religion,
      denomination: place.denomination,
      phone: place.phone,
      website: place.website,
      email: place.email,
      language: place.language?.join(', '),
      facilities: place.facilities?.join(', '),
      schedule_notes: place.schedule_notes ? JSON.stringify(place.schedule_notes) : '',
    };

    let contentLong: string;
    try {
      const prompt = buildPlaceContentPrompt(row, transportInfo);
      const aiContent = await deepSeekChatCompletion(
        'You are an expert SEO content writer for a US place of worship directory.',
        prompt,
        { temperature: 0.7, max_tokens: 4000 }
      );
      contentLong = cleanAiContent(aiContent);
    } catch {
      contentLong = cleanAiContent(buildFallbackContent(row, transportInfo));
    }

    const { error: updateError } = await admin
      .from('places')
      .update({ content_long: contentLong, transport_info: transportInfo, status: 'ai_generated' })
      .eq('id', placeId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, placeId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
