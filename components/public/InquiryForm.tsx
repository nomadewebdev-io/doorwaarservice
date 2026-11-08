'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import type { PreferredChannel } from '@/lib/types/database';

interface InquiryFormProps {
  mode: 'visite' | 'contact';
  listingId?: string;
  listingTitle?: string;
  disabledNotice?: string;
}

export function InquiryForm({
  mode,
  listingId,
  listingTitle,
  disabledNotice,
}: InquiryFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<PreferredChannel>('whatsapp');
  const [preferredVisitDate, setPreferredVisitDate] = useState('');
  const [message, setMessage] = useState(
    mode === 'visite' && listingTitle
      ? `Bonjour, je souhaite organiser une visite pour le bien "${listingTitle}".`
      : '',
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setFieldErrors({});

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId ?? null,
          listing_title: listingTitle ?? null,
          inquiry_type: mode,
          full_name: fullName,
          phone,
          email: email || null,
          preferred_channel: preferredChannel,
          preferred_visit_date: preferredVisitDate || null,
          message,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        if (payload.errors) {
          setFieldErrors(payload.errors);
        }
        setErrorMsg(
          payload.error || 'Impossible d’enregistrer votre demande. Vérifiez les champs.',
        );
        return;
      }

      setSubmitted(true);
      setFullName('');
      setPhone('');
      setEmail('');
      setPreferredVisitDate('');
      setMessage('');
    } catch {
      setErrorMsg('Erreur de connexion. Vous pouvez aussi nous joindre directement sur WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" strokeWidth={1.75} />
          <div>
            <h3 className="font-display text-base font-bold text-emerald-950">
              {mode === 'visite'
                ? 'Demande de visite enregistrée'
                : 'Message transmis à DoorWaarSERVICE'}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-emerald-900">
              Un conseiller basé à Kolda vous recontactera sous peu par{' '}
              {preferredChannel === 'whatsapp'
                ? 'WhatsApp'
                : preferredChannel === 'telephone'
                  ? 'téléphone'
                  : 'e-mail'}{' '}
              pour confirmer le créneau.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-950"
            >
              Envoyer une autre demande
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {disabledNotice ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-900">
          {disabledNotice}
        </div>
      ) : null}

      {errorMsg ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
        >
          {errorMsg}
        </div>
      ) : null}

      <div>
        <label htmlFor={`full-name-${mode}`} className="mb-1.5 block text-xs font-semibold text-navy">
          Nom complet *
        </label>
        <input
          id={`full-name-${mode}`}
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ex : Moussa Ndiaye"
          className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none"
        />
        {fieldErrors.full_name ? (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.full_name}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`phone-${mode}`} className="mb-1.5 block text-xs font-semibold text-navy">
            Téléphone / WhatsApp *
          </label>
          <input
            id={`phone-${mode}`}
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+221 77 000 00 00"
            className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none"
          />
          {fieldErrors.phone ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`email-${mode}`} className="mb-1.5 block text-xs font-semibold text-navy">
            E-mail (optionnel)
          </label>
          <input
            id={`email-${mode}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@exemple.sn"
            className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none"
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`channel-${mode}`} className="mb-1.5 block text-xs font-semibold text-navy">
            Canal souhaité
          </label>
          <select
            id={`channel-${mode}`}
            value={preferredChannel}
            onChange={(e) => setPreferredChannel(e.target.value as PreferredChannel)}
            className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="telephone">Appel téléphonique</option>
            <option value="email">E-mail</option>
          </select>
        </div>

        {mode === 'visite' ? (
          <div>
            <label
              htmlFor="preferred-visit-date"
              className="mb-1.5 block text-xs font-semibold text-navy"
            >
              Date de visite souhaitée
            </label>
            <input
              id="preferred-visit-date"
              type="date"
              value={preferredVisitDate}
              onChange={(e) => setPreferredVisitDate(e.target.value)}
              className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink focus:border-navy focus:outline-none"
            />
            {fieldErrors.preferred_visit_date ? (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.preferred_visit_date}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor={`message-${mode}`} className="mb-1.5 block text-xs font-semibold text-navy">
          {mode === 'visite' ? 'Précisions pour la visite *' : 'Votre message *'}
        </label>
        <textarea
          id={`message-${mode}`}
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            mode === 'visite'
              ? 'Indiquez vos disponibilités ou vos questions sur le titre foncier / les équipements.'
              : 'Décrivez votre recherche (terrain, appartement meublé, secteur, budget FCFA)...'
          }
          className="w-full rounded-md border border-border-strong bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none"
        />
        {fieldErrors.message ? (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
            <span>Envoi en cours...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
            <span>
              {mode === 'visite' ? 'Demander une visite' : 'Envoyer ma demande'}
            </span>
          </>
        )}
      </button>
    </form>
  );
}

