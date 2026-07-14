import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPlaceBySlug, getAllPublishedSlugs, getNearbyPlaces } from '@/lib/db/places';
import { getEventsByPlace } from '@/lib/db/events';
import { getSiteSetting } from '@/lib/db/site-settings';
import { AdSlot } from '@/components/site/AdSlot';
import { ImageGallery } from '@/components/places/image-gallery';
import { ContentSections } from '@/components/places/content-sections';
import { PlaceMap } from '@/components/places/place-map';
import { EventList } from '@/components/events/event-list';
import { ShareButton } from '@/components/places/share-button';
import { BookmarkButton } from '@/components/places/bookmark-button';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-jsonld';
import { ScheduleTable } from '@/components/places/schedule-table';
import { HighlightsSection } from '@/components/places/highlights-section';
import { ExperienceSection } from '@/components/places/experience-section';
import { FAQAccordion } from '@/components/places/faq-accordion';
import { NearbyPlaces } from '@/components/places/nearby-places';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Mail, Navigation, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import { getBaseUrl } from '@/lib/utils/site-url';
import { buildPlaceUrl, buildCityUrl, slugify } from '@/lib/utils/slugify';
import { generatePlaceFAQs } from '@/lib/utils/generate-faqs';
import { cleanAiContent } from '@/lib/utils/clean-ai-content';
import { markdownToPlainText } from '@/lib/utils/markdown-to-plain-text';
import Link from 'next/link';

function toPlainContent(content?: string | null): string {
  if (!content) return '';
  return markdownToPlainText(cleanAiContent(content));
}

interface DetailPageProps {
  params: Promise<{ state: string; city: string; slug: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((s) => ({
    state: slugify(s.state),
    city: slugify(s.city),
    slug: s.slug,
  }));
}

function formatAddress(place: {
  address?: string | null;
  city: string;
  state: string;
  zip?: string | null;
}) {
  const { address, city, state, zip } = place;
  const cityStateZip = [city, state, zip].filter(Boolean).join(', ');
  if (!address) return cityStateZip;

  const addrNorm = address.toLowerCase().replace(/[\s,]+/g, ' ').trim();
  const cszNorm = cityStateZip.toLowerCase().replace(/[\s,]+/g, ' ').trim();

  if (addrNorm.includes(cszNorm)) return address;
  return `${address}, ${cityStateZip}`;
}

function plainExcerpt(content?: string | null, max = 160) {
  const cleaned = toPlainContent(content).replace(/\n+/g, ' ').trim();
  return cleaned.length > max ? cleaned.slice(0, max - 1) + '…' : cleaned;
}

function getStatus(schedule: Record<string, unknown>) {
  const status =
    typeof schedule?.status === 'string' ? schedule.status.toLowerCase() : '';
  if (status.includes('open') && !status.includes('close')) {
    return { label: 'Open', className: 'bg-emerald-100 text-emerald-700' };
  }
  if (status.includes('temporarily')) {
    return { label: 'Temporarily Closed', className: 'bg-amber-100 text-amber-700' };
  }
  if (status.includes('close') || status.includes('closed')) {
    return { label: 'Closed', className: 'bg-rose-100 text-rose-700' };
  }
  return { label: 'Active', className: 'bg-emerald-100 text-emerald-700' };
}

function buildPlaceDescription(place: {
  name: string;
  city: string;
  state: string;
  religion?: string | null;
  denomination?: string | null;
  address?: string | null;
  facilities?: string[];
  content_long?: string | null;
}): string {
  const contentExcerpt = plainExcerpt(toPlainContent(place.content_long));
  if (contentExcerpt && contentExcerpt.length > 80) {
    return contentExcerpt;
  }

  const tradition = place.denomination || place.religion || 'place of worship';
  const facilityText =
    place.facilities && place.facilities.length > 0
      ? ` Amenities include ${place.facilities.slice(0, 4).join(', ')}.`
      : '';

  return `Visit ${place.name}, a ${tradition} in ${place.city}, ${place.state}. Find service times, directions, photos, and contact information.${facilityText}`;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPublishedPlaceBySlug(slug);
  if (!place) return { title: 'Not Found' };

  const primaryImage = place.images.find((img) => img.is_primary) || place.images[0];
  const description = buildPlaceDescription(place);
  const canonical = `${getBaseUrl()}${buildPlaceUrl(place)}`;

  return {
    title: `${place.name} - ${place.city}, ${place.state}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${place.name} - ${place.city}, ${place.state}`,
      description,
      url: canonical,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${place.name} - ${place.city}, ${place.state}`,
      description,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
  };
}

export default async function PlaceDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const place = await getPublishedPlaceBySlug(slug);
  if (!place) notFound();

  const { upcoming } = await getEventsByPlace(place.id);
  const nearby = await getNearbyPlaces(place.state, place.city, place.id, 4);
  const bannerSidebar = await getSiteSetting('banner_sidebar');
  const contentLong = cleanAiContent(place.content_long || '');
  // Keep the serialized place object clean so raw AI preamble never reaches the client payload.
  place.content_long = contentLong;
  const baseUrl = getBaseUrl();
  const cityUrl = `${baseUrl}${buildCityUrl(place.state, place.city)}`;
  const placeUrl = `${baseUrl}${buildPlaceUrl(place)}`;
  const faqs = generatePlaceFAQs(place);
  const displayAddress = formatAddress(place);
  const status = getStatus(place.schedule_notes);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PlaceOfWorship',
    name: place.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.address || undefined,
      addressLocality: place.city,
      addressRegion: place.state,
      postalCode: place.zip || undefined,
    },
    geo: place.latitude && place.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: place.latitude,
      longitude: place.longitude,
    } : undefined,
    telephone: place.phone || undefined,
    url: place.website || undefined,
    event: upcoming.map((e) => ({
      '@type': 'Event',
      name: e.title,
      startDate: e.start_datetime,
      endDate: e.end_datetime,
      description: e.description,
    })),
  };

  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: baseUrl },
          { name: 'Locations', item: `${baseUrl}/locations` },
          { name: `${place.city}, ${place.state}`, item: cityUrl },
          { name: place.name, item: placeUrl },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* Hero gallery */}
      <ImageGallery images={place.images} name={place.name} />

      {/* Header Info */}
      <section className="bg-white pb-8 pt-8">
        <div className="mx-auto max-w-7xl px-4">
          {/* Breadcrumb */}
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/locations" className="hover:text-primary-600">Locations</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={cityUrl} className="hover:text-primary-600">{place.city}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-slate-900">{place.name}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              {/* Tags */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${status.className}`}>
                  {status.label}
                </span>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700">
                  {place.religion}
                </span>
                {place.denomination && (
                  <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-700">
                    {place.denomination}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                {place.name}
              </h1>
              <p className="mt-3 flex items-start gap-2 text-base text-slate-600 md:text-lg">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
                {displayAddress}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch">
              <div className="flex gap-3">
                <BookmarkButton placeId={place.id} />
                <ShareButton title={place.name} />
              </div>
              <div className="flex gap-3">
                {place.website && (
                  <a href={place.website} target="_blank" rel="noreferrer">
                    <Button variant="outline">
                      <Globe className="mr-2 h-4 w-4" /> Website
                    </Button>
                  </a>
                )}
                {place.latitude && place.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button>
                      <Navigation className="mr-2 h-4 w-4" /> Directions
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick info row */}
      <section className="bg-white pb-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <ScheduleTable schedule={place.schedule_notes} />

            <Card className="overflow-hidden border border-slate-200 bg-white p-0 shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-slate-900 md:text-xl">Location</h2>
                </div>
              </div>
              <div className="p-5">
                {place.latitude && place.longitude ? (
                  <PlaceMap latitude={place.latitude} longitude={place.longitude} name={place.name} />
                ) : (
                  <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Map coordinates not available.
                  </p>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  <p className="flex items-start gap-2 text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                    {displayAddress}
                  </p>
                  {place.phone && (
                    <a href={`tel:${place.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-primary-600">
                      <Phone className="h-4 w-4 text-primary-500" /> {place.phone}
                    </a>
                  )}
                  {place.website && (
                    <a href={place.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-primary-600">
                      <Globe className="h-4 w-4 text-primary-500" /> Website
                    </a>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200 bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white shadow-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary-100" />
                <h2 className="text-lg font-bold md:text-xl">Have You Visited?</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-primary-100">
                Share this listing with friends or save it for your next visit. Your feedback helps others find the right place to worship.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ShareButton title={place.name} />
                <BookmarkButton placeId={place.id} />
              </div>
              {place.phone && (
                <a href={`tel:${place.phone}`} className="mt-4 block text-sm font-semibold underline decoration-primary-300 underline-offset-4 hover:text-white">
                  Call {place.phone}
                </a>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Main content + sidebar */}
      <section className="pb-16 pt-2">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-12">
          {/* Main */}
          <div className="space-y-8 lg:col-span-8">
            <Card className="border border-slate-200 p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-xl font-bold text-slate-900 md:text-2xl">Quick Highlights</h2>
              <HighlightsSection place={place} />
            </Card>

            {contentLong ? (
              <ContentSections content={contentLong} />
            ) : (
              <Card className="p-6 md:p-8">
                <p className="text-slate-600">Detailed content is being generated.</p>
              </Card>
            )}

            <Card className="border border-slate-200 p-6 shadow-sm md:p-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">Upcoming Events</h2>
              <EventList events={upcoming} emptyText="No upcoming events." />
            </Card>

            <Card className="border border-slate-200 p-6 shadow-sm md:p-8">
              <FAQAccordion faqs={faqs} />
            </Card>

            <NearbyPlaces places={nearby} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            <ExperienceSection place={place} />

            <Card className="overflow-hidden border border-slate-200 p-0 shadow-sm">
              <div className="bg-primary-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Contact</h3>
                <p className="text-sm text-primary-100">{place.name}</p>
              </div>
              <div className="p-5">
                <div className="space-y-3 text-sm">
                  <p className="flex items-start gap-2 text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                    {displayAddress}
                  </p>
                  {place.phone && (
                    <a href={`tel:${place.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-primary-600">
                      <Phone className="h-4 w-4 text-primary-500" /> {place.phone}
                    </a>
                  )}
                  {place.email && (
                    <a href={`mailto:${place.email}`} className="flex items-center gap-2 text-slate-600 hover:text-primary-600">
                      <Mail className="h-4 w-4 text-primary-500" /> {place.email}
                    </a>
                  )}
                  {place.website && (
                    <a href={place.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-primary-600">
                      <Globe className="h-4 w-4 text-primary-500" /> Website
                    </a>
                  )}
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  {place.phone && (
                    <a href={`tel:${place.phone}`} className="w-full rounded-xl bg-primary-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-primary-700">
                      Call Now
                    </a>
                  )}
                  {place.website && (
                    <a href={place.website} target="_blank" rel="noreferrer" className="w-full rounded-xl border-2 border-primary-600 px-4 py-3 text-center font-semibold text-primary-600 transition hover:bg-primary-50">
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-900">Plan Your Visit</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Check the service schedule above and arrive a few minutes early. Many places offer parking, accessible entrances, and welcoming greeters.
              </p>
            </Card>

            {bannerSidebar && (
              <AdSlot code={bannerSidebar} className="w-full" />
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
