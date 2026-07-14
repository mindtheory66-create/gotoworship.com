export function slugify(str: string): string {
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generatePlaceSlug(name: string, city: string, existingSlugs?: string[]): string {
  const base = `${slugify(name)}-${slugify(city)}`;
  if (!existingSlugs || existingSlugs.length === 0) return base;
  if (!existingSlugs.includes(base)) return base;
  let i = 2;
  while (existingSlugs.includes(`${base}-${i}`)) {
    i++;
  }
  return `${base}-${i}`;
}

export const stateSlug = slugify;
export const citySlug = slugify;

export function buildStateUrl(state: string): string {
  return `/${stateSlug(state)}`;
}

export function buildCityUrl(state: string, city: string): string {
  return `/${stateSlug(state)}/${citySlug(city)}`;
}

export function buildPlaceUrl(place: { state: string; city: string; slug: string }): string {
  return `${buildCityUrl(place.state, place.city)}/${place.slug}`;
}
