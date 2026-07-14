import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadBlogImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('No image selected');
  }

  if (file.size > MAX_BYTES) {
    throw new Error('Image must be smaller than 5 MB');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, WebP, GIF, or AVIF images are allowed');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let processed: Buffer;
  try {
    processed = await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new Error('Failed to process image');
  }

  const admin = createAdminClient();
  const path = `blog/${randomUUID()}.webp`;
  const { error } = await admin.storage.from('blog-images').upload(path, processed, {
    contentType: 'image/webp',
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = admin.storage.from('blog-images').getPublicUrl(path);
  return data.publicUrl;
}
