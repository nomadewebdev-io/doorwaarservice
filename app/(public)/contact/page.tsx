import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone, Wallet } from 'lucide-react';
import { InquiryForm } from '@/components/public/InquiryForm';
import { siteConfig, buildWhatsAppUrl } from '@/src/config/site';

export const metadata: Metadata = {
  title: `Contactez ${siteConfig.name} — ${siteConfig.zone}`,
  description: `Contactez notre équipe basée à ${siteConfig.zone} par WhatsApp, téléphone ou formulaire pour planifier une visite de terrain ou réserver un appartement meublé dans la région de ${siteConfig.zone}.`,
};

export default function ContactPage() {
  return (
    <div className="bg-canvas py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
            Contact
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Échanger avec un conseiller {siteConfig.name}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary sm:text-base">
            Que vous recherchiez un terrain vérifié ou un appartement meublé à {siteConfig.zone},
            laissez-nous vos critères ou joignez-nous directement sur WhatsApp.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-border-subtle bg-navy p-6 text-white sm:p-7">
              <h2 className="font-display text-lg font-bold text-white">
                Contact
              </h2>
              <p className="mt-1.5 text-xs text-slate-300">
                Service en ligne disponible 7j/7 et accompagnement personnalisé pour vos projets à {siteConfig.zone}.
              </p>

              <ul className="mt-6 space-y-4 text-sm">
                {/* WhatsApp direct */}
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400">
                      WhatsApp direct
                    </span>
                    <a
                      href={buildWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white hover:text-gold-light"
                    >
                      {siteConfig.whatsapp.display}
                    </a>
                  </div>
                </li>

                {/* Téléphone direct */}
                {siteConfig.phone.display ? (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-400">
                        Téléphone
                      </span>
                      <a
                        href={`tel:${siteConfig.phone.raw}`}
                        className="font-semibold text-white hover:text-gold-light"
                      >
                        {siteConfig.phone.display}
                      </a>
                    </div>
                  </li>
                ) : null}

                {/* Email */}
                {siteConfig.email ? (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-400">
                        E-mail
                      </span>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="font-medium text-white hover:text-gold-light"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </li>
                ) : null}

                {/* Horaires */}
                {siteConfig.hours ? (
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-400">
                        Horaires
                      </span>
                      <span className="text-slate-200">{siteConfig.hours}</span>
                    </div>
                  </li>
                ) : null}

                {/* Adresse - masquée si non renseignée */}
                {siteConfig.address ? (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-slate-400">
                        Adresse
                      </span>
                      <span className="font-medium text-white">{siteConfig.address}</span>
                    </div>
                  </li>
                ) : null}
              </ul>

              <div className="mt-7 border-t border-white/15 pt-5">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gold px-4 text-sm font-bold text-navy-deep transition-colors hover:bg-gold-light"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                  <span>Ouvrir une discussion WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface p-6">
              <div className="flex items-center gap-2.5 text-navy">
                <Wallet className="h-5 w-5 text-gold-text" strokeWidth={1.75} />
                <h2 className="font-display text-base font-bold">
                  Moyens de paiement acceptés
                </h2>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary">
                Les frais de réservation, loyers meublés et acomptes peuvent être réglés via{' '}
                <strong className="font-semibold text-navy">Wave</strong>,{' '}
                <strong className="font-semibold text-navy">Orange Money</strong>,{' '}
                <strong className="font-semibold text-navy">Free Money</strong> ou{' '}
                <strong className="font-semibold text-navy">virement bancaire local</strong>. Les
                acquisitions foncières définitives sont finalisées chez le notaire.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-6 sm:p-8 lg:col-span-7">
            <h2 className="font-display text-xl font-bold text-navy">
              Envoyer une demande écrite
            </h2>
            <p className="mt-1.5 text-sm text-ink-secondary">
              Précisez votre besoin (achat de terrain vérifié ou réservation d’appartement meublé)
              et votre mode de contact préféré.
            </p>
            <div className="mt-6">
              <InquiryForm mode="contact" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
