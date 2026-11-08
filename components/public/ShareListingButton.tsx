'use client';

import { useState } from 'react';
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react';
import { siteConfig } from '@/src/config/site';

interface ShareListingButtonProps {
  title: string;
  priceFormatted: string;
}

export function ShareListingButton({ title, priceFormatted }: ShareListingButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `${title} (${priceFormatted}) — disponible sur ${siteConfig.name} (${siteConfig.zone})`;

  async function handleNativeShare() {
    if (typeof window === 'undefined') return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
      }
    }

    // Fallback: copier le lien dans le presse-papiers
    await copyLink();
  }

  async function copyLink() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignorer
    }
  }

  function getWhatsAppShareUrl() {
    if (typeof window === 'undefined') return '#';
    const url = window.location.href;
    const message = `${shareText}\n${url}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-border-strong bg-canvas px-3 text-xs font-semibold text-navy transition-colors hover:bg-sand"
        title="Partager cette annonce"
      >
        <Share2 className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
        <span>Partager</span>
      </button>

      <a
        href={getWhatsAppShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-border-strong bg-canvas px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
        title="Transférer sur WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
        <span className="hidden sm:inline">Transférer</span>
      </a>

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-border-strong bg-canvas px-3 text-xs font-semibold text-ink-secondary transition-colors hover:bg-sand"
        title="Copier le lien direct"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
            <span className="text-emerald-700">Copié</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.75} />
            <span className="hidden sm:inline">Copier</span>
          </>
        )}
      </button>
    </div>
  );
}
