'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { ListingImage } from '@/lib/types/database';

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const safeImages: ListingImage[] =
    images.length > 0
      ? images
      : [
          {
            id: 'fallback',
            listing_id: 'fallback',
            storage_path: null,
            image_url: '/images/listings/almadies-residence.jpg',
            alt_text: title,
            sort_order: 0,
            is_cover: true,
            created_at: '',
          },
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentImage = safeImages[activeIndex] ?? safeImages[0];

  function handlePrev() {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }

  function handleNext() {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, safeImages.length]);

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border-subtle bg-sand">
        <Image
          src={currentImage.image_url}
          alt={currentImage.alt_text || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Agrandir la photo"
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-navy-deep/85 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-navy"
        >
          <Expand className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Agrandir</span>
        </button>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/95 text-navy shadow-sm transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/95 text-navy shadow-sm transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div className="absolute bottom-3 left-3 rounded-md bg-navy-deep/85 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
              {activeIndex + 1} / {safeImages.length}
            </div>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
          {safeImages.map((img, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Afficher la photo ${index + 1}`}
                className={`relative aspect-[16/10] overflow-hidden rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-gold ring-1 ring-navy'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || `${title} — miniature ${index + 1}`}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie photo : ${title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/95 p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fermer la galerie"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-navy text-white hover:bg-navy-soft"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div className="relative h-[75vh] w-full max-w-5xl">
            <Image
              src={currentImage.image_url}
              alt={currentImage.alt_text || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Photo précédente"
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-navy hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Photo suivante"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-navy hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
