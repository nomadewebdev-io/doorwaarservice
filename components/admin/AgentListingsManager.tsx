'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { MarkSoldModal } from '@/components/admin/MarkSoldModal';
import { StatusBadge } from '@/components/public/StatusBadge';
import type { ListingStatus, ListingWithImages, PropertyType } from '@/lib/types/database';
import { formatListingPrice, getPropertyTypeLabel } from '@/lib/utils/format';

interface AgentListingsManagerProps {
  initialListings: ListingWithImages[];
}

export function AgentListingsManager({ initialListings }: AgentListingsManagerProps) {
  const router = useRouter();
  const [listings, setListings] = useState<ListingWithImages[]>(initialListings);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'tous' | PropertyType>('tous');
  const [statusFilter, setStatusFilter] = useState<'tous' | ListingStatus>('tous');
  const [sellingListing, setSellingListing] = useState<ListingWithImages | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const filtered = listings.filter((item) => {
    if (typeFilter !== 'tous' && item.property_type !== typeFilter) return false;
    if (statusFilter !== 'tous' && item.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const hay = `${item.title} ${item.city} ${item.neighborhood}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  async function handleQuickStatusChange(listing: ListingWithImages, nextStatus: ListingStatus) {
    if (nextStatus === 'vendu') {
      setSellingListing(listing);
      return;
    }

    setBusyId(listing.id);
    setFeedbackError(null);
    try {
      const response = await fetch(`/api/admin/listings/${listing.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFeedbackError(payload.error || 'Impossible de modifier le statut.');
        return;
      }

      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id ? { ...item, status: nextStatus } : item,
        ),
      );
      router.refresh();
    } catch {
      setFeedbackError('Erreur réseau lors du changement de statut.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(listingId: string) {
    setBusyId(listingId);
    setFeedbackError(null);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFeedbackError(payload.error || 'Suppression impossible.');
        return;
      }

      setListings((prev) => prev.filter((item) => item.id !== listingId));
      setConfirmDeleteId(null);
      router.refresh();
    } catch {
      setFeedbackError('Erreur réseau lors de la suppression.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy sm:text-3xl">
            Gestion des annonces
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Ajoutez des biens, téléversez vos photos et mettez à jour les statuts. Passer à
            « Vendu » exige le prix de vente final en FCFA.
          </p>
        </div>

        <Link
          href="/admin/annonces/nouvelle"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
        >
          <Plus className="h-4 w-4 text-gold-light" strokeWidth={2} />
          <span>Nouvelle annonce</span>
        </Link>
      </div>

      {feedbackError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {feedbackError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border-subtle bg-surface p-4 sm:grid-cols-12">
        <div className="relative sm:col-span-6">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre, ville ou quartier..."
            className="h-10 w-full rounded-md border border-border-strong bg-canvas pl-9 pr-3 text-sm text-ink focus:border-navy focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            aria-label="Filtrer par catégorie"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'tous' | PropertyType)}
            className="h-10 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
          >
            <option value="tous">Toutes catégories</option>
            <option value="terrain">Terrains à vendre</option>
            <option value="appartement">Appartements meublés</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            aria-label="Filtrer par statut"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'tous' | ListingStatus)}
            className="h-10 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
          >
            <option value="tous">Tous statuts</option>
            <option value="disponible">Disponible</option>
            <option value="reserve">Réservé</option>
            <option value="vendu">Vendu</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface p-10 text-center">
          <p className="text-sm text-ink-secondary">
            Aucune annonce trouvée pour ces critères.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => {
            const cover =
              listing.listing_images?.[0]?.image_url || '/images/listings/almadies-residence.jpg';
            const isVendu = listing.status === 'vendu';
            const isBusy = busyId === listing.id;

            return (
              <div
                key={listing.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-border-subtle bg-surface p-4 lg:flex-row lg:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-sand">
                    <Image
                      src={cover}
                      alt={listing.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-sand px-2 py-0.5 text-[11px] font-semibold text-navy">
                        {getPropertyTypeLabel(listing.property_type)}
                      </span>
                      <StatusBadge status={listing.status} />
                      {!listing.is_published ? (
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          Brouillon
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-1.5 font-display text-base font-bold text-navy">
                      {listing.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-secondary">
                      {listing.neighborhood}, {listing.city} •{' '}
                      <span className="font-semibold text-navy tabular-nums">
                        {formatListingPrice(listing.price_fcfa, listing.price_period)}
                      </span>
                      {listing.surface_sqm ? ` • ${listing.surface_sqm} m²` : ''}
                      {` • ${listing.listing_images?.length ?? 0} photo(s)`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3 lg:border-t-0 lg:pt-0">
                  {!isVendu ? (
                    <>
                      <select
                        aria-label={`Statut de ${listing.title}`}
                        value={listing.status}
                        disabled={isBusy}
                        onChange={(e) =>
                          handleQuickStatusChange(listing, e.target.value as ListingStatus)
                        }
                        className="h-9 rounded-md border border-border-strong bg-canvas px-2.5 text-xs font-semibold text-navy focus:border-navy focus:outline-none"
                      >
                        <option value="disponible">Disponible</option>
                        <option value="reserve">Réservé</option>
                      </select>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setSellingListing(listing)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gold bg-gold-tint px-3 text-xs font-semibold text-gold-text transition-colors hover:bg-gold hover:text-navy-deep"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <span>Passer à Vendu</span>
                      </button>
                    </>
                  ) : null}

                  <Link
                    href={`/annonces/${listing.slug}`}
                    target="_blank"
                    className="inline-flex h-9 items-center gap-1 rounded-md border border-border-subtle px-2.5 text-xs font-medium text-ink-secondary hover:bg-canvas hover:text-navy"
                    title="Voir la fiche publique"
                  >
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>Voir</span>
                  </Link>

                  <Link
                    href={`/admin/annonces/${listing.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-canvas px-3 text-xs font-semibold text-navy hover:bg-sand"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>Modifier</span>
                  </Link>

                  {confirmDeleteId === listing.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(listing.id)}
                        className="h-9 rounded-md bg-red-700 px-3 text-xs font-semibold text-white hover:bg-red-800"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-9 rounded-md border border-border-strong px-2.5 text-xs text-ink-secondary hover:bg-canvas"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(listing.id)}
                      aria-label={`Supprimer ${listing.title}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle text-red-700 hover:border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sellingListing ? (
        <MarkSoldModal
          listing={sellingListing}
          onClose={() => setSellingListing(null)}
          onSuccess={() => {
            setListings((prev) =>
              prev.map((item) =>
                item.id === sellingListing.id ? { ...item, status: 'vendu' } : item,
              ),
            );
            setSellingListing(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
