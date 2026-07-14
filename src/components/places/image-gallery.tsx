'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlaceImage } from '@/types';
import { MapPin, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';

export function ImageGallery({ images, name }: { images: PlaceImage[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="relative flex h-[40vh] min-h-[280px] w-full items-center justify-center bg-slate-100 text-slate-400 md:h-[50vh] md:max-h-[520px]">
        <div className="flex flex-col items-center gap-3">
          <MapPin className="h-14 w-14" />
          <span className="text-sm font-medium text-slate-400">No photos available</span>
        </div>
      </div>
    );
  }

  // Gallery grid when we have multiple images (reference style: large left + stacked right)
  if (images.length > 1) {
    return (
      <>
        <div className="grid h-[45vh] min-h-[300px] w-full grid-cols-1 gap-2 bg-slate-100 md:h-[55vh] md:max-h-[620px] md:grid-cols-3">
          {images.slice(0, 3).map((img, idx) => (
            <button
              key={img.id}
              onClick={() => { setSelected(idx); setLightbox(true); }}
              className={`relative block min-h-[160px] w-full overflow-hidden ${
                idx === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt_text || name}
                fill
                sizes={idx === 0 ? '66vw' : '33vw'}
                className="object-cover transition duration-500 hover:scale-105"
                priority={idx === 0}
              />
              {idx === 2 && images.length > 3 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                  +{images.length - 3}
                </span>
              )}
            </button>
          ))}
        </div>

        {lightbox && (
          <Lightbox images={images} name={name} selected={selected} setSelected={setSelected} onClose={() => setLightbox(false)} />
        )}
      </>
    );
  }

  // Single image full-width cover
  const primary = images[0];
  return (
    <>
      <button
        onClick={() => setLightbox(true)}
        className="relative block h-[45vh] min-h-[300px] w-full cursor-zoom-in bg-slate-100 md:h-[55vh] md:max-h-[620px]"
      >
        <Image
          src={primary.url}
          alt={primary.alt_text || name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
      </button>

      {lightbox && (
        <Lightbox images={images} name={name} selected={selected} setSelected={setSelected} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}

function Lightbox({
  images,
  name,
  selected,
  setSelected,
  onClose,
}: {
  images: PlaceImage[];
  name: string;
  selected: number;
  setSelected: (n: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={onClose}>
      <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:block"
            onClick={(e) => { e.stopPropagation(); setSelected(selected === 0 ? images.length - 1 : selected - 1); }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:block"
            onClick={(e) => { e.stopPropagation(); setSelected(selected === images.length - 1 ? 0 : selected + 1); }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <Image
        src={images[selected].url}
        alt={images[selected].alt_text || name}
        width={1200}
        height={800}
        className="max-h-[85vh] max-w-full rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
          {selected + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
