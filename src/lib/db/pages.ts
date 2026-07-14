import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { Page } from '@/types';

export async function getPublishedPageBySlug(slug: string): Promise<Page | null> {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data as Page;
}

export async function getAllPages(): Promise<Page[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin.from('pages').select('*').order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data as Page[];
}

export async function getPageById(id: string): Promise<Page | null> {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.from('pages').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Page;
}
