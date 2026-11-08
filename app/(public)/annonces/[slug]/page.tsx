import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Check,
  FileCheck2,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { InquiryForm } from '@/components/public/InquiryForm';
import { ListingGallery } from '@/components/public/ListingGallery';
import { StatusBadge } from '@/components/public/StatusBadge';
import { getListingBySlugOrId } from '@/lib/data/listings-service';
import {
  SITE_CONFIG,
  buildWhatsAppListingUrl,
  formatDateFr,
  formatListingPrice,
  getPropertyTypeLabel,
} from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

interface ListingDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlugOrId(slug);
  if (!listing) {
    return {
      title: 'Annonce introuvable',
    };
  }

  const priceText = formatListingPrice(listing.price_fcfa, listing.price_period);
  const coverImage = listing.listing_images?.[0]?.image_url;

  return {
    title: `${listing.title} — ${priceText}`,
    description: `${getPropertyTypeLabel(listing.property_type)} à ${listing.neighborhood}, ${listing.city}. ${priceText}. ${listing.description.slice(0, 130)}`,
    openGraph: {
      title: `${listing.title} | DoorWaarSERVICE`,
      description: `${listing.neighborhood}, ${listing.city} — ${priceText}`,
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlugOrId(slug);

  if (!listing) {
    notFound();
  }

  const whatsappUrl = buildWhatsAppListingUrl({
    title: listing.title,
    city: listing.city,
    neighborhood: listing.neighborhood,
    priceFcfa: listing.price_fcfa,
    pricePeriod: listing.price_period,
  });

  const isSold = listing.status === 'vendu';

  return (
    <div className="bg-canvas py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <Link href="/" className="hover:text-navy">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-navy">
            Catalogue
          </Link>
          <span>/</span>
          <Link
            href={`/catalogue?type=${listing.property_type}`}
            className="hover:text-navy"
          >
            {getPropertyTypeLabel(listing.property_type)}
          </Link>
          <span>/</span>
          <span className="truncate font-medium text-navy">{listing.neighborhood}</span>
        </nav>

        <div className="mb-6">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            <span>Retour au catalogue</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Colonne principale : galerie + informations détaillées */}
          <div className="space-y-8 lg:col-span-7">
            <ListingGallery images={listing.listing_images} title={listing.title} />

            <div className="rounded-xl border border-border-subtle bg-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-md bg-navy px-3 py-1 text-xs font-semibold text-white">
                  {getPropertyTypeLabel(listing.property_type)}
                </span>
                <StatusBadge status={listing.status} />
                <span className="text-xs text-ink-muted">
                  Publié le {formatDateFr(listing.created_at)}
                </span>
              </div>

              <h1 className="mt-4 font-display text-2xl font-bold leading-snug text-navy sm:text-3xl">
                {listing.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-secondary">
                <MapPin className="h-4 w-4 shrink-0 text-gold-text" strokeWidth={1.75} />
                <span className="font-medium text-navy">
                  {listing.neighborhood}, {listing.city}
                </span>
                {listing.address_landmark ? (
                  <span className="text-ink-muted">— {listing.address_landmark}</span>
                ) : null}
              </div>

              {/* Fiche technique */}
              <div className="mt-6 grid grid-cols-2 gap-3 border-y border-border-subtle py-5 sm:grid-cols-4">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Surface
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-navy tabular-nums">
                    <Maximize2 className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                    {listing.surface_sqm ? `${listing.surface_sqm} m²` : 'Sur demande'}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Statut juridique
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-navy">
                    <FileCheck2 className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                    {listing.legal_status || 'Vérifié'}
                  </span>
                </div>

                {listing.property_type === 'appartement' ? (
                  <>
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                        Chambres
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-navy tabular-nums">
                        <BedDouble className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                        {listing.bedrooms ?? 1}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                        Salles d’eau
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-navy tabular-nums">
                        <Bath className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                        {listing.bathrooms ?? 1}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                        Transaction
                      </span>
                      <span className="mt-1 block text-sm font-bold text-navy">
                        Vente foncière
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                        Disponibilité
                      </span>
                      <span className="mt-1 block text-sm font-bold text-navy">
                        Visite sur site
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6">
                <h2 className="font-display text-lg font-bold text-navy">
                  Description du bien
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-secondary sm:text-base">
                  {listing.description}
                </p>
              </div>

              {listing.amenities && listing.amenities.length > 0 ? (
                <div className="mt-7 border-t border-border-subtle pt-6">
                  <h2 className="font-display text-lg font-bold text-navy">
                    Atouts &amp; équipements
                  </h2>
                  <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {listing.amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="flex items-center gap-2.5 text-sm text-ink-secondary"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-tint text-gold-text">
                          <Check className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {/* Colonne droite : Prix, WhatsApp pré-rempli & Demande de visite */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
            <div className="rounded-xl border border-border-subtle bg-surface p-6">
              <div className="border-b border-border-subtle pb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {listing.transaction_type === 'vente' ? 'Prix net vendeur' : 'Tarif location meublée'}
                </span>
                <p className="mt-1 font-display text-3xl font-bold text-navy tabular-nums">
                  {formatListingPrice(listing.price_fcfa, listing.price_period)}
                </p>
                <p className="mt-2 text-xs text-ink-secondary">
                  Paiement accepté : Wave, Orange Money, Free Money, virement bancaire ou devant
                  notaire.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
                >
                  <MessageCircle className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
                  <span>
                    {isSold
                      ? 'Demander un bien similaire sur WhatsApp'
                      : 'Discuter de ce bien sur WhatsApp'}
                  </span>
                </a>

                <a
                  href={`tel:${SITE_CONFIG.contactPhone.replace(/\s+/g, '')}`}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border-strong bg-canvas px-4 text-sm font-semibold text-navy transition-colors hover:bg-sand"
                >
                  <Phone className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                  <span>Appeler : {SITE_CONFIG.contactPhone}</span>
                </a>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-sand/70 px-3.5 py-2.5 text-xs text-ink-secondary">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gold-text" strokeWidth={1.75} />
                <span>
                  Dossier vérifié par DoorWaarSERVICE — visite physique ou en visio pour la
                  diaspora.
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface p-6">
              <h2 className="font-display text-lg font-bold text-navy">
                Demande de visite
              </h2>
              <p className="mt-1 text-xs text-ink-secondary">
                Laissez vos coordonnées pour planifier une visite sur site ou recevoir les plans.
              </p>

              <div className="mt-5">
                <InquiryForm
                  mode="visite"
                  listingId={listing.id}
                  listingTitle={listing.title}
                  disabledNotice={
                    isSold
                      ? 'Ce bien est déjà vendu. Vous pouvez tout de même envoyer une demande pour être orienté vers une offre équivalente.'
                      : listing.status === 'reserve'
                        ? 'Ce bien fait actuellement l’objet d’une option de réservation. Déposez une demande pour être prévenu en priorité en cas de désistement.'
                        : undefined
                  }
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

