import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parsePlaceCsv, parseNumber } from '@/lib/utils/csv-parser';
import { parsePlaceXlsx } from '@/lib/utils/xlsx-parser';
import { generatePlaceSlug } from '@/lib/utils/slugify';
import { enqueueProcessPlace } from '@/lib/queue/enqueue';
import { CsvPlaceRow } from '@/types';

function parseScheduleNotes(value?: string): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // fallthrough
  }
  return { notes: value };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Please upload a file.' }, { status: 400 });
    }

    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');
    if (!isXlsx && !isCsv) {
      return NextResponse.json({ error: 'Please upload a CSV or XLSX file.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows: CsvPlaceRow[] = isXlsx ? parsePlaceXlsx(buffer) : parsePlaceCsv(buffer);
    const admin = createAdminClient();

    const results: { row: number; status: 'success' | 'error'; message: string; placeId?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.name || !row.city || !row.state || !row.religion) {
          throw new Error('Missing required fields: name, city, state, religion');
        }

        const lat = parseNumber(row.latitude);
        const lng = parseNumber(row.longitude);
        if (lat === null || lng === null) {
          throw new Error('Invalid latitude or longitude');
        }

        const slugBase = generatePlaceSlug(row.name, row.city);
        const { data: existing } = await admin.from('places').select('slug').eq('slug', slugBase).maybeSingle();
        const slug = existing ? generatePlaceSlug(row.name, row.city, [slugBase]) : slugBase;

        const { data: placeData, error: insertError } = await admin
          .from('places')
          .insert({
            name: row.name,
            slug,
            address: row.address || null,
            city: row.city,
            state: row.state,
            zip: row.zip || null,
            latitude: lat,
            longitude: lng,
            religion: row.religion,
            denomination: row.denomination || null,
            phone: row.phone || null,
            website: row.website || null,
            email: row.email || null,
            language: row.language ? row.language.split(/[,;|]/).map((s) => s.trim()).filter(Boolean) : [],
            facilities: row.facilities ? row.facilities.split(/[,;|]/).map((s) => s.trim()).filter(Boolean) : [],
            schedule_notes: parseScheduleNotes(row.schedule_notes),
            status: 'draft',
          })
          .select()
          .single();

        if (insertError || !placeData) {
          throw new Error(insertError?.message || 'Failed to insert place');
        }

        await enqueueProcessPlace({ placeId: placeData.id, row: row as unknown as Record<string, string> });
        results.push({ row: i + 1, status: 'success', message: 'Queued for processing', placeId: placeData.id });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ row: i + 1, status: 'error', message });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    return NextResponse.json({ total: rows.length, queued: successCount, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
