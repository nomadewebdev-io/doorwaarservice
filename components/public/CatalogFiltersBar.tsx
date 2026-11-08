'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { CatalogFilters, CatalogSortOption, ListingStatus, PropertyType } from '@/lib/types/database';

interface CatalogFiltersBarProps {
  initialFilters: CatalogFilters;
  availableLocations: string[];
  totalResults: number;
}

export function CatalogFiltersBar({
  initialFilters,
  availableLocations,
  totalResults,
}: CatalogFiltersBarProps) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [type, setType] = useState<PropertyType | 'tous'>(initialFilters.type ?? 'tous');
  const [location, setLocation] = useState(initialFilters.location ?? '');
  const [minPrice, setMinPrice] = useState(
    initialFilters.minPrice ? String(initialFilters.minPrice) : '',
  );
  const [maxPrice, setMaxPrice] = useState(
    initialFilters.maxPrice ? String(initialFilters.maxPrice) : '',
  );
  const [minSurface, setMinSurface] = useState(
    initialFilters.minSurface ? String(initialFilters.minSurface) : '',
  );
  const [minBedrooms, setMinBedrooms] = useState(
    initialFilters.minBedrooms ? String(initialFilters.minBedrooms) : '',
  );
  const [status, setStatus] = useState<ListingStatus | 'tous'>(
    initialFilters.status ?? 'tous',
  );
  const [sort, setSort] = useState<CatalogSortOption>(initialFilters.sort ?? 'recent');

  function pushFilters(overrides?: Partial<{ sort: CatalogSortOption }>) {
    const params = new URLSearchParams();
    const effectiveSort = overrides?.sort ?? sort;

    if (type !== 'tous') params.set('type', type);
    if (location.trim()) params.set('location', location.trim());
    if (minPrice.trim()) params.set('minPrice', minPrice.trim());
    if (maxPrice.trim()) params.set('maxPrice', maxPrice.trim());
    if (minSurface.trim()) params.set('minSurface', minSurface.trim());
    if (minBedrooms.trim()) params.set('minBedrooms', minBedrooms.trim());
    if (status !== 'tous') params.set('status', status);
    if (effectiveSort !== 'recent') params.set('sort', effectiveSort);

    const qs = params.toString();
    router.push(qs ? `/catalogue?${qs}` : '/catalogue');
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    pushFilters();
    setMobileFiltersOpen(false);
  }

  function handleReset() {
    setType('tous');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setMinSurface('');
    setMinBedrooms('');
    setStatus('tous');
    setSort('recent');
    router.push('/catalogue');
    setMobileFiltersOpen(false);
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-border-strong bg-canvas px-3.5 text-sm font-medium text-navy lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
            <span>Filtres</span>
          </button>

          <p className="text-sm font-medium text-ink-secondary">
            <span className="font-bold text-navy tabular-nums">{totalResults}</span>{' '}
            {totalResults > 1 ? 'biens correspondants' : 'bien correspondant'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label htmlFor="catalog-sort" className="text-xs font-semibold text-ink-muted">
            Trier par
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) => {
              const nextSort = e.target.value as CatalogSortOption;
              setSort(nextSort);
              pushFilters({ sort: nextSort });
            }}
            className="h-10 rounded-md border border-border-strong bg-canvas px-3 text-sm font-medium text-navy focus:border-navy focus:outline-none"
          >
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="surface_desc">Surface décroissante</option>
          </select>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`${mobileFiltersOpen ? 'mt-4 block' : 'hidden'} border-t border-border-subtle pt-4 lg:mt-4 lg:block`}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <div>
            <label htmlFor="filter-type" className="mb-1 block text-xs font-semibold text-ink-secondary">
              Catégorie
            </label>
            <select
              id="filter-type"
              value={type}
              onChange={(e) => setType(e.target.value as PropertyType | 'tous')}
              className="h-10 w-full rounded-md border border-border-strong bg-canvas px-2.5 text-sm text-ink focus:border-navy focus:outline-none"
            >
              <option value="tous">Tous les biens</option>
              <option value="terrain">Terrains à vendre</option>
              <option value="appartement">Appartements meublés</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-location" className="mb-1 block text-xs font-semibold text-ink-secondary">
              Ville / Quartier
            </label>
            <input
              id="filter-location"
              type="text"
              list="catalog-locations-list"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dakar, Diamniadio, Saly..."
              className="h-10 w-full rounded-md border border-border-strong bg-canvas px-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none"
            />
            <datalist id="catalog-locations-list">
              {availableLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="filter-min-price" className="mb-1 block text-xs font-semibold text-ink-secondary">
              Prix min (FCFA)
            </label>
            <input
              id="filter-min-price"
              type="number"
              min={0}
              step={50000}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Ex : 400000"
              className="h-10 w-full rounded-md border border-border-strong bg-canvas px-2.5 text-sm text-ink tabular-nums placeholder:text-ink-muted focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="filter-max-price" className="mb-1 block text-xs font-semibold text-ink-secondary">
              Prix max (FCFA)
            </label>
            <input
              id="filter-max-price"
              type="number"
              min={0}
              step={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Ex : 30000000"
              className="h-10 w-full rounded-md border border-border-strong bg-canvas px-2.5 text-sm text-ink tabular-nums placeholder:text-ink-muted focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="filter-surface" className="mb-1 block text-xs font-semibold text-ink-secondary">
              Surface min (m²)
            </label>
            <input
              id="filter-surface"
              type="number"
              min={0}
              step={10}
              value={minSurface}
              onChange={(e) => setMinSurface(e.target.value)}
              placeholder="Ex : 100"
              className="h-10 w-full rounded-md border border-border-strong bg-canvas px-2.5 text-sm text-ink tabular-nums placeholder:text-ink-muted focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="filter-bedrooms" className="mb-1 block text-xs font-semibold text-ink-secondary">
              Chambres min
            </label>
            <select
              id="filter-bedrooms"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              className="h-10 w-full rounded-md border border-border-strong bg-canvas px-2.5 text-sm text-ink focus:border-navy focus:outline-none"
            >
              <option value="">Indifférent</option>
              <option value="1">1+ chambre</option>
              <option value="2">2+ chambres</option>
              <option value="3">3+ chambres</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-status" className="mb-1 block text-xs font-semibold text-ink-secondary">
              Statut
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ListingStatus | 'tous')}
              className="h-10 w-full rounded-md border border-border-strong bg-canvas px-2.5 text-sm text-ink focus:border-navy focus:outline-none"
            >
              <option value="tous">Tous</option>
              <option value="disponible">Disponible</option>
              <option value="reserve">Réservé</option>
              <option value="vendu">Vendu</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border-strong px-3.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-canvas hover:text-navy"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Réinitialiser</span>
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            Appliquer les filtres
          </button>
        </div>
      </form>
    </div>
  );
}
