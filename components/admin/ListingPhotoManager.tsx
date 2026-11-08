'use client';

import Image from 'next/image';
import { useState, type ChangeEvent } from 'react';
import { Loader2, Star, Trash2, Upload } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ListingImage } from '@/lib/types/database';

interface ListingPhotoManagerProps {
  listingId: string;
  listingTitle: string;
  initialImages: ListingImage[];
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ListingPhotoManager({
  listingId,
  listingTitle,
  initialImages,
}: ListingPhotoManagerProps) {
  const [images, setImages] = useState<ListingImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setErrorMsg(null);
    setUploading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const uploadedImages: ListingImage[] = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!ALLOWED_TYPES.includes(file.type)) {
          setErrorMsg(`Format non pris en charge (${file.name}). Utilisez JPG, PNG ou WebP.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setErrorMsg(`Fichier trop volumineux (${file.name} > 5 Mo).`);
          continue;
        }

        const safeExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const storagePath = `${listingId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          setErrorMsg(`Échec de l’envoi vers Supabase Storage : ${uploadError.message}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('listing-images').getPublicUrl(storagePath);

        const isFirstPhoto = images.length === 0 && uploadedImages.length === 0;
        const response = await fetch(`/api/admin/listings/${listingId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storage_path: storagePath,
            image_url: publicUrl,
            alt_text: listingTitle,
            is_cover: isFirstPhoto,
            sort_order: images.length + uploadedImages.length,
          }),
        });

        const payload = (await response.json()) as { image?: ListingImage; error?: string };
        if (response.ok && payload.image) {
          uploadedImages.push(payload.image);
        } else {
          setErrorMsg(payload.error || 'Erreur lors de l’enregistrement de la photo.');
        }
      }

      if (uploadedImages.length > 0) {
        setImages((prev) => [...prev, ...uploadedImages]);
      }
    } catch {
      setErrorMsg('Impossible de téléverser les photos.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSetCover(imageId: string) {
    setErrorMsg(null);
    const response = await fetch(`/api/admin/listings/${listingId}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    });

    if (!response.ok) {
      setErrorMsg('Impossible de changer la photo de couverture.');
      return;
    }

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_cover: img.id === imageId,
      })),
    );
  }

  async function handleDelete(imageId: string) {
    setErrorMsg(null);
    const response = await fetch(
      `/api/admin/listings/${listingId}/images?imageId=${encodeURIComponent(imageId)}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      setErrorMsg('Impossible de supprimer cette photo.');
      return;
    }

    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-navy">Photos du bien</h2>
          <p className="text-xs text-ink-secondary">
            Formats JPG, PNG ou WebP (5 Mo max par photo). La photo principale s’affiche en une
            du catalogue.
          </p>
        </div>

        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-navy px-4 text-xs font-semibold text-white transition-colors hover:bg-navy-soft">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              <span>Upload en cours...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
              <span>Ajouter des photos</span>
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="sr-only"
          />
        </label>
      </div>

      {errorMsg ? (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          {errorMsg}
        </div>
      ) : null}

      {images.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border-strong bg-canvas p-8 text-center text-xs text-ink-muted">
          Aucune photo associée pour le moment. Téléversez au moins une photo du bien.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-lg border border-border-subtle bg-canvas"
            >
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={image.image_url}
                  alt={image.alt_text || listingTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                {image.is_cover ? (
                  <span className="absolute left-2 top-2 rounded bg-navy px-2 py-0.5 text-[11px] font-semibold text-gold-light">
                    Principale
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => handleSetCover(image.id)}
                  disabled={image.is_cover}
                  className="inline-flex items-center gap-1 text-xs font-medium text-navy hover:text-gold-text disabled:text-ink-muted"
                >
                  <Star className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>{image.is_cover ? 'Couverture active' : 'Définir couverture'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  aria-label="Supprimer cette photo"
                  className="rounded p-1 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
