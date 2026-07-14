'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PlaceWithImages } from '@/types';
import { buildCityUrl } from '@/lib/utils/slugify';
import { PlaceCard } from '@/components/places/place-card';
import { DistanceBadge } from '@/components/places/place-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  MapPin,
  Loader2,
  Navigation,
  Search,
  Building2,
  LocateFixed,
  ChevronRight,
} from 'lucide-react';

type CityItem = { state: string; city: string; count: number };
type Tab = 'location' | 'cities' | 'search';

export default function NearMeContent() {
  const [activeTab, setActiveTab] = useState<Tab>('cities');

  // Location state
  const [places, setPlaces] = useState<PlaceWithImages[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Cities state
  const [cities, setCities] = useState<CityItem[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');

  // Search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceWithImages[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(data.cities || []))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/places/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data.places || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredCities = useMemo(() => {
    const term = cityFilter.toLowerCase().trim();
    if (!term) return cities;
    return cities.filter(
      (c) =>
        c.city.toLowerCase().includes(term) ||
        c.state.toLowerCase().includes(term)
    );
  }, [cities, cityFilter]);

  const detectLocation = () => {
    setLoading(true);
    setError(null);
    setPlaces([]);

    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation. Please use Browse Cities or Search instead.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`/api/places/nearby?lat=${latitude}&lng=${longitude}&radius=10`);
          const data = await res.json();
          setPlaces(data.places || []);
        } catch {
          setError('Failed to fetch nearby places. Please try Browse Cities or Search.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access was denied or unavailable. Please use Browse Cities or Search instead.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center md:mb-14">
        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
          Find Places of Worship Near You
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500 md:text-lg">
          Choose how you want to search. On desktop without GPS, use Browse Cities or Search by name.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <TabButton
          active={activeTab === 'location'}
          onClick={() => setActiveTab('location')}
          icon={<LocateFixed className="h-4 w-4" />}
          label="Use My Location"
        />
        <TabButton
          active={activeTab === 'cities'}
          onClick={() => setActiveTab('cities')}
          icon={<Building2 className="h-4 w-4" />}
          label="Browse Cities"
        />
        <TabButton
          active={activeTab === 'search'}
          onClick={() => setActiveTab('search')}
          icon={<Search className="h-4 w-4" />}
          label="Search"
        />
      </div>

      {/* Location tab */}
      {activeTab === 'location' && (
        <div className="mx-auto max-w-2xl">
          <Card className="p-6 text-center md:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Navigation className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Detect My Location</h2>
            <p className="mt-2 text-slate-500">
              Works best on phones/tablets. Desktop browsers may ask for permission or use your network location.
            </p>
            <Button
              onClick={detectLocation}
              disabled={loading}
              className="mt-5"
              size="lg"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="mr-2 h-4 w-4" />
              )}
              Find Nearby Places
            </Button>
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-left text-red-700">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Could not detect location</p>
                  <p className="text-sm">{error}</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('cities')}>
                      Browse Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('search')}>
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {coords && !loading && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Places within 10 km
              </h3>
              {places.length === 0 ? (
                <p className="text-center text-slate-600">No published places found near your location.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {places.map((place) => (
                    <div key={place.id} className="relative">
                      <PlaceCard place={place} />
                      {place.latitude && place.longitude && (
                        <div className="absolute right-3 top-3">
                          <DistanceBadge
                            fromLat={coords.lat}
                            fromLng={coords.lng}
                            toLat={place.latitude}
                            toLng={place.longitude}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cities tab */}
      {activeTab === 'cities' && (
        <div className="mx-auto max-w-5xl">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter cities or states..."
              className="pl-10"
            />
          </div>

          {citiesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : filteredCities.length === 0 ? (
            <p className="text-center text-slate-600">No cities found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredCities.map((c) => (
                <Link
                  key={`${c.state}-${c.city}`}
                  href={buildCityUrl(c.state, c.city)}
                >
                  <Card className="group flex items-center justify-between p-4 transition-colors hover:border-primary-300">
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-primary-600">{c.city}</h3>
                      <p className="text-sm text-slate-500">{c.state} · {c.count} {c.count === 1 ? 'place' : 'places'}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary-600" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search tab */}
      {activeTab === 'search' && (
        <div className="mx-auto max-w-5xl">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by place name, city, or state..."
              className="pl-10"
            />
          </div>

          {query.trim().length < 2 ? (
            <p className="text-center text-slate-500">Type at least 2 characters to search.</p>
          ) : searchLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-slate-600">No places match your search.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? 'bg-primary-600 text-white shadow-md'
          : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
