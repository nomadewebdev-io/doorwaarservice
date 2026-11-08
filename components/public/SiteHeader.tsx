'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, MessageCircle, ShieldCheck, X } from 'lucide-react';
import { SITE_CONFIG, buildWhatsAppDirectUrl } from '@/lib/utils/format';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const whatsappHref = buildWhatsAppDirectUrl();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-navy text-xs font-bold tracking-tight text-white"
          >
            <span>DW</span>
            <span className="mt-0.5 h-0.5 w-6 rounded-full bg-gold" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-navy">
              {SITE_CONFIG.name}
            </span>
            <span className="hidden text-[11px] font-medium tracking-wide text-ink-muted sm:block">
              Terrains &amp; meublés au Sénégal
            </span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sand text-navy font-semibold'
                    : 'text-ink-secondary hover:bg-canvas hover:text-navy'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <span
            aria-disabled="true"
            title="Espace boutique vêtements en préparation"
            className="ml-1 inline-flex cursor-default items-center gap-2 rounded-md border border-border-subtle bg-canvas px-3 py-1.5 text-sm font-medium text-ink-muted"
          >
            <span>Boutique</span>
            <span className="rounded bg-gold-tint px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-text">
              Bientôt
            </span>
          </span>
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:bg-canvas hover:text-navy"
          >
            <ShieldCheck className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
            <span>Espace pro</span>
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            <MessageCircle className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
            <span>WhatsApp</span>
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle bg-surface text-navy lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border-subtle bg-surface px-4 pb-6 pt-4 lg:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex min-h-[44px] items-center rounded-md px-3.5 text-base font-medium ${
                    isActive
                      ? 'bg-sand font-semibold text-navy'
                      : 'text-ink-secondary hover:bg-canvas hover:text-navy'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div
              aria-disabled="true"
              className="mt-1 flex min-h-[44px] items-center justify-between rounded-md border border-border-subtle bg-canvas px-3.5 text-base font-medium text-ink-muted"
            >
              <span>Boutique vêtements</span>
              <span className="rounded bg-gold-tint px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-text">
                Bientôt
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 border-t border-border-subtle pt-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
                <span>Écrire sur WhatsApp</span>
              </a>
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-4 text-sm font-medium text-navy"
              >
                <ShieldCheck className="h-4 w-4 text-gold-text" strokeWidth={1.75} />
                <span>Espace agent / propriétaire</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
