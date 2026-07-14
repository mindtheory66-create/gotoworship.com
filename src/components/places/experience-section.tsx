import { Card } from '@/components/ui/card';
import { PlaceWithImages } from '@/types';
import { Tag, Languages, Sparkles, Accessibility } from 'lucide-react';

export function ExperienceSection({ place }: { place: PlaceWithImages }) {
  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-bold text-slate-900 md:text-2xl">At a Glance</h2>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Tag className="h-4 w-4 text-primary-600" /> Type
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">{place.religion}</span>
          {place.denomination && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{place.denomination}</span>
          )}
        </div>
      </div>

      {place.language.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Languages className="h-4 w-4 text-primary-600" /> Languages
          </div>
          <div className="flex flex-wrap gap-2">
            {place.language.map((lang) => (
              <span key={lang} className="rounded-full bg-accent-50 px-3 py-1 text-sm font-semibold text-accent-700">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Sparkles className="h-4 w-4 text-primary-600" /> Features
        </div>
        <div className="flex flex-wrap gap-2">
          {place.facilities.length > 0 ? (
            place.facilities.map((f) => (
              <span key={f} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {f}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">No facilities listed yet.</span>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Accessibility className="h-4 w-4 text-primary-600" /> Accessibility
        </div>
        <p className="text-sm text-slate-600">
          {place.facilities.some((f) => f.toLowerCase().includes('wheelchair'))
            ? 'Wheelchair accessible facilities are available.'
            : 'Please contact the place for accessibility details.'}
        </p>
      </div>
    </Card>
  );
}
