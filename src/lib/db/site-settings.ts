import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { SiteSetting } from '@/types';

export type SiteSettingKey = 'header_code' | 'banner_below_header' | 'banner_sidebar';

const DEFAULT_KEYS: SiteSettingKey[] = [
  'header_code',
  'banner_below_header',
  'banner_sidebar',
];

export async function getSiteSettings(): Promise<Record<SiteSettingKey, string>> {
  const fallback: Record<SiteSettingKey, string> = {
    header_code: '',
    banner_below_header: '',
    banner_sidebar: '',
  };

  if (!isSupabaseConfigured()) return fallback;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('site_settings')
      .select('*')
      .in('key', DEFAULT_KEYS);

    if (error || !data) {
      // If the table does not exist yet (migration pending), return empty defaults
      // so public pages continue to render while the migration is applied.
      return fallback;
    }

    const map = new Map((data as SiteSetting[]).map((s) => [s.key, s.value]));

    return {
      header_code: map.get('header_code') ?? '',
      banner_below_header: map.get('banner_below_header') ?? '',
      banner_sidebar: map.get('banner_sidebar') ?? '',
    };
  } catch {
    return fallback;
  }
}

export async function getSiteSetting(key: SiteSettingKey): Promise<string> {
  const settings = await getSiteSettings();
  return settings[key];
}
