import Link from 'next/link';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { getLocationBrowseData, getUniqueReligions } from '@/lib/db/places';
import { getReligionPublicUrl } from '@/lib/config/religions';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-jsonld';
import { getBaseUrl } from '@/lib/utils/site-url';
import { buildCityUrl, slugify } from '@/lib/utils/slugify';

const siteUrl = getBaseUrl();
import { MapPin, ArrowRight, Church, Landmark, Heart, X } from 'lucide-react';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ religion?: string }>;
}): Promise<Metadata> {
  const { religion } = await searchParams;
  const selectedReligion = religion?.trim();

  if (selectedReligion) {
    return {
      title: `Browse ${selectedReligion} Places of Worship by City & State`,
      description: `Browse ${selectedReligion} places of worship across the United States by city and state. Find churches, mosques, synagogues, temples, and religious communities near you.`,
      robots: { index: false, follow: true },
      alternates: { canonical: `${siteUrl}/locations` },
    };
  }

  return {
    title: 'Browse Places of Worship by City & State',
    description:
      'Browse places of worship across the United States by city and state. Find churches, mosques, synagogues, temples, and religious communities near you.',
    keywords: [
      'places of worship by city',
      'places of worship by state',
      'churches by city',
      'mosques by state',
      'synagogues near me',
      'temples in USA',
      'worship directory by location',
    ],
    alternates: { canonical: `${siteUrl}/locations` },
    openGraph: {
      title: 'Browse Places of Worship by City & State',
      description: 'Find churches, mosques, synagogues, temples, and more across the United States.',
      url: `${siteUrl}/locations`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Browse Places of Worship by City & State',
      description: 'Find churches, mosques, synagogues, temples, and more across the United States.',
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

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ religion?: string }>;
}) {
  const { religion } = await searchParams;
  const selectedReligion = religion || '';
  const baseUrl = getBaseUrl();
  const rows = await getLocationBrowseData();
  const religions = await getUniqueReligions();

  const filteredRows = selectedReligion
    ? rows.filter((r) => r.religion.toLowerCase() === selectedReligion.toLowerCase())
    : rows;

  const grouped = filteredRows.reduce<Record<string, { state: string; city: string; count: number }[]>>((acc, row) => {
    if (!acc[row.state]) acc[row.state] = [];
    const cityEntry = acc[row.state].find((c) => c.city === row.city);
    if (cityEntry) {
      cityEntry.count += row.count;
    } else {
      acc[row.state].push({ state: row.state, city: row.city, count: row.count });
    }
    return acc;
  }, {});

  const sortedStates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  const totalPlaces = filteredRows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: baseUrl },
          { name: 'Locations', item: `${baseUrl}/locations` },
        ]}
      />

      {/* Hero */}
      <section className="bg-primary-900 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Browse Places of Worship by Location
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Explore churches, mosques, synagogues, temples, and religious communities across the United States.
            Filter by faith or jump to your state and city.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Religion filters */}
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Filter by Faith</h2>
          <div className="flex flex-wrap gap-3">
            {selectedReligion && (
              <Link
                href="/locations"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" /> Clear filter
              </Link>
            )}
            {religions.map(({ religion, count }) => {
              const active = selectedReligion.toLowerCase() === religion.toLowerCase();
              return (
                <Link
                  key={religion}
                  href={getReligionPublicUrl(religion)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
                    active
                      ? 'bg-primary-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {religionIcons[religion] || <Heart className="h-4 w-4" />}
                  {religion}
                  <span className={active ? 'text-primary-100' : 'text-slate-400'}>({count})</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-8">
          <p className="text-slate-500">
            Showing {totalPlaces} place{totalPlaces !== 1 ? 's' : ''}
            {selectedReligion ? ` for ${selectedReligion}` : ''} across {sortedStates.length} state
            {sortedStates.length !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Locations by state */}
        <div className="space-y-12">
          {sortedStates.map((state) => (
            <div key={state} id={slugify(state)}>
              <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold text-slate-800">
                <MapPin className="h-5 w-5 text-primary-600" /> {state}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {grouped[state]
                  .sort((a, b) => a.city.localeCompare(b.city))
                  .map((city) => (
                    <Link
                      key={`${state}-${city.city}`}
                      href={
                        selectedReligion
                          ? `${buildCityUrl(city.state, city.city)}?religion=${encodeURIComponent(selectedReligion)}`
                          : buildCityUrl(city.state, city.city)
                      }
                    >
                      <Card className="group flex items-center justify-between p-5 transition-colors hover:border-primary-300 hover:bg-white">
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-primary-600">{city.city}</h3>
                          <p className="text-sm text-slate-500">{city.count} place{city.count !== 1 ? 's' : ''}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary-600" />
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* SEO content */}
        <section className="mt-20">
          <Card className="border border-slate-200 p-8 shadow-sm md:p-10">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">
              Places of Worship by City and State
            </h2>
            <div className="space-y-5 leading-7 text-slate-600">
              <p>
                GoToWorship makes it easy to find places of worship by city and state anywhere in the United States.
                From small neighborhood chapels to large community centers, our directory helps you locate the right
                church, mosque, synagogue, temple, or worship space for your spiritual needs.
              </p>
              <p>
                Use the faith filter above to narrow results to a specific religion, or scroll through each state to
                explore cities with active worship communities. Every city page includes detailed listings with
                addresses, contact information, service schedules, photos, maps, and directions.
              </p>
              <p>
                Popular searches include{' '}
                <Link href="/locations?religion=Christianity" className="font-semibold text-primary-600 hover:underline">
                  Christian churches
                </Link>,{' '}
                <Link href="/locations?religion=Islam" className="font-semibold text-primary-600 hover:underline">
                  Islamic mosques
                </Link>,{' '}
                <Link href="/locations?religion=Judaism" className="font-semibold text-primary-600 hover:underline">
                  Jewish synagogues
                </Link>, and{' '}
                <Link href="/locations?religion=Hinduism" className="font-semibold text-primary-600 hover:underline">
                  Hindu temples
                </Link>. Start browsing today and connect with a faith community near you.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
