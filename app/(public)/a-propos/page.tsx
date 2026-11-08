import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  FileCheck2,
  Handshake,
  Landmark,
  MessageCircle,
} from 'lucide-react';
import { siteConfig, buildWhatsAppUrl } from '@/src/config/site';

export const metadata: Metadata = {
  title: `À propos de ${siteConfig.name} — ${siteConfig.zone}`,
  description: `Découvrez l’approche de ${siteConfig.name} à ${siteConfig.zone} : sécurisation foncière en région de ${siteConfig.zone}, gestion d’appartements meublés et transparence financière en FCFA.`,
};

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Sélection et audit du bien',
    text: 'Chaque parcelle est contrôlée sur le plan administratif (Titre Foncier, Bail ou Délibération) et chaque appartement meublé est inspecté sur la qualité de ses équipements (eau, électricité secourue, connexion internet).',
  },
  {
    step: '02',
    title: 'Visite sur site ou en vidéo directe',
    text: `Nos conseillers organisent la visite physique sur place à ${siteConfig.zone} et dans sa région, ou réalisent une visite vidéo commentée pour nos clients de la diaspora.`,
  },
  {
    step: '03',
    title: 'Réservation transparente en FCFA',
    text: 'Les conditions, délais et frais sont détaillés avant tout versement. Les acomptes sont encaissés par Wave, Orange Money, Free Money ou virement avec reçu officiel.',
  },
  {
    step: '04',
    title: 'Signature notariée ou remise des clés',
    text: 'Pour les terrains, la cession finale est encadrée par un notaire partenaire jusqu’à la mutation. Pour les appartements meublés, l’état des lieux et la remise des clés se font le jour convenu.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-canvas">
      <section className="border-b border-border-subtle bg-navy py-14 text-white sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-light">
            À propos de {siteConfig.name}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            Une agence immobilière sénégalaise bâtie sur la clarté foncière et la réactivité
            du service client.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            {siteConfig.slogan}. Implantée à {siteConfig.zone}, notre équipe concentre son action sur
            l’ensemble de la région de {siteConfig.zone} pour accompagner résidents, ONG,
            investisseurs et diaspora sur deux métiers : l’acquisition de terrains vérifiés et la
            location d’appartements meublés prêts à vivre.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-xl border border-border-subtle bg-surface p-7 lg:col-span-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-tint text-gold-text">
              <Landmark className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-navy">
              Pôle Foncier &amp; Terrains
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              L’achat d’un terrain dans le Fouladou exige une vigilance absolue sur la nature
              juridique de la parcelle, l’accès routier, l’absence d’inondation et l’absence de
              litige. Nous concentrons notre catalogue sur la région de {siteConfig.zone} avec un
              dossier vérifiable avant toute transaction.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-navy">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                <span>Identification claire du statut : Titre Foncier, Bail ou Délibération</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                <span>Bornage vérifié sur le terrain lors de la visite</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                <span>Accompagnement complet devant notaire jusqu’à la mutation</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-7 lg:col-span-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-tint text-gold-text">
              <Compass className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-navy">
              Pôle Appartements Meublés
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Nous sélectionnons des studios, F3 et F4 meublés dans les secteurs calmes et
              accessibles de {siteConfig.zone}. Nos logements sont pensés pour les agents de projets
              et ONG, cadres en mission, visiteurs et familles de la diaspora.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-navy">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                <span>Connexion fibre optique et équipements complets vérifiés</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                <span>Secours énergétique (groupe électrogène ou onduleur) et gardiennage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                <span>Contrats de bail meublé clairs, sans frais cachés</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-border-subtle bg-sand py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
              Notre méthode
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy sm:text-3xl">
              Quatre étapes simples du premier contact à la remise du titre ou des clés
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item) => (
              <div
                key={item.step}
                className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface p-6"
              >
                <div>
                  <span className="font-display text-2xl font-bold text-gold-text tabular-nums">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-navy p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-light">
              <Handshake className="h-4 w-4" strokeWidth={1.75} />
              <span>Propriétaires &amp; vendeurs</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Vous souhaitez confier un terrain titré ou un appartement meublé à {siteConfig.name} ?
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Contactez notre direction pour une visite d’évaluation et une mise en vente ou en
              location encadrée.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={buildWhatsAppUrl(
                null,
                `Bonjour ${siteConfig.name}, je souhaite vous confier un bien immobilier dans la région de ${siteConfig.zone}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-gold px-5 text-sm font-bold text-navy-deep hover:bg-gold-light"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              <span>WhatsApp direct</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/25 px-5 text-sm font-semibold text-white hover:bg-navy-soft"
            >
              <FileCheck2 className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
              <span>Nous écrire</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
