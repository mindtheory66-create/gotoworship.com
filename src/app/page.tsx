import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PlaceCard } from '@/components/places/place-card';
import { getUniqueCities, getUniqueReligions, searchPlaces } from '@/lib/db/places';
import { getReligionPublicUrl } from '@/lib/config/religions';
import { getBaseUrl } from '@/lib/utils/site-url';
import { buildCityUrl, slugify } from '@/lib/utils/slugify';

const siteUrl = getBaseUrl();
import {
  Search,
  MapPin,
  Users,
  Shield,
  ArrowRight,
  Church,
  Landmark,
  Heart,
} from 'lucide-react';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  if (query) {
    return {
      title: `Search results for "${query}" | Places of Worship`,
      description: `Find places of worship matching "${query}" on GoToWorship. Browse churches, mosques, synagogues, temples, and religious communities across the United States.`,
      robots: { index: false, follow: true },
      alternates: { canonical: siteUrl + '/' },
    };
  }

  return {
    title: 'GoToWorship | Find Places of Worship Near Me - Churches, Mosques, Synagogues, Temples',
    description:
      'Find places of worship near you across the United States. Discover churches, mosques, synagogues, temples, and more with service schedules, directions, photos, and community events.',
    keywords: [
      'places of worship near me',
      'churches near me',
      'mosques near me',
      'synagogues near me',
      'temples near me',
      'find a church',
      'worship directory',
      'US place of worship directory',
      'worship services near me',
      'religious communities USA',
    ],
    alternates: { canonical: siteUrl + '/' },
    openGraph: {
      title: 'GoToWorship | Find Places of Worship Near Me',
      description:
        'Discover churches, mosques, synagogues, temples, and more across the United States.',
      url: siteUrl + '/',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'GoToWorship | Find Places of Worship Near Me',
      description:
        'Discover churches, mosques, synagogues, temples, and more across the United States.',
    },
  };
}

export const dynamic = 'force-dynamic';

const religionIcons: Record<string, React.ReactNode> = {
  Christianity: <Church className="h-4 w-4" />,
  Islam: <Landmark className="h-4 w-4" />,
  Judaism: <Heart className="h-4 w-4" />,
  Hinduism: <Heart className="h-4 w-4" />,
  Buddhism: <Heart className="h-4 w-4" />,
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || '';
  const cities = await getUniqueCities();
  const religions = await getUniqueReligions();
  const results = query ? await searchPlaces(query, 12) : [];

  const topStates = cities
    .reduce<{ state: string; count: number }[]>((acc, c) => {
      const existing = acc.find((s) => s.state === c.state);
      if (existing) existing.count += c.count;
      else acc.push({ state: c.state, count: c.count });
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const topCities = cities.slice(0, 8);
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'GoToWorship',
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'GoToWorship',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description:
          'A US place of worship directory helping people find churches, mosques, synagogues, temples, and religious communities near them.',
      },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-primary-950 py-24 text-white lg:py-32">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <h1 className="mx-auto mb-6 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Find Your <span className="text-accent-300">Place of Worship</span> Near You
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-100/90">
            Search churches, mosques, synagogues, temples, and other places of worship across the United States.
            Get directions, service schedules, and community events in one easy directory.
          </p>

          <form
            action="/"
            method="GET"
            className="mx-auto flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/20 ring-1 ring-white/10 sm:flex-row"
          >
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search churches, mosques, temples, city, or religion..."
              className="h-12 border-0 bg-slate-100 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
              aria-label="Search places of worship"
            />
            <Button type="submit" variant="primary" className="h-12 shrink-0 px-6">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/near-me">
              <Button size="lg" className="h-12 px-7 text-base shadow-lg shadow-primary-900/30">
                <MapPin className="mr-2 h-4 w-4" /> Find Near Me
              </Button>
            </Link>
            <Link href="/locations">
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-white/30 bg-white/10 px-7 text-base text-white hover:bg-white hover:text-primary-900"
              >
                Browse Locations <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search results */}
      {query && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">Search Results for &quot;{query}&quot;</h2>
          <p className="mb-8 text-slate-500">{results.length} place(s) found</p>
          {results.length === 0 ? (
            <p className="text-slate-600">No places found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </section>
      )}

      {!query && (
        <>
          {/* Browse by religion */}
          <section className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-900">Browse by Religion</h2>
              <p className="mx-auto mt-2 max-w-2xl text-slate-500">
                Explore places of worship by faith community across the United States.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {religions.slice(0, 8).map(({ religion, count }) => (
                <Link key={religion} href={getReligionPublicUrl(religion)}>
                  <Card className="group flex items-center justify-between p-5 transition-colors hover:border-primary-300 hover:bg-slate-50">
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-primary-600">
                        {religionIcons[religion] || <Heart className="h-4 w-4" />}
                        <h3 className="font-bold text-slate-900 group-hover:text-primary-600">{religion}</h3>
                      </div>
                      <p className="text-sm text-slate-500">{count} places</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary-600" />
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular states */}
          <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-900">Popular States</h2>
                <p className="mx-auto mt-2 max-w-2xl text-slate-500">
                  Discover worship communities in the most active states.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topStates.map(({ state, count }) => {
                  const stateSlug = slugify(state);
                  return (
                    <Link key={state} href={`/locations#${stateSlug}`}>
                      <Card className="group flex items-center justify-between p-5 transition-colors hover:border-primary-300 hover:bg-slate-50">
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-primary-600">{state}</h3>
                          <p className="text-sm text-slate-500">{count} places</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary-600" />
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Popular cities */}
          <section className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Popular Cities</h2>
                <p className="mt-2 text-slate-500">Browse places of worship by city</p>
              </div>
              <Link
                href="/locations"
                className="hidden text-sm font-semibold text-primary-600 hover:underline sm:block"
              >
                View all <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topCities.map((city) => (
                <Link
                  key={`${city.state}-${city.city}`}
                  href={buildCityUrl(city.state, city.city)}
                >
                  <Card className="group p-5 transition-colors hover:border-primary-300 hover:bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600">
                      {city.city}, {city.state}
                    </h3>
                    <p className="text-sm text-slate-500">{city.count} places</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mb-14 text-center">
                <h2 className="mb-3 text-3xl font-bold text-slate-900">Why Use GoToWorship?</h2>
                <p className="mx-auto max-w-2xl text-slate-500">
                  Built for worshippers, newcomers, and visitors across the United States.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                <Card className="text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">Location-Based Search</h3>
                  <p className="text-slate-500">Find worship places near you with accurate maps and directions.</p>
                </Card>
                <Card className="text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                    <Users className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">Community Events</h3>
                  <p className="text-slate-500">Stay updated with events submitted by verified contributors.</p>
                </Card>
                <Card className="text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Shield className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">Verified Information</h3>
                  <p className="text-slate-500">AI-assisted content and admin moderation keep data reliable.</p>
                </Card>
              </div>
            </div>
          </section>

          {/* SEO content */}
          <section className="mx-auto max-w-4xl px-4 py-20">
            <Card className="border border-slate-200 p-8 shadow-sm md:p-10">
              <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">
                Find Places of Worship Across the United States
              </h2>
              <div className="space-y-5 leading-7 text-slate-600">
                <p>
                  GoToWorship is a free online directory designed to help anyone find a place of worship near them in
                  the United States. Whether you are looking for <strong>churches near me</strong>,{' '}
                  <strong>mosques near me</strong>, <strong>synagogues near me</strong>, or{' '}
                  <strong>temples near me</strong>, our platform connects you with welcoming religious communities in
                  your area.
                </p>
                <p>
                  Our growing database includes Christian churches, Islamic mosques, Jewish synagogues, Hindu temples,
                  Buddhist temples, and many other faith communities. Each listing includes helpful details such as
                  address, phone number, website, service schedules, accessibility features, photos, and directions - so
                  you can plan your visit with confidence.
                </p>
                <p>
                  Use the <Link href="/near-me" className="font-semibold text-primary-600 hover:underline">Find Near Me</Link>{' '}
                  tool to discover worship places based on your current location, or browse by city and state through our{' '}
                  <Link href="/locations" className="font-semibold text-primary-600 hover:underline">Locations</Link>{' '}
                  page. You can also read helpful articles and community updates on our{' '}
                  <Link href="/blog" className="font-semibold text-primary-600 hover:underline">Blog</Link>.
                </p>
                <p>
                  Start your search today and find the right place to worship, grow spiritually, and connect with your
                  local community.
                </p>
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
