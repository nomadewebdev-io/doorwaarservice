'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import type { ListingWithImages } from '@/lib/types/database';
import { formatFCFA } from '@/lib/utils/format';

interface MarkSoldModalProps {
  listing: ListingWithImages;
  onClose: () => void;
  onSuccess: () => void;
}

export function MarkSoldModal({ listing, onClose, onSuccess }: MarkSoldModalProps) {
  const [finalPrice, setFinalPrice] = useState(String(listing.price_fcfa));
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numericPrice = Number(finalPrice);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setErrorMsg('Le prix de vente final en FCFA est obligatoire et doit être supérieur à 0.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/listings/${listing.id}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_sale_price_fcfa: Math.round(numericPrice),
          buyer_name: buyerName.trim() || null,
          buyer_phone: buyerPhone.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMsg(data.error || 'Impossible de finaliser cette vente.');
        return;
      }

      onSuccess();
    } catch {
      setErrorMsg('Erreur réseau lors de l’enregistrement de la vente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mark-sold-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/75 p-4"
    >
      <div className="w-full max-w-lg rounded-xl border border-border-subtle bg-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
              Clôture de transaction
            </p>
            <h2 id="mark-sold-title" className="mt-1 font-display text-lg font-bold text-navy">
              Passer l’annonce à « Vendu »
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-navy"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-sand/70 p-3.5 text-xs text-ink-secondary">
          <p className="font-semibold text-navy">{listing.title}</p>
          <p className="mt-1">
            Prix affiché initialement :{' '}
            <strong className="text-navy tabular-nums">{formatFCFA(listing.price_fcfa)}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMsg ? (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-800"
            >
              {errorMsg}
            </div>
          ) : null}

          <div>
            <label htmlFor="final-sale-price" className="mb-1.5 block text-xs font-semibold text-navy">
              Prix de vente final négocié (FCFA) *
            </label>
            <input
              id="final-sale-price"
              type="number"
              required
              min={1}
              step={1000}
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm font-semibold text-navy tabular-nums focus:border-navy focus:outline-none"
            />
            {Number.isFinite(numericPrice) && numericPrice > 0 ? (
              <p className="mt-1 text-xs text-gold-text tabular-nums">
                Montant enregistré : {formatFCFA(numericPrice)} (commission calculée automatiquement)
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="buyer-name" className="mb-1.5 block text-xs font-semibold text-navy">
                Nom de l’acheteur / preneur
              </label>
              <input
                id="buyer-name"
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ex : Awa Diop"
                className="h-10 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="buyer-phone" className="mb-1.5 block text-xs font-semibold text-navy">
                Téléphone acheteur
              </label>
              <input
                id="buyer-phone"
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+221 77 ..."
                className="h-10 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sale-notes" className="mb-1.5 block text-xs font-semibold text-navy">
              Notes de transaction (notaire, mode de règlement)
            </label>
            <textarea
              id="sale-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex : Acte signé chez Me Sarr, virement bancaire reçu."
              className="w-full rounded-md border border-border-strong bg-canvas px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-border-strong px-4 text-xs font-semibold text-ink-secondary hover:bg-canvas"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-5 text-xs font-semibold text-white hover:bg-navy-soft disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Confirmer la vente</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

