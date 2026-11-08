import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BedDouble, FileCheck2, MapPin, Maximize2 } from 'lucide-react';
import type { ListingWithImages } from '@/lib/types/database';
import { formatListingPrice, getPropertyTypeLabel } from '@/lib/utils/format';
import { StatusBadge } from '@/components/public/StatusBadge';

interface ListingCardProps {
  listing: ListingWithImages;
  variant?: 'standard' | 'featured';
}

export function ListingCard({ listing, variant = 'standard' }: ListingCardProps) {
  const coverImage =
    listing.listing_images?.[0]?.image_url || '/images/listings/almadies-residence.jpg';
  const coverAlt = listing.listing_images?.[0]?.alt_text || listing.title;

  if (variant === 'featured') {
    return (
      <article className="group overflow-hidden rounded-xl border border-border-subtle bg-surface transition-colors hover:border-border-strong">
        <Link href={`/annonces/${listing.slug}`} className="grid grid-cols-1 lg:grid-cols-12">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand lg:col-span-7 lg:aspect-auto lg:min-h-[340px]">
            <Image
              src={coverImage}
              alt={coverAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-navy px-2.5 py-1 text-xs font-semibold text-white">
                {getPropertyTypeLabel(listing.property_type)}
              </span>
              <StatusBadge status={listing.status} />
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gold-text">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>
                  {listing.neighborhood}, {listing.city}
                </span>
              </div>

              <h3 className="mt-3 font-display text-xl font-bold leading-snug text-navy group-hover:text-navy-soft sm:text-2xl">
                {listing.title}
              </h3>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-secondary">
                {listing.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-border-subtle py-3.5 text-xs font-medium text-ink-secondary">
                {listing.surface_sqm ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
                    <span>{listing.surface_sqm} m²</span>
                  </span>
                ) : null}
                {listing.bedrooms !== null && listing.bedrooms > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
                    <span>
                      {listing.bedrooms} chambre{listing.bedrooms > 1 ? 's' : ''}
                    </span>
                  </span>
                ) : null}
                {listing.legal_status ? (
                  <span className="inline-flex items-center gap-1.5">
                    <FileCheck2 className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
                    <span>{listing.legal_status}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <span className="block text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {listing.transaction_type === 'vente' ? 'Prix de cession' : 'Loyer meublé'}
                </span>
                <span className="font-display text-xl font-bold text-navy tabular-nums sm:text-2xl">
                  {formatListingPrice(listing.price_fcfa, listing.price_period)}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-border-strong px-3 py-2 text-xs font-semibold text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                <span>Voir le bien</span>
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface transition-colors hover:border-border-strong">
      <Link href={`/annonces/${listing.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
          <Image
            src={coverImage}
            alt={coverAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded bg-navy px-2.5 py-1 text-[11px] font-semibold text-white">
              {getPropertyTypeLabel(listing.property_type)}
            </span>
          </div>
          <div className="absolute right-3 top-3">
            <StatusBadge status={listing.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gold-text">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">
                {listing.neighborhood}, {listing.city}
              </span>
            </div>

            <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-navy group-hover:text-navy-soft">
              {listing.title}
            </h3>

            <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-secondary">
              {listing.surface_sqm ? (
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
                  <span>{listing.surface_sqm} m²</span>
                </span>
              ) : null}
              {listing.bedrooms !== null && listing.bedrooms > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
                  <span>
                    {listing.bedrooms} ch.
                  </span>
                </span>
              ) : null}
              {listing.legal_status ? (
                <span className="inline-flex items-center gap-1">
                  <FileCheck2 className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
                  <span>{listing.legal_status}</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4">
            <span className="font-display text-lg font-bold text-navy tabular-nums">
              {formatListingPrice(listing.price_fcfa, listing.price_period)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-text group-hover:text-navy">
              <span>Détails</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
