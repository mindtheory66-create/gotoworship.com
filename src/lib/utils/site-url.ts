export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // In development, respect the configured URL (usually localhost).
  if (process.env.NODE_ENV === 'development' && envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // In production, ignore a localhost placeholder and use the real domain.
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, '')}`;
  }

  // Production fallback inferred from the brand. Override via NEXT_PUBLIC_SITE_URL if different.
  return 'https://gotoworship.com';
}
