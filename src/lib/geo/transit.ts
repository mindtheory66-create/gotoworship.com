export interface NearestStation {
  name: string;
  distance_m: number;
  duration_s?: number;
  mode: 'walking' | 'driving';
}

const WALKING_SPEED_MPS = 1.4; // ~5 km/h

export async function fetchNearestStations(
  lat: number,
  lng: number,
  radius = 2000,
  limit = 3
): Promise<NearestStation[]> {
  try {
    const query = `
      [out:json][timeout:10];
      (
        node["public_transport"="station"](around:${radius},${lat},${lng});
        node["public_transport"="stop_position"]["train"="yes"](around:${radius},${lat},${lng});
        node["railway"="station"](around:${radius},${lat},${lng});
        node["railway"="halt"](around:${radius},${lat},${lng});
      );
      out body ${limit};
    `;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) return [];

    const data = await res.json();
    const stations: NearestStation[] = [];
    const seen = new Set<string>();

    for (const element of data.elements || []) {
      const name = element.tags?.name;
      if (!name || seen.has(name)) continue;

      const sLat = element.lat;
      const sLng = element.lon;
      if (typeof sLat !== 'number' || typeof sLng !== 'number') continue;

      const distance = haversineKm(lat, lng, sLat, sLng) * 1000;
      if (distance <= radius) {
        seen.add(name);
        stations.push({
          name,
          distance_m: Math.round(distance),
          duration_s: Math.round(distance / WALKING_SPEED_MPS),
          mode: 'walking',
        });
      }
    }

    return stations.slice(0, limit);
  } catch {
    return [];
  }
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
