'use client';

import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, Save, Upload } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  LegalStatus,
  ListingStatus,
  ListingWithImages,
  PricePeriod,
  PropertyType,
} from '@/lib/types/database';
import { formatFCFA } from '@/lib/utils/format';

interface ListingFormProps {
  mode: 'create' | 'edit';
  initialListing?: ListingWithImages;
}

const LEGAL_STATUS_OPTIONS: LegalStatus[] = [
  'Titre Foncier',
  'Bail',
  'Délibération',
  'Contrat de bail meublé',
];

export function ListingForm({ mode, initialListing }: ListingFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialListing?.title ?? '');
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initialListing?.property_type ?? 'terrain',
  );
  const [status, setStatus] = useState<ListingStatus>(initialListing?.status ?? 'disponible');
  const [priceFcfa, setPriceFcfa] = useState(
    initialListing ? String(initialListing.price_fcfa) : '',
  );
  const [pricePeriod, setPricePeriod] = useState<PricePeriod>(
    initialListing?.price_period ?? 'total',
  );
  const [city, setCity] = useState(initialListing?.city ?? 'Dakar');
  const [neighborhood, setNeighborhood] = useState(initialListing?.neighborhood ?? '');
  const [addressLandmark, setAddressLandmark] = useState(
    initialListing?.address_landmark ?? '',
  );
  const [surfaceSqm, setSurfaceSqm] = useState(
    initialListing?.surface_sqm ? String(initialListing.surface_sqm) : '',
  );
  const [bedrooms, setBedrooms] = useState(
    initialListing?.bedrooms !== null && initialListing?.bedrooms !== undefined
      ? String(initialListing.bedrooms)
      : '',
  );
  const [bathrooms, setBathrooms] = useState(
    initialListing?.bathrooms !== null && initialListing?.bathrooms !== undefined
      ? String(initialListing.bathrooms)
      : '',
  );
  const [legalStatus, setLegalStatus] = useState<string>(
    initialListing?.legal_status ?? 'Titre Foncier',
  );
  const [amenitiesText, setAmenitiesText] = useState(
    initialListing?.amenities?.join(', ') ?? '',
  );
  const [description, setDescription] = useState(initialListing?.description ?? '');
  const [isFeatured, setIsFeatured] = useState(initialListing?.is_featured ?? false);
  const [isPublished, setIsPublished] = useState(initialListing?.is_published ?? true);

  // Champs obligatoires uniquement lors du passage au statut 'vendu'
  const isTransitioningToSold =
    mode === 'edit' && status === 'vendu' && initialListing?.status !== 'vendu';
  const [finalSalePrice, setFinalSalePrice] = useState(
    initialListing ? String(initialListing.price_fcfa) : '',
  );
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

  // Fichiers en attente lors de la création initiale
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handlePropertyTypeChange(nextType: PropertyType) {
    setPropertyType(nextType);
    if (nextType === 'terrain') {
      setPricePeriod('total');
      if (legalStatus === 'Contrat de bail meublé') setLegalStatus('Titre Foncier');
    } else {
      setPricePeriod('mois');
      setLegalStatus('Contrat de bail meublé');
    }
  }

  function handlePendingFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const validFiles = files.filter(
      (f) =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) &&
        f.size <= 5 * 1024 * 1024,
    );
    if (validFiles.length < files.length) {
      setErrorMsg('Certains fichiers ont été ignorés (formats JPG/PNG/WebP, max 5 Mo).');
    }
    setPendingFiles(validFiles);
  }

  async function uploadQueuedPhotos(listingId: string, listingTitle: string) {
    if (pendingFiles.length === 0) return;
    const supabase = createSupabaseBrowserClient();

    for (let i = 0; i < pendingFiles.length; i += 1) {
      const file = pendingFiles[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const storagePath = `${listingId}/${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('listing-images')
        .upload(storagePath, file, { cacheControl: '3600', upsert: false });

      if (uploadErr) continue;

      const {
        data: { publicUrl },
      } = supabase.storage.from('listing-images').getPublicUrl(storagePath);

      await fetch(`/api/admin/listings/${listingId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storage_path: storagePath,
          image_url: publicUrl,
          alt_text: listingTitle,
          is_cover: i === 0,
          sort_order: i,
        }),
      });
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    if (isTransitioningToSold) {
      const numericFinal = Number(finalSalePrice);
      if (!Number.isFinite(numericFinal) || numericFinal <= 0) {
        setFieldErrors({
          final_sale_price_fcfa:
            'Le prix de vente final en FCFA est obligatoire pour passer à Vendu.',
        });
        setErrorMsg('Veuillez saisir le prix de vente final en FCFA.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title,
        property_type: propertyType,
        transaction_type: propertyType === 'terrain' ? 'vente' : 'location',
        status,
        price_fcfa: Number(priceFcfa),
        price_period: pricePeriod,
        city,
        neighborhood,
        address_landmark: addressLandmark,
        surface_sqm: surfaceSqm ? Number(surfaceSqm) : null,
        bedrooms: propertyType === 'appartement' && bedrooms !== '' ? Number(bedrooms) : null,
        bathrooms: propertyType === 'appartement' && bathrooms !== '' ? Number(bathrooms) : null,
        legal_status: legalStatus || null,
        amenities: amenitiesText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        description,
        is_featured: isFeatured,
        is_published: isPublished,
      };

      if (isTransitioningToSold) {
        payload.final_sale_price_fcfa = Number(finalSalePrice);
        payload.buyer_name = buyerName;
        payload.buyer_phone = buyerPhone;
        payload.sale_notes = saleNotes;
      }

      const url =
        mode === 'create'
          ? '/api/admin/listings'
          : `/api/admin/listings/${initialListing?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        listing?: ListingWithImages;
        error?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        if (result.errors) setFieldErrors(result.errors);
        setErrorMsg(result.error || 'Impossible d’enregistrer l’annonce.');
        return;
      }

      if (mode === 'create' && result.listing?.id) {
        await uploadQueuedPhotos(result.listing.id, result.listing.title);
        router.push(`/admin/annonces/${result.listing.id}?created=1`);
        router.refresh();
        return;
      }

      router.push('/admin?saved=1');
      router.refresh();
    } catch {
      setErrorMsg('Erreur réseau lors de la sauvegarde.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {errorMsg}
        </div>
      ) : null}

      <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-5">
        <h2 className="font-display text-lg font-bold text-navy">
          Informations principales
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="listing-type" className="mb-1.5 block text-xs font-semibold text-navy">
              Catégorie *
            </label>
            <select
              id="listing-type"
              value={propertyType}
              onChange={(e) => handlePropertyTypeChange(e.target.value as PropertyType)}
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
            >
              <option value="terrain">Terrain à vendre</option>
              <option value="appartement">Appartement meublé</option>
            </select>
          </div>

          <div>
            <label htmlFor="listing-status" className="mb-1.5 block text-xs font-semibold text-navy">
              Statut *
            </label>
            <select
              id="listing-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ListingStatus)}
              disabled={mode === 'edit' && initialListing?.status === 'vendu'}
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none disabled:opacity-60"
            >
              <option value="disponible">Disponible</option>
              <option value="reserve">Réservé</option>
              {mode === 'edit' ? <option value="vendu">Vendu (exige prix final)</option> : null}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="listing-title" className="mb-1.5 block text-xs font-semibold text-navy">
            Titre de l’annonce *
          </label>
          <input
            id="listing-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Terrain viabilisé 400 m² en Titre Foncier à Diamniadio"
            className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
          />
          {fieldErrors.title ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="listing-price" className="mb-1.5 block text-xs font-semibold text-navy">
              Prix affiché (FCFA) *
            </label>
            <input
              id="listing-price"
              type="number"
              required
              min={1}
              step={1000}
              value={priceFcfa}
              onChange={(e) => setPriceFcfa(e.target.value)}
              placeholder="Ex : 28000000"
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm font-semibold text-navy tabular-nums focus:border-navy focus:outline-none"
            />
            {Number(priceFcfa) > 0 ? (
              <p className="mt-1 text-xs text-ink-muted tabular-nums">
                Aperçu : {formatFCFA(Number(priceFcfa))}
              </p>
            ) : null}
            {fieldErrors.price_fcfa ? (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.price_fcfa}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="listing-period" className="mb-1.5 block text-xs font-semibold text-navy">
              Période tarifaire
            </label>
            <select
              id="listing-period"
              value={pricePeriod}
              onChange={(e) => setPricePeriod(e.target.value as PricePeriod)}
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
            >
              <option value="total">Prix total (vente)</option>
              <option value="mois">Par mois</option>
              <option value="nuit">Par nuit</option>
            </select>
          </div>
        </div>

        {isTransitioningToSold ? (
          <div className="rounded-lg border-2 border-gold bg-gold-tint/50 p-5 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold-text">
                Vente finale obligatoire
              </p>
              <p className="mt-1 text-xs text-ink-secondary">
                Le passage au statut « Vendu » exige la saisie du prix de vente final en FCFA et
                génère automatiquement la commission agence.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="edit-final-sale-price"
                  className="mb-1.5 block text-xs font-semibold text-navy"
                >
                  Prix de vente final (FCFA) *
                </label>
                <input
                  id="edit-final-sale-price"
                  type="number"
                  required
                  min={1}
                  step={1000}
                  value={finalSalePrice}
                  onChange={(e) => setFinalSalePrice(e.target.value)}
                  className="h-11 w-full rounded-md border border-navy bg-surface px-3 text-sm font-bold text-navy tabular-nums focus:outline-none"
                />
                {fieldErrors.final_sale_price_fcfa ? (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.final_sale_price_fcfa}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="edit-buyer-name"
                  className="mb-1.5 block text-xs font-semibold text-navy"
                >
                  Nom de l’acheteur
                </label>
                <input
                  id="edit-buyer-name"
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Optionnel"
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-ink focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-buyer-phone"
                  className="mb-1.5 block text-xs font-semibold text-navy"
                >
                  Téléphone acheteur
                </label>
                <input
                  id="edit-buyer-phone"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+221 77 ..."
                  className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-ink focus:border-navy focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-sale-notes" className="mb-1.5 block text-xs font-semibold text-navy">
                Notes de vente
              </label>
              <input
                id="edit-sale-notes"
                type="text"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Notaire, modalité de règlement..."
                className="h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-ink focus:border-navy focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="listing-city" className="mb-1.5 block text-xs font-semibold text-navy">
              Ville *
            </label>
            <input
              id="listing-city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Dakar, Diamniadio, Mbour..."
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
            />
            {fieldErrors.city ? (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.city}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="listing-neighborhood"
              className="mb-1.5 block text-xs font-semibold text-navy"
            >
              Quartier / Secteur *
            </label>
            <input
              id="listing-neighborhood"
              type="text"
              required
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Les Almadies, Saly Portudal..."
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
            />
            {fieldErrors.neighborhood ? (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.neighborhood}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="listing-landmark" className="mb-1.5 block text-xs font-semibold text-navy">
              Repère / accès
            </label>
            <input
              id="listing-landmark"
              type="text"
              value={addressLandmark}
              onChange={(e) => setAddressLandmark(e.target.value)}
              placeholder="Ex : À 4 min de la gare TER"
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="listing-surface" className="mb-1.5 block text-xs font-semibold text-navy">
              Surface (m²)
            </label>
            <input
              id="listing-surface"
              type="number"
              min={1}
              value={surfaceSqm}
              onChange={(e) => setSurfaceSqm(e.target.value)}
              placeholder="Ex : 400"
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink tabular-nums focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="listing-legal" className="mb-1.5 block text-xs font-semibold text-navy">
              Statut juridique
            </label>
            <select
              id="listing-legal"
              value={legalStatus}
              onChange={(e) => setLegalStatus(e.target.value)}
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
            >
              {LEGAL_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {propertyType === 'appartement' ? (
            <>
              <div>
                <label
                  htmlFor="listing-bedrooms"
                  className="mb-1.5 block text-xs font-semibold text-navy"
                >
                  Chambres
                </label>
                <input
                  id="listing-bedrooms"
                  type="number"
                  min={0}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="Ex : 3"
                  className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink tabular-nums focus:border-navy focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="listing-bathrooms"
                  className="mb-1.5 block text-xs font-semibold text-navy"
                >
                  Salles d’eau
                </label>
                <input
                  id="listing-bathrooms"
                  type="number"
                  min={0}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="Ex : 2"
                  className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink tabular-nums focus:border-navy focus:outline-none"
                />
              </div>
            </>
          ) : null}
        </div>

        <div>
          <label htmlFor="listing-amenities" className="mb-1.5 block text-xs font-semibold text-navy">
            Points forts &amp; équipements (séparés par des virgules)
          </label>
          <input
            id="listing-amenities"
            type="text"
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
            placeholder="Ex : Titre Foncier individuel, Voirie bitumée, Senelec, SDE"
            className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="listing-description"
            className="mb-1.5 block text-xs font-semibold text-navy"
          >
            Description complète *
          </label>
          <textarea
            id="listing-description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez précisément le bien, son environnement, les commodités et les conditions."
            className="w-full rounded-md border border-border-strong bg-canvas px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none"
          />
          {fieldErrors.description ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-6 border-t border-border-subtle pt-4">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-navy">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border-strong text-navy"
            />
            <span>Publier sur le site public</span>
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-navy">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-border-strong text-navy"
            />
            <span>Mettre en avant sur la page d’accueil</span>
          </label>
        </div>
      </div>

      {mode === 'create' ? (
        <div className="rounded-xl border border-border-subtle bg-surface p-6">
          <h2 className="font-display text-lg font-bold text-navy">
            Photos de l’annonce
          </h2>
          <p className="mt-1 text-xs text-ink-secondary">
            Sélectionnez une ou plusieurs photos (JPG, PNG, WebP — max 5 Mo). La première image
            deviendra la photo de couverture.
          </p>

          <label className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border-strong bg-canvas px-4 text-xs font-semibold text-navy hover:bg-sand">
            <Upload className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
            <span>
              {pendingFiles.length > 0
                ? `${pendingFiles.length} photo(s) sélectionnée(s)`
                : 'Choisir des photos à téléverser'}
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePendingFileChange}
              className="sr-only"
            />
          </label>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="h-11 rounded-md border border-border-strong bg-surface px-5 text-sm font-semibold text-ink-secondary hover:bg-canvas"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
              <span>
                {mode === 'create' ? 'Créer l’annonce' : 'Enregistrer les modifications'}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
