import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { getBaseUrl } from '@/lib/utils/site-url';
import { RELIGION_SLUGS } from '@/lib/config/religions';
import { buildCityUrl, buildPlaceUrl } from '@/lib/utils/slugify';

export const revalidate = 86400;

export async function GET() {
  const baseUrl = getBaseUrl();
  const today = new Date().toISOString();

  const staticUrls = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/locations', changefreq: 'weekly', priority: '0.8' },
    { path: '/blog', changefreq: 'weekly', priority: '0.7' },
    { path: '/about', changefreq: 'monthly', priority: '0.6' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
    { path: '/faq', changefreq: 'monthly', priority: '0.6' },
    { path: '/privacy', changefreq: 'monthly', priority: '0.6' },
    { path: '/terms', changefreq: 'monthly', priority: '0.6' },
    ...[...new Set(Object.values(RELIGION_SLUGS))].map((slug) => ({
      path: `/${slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ];

  const urls: string[] = staticUrls.map(
    (u) =>
      `<url><loc>${baseUrl}${u.path}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  );

  if (isSupabaseConfigured()) {
    const admin = createAdminClient();
    const [placesRes, citiesRes, postsRes] = await Promise.all([
      admin.from('places').select('slug, state, city, updated_at').eq('status', 'published'),
      admin.from('places').select('state, city').eq('status', 'published'),
      admin.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
    ]);

    const places = (placesRes.data || []) as { slug: string; state: string; city: string; updated_at: string }[];
    const cities = (citiesRes.data || []) as { state: string; city: string }[];
    const posts = (postsRes.data || []) as { slug: string; updated_at: string }[];

    const citySet = new Map<string, { state: string; city: string }>();
    for (const c of cities) {
      citySet.set(`${c.state.toLowerCase()}-${c.city.toLowerCase()}`, c);
    }

    citySet.forEach((c) => {
      urls.push(
        `<url><loc>${baseUrl}${buildCityUrl(c.state, c.city)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`
      );
    });

    for (const p of places) {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString();
      urls.push(
        `<url><loc>${baseUrl}${buildPlaceUrl(p)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
      );
    }

    for (const post of posts) {
      const lastmod = post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString();
      urls.push(
        `<url><loc>${baseUrl}/blog/${post.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
