import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SITE_CONFIG, buildWhatsAppDirectUrl } from '@/lib/utils/format';

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
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              {SITE_CONFIG.slogan}. Implantée à Kolda, l’agence concentre son activité sur la
              région de Kolda (Haute-Casamance) : terrains vérifiés et appartements meublés prêts
              à vivre.
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
              Secteurs — Région de Kolda
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li>
                <Link
                  href="/catalogue?location=Bouna%20Kane"
                  className="transition-colors hover:text-white"
                >
                  Bouna Kane &amp; Sikilo — Kolda
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?location=Doumassou"
                  className="transition-colors hover:text-white"
                >
                  Doumassou, Gadapara &amp; HLM Kolda
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?location=Dioulacolon"
                  className="transition-colors hover:text-white"
                >
                  Dioulacolon &amp; Saré Bidji
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?location=V%C3%A9lingara"
                  className="transition-colors hover:text-white"
                >
                  Vélingara &amp; Diaobé
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogue?location=M%C3%A9dina%20Yoro%20Foulah"
                  className="transition-colors hover:text-white"
                >
                  Médina Yoro Foulah &amp; Dabo
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold-light">
              Contact direct
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                <span>{SITE_CONFIG.officeAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                <a
                  href={`tel:${SITE_CONFIG.contactPhone.replace(/\s+/g, '')}`}
                  className="transition-colors hover:text-white"
                >
                  {SITE_CONFIG.contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="transition-colors hover:text-white"
                >
                  {SITE_CONFIG.contactEmail}
                </a>
              </li>
              <li className="pt-1">
                <a
                  href={buildWhatsAppDirectUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-gold px-3.5 py-2 text-xs font-semibold text-gold-light transition-colors hover:bg-gold hover:text-navy-deep"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                  <span>Discuter sur WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-navy-soft pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>
            © {currentYear} {SITE_CONFIG.name}. Tous droits réservés.
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

