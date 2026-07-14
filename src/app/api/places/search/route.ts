import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/db/places';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ places: [] });
  }

  try {
    const places = await searchPlaces(q, 20);
    return NextResponse.json({ places });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search places' }, { status: 500 });
  }
}
