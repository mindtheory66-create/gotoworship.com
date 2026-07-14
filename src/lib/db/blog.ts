import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { BlogPost } from '@/types';

export async function getPublishedPosts(limit = 50, offset = 0): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('blog_posts')
    .select('*, category:categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];
  return data as BlogPost[];
}

export async function countPublishedPosts(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const admin = createAdminClient();
  const { count, error } = await admin
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  if (error) return 0;
  return count || 0;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('blog_posts')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data as BlogPost;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('blog_posts')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as BlogPost[];
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('blog_posts')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as BlogPost;
}

export async function getCategories() {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin.from('categories').select('*').order('name');
  if (error || !data) return [];
  return data;
}
