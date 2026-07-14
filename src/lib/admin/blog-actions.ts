'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils/slugify';
import { uploadBlogImage } from '@/lib/image/upload-blog-image';

export async function savePost(formData: FormData) {
  const admin = createAdminClient();
  const id = formData.get('id') as string | null;
  const title = formData.get('title') as string;
  const slug = slugify((formData.get('slug') as string) || title);
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;
  const categoryId = formData.get('category_id') as string | null;
  const status = formData.get('status') as 'draft' | 'published';
  const publishedAt = status === 'published' ? new Date().toISOString() : null;

  const file = formData.get('featured_image_file') as File | null;
  const existingFeaturedImage = formData.get('existing_featured_image') as string | null;
  const clearedFlag = formData.get('featured_image');

  let featuredImage: string | null = existingFeaturedImage || null;

  if (file && file.size > 0) {
    featuredImage = await uploadBlogImage(file);
  } else if (clearedFlag === '') {
    featuredImage = null;
  }

  const payload = {
    title,
    slug,
    content,
    excerpt,
    featured_image: featuredImage,
    category_id: categoryId || null,
    status,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await admin.from('blog_posts').update(payload).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('blog_posts').insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  return { success: true };
}

export async function deletePost(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('blog_posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/blog');
  return { success: true };
}

export async function saveCategory(formData: FormData) {
  const admin = createAdminClient();
  const id = formData.get('id') as string | null;
  const name = formData.get('name') as string;
  const slug = slugify((formData.get('slug') as string) || name);

  if (id) {
    const { error } = await admin.from('categories').update({ name, slug }).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('categories').insert({ name, slug });
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/blog/categories');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/blog/categories');
  return { success: true };
}

export async function savePage(formData: FormData) {
  const admin = createAdminClient();
  const id = formData.get('id') as string | null;
  const title = formData.get('title') as string;
  const slug = slugify((formData.get('slug') as string) || title);
  const content = formData.get('content') as string;
  const status = formData.get('status') as 'draft' | 'published';

  const payload = {
    title,
    slug,
    content,
    status,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await admin.from('pages').update(payload).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('pages').insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/p/${slug}`);
  return { success: true };
}

export async function deletePage(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('pages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}
