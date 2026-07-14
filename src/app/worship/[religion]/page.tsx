import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPlacesByReligion } from '@/lib/db/places';
import { ReligionPlacesView } from '@/components/places/religion-places-view';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-jsonld';
import { getBaseUrl } from '@/lib/utils/site-url';
import {
  getReligionBySlug,
  getReligionDisplayName,
  getReligionPublicUrl,
  RELIGION_SLUGS,
} from '@/lib/config/religions';

interface ReligionPageProps {
  params: Promise<{ religion: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  return Object.values(RELIGION_SLUGS).map((slug) => ({ religion: slug }));
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function resolveReligion(slug: string): string {
  const fromMap = getReligionBySlug(slug);
  if (fromMap) return fromMap;
  return slug
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
}

const MIN_INDEXABLE_PLACES = 2;

export async function generateMetadata({ params }: ReligionPageProps): Promise<Metadata> {
  const { religion: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const religion = resolveReligion(slug);
  const displayName = getReligionDisplayName(religion);
  const places = await getPublishedPlacesByReligion(religion);
  const count = places.length;

  const title = `${displayName} in the United States | ${count} Listings`;
  const description = `Find ${count} ${displayName.toLowerCase()} across the United States. Browse by state, city, and denomination, with service schedules, directions, photos, and contact information.`;
  const canonical = `${getBaseUrl()}${getReligionPublicUrl(religion)}`;
  const robots = count < MIN_INDEXABLE_PLACES ? { index: false, follow: true } : undefined;

  return {
    title,
    description,
    robots,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ReligionPage({ params }: ReligionPageProps) {
  const { religion: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const religion = resolveReligion(slug);
  const places = await getPublishedPlacesByReligion(religion);

  if (places.length === 0) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}${getReligionPublicUrl(religion)}`;
  const displayName = getReligionDisplayName(religion);

  return (
    <div className="min-h-screen bg-slate-50">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: baseUrl },
          { name: religion, item: pageUrl },
        ]}
      />
      <ReligionPlacesView
        places={places}
        religion={religion}
        title={displayName}
        introText={`Find ${displayName.toLowerCase()} across the United States. Use the filters to narrow by state, city, denomination, language, or facilities.`}
      />
    </div>
  );
}
