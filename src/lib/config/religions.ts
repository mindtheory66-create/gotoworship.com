// Public URL slugs and display labels for religion filter pages.
// The dynamic route is /worship/[religion], but these short slugs are exposed via rewrites.
// Keep these values in sync with the actual `religion` values stored in the database.

export const RELIGION_SLUGS: Record<string, string> = {
  // Canonical religion names
  Christianity: 'churches',
  Islam: 'mosques',
  Judaism: 'synagogues',
  Hinduism: 'temples',
  Buddhism: 'buddhist-temples',
  Sikhism: 'gurdwaras',

  // Names as stored in the database (these take precedence in reverse slug lookup)
  Mosque: 'mosques',
  Synagogue: 'synagogues',
  'Hindu temple': 'temples',
  'Buddhist temple': 'buddhist-temples',
};

export const RELIGION_BY_SLUG = Object.fromEntries(
  Object.entries(RELIGION_SLUGS).map(([religion, slug]) => [slug, religion])
);

export function getReligionSlug(religion: string): string {
  return RELIGION_SLUGS[religion] || religion.toLowerCase().replace(/\s+/g, '-');
}

export function getReligionBySlug(slug: string): string | undefined {
  return RELIGION_BY_SLUG[slug.toLowerCase()];
}

export function getReligionPublicUrl(religion: string): string {
  return `/${getReligionSlug(religion)}`;
}

export function getReligionDisplayName(religion: string): string {
  const map: Record<string, string> = {
    Christianity: 'Christian Churches',
    Islam: 'Islamic Mosques',
    Judaism: 'Jewish Synagogues',
    Hinduism: 'Hindu Temples',
    Buddhism: 'Buddhist Temples',
    Sikhism: 'Sikh Gurdwaras',
    Synagogue: 'Synagogues',
    'Hindu temple': 'Hindu Temples',
    'Buddhist temple': 'Buddhist Temples',
  };
  return map[religion] || `${religion} Places of Worship`;
}
