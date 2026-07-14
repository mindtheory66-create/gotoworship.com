import { PlaceWithImages } from '@/types';
import { Check, Globe, Users, Accessibility, Car, MapPin } from 'lucide-react';

export function HighlightsSection({ place }: { place: PlaceWithImages }) {
  const items: { icon: React.ReactNode; text: string }[] = [];

  items.push({ icon: <Globe className="h-4 w-4" />, text: `${place.religion}${place.denomination ? ` - ${place.denomination}` : ''}` });

  if (place.language.length > 0) {
    items.push({ icon: <Users className="h-4 w-4" />, text: `Services in ${place.language.join(', ')}` });
  }

  const accessibility = place.facilities.filter((f) =>
    f.toLowerCase().includes('wheelchair')
  );
  if (accessibility.length > 0) {
    items.push({ icon: <Accessibility className="h-4 w-4" />, text: accessibility.join(', ') });
  }

  if (place.facilities.some((f) => f.toLowerCase().includes('parking'))) {
    items.push({ icon: <Car className="h-4 w-4" />, text: 'Parking available' });
  }

  const otherFacilities = place.facilities.filter(
    (f) => !f.toLowerCase().includes('wheelchair') && !f.toLowerCase().includes('parking')
  );
  otherFacilities.slice(0, 4).forEach((f) => {
    items.push({ icon: <Check className="h-4 w-4" />, text: f });
  });

  items.push({ icon: <MapPin className="h-4 w-4" />, text: `Located in ${place.city}, ${place.state}` });

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3 text-sm text-slate-700">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            {item.icon}
          </span>
          <span dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      ))}
    </div>
  );
}
