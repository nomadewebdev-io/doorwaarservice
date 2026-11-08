import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { siteConfig, buildWhatsAppUrl } from '@/src/config/site';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-navy-soft bg-navy-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md border border-navy-soft bg-navy text-xs font-bold text-white"
              >
                <span>DW</span>
                <span className="mt-0.5 h-0.5 w-6 rounded-full bg-gold" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              {siteConfig.slogan}. Zone d’activité : {siteConfig.zone} (Sénégal). Sélection
              rigoureuse de parcelles vérifiées et gestion locative meublée.
            </p>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-light">
                Modes de règlement acceptés
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {['Wave', 'Orange Money', 'Free Money', 'Virement bancaire', 'Notaire'].map(
                  (method) => (
                    <span
                      key={method}
                      className="rounded border border-navy-soft bg-navy px-2.5 py-1 text-xs font-medium text-slate-200"
                    >
                      {method}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold-light">
              Navigation
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="transition-colors hover:text-white">
                  Catalogue complet
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?type=terrain"
                  className="transition-colors hover:text-white"
                >
                  Terrains à vendre
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?type=appartement"
                  className="transition-colors hover:text-white"
                >
                  Appartements meublés
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="transition-colors hover:text-white">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
              <li className="pt-1 text-slate-400">
                Boutique <span className="text-xs text-gold-light">(bientôt)</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold-light">
              Prestations à {siteConfig.zone}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li>
                <Link
                  href="/catalogue?type=terrain"
                  className="transition-colors hover:text-white"
                >
                  Vente de terrains vérifiés
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?type=appartement"
                  className="transition-colors hover:text-white"
                >
                  Location d’appartements meublés
                </Link>
              </li>
              <li>
                <Link
                  href="/a-propos"
                  className="transition-colors hover:text-white"
                >
                  Sécurisation administrative &amp; notariée
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-white"
                >
                  Visites sur site &amp; réservations diaspora
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold-light">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  WhatsApp : {siteConfig.whatsapp.display}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                <a
                  href={`tel:${siteConfig.phone.raw}`}
                  className="transition-colors hover:text-white"
                >
                  Téléphone : {siteConfig.phone.display}
                </a>
              </li>
              {siteConfig.email ? (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="transition-colors hover:text-white"
                  >
                    {siteConfig.email}
                  </a>
                </li>
              ) : null}
              {siteConfig.hours ? (
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                  <span>{siteConfig.hours}</span>
                </li>
              ) : null}
              {siteConfig.address ? (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                  <span>{siteConfig.address}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-navy-soft pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>
            © {currentYear} {siteConfig.name}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5">
            <span>Montants exprimés en Francs CFA (FCFA)</span>
            <Link href="/admin/login" className="text-slate-300 underline-offset-4 hover:underline">
              Espace pro
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

