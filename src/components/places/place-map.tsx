'use client';

import { useEffect, useRef } from 'react';
import { haversineKm } from '@/lib/geo/transit';

interface PlaceMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export function PlaceMap({ latitude, longitude, name }: PlaceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let mapInstance: any = null;
    let leaflet: any = null;

    const initMap = async () => {
      leaflet = await import('leaflet');

      // Inject Leaflet CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      mapInstance = leaflet.map(mapContainerRef.current).setView([latitude, longitude], 14);

      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(mapInstance);

      const markerIcon = leaflet.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="display:flex;height:2rem;width:2rem;align-items:center;justify-content:center;border-radius:9999px;background:#2563eb;color:white;font-weight:700;">P</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      leaflet.marker([latitude, longitude], { icon: markerIcon }).addTo(mapInstance).bindPopup(name);
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [latitude, longitude, name]);

  if (!latitude || !longitude) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
        <p className="font-medium">{name}</p>
        <p className="text-sm">Coordinates not available</p>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="z-0 h-80 w-full rounded-lg" />;
}

export function DistanceBadge({
  fromLat,
  fromLng,
  toLat,
  toLng,
}: {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}) {
  const km = haversineKm(fromLat, fromLng, toLat, toLng);
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
      {km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`} away
    </span>
  );
}
