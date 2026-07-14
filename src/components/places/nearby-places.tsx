import Link from 'next/link';
import { PlaceWithImages } from '@/types';
import { Card } from '@/components/ui/card';
import { buildPlaceUrl } from '@/lib/utils/slugify';
import { MapPin } from 'lucide-react';

export function NearbyPlaces({ places }: { places: PlaceWithImages[] }) {
  if (places.length === 0) return null;

  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-slate-900">Nearby Places</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {places.map((place) => {
          const primary = place.images.find((img) => img.is_primary) || place.images[0];
          const href = buildPlaceUrl(place);
          return (
            <Link key={place.id} href={href} className="group block">
              <Card className="h-full overflow-hidden border border-slate-200 bg-white p-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {primary ? (
                    <img
                      src={primary.url}
                      alt={primary.alt_text || place.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <MapPin className="h-10 w-10" />
                    </div>
                  )}
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-700 shadow-sm backdrop-blur-sm">
                    {place.religion}
                  </span>
                </div>
                <div className="p-3.5">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-primary-600">
                    {place.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {place.city}, {place.state}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
