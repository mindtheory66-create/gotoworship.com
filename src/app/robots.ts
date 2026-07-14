import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/utils/site-url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/contributor', '/api', '/*.xlsx$', '/*.csv$'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
