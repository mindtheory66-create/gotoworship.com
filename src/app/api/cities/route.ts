import { NextResponse } from 'next/server';
import { getUniqueCities } from '@/lib/db/places';

export const revalidate = 86400;

export async function GET() {
  try {
    const cities = await getUniqueCities();
    return NextResponse.json({ cities });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load cities' }, { status: 500 });
  }
}
