import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { Place, PlaceWithImages, PlaceImage } from '@/types';
import { slugify } from '@/lib/utils/slugify';

async function attachImages(places: Place[]): Promise<PlaceWithImages[]> {
  if (places.length === 0) return [];
  const admin = createAdminClient();
  const placeIds = places.map((p) => p.id);
  const { data: images } = await admin
    .from('place_images')
    .select('*')
    .in('place_id', placeIds)
    .order('is_primary', { ascending: false });

  const imagesByPlace = new Map<string, PlaceImage[]>();
  for (const img of (images as PlaceImage[] | null) || []) {
    const list = imagesByPlace.get(img.place_id) || [];
    list.push(img);
    imagesByPlace.set(img.place_id, list);
  }

  return places.map((place) => ({
    ...place,
    images: imagesByPlace.get(place.id) || [],
  }));
}

export async function getPublishedPlaceBySlug(slug: string): Promise<PlaceWithImages | null> {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;

  const place = data as Place;
  const { data: images } = await admin
    .from('place_images')
    .select('*')
    .eq('place_id', place.id)
    .order('is_primary', { ascending: false });

  return { ...place, images: (images as PlaceImage[] | null) || [] };
}

export async function getAllPublishedSlugs(): Promise<{ state: string; city: string; slug: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('state, city, slug')
    .eq('status', 'published');

  if (error || !data) return [];
  return data as { state: string; city: string; slug: string }[];
}

export async function getPublishedPlacesByCity(state: string, city: string): Promise<PlaceWithImages[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('*')
    .ilike('state', state)
    .ilike('city', city)
    .eq('status', 'published')
    .order('name');

  if (error || !data) return [];
  return attachImages(data as Place[]);
}

export async function getPublishedPlacesByState(state: string): Promise<PlaceWithImages[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('*')
    .ilike('state', state)
    .eq('status', 'published')
    .order('name');

  if (error || !data) return [];
  return attachImages(data as Place[]);
}

export async function getUniqueStates(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('state')
    .eq('status', 'published');

  if (error || !data) return [];
  const states = new Set((data as { state: string }[]).map((row) => row.state));
  return Array.from(states).sort();
}

export async function resolveStateFromSlug(stateSlugParam: string): Promise<string | null> {
  const states = await getUniqueStates();
  return states.find((s) => slugify(s) === slugify(stateSlugParam)) || null;
}

export async function resolveCityFromSlug(stateSlugParam: string, citySlugParam: string): Promise<string | null> {
  const cities = await getUniqueCities();
  const match = cities.find(
    (c) => slugify(c.state) === slugify(stateSlugParam) && slugify(c.city) === slugify(citySlugParam)
  );
  return match?.city || null;
}

export async function getPublishedPlacesByStateSlug(stateSlugParam: string): Promise<PlaceWithImages[]> {
  const state = await resolveStateFromSlug(stateSlugParam);
  if (!state) return [];
  return getPublishedPlacesByState(state);
}

export async function getPublishedPlacesByCitySlugs(stateSlugParam: string, citySlugParam: string): Promise<PlaceWithImages[]> {
  const state = await resolveStateFromSlug(stateSlugParam);
  const city = await resolveCityFromSlug(stateSlugParam, citySlugParam);
  if (!state || !city) return [];
  return getPublishedPlacesByCity(state, city);
}

export async function getUniqueCities(): Promise<{ state: string; city: string; count: number }[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('state, city', { count: 'exact' })
    .eq('status', 'published');

  if (error || !data) return [];

  const map = new Map<string, { state: string; city: string; count: number }>();
  for (const row of data as { state: string; city: string }[]) {
    const key = `${row.state}|${row.city}`;
    const entry = map.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      map.set(key, { state: row.state, city: row.city, count: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export async function getNearbyPlaces(
  state: string,
  city: string,
  excludeId: string,
  limit = 4
): Promise<PlaceWithImages[]> {
  const places = await getPublishedPlacesByCity(state, city);
  return places.filter((p) => p.id !== excludeId).slice(0, limit);
}

export async function getUniqueReligions(): Promise<{ religion: string; count: number }[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('religion')
    .eq('status', 'published');

  if (error || !data) return [];
  const counts = new Map<string, number>();
  for (const row of data as { religion: string }[]) {
    counts.set(row.religion, (counts.get(row.religion) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([religion, count]) => ({ religion, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getPublishedPlacesByReligion(religion: string): Promise<PlaceWithImages[]> {
  if (!isSupabaseConfigured() || !religion) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('*')
    .ilike('religion', religion)
    .eq('status', 'published')
    .order('name');

  if (error || !data) return [];
  return attachImages(data as Place[]);
}

export async function getLocationBrowseData(): Promise<
  { state: string; city: string; religion: string; count: number }[]
> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('places')
    .select('state, city, religion')
    .eq('status', 'published');

  if (error || !data) return [];
  const counts = new Map<string, number>();
  for (const row of data as { state: string; city: string; religion: string }[]) {
    const key = `${row.state}|${row.city}|${row.religion}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => {
      const [state, city, religion] = key.split('|');
      return { state, city, religion, count };
    })
    .sort((a, b) => b.count - a.count);
}

export async function searchPlaces(query: string, limit = 20): Promise<PlaceWithImages[]> {
  if (!isSupabaseConfigured() || !query.trim()) return [];
  const admin = createAdminClient();
  const q = query.trim();
  const lower = q.toLowerCase();

  const seen = new Set<string>();
  const all: PlaceWithImages[] = [];

  const addResults = (items: PlaceWithImages[]) => {
    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        all.push(item);
      }
    }
  };

  const runSearch = async (terms: string[]) => {
    const conditions = terms
      .map((t) => `name.ilike.%${t}%,city.ilike.%${t}%,state.ilike.%${t}%,religion.ilike.%${t}%`)
      .join(',');
    const { data, error } = await admin
      .from('places')
      .select('*')
      .eq('status', 'published')
      .or(conditions)
      .limit(limit);
    if (error || !data) return [];
    return attachImages(data as Place[]);
  };

  const runReligionSearch = async (religions: string[]) => {
    const conditions = religions.map((r) => `religion.ilike.${r}`).join(',');
    const { data, error } = await admin
      .from('places')
      .select('*')
      .eq('status', 'published')
      .or(conditions)
      .limit(limit);
    if (error || !data) return [];
    return attachImages(data as Place[]);
  };

  // Common synonyms / misspellings mapped to religion names in the database
  const religionSynonyms: Record<string, string[]> = {
    church: ['Christianity'],
    churches: ['Christianity'],
    churces: ['Christianity'],
    churh: ['Christianity'],
    christain: ['Christianity'],
    christian: ['Christianity'],
    mosque: ['Mosque'],
    mosques: ['Mosque'],
    masjid: ['Mosque'],
    synagog: ['Synagogue'],
    synagogue: ['Synagogue'],
    synagogues: ['Synagogue'],
    jewish: ['Synagogue'],
    jew: ['Synagogue'],
    temple: ['Hindu temple', 'Buddhist temple'],
    temples: ['Hindu temple', 'Buddhist temple'],
    hindu: ['Hindu temple'],
    buddhist: ['Buddhist temple'],
    sikh: ['Sikhism'],
    gurdwara: ['Sikhism'],
  };

  const searchTerms = [q, lower];

  // 1. Exact / substring match
  addResults(await runSearch([q]));

  // 2. Synonym / misspelling matches
  if (religionSynonyms[lower]) {
    addResults(await runReligionSearch(religionSynonyms[lower]));
  }

  // 3. Try stripping a trailing plural "s" / "es"
  const singular = lower.replace(/e?s$/, '');
  if (singular !== lower) {
    searchTerms.push(singular);
    addResults(await runSearch([singular]));
    if (religionSynonyms[singular]) {
      addResults(await runReligionSearch(religionSynonyms[singular]));
    }
  }

  // 4. Prefix match (e.g. "New Y" -> "New York")
  addResults(await runSearch([`${q}%`]));

  // 5. Tokenized multi-word query
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  if (tokens.length > 1) {
    addResults(await runSearch(tokens));
  }

  return all.slice(0, limit);
}
