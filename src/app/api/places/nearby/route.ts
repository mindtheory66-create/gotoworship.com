import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PlaceWithImages, PlaceImage } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '10');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('nearby_places', {
    p_lat: lat,
    p_lng: lng,
    radius_km: radius,
    result_limit: limit,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const places = (data || []) as PlaceWithImages[];
  for (const place of places) {
    const { data: images } = await admin
      .from('place_images')
      .select('*')
      .eq('place_id', place.id)
      .order('is_primary', { ascending: false });
    place.images = (images as PlaceImage[] | null) || [];
  }

  return NextResponse.json({ places });
}
