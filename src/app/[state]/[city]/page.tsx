import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPlacesByCitySlugs, getUniqueCities } from '@/lib/db/places';
import { CityPlacesView } from '@/components/places/city-places-view';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-jsonld';
import { getBaseUrl } from '@/lib/utils/site-url';
import { buildCityUrl, slugify } from '@/lib/utils/slugify';

interface CityPageProps {
  params: Promise<{ state: string; city: string }>;
}

// Cities with fewer published places than this are considered thin pages and
// are noindexed so they do not drag down the rest of the site in Google.
const MIN_INDEXABLE_PLACES = 2;

export const revalidate = 86400;

export async function generateStaticParams() {
  const cities = await getUniqueCities();
  return cities.map((c) => ({
    state: slugify(c.state),
    city: slugify(c.city),
  }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { state: rawState, city: rawCity } = await params;
  const places = await getPublishedPlacesByCitySlugs(rawState, rawCity);
  const displayCity = places[0]?.city || decodeURIComponent(rawCity).replace(/-/g, ' ');
  const displayState = places[0]?.state || decodeURIComponent(rawState).replace(/-/g, ' ');
  const count = places.length;
  const canonical = `${getBaseUrl()}${buildCityUrl(displayState, displayCity)}`;

  const title = `${displayCity}, ${displayState} Places of Worship | ${count} Churches, Mosques, Temples`;
  const description =
    count > 0
      ? `Discover ${count} place${count === 1 ? '' : 's'} of worship in ${displayCity}, ${displayState}. Browse churches, mosques, synagogues, temples, and religious communities with schedules, directions, and contact info.`
      : `Discover places of worship in ${displayCity}, ${displayState}. Browse churches, mosques, synagogues, temples, and religious communities with schedules, directions, and contact info.`;

  const robots = count < MIN_INDEXABLE_PLACES ? { index: false, follow: true } : undefined;

  return {
    title,
    description,
    robots,
    keywords: [
      `places of worship in ${displayCity}`,
      `churches in ${displayCity}`,
      `mosques in ${displayCity}`,
      `synagogues in ${displayCity}`,
      `temples in ${displayCity}`,
      `${displayCity} worship directory`,
    ],
    alternates: { canonical },
    openGraph: {
      title: `${displayCity}, ${displayState} Places of Worship`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayCity}, ${displayState} Places of Worship`,
      description,
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { state: rawState, city: rawCity } = await params;
  const places = await getPublishedPlacesByCitySlugs(rawState, rawCity);

  if (places.length === 0) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const cityUrl = `${baseUrl}${buildCityUrl(places[0].state, places[0].city)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: baseUrl },
          { name: 'Locations', item: `${baseUrl}/locations` },
          { name: `${places[0].city}, ${places[0].state}`, item: cityUrl },
        ]}
      />
      <CityPlacesView
        places={places}
        city={places[0].city}
        state={places[0].state}
        introText={`Find places of worship in ${places[0].city}, ${places[0].state}. Browse local churches, mosques, synagogues, temples, and religious communities with service schedules, directions, photos, and contact information.`}
      />
    </div>
  );
}
