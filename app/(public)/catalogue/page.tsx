import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { CatalogFiltersBar } from '@/components/public/CatalogFiltersBar';
import { ListingCard } from '@/components/public/ListingCard';
import { getAvailableLocations, getPublicListings } from '@/lib/data/listings-service';
import type { CatalogFilters, CatalogSortOption, ListingStatus, PropertyType } from '@/lib/types/database';
import { buildWhatsAppDirectUrl } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catalogue des terrains et appartements meublés — Région de Kolda',
  description:
    'Consultez nos terrains vérifiés à vendre et nos appartements meublés à louer à Kolda (Bouna Kane, Sikilo, Doumassou, Gadapara), Vélingara, Diaobé et Médina Yoro Foulah.',
};

interface CataloguePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getNumberParam(value: string | string[] | undefined): number | undefined {
  const str = getStringParam(value);
  if (!str) return undefined;
  const num = Number(str);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const resolvedParams = await searchParams;

  const rawType = getStringParam(resolvedParams.type);
  const type: PropertyType | 'tous' =
    rawType === 'terrain' || rawType === 'appartement' ? rawType : 'tous';

  const rawStatus = getStringParam(resolvedParams.status);
  const status: ListingStatus | 'tous' =
    rawStatus === 'disponible' || rawStatus === 'reserve' || rawStatus === 'vendu'
      ? rawStatus
      : 'tous';

  const rawSort = getStringParam(resolvedParams.sort);
  const sort: CatalogSortOption =
    rawSort === 'price_asc' || rawSort === 'price_desc' || rawSort === 'surface_desc'
      ? rawSort
      : 'recent';

  const filters: CatalogFilters = {
    type,
    location: getStringParam(resolvedParams.location),
    minPrice: getNumberParam(resolvedParams.minPrice),
    maxPrice: getNumberParam(resolvedParams.maxPrice),
    minSurface: getNumberParam(resolvedParams.minSurface),
    minBedrooms: getNumberParam(resolvedParams.minBedrooms),
    status,
    sort,
  };

  const [listings, availableLocations] = await Promise.all([
    getPublicListings(filters),
    getAvailableLocations(),
  ]);

  return (
    <div className="bg-canvas py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border-subtle pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
              Catalogue immobilier
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Terrains à vendre &amp; appartements meublés
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
              Filtrez par catégorie, secteur, budget en FCFA, surface ou nombre de chambres. Tous
              les montants sont affichés nets en Francs CFA.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/catalogue"
              className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
                type === 'tous'
                  ? 'bg-navy text-white'
                  : 'border border-border-strong bg-surface text-navy hover:bg-sand'
              }`}
            >
              Tout voir
            </Link>
            <Link
              href="/catalogue?type=terrain"
              className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
                type === 'terrain'
                  ? 'bg-navy text-white'
                  : 'border border-border-strong bg-surface text-navy hover:bg-sand'
              }`}
            >
              Terrains à vendre
            </Link>
            <Link
              href="/catalogue?type=appartement"
              className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
                type === 'appartement'
                  ? 'bg-navy text-white'
                  : 'border border-border-strong bg-surface text-navy hover:bg-sand'
              }`}
            >
              Appartements meublés
            </Link>
          </div>
        </div>

        <CatalogFiltersBar
          initialFilters={filters}
          availableLocations={availableLocations}
          totalResults={listings.length}
        />

        {listings.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border-subtle bg-surface p-8 text-center sm:p-12">
            <h2 className="font-display text-xl font-bold text-navy">
              Aucun bien ne correspond à ces critères
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
              Élargissez votre fourchette de budget ou contactez directement notre équipe pour
              accéder aux opportunités en cours de mise en ligne.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/catalogue"
                className="inline-flex h-10 items-center rounded-md border border-border-strong bg-canvas px-4 text-sm font-semibold text-navy hover:bg-sand"
              >
                Réinitialiser les filtres
              </Link>
              <a
                href={buildWhatsAppDirectUrl(
                  'Bonjour DoorWaarSERVICE, je recherche un bien spécifique qui ne figure pas encore dans les résultats du catalogue.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-soft"
              >
                <MessageCircle className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
                <span>Demander sur WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

