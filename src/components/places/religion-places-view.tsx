'use client';

import { useMemo, useState } from 'react';
import { PlaceWithImages } from '@/types';
import { buildPlaceUrl } from '@/lib/utils/slugify';
import { PlaceCard } from './place-card';
import { SlidersHorizontal, MapPin, X, LayoutGrid, List } from 'lucide-react';

interface FilterGroup {
  key: keyof PlaceWithImages;
  label: string;
  options: { value: string; count: number }[];
}

function ListPlaceCard({ place }: { place: PlaceWithImages }) {
  const primaryImage = place.images.find((img) => img.is_primary) || place.images[0];
  const href = buildPlaceUrl(place);

  return (
    <a href={href} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.alt_text || place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <MapPin className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center py-1">
        <span className="mb-1 w-fit rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-700">
          {place.religion}
        </span>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600">{place.name}</h3>
        <p className="text-sm text-slate-500">{place.city}, {place.state}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {place.denomination && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{place.denomination}</span>
          )}
          {place.facilities.slice(0, 2).map((f) => (
            <span key={f} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{f}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

export function ReligionPlacesView({
  places,
  religion,
  title,
  introText,
}: {
  places: PlaceWithImages[];
  religion: string;
  title: string;
  introText?: string;
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState<'recommended' | 'name'>('recommended');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filterGroups: FilterGroup[] = useMemo(() => {
    const makeGroup = (key: keyof PlaceWithImages, label: string) => {
      const counts = new Map<string, number>();
      places.forEach((p) => {
        const vals = Array.isArray(p[key]) ? (p[key] as string[]) : [p[key] as string].filter(Boolean);
        vals.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
      });
      return {
        key,
        label,
        options: Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, count })),
      };
    };

    return [
      makeGroup('state', 'State'),
      makeGroup('city', 'City'),
      makeGroup('denomination', 'Denomination'),
      makeGroup('language', 'Language'),
      makeGroup('facilities', 'Facilities'),
    ];
  }, [places]);

  const filtered = useMemo(() => {
    let result = places.filter((place) => {
      return Object.entries(selected).every(([groupKey, values]) => {
        if (values.length === 0) return true;
        const placeVals = Array.isArray(place[groupKey as keyof PlaceWithImages])
          ? (place[groupKey as keyof PlaceWithImages] as string[])
          : ([place[groupKey as keyof PlaceWithImages] as string].filter(Boolean));
        return values.some((v) => placeVals.includes(v));
      });
    });

    if (sort === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [places, selected, sort]);

  const toggleFilter = (groupKey: string, value: string) => {
    setSelected((prev) => {
      const current = prev[groupKey] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [groupKey]: next };
    });
  };

  const activeFilterCount = Object.values(selected).flat().length;

  const Filters = () => (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={() => setSelected({})}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Clear all
          </button>
        )}
      </div>

      {filterGroups.map((group) => (
        <div key={group.key as string}>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{group.label}</h4>
          <div className="space-y-1.5">
            {group.options.slice(0, 8).map((option) => {
              const key = group.key as string;
              const checked = (selected[key] || []).includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg p-2 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFilter(key, option.value)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="truncate text-sm font-medium text-slate-700" title={option.value}>
                      {option.value}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{option.count}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <a href="/" className="hover:text-primary-600">Home</a>
        <span>/</span>
        <span className="font-medium text-slate-900">{religion}</span>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            <span className="text-primary-600">{filtered.length}</span> {title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-slate-500">
            <MapPin className="h-4 w-4" />
            Showing {filtered.length} of {places.length} results across the United States
          </p>
          {introText && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{introText}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'recommended' | 'name')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="recommended">Recommended</option>
            <option value="name">Name (A-Z)</option>
          </select>

          <div className="hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm md:flex">
            <button
              onClick={() => setView('grid')}
              className={`rounded-lg p-2 transition ${view === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded-lg p-2 transition ${view === 'list' ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Filters />
          </div>
        </aside>

        {/* Results */}
        <main className="lg:col-span-9">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-lg font-semibold text-slate-900">No places match your filters.</p>
              <button
                onClick={() => setSelected({})}
                className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Clear filters
              </button>
            </div>
          ) : view === 'list' ? (
            <div className="space-y-4">
              {filtered.map((place) => (
                <ListPlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <Filters />
          </div>
        </div>
      )}
    </div>
  );
}
