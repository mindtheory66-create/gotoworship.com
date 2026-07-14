import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

function upscaleImageUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Google Street View thumbnail: bump width/height while keeping other params
    if (parsed.hostname.includes('streetviewpixels-pa.googleapis.com')) {
      parsed.searchParams.set('w', '1280');
      parsed.searchParams.set('h', '800');
      return parsed.toString();
    }

    // Google user-content images
    if (parsed.hostname.includes('googleusercontent.com') || parsed.hostname.includes('ggpht.com')) {
      const pathname = parsed.pathname;
      if (/(=s\d+|=w\d+-h\d+.*)$/.test(pathname)) {
        parsed.pathname = pathname.replace(/(=s\d+|=w\d+-h\d+.*)$/, '=w1280-h1280-k-no');
        return parsed.toString();
      }
    }
  } catch {
    // fall through
  }
  return url;
}

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function fetchImage(url: string, altText?: string) {
  const { signal, clear } = timeoutSignal(20000);
  try {
    const res = await fetch(url, {
      signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
      },
    });
    if (!res.ok) return null;

    // Guard against unexpectedly large files (max 20 MB)
    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 20 * 1024 * 1024) return null;

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > 20 * 1024 * 1024) return null;
    return Buffer.from(arrayBuffer);
  } finally {
    clear();
  }
}

export async function processAndUploadImage(
  placeId: string,
  imageUrl: string,
  altText?: string
): Promise<{ url: string; alt_text: string | null } | null> {
  const admin = createAdminClient();

  const upscaledUrl = upscaleImageUrl(imageUrl);
  let buffer = await fetchImage(upscaledUrl, altText);

  // Fallback to original URL if upscaled fails
  if (!buffer && upscaledUrl !== imageUrl) {
    buffer = await fetchImage(imageUrl, altText);
  }

  if (!buffer) return null;

  try {
    const processed = await sharp(buffer)
      .resize({ width: 1600, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const path = `${placeId}/${randomUUID()}.webp`;
    const { error: uploadError } = await admin.storage
      .from('place-images')
      .upload(path, processed, { contentType: 'image/webp' });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = admin.storage.from('place-images').getPublicUrl(path);
    return { url: data.publicUrl, alt_text: altText || null };
  } catch (err) {
    console.error('Image processing error:', err);
    return null;
  }
}

export async function processPlaceImages(
  placeId: string,
  imageUrls: string[]
): Promise<{ url: string; alt_text: string | null }[]> {
  const uploads = await Promise.all(
    imageUrls.filter(Boolean).map((url) => processAndUploadImage(placeId, url))
  );
  return uploads.filter(Boolean) as { url: string; alt_text: string | null }[];
}
