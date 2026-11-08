import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { ListingCard } from '@/components/public/ListingCard';
import { QuickSearchBar } from '@/components/public/QuickSearchBar';
import { getRecentListings } from '@/lib/data/listings-service';
import { SITE_CONFIG, buildWhatsAppDirectUrl } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const recentListings = await getRecentListings(4);
  const featuredListing = recentListings[0] ?? null;
  const secondaryListings = recentListings.slice(1, 4);

  return (
    <div>
      {/* Hero asymétrique bleu nuit & ivoire */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-navy-soft bg-navy-deep/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-light">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Dakar • Diamniadio • Petite Côte • Thiès</span>
              </div>

              <h1 className="mt-5 font-display text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl">
                {SITE_CONFIG.slogan}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                DoorWaarSERVICE sélectionne des parcelles au dossier foncier vérifié et des
                appartements meublés prêts à vivre. Prix transparents en FCFA, visites rapides
                et suivi rigoureux jusqu’à la signature.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/catalogue"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-gold px-6 text-sm font-bold text-navy-deep transition-colors hover:bg-gold-light"
                >
                  <span>Parcourir le catalogue</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <a
                  href={buildWhatsAppDirectUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-white/25 bg-navy-soft/60 px-5 text-sm font-semibold text-white transition-colors hover:border-gold-light hover:bg-navy-soft"
                >
                  <MessageCircle className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
                  <span>Échanger sur WhatsApp</span>
                </a>
              </div>

              <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Foncier vérifié
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    Titre Foncier &amp; Bail
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Règlements locaux
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    Wave, Orange Money, Notaire
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Disponibilité terrain
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">
                    Visite organisée sous 24h
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-xl border border-white/15 bg-navy-deep">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/listings/almadies-residence.jpg"
                    alt="Résidence contemporaine gérée par DoorWaarSERVICE aux Almadies à Dakar"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-navy-deep px-5 py-3.5 text-xs">
                  <span className="font-semibold text-gold-light">
                    Sélection vérifiée DoorWaarSERVICE
                  </span>
                  <span className="text-slate-300">
                    Les Almadies • Diamniadio • Saly Portudal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barre de recherche rapide ancrée */}
      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <QuickSearchBar />
      </section>

      {/* Annonces récentes */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
              Sélection récente
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Biens disponibles et opportunités du moment
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy underline-offset-4 hover:text-gold-text hover:underline"
          >
            <span>Voir toutes les annonces</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border-subtle bg-surface p-8 text-center">
            <p className="text-sm text-ink-secondary">
              Aucune annonce publiée pour le moment. Contactez notre équipe sur WhatsApp pour
              connaître les disponibilités hors-catalogue.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {featuredListing ? (
              <ListingCard listing={featuredListing} variant="featured" />
            ) : null}

            {secondaryListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {secondaryListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Section "Pourquoi nous" en disposition bento asymétrique */}
      <section className="border-y border-border-subtle bg-sand py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="flex flex-col justify-between rounded-xl bg-navy p-8 text-white lg:col-span-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-light">
                  Pourquoi DoorWaarSERVICE
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold leading-snug sm:text-3xl">
                  Un partenaire de terrain exigeant pour sécuriser votre projet au Sénégal.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Acheter un terrain ou réserver un appartement meublé à distance ou depuis Dakar
                  demande des preuves tangibles, des prix nets en FCFA et un interlocuteur
                  joignable à chaque étape.
                </p>
              </div>

              <div className="mt-8 border-t border-white/15 pt-6">
                <Link
                  href="/a-propos"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold-light hover:text-white"
                >
                  <span>Découvrir notre méthode de travail</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
              <div className="rounded-xl border border-border-subtle bg-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-tint text-gold-text">
                  <FileCheck2 className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  Dossiers fonciers contrôlés
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  Vérification préalable du Titre Foncier, du Bail ou de la Délibération,
                  extrait de plan et accompagnement devant notaire pour chaque cession de terrain.
                </p>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-tint text-gold-text">
                  <Building2 className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  Appartements meublés prêts à vivre
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  Fibre optique testée, climatisation entretenue, secours électrique (groupe ou
                  onduleur) et gardiennage 24/7 pour séjours d’affaires, diaspora ou familles.
                </p>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-tint text-gold-text">
                  <Wallet className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  Paiements locaux &amp; clarté FCFA
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  Règlements sécurisés via Wave, Orange Money, Free Money, virement bancaire ou
                  dépôt notarié, avec reçu détaillé et aucune majoration cachée.
                </p>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-tint text-gold-text">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  Visites accompagnées &amp; réactivité
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  Prise de rendez-vous directe par WhatsApp ou téléphone. Visites sur place ou par
                  vidéo en direct pour nos clients résidant à l’étranger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact rapide sur l'accueil */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="p-8 sm:p-10 lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
                Parler à un conseiller
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-navy sm:text-3xl">
                Un terrain à visiter ou un séjour à planifier à Dakar ?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
                Indiquez-nous votre secteur et votre budget en FCFA : notre équipe vous propose
                uniquement des biens vérifiés et disponibles immédiatement.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={buildWhatsAppDirectUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
                >
                  <MessageCircle className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
                  <span>Contacter sur WhatsApp</span>
                </a>
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-canvas px-5 text-sm font-semibold text-navy transition-colors hover:bg-sand"
                >
                  <span>Formulaire de contact</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            </div>

            <div className="border-t border-border-subtle bg-sand/60 p-8 sm:p-10 lg:col-span-5 lg:border-l lg:border-t-0">
              <h3 className="font-display text-base font-bold text-navy">
                Bureau DoorWaarSERVICE
              </h3>
              <ul className="mt-4 space-y-3.5 text-sm text-ink-secondary">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-text" strokeWidth={1.75} />
                  <span>{SITE_CONFIG.officeAddress}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-gold-text" strokeWidth={1.75} />
                  <a
                    href={`tel:${SITE_CONFIG.contactPhone.replace(/\s+/g, '')}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {SITE_CONFIG.contactPhone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-gold-text" strokeWidth={1.75} />
                  <span>{SITE_CONFIG.officeHours}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-text" strokeWidth={1.75} />
                  <span>Accueil physique sur rendez-vous &amp; visites vidéo diaspora</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
