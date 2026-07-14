import { parse } from 'csv-parse/sync';
import { CsvPlaceRow } from '@/types';

export function parsePlaceCsv(buffer: Buffer): CsvPlaceRow[] {
  const text = buffer.toString('utf-8');
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: false,
  });
  return records as CsvPlaceRow[];
}

export function parseArray(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[,;|]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseNumber(value?: string): number | null {
  if (!value) return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}
