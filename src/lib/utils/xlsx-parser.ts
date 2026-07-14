import * as XLSX from 'xlsx';
import { CsvPlaceRow } from '@/types';

function toStr(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function extractEmail(contactInfo?: string): string | null {
  if (!contactInfo) return null;
  try {
    const parsed = JSON.parse(contactInfo);
    if (Array.isArray(parsed)) {
      const email = parsed.find((c: any) => c.type === 'mail' || c.type === 'email')?.value;
      return email ? String(email).trim() : null;
    }
  } catch {
    // ignore
  }
  return null;
}

function humanizeSnake(value: string): string {
  return value
    .replace(/^has_/g, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function extractFacilities(attributes?: string): string[] {
  if (!attributes) return [];
  const facilities: string[] = [];
  try {
    const parsed = JSON.parse(attributes);
    const available = parsed?.available_attributes;
    if (available && typeof available === 'object') {
      for (const category of Object.keys(available)) {
        const items = available[category];
        if (Array.isArray(items)) {
          for (const item of items) {
            facilities.push(humanizeSnake(String(item)));
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return Array.from(new Set(facilities));
}

function formatTime(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function extractSchedule(workTime?: string): Record<string, string> {
  const schedule: Record<string, string> = {};
  if (!workTime) return schedule;
  try {
    const parsed = JSON.parse(workTime);
    const timetable = parsed?.work_hours?.timetable;
    const status = parsed?.work_hours?.current_status;
    if (status) {
      schedule.status = String(status).replace(/_/g, ' ');
    }
    if (timetable && typeof timetable === 'object') {
      for (const [day, slots] of Object.entries(timetable)) {
        if (!slots || !Array.isArray(slots) || slots.length === 0) continue;
        const ranges = slots.map((slot: any) => {
          const open = slot.open ? formatTime(slot.open.hour, slot.open.minute) : '';
          const close = slot.close ? formatTime(slot.close.hour, slot.close.minute) : '';
          if (!open && !close) return '';
          return `${open} - ${close}`;
        });
        const value = ranges.filter(Boolean).join(', ');
        if (value) schedule[day] = value;
      }
    }
  } catch {
    // ignore
  }
  return schedule;
}

export function parsePlaceXlsx(buffer: Buffer): CsvPlaceRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, any>[];

  return json.map((row) => {
    const name = toStr(row.title);
    const city = toStr(row.address_info_city);
    const state = toStr(row.address_info_region);
    const address = toStr(row.address_info_address || row.address);
    const zip = toStr(row.address_info_zip);
    const lat = toStr(row.latitude);
    const lng = toStr(row.longitude);
    const category = toStr(row.category);
    const religion = category.toLowerCase() === 'church' ? 'Christianity' : category || 'Other';
    const phone = toStr(row.phone);
    const website = toStr(row.url);
    const email = extractEmail(toStr(row.contact_info));
    const facilities = extractFacilities(toStr(row.attributes));
    const schedule = extractSchedule(toStr(row.work_time));

    return {
      name,
      address: address || undefined,
      city,
      state,
      zip: zip || undefined,
      latitude: lat,
      longitude: lng,
      religion,
      denomination: undefined,
      phone: phone || undefined,
      website: website || undefined,
      email: email || undefined,
      language: 'English',
      facilities: facilities.join(', ') || undefined,
      schedule_notes: Object.keys(schedule).length > 0 ? JSON.stringify(schedule) : undefined,
      image_url1: toStr(row.main_image) || undefined,
      image_url2: undefined,
      image_url3: undefined,
      description: toStr(row.description) || undefined,
    } as CsvPlaceRow;
  });
}
