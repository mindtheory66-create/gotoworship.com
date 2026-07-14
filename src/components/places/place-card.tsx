'use client';

import Link from 'next/link';
import { PlaceWithImages } from '@/types';
import { Card } from '@/components/ui/card';
import { buildPlaceUrl } from '@/lib/utils/slugify';
import { MapPin, Heart } from 'lucide-react';

interface PlaceCardProps {
  place: PlaceWithImages;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const primaryImage = place.images.find((img) => img.is_primary) || place.images[0];
  const href = buildPlaceUrl(place);

  const status =
    typeof place.schedule_notes?.status === 'string'
      ? place.schedule_notes.status.toLowerCase()
      : 'active';

  const statusBadge =
    status.includes('open') || status === 'active' ? (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
        Open
      </span>
    ) : status.includes('temporarily') ? (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
        Temporarily Closed
      </span>
    ) : status.includes('close') || status.includes('closed') ? (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
        Closed
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
        Active
      </span>
    );

  return (
    <Link href={href} className="group block">
      <Card className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt_text || place.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <MapPin className="h-12 w-12" />
            </div>
          )}

          {/* Religion badge */}
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-700 shadow-sm backdrop-blur-sm">
            {place.religion}
          </span>

          {/* Status badge */}
          <span className="absolute bottom-3 right-3">
            {statusBadge}
          </span>

          {/* Favorite */}
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-400 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-red-500"
            aria-label="Save place"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 group-hover:text-primary-600 md:text-lg">
            {place.name}
          </h3>
          <p className="mt-1 line-clamp-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {place.city}, {place.state}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {place.denomination && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {place.denomination}
              </span>
            )}
            {place.facilities.slice(0, 2).map((f) => (
              <span key={f} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {f}
              </span>
            ))}
            {place.facilities.length > 2 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                +{place.facilities.length - 2}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
