'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  Check,
  Download,
  Loader2,
  MessageCircle,
  Percent,
  Phone,
  Search,
} from 'lucide-react';
import type {
  CommissionStatus,
  Inquiry,
  InquiryStatus,
  SaleWithDetails,
} from '@/lib/types/database';
import {
  formatDateFr,
  formatFCFA,
  serializeCsv,
} from '@/lib/utils/format';

interface OwnerDashboardClientProps {
  initialCommissionRate: number;
  initialSales: SaleWithDetails[];
  initialInquiries: Inquiry[];
}

const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  nouvelle: 'Nouvelle',
  contactee: 'Contactée',
  planifiee: 'Visite planifiée',
  cloturee: 'Clôturée',
};

function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function OwnerDashboardClient({
  initialCommissionRate,
  initialSales,
  initialInquiries,
}: OwnerDashboardClientProps) {
  const router = useRouter();

  const [commissionRateInput, setCommissionRateInput] = useState(
    String(initialCommissionRate),
  );
  const [savedRate, setSavedRate] = useState(initialCommissionRate);
  const [savingRate, setSavingRate] = useState(false);
  const [rateMessage, setRateMessage] = useState<string | null>(null);

  const [sales, setSales] = useState<SaleWithDetails[]>(initialSales);
  const [commissionFilter, setCommissionFilter] = useState<'toutes' | CommissionStatus>(
    'toutes',
  );
  const [busyCommissionId, setBusyCommissionId] = useState<string | null>(null);

  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'toutes' | InquiryStatus>(
    'toutes',
  );
  const [inquirySearch, setInquirySearch] = useState('');
  const [busyInquiryId, setBusyInquiryId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const totalSalesAmount = sales.reduce(
    (sum, s) => sum + Number(s.final_sale_price_fcfa || 0),
    0,
  );
  const totalCommissionsAmount = sales.reduce(
    (sum, s) => sum + Number(s.commission?.amount_fcfa || 0),
    0,
  );
  const dueCommissionsAmount = sales.reduce(
    (sum, s) =>
      s.commission?.status === 'due'
        ? sum + Number(s.commission.amount_fcfa || 0)
        : sum,
    0,
  );
  const paidCommissionsAmount = sales.reduce(
    (sum, s) =>
      s.commission?.status === 'payee'
        ? sum + Number(s.commission.amount_fcfa || 0)
        : sum,
    0,
  );
  const newInquiriesCount = inquiries.filter((inq) => inq.status === 'nouvelle').length;

  const filteredSales = sales.filter((sale) => {
    if (commissionFilter === 'toutes') return true;
    return sale.commission?.status === commissionFilter;
  });

  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryStatusFilter !== 'toutes' && inq.status !== inquiryStatusFilter) {
      return false;
    }
    if (inquirySearch.trim()) {
      const q = inquirySearch.trim().toLowerCase();
      const hay = `${inq.full_name} ${inq.phone} ${inq.email ?? ''} ${inq.listing_title ?? ''} ${inq.message}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  async function handleSaveRate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingRate(true);
    setRateMessage(null);
    setErrorBanner(null);

    try {
      const rate = Number(commissionRateInput);
      const response = await fetch('/api/admin/owner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_commission_rate: rate }),
      });
      const payload = (await response.json()) as {
        settings?: { default_commission_rate: number };
        error?: string;
      };

      if (!response.ok || !payload.settings) {
        setErrorBanner(payload.error || 'Impossible de mettre à jour le taux.');
        return;
      }

      setSavedRate(payload.settings.default_commission_rate);
      setCommissionRateInput(String(payload.settings.default_commission_rate));
      setRateMessage(
        `Taux enregistré (${payload.settings.default_commission_rate} %) pour les prochaines ventes.`,
      );
      router.refresh();
    } catch {
      setErrorBanner('Erreur réseau lors de la mise à jour du taux.');
    } finally {
      setSavingRate(false);
    }
  }

  async function handleToggleCommissionStatus(
    commissionId: string,
    nextStatus: CommissionStatus,
  ) {
    setBusyCommissionId(commissionId);
    setErrorBanner(null);
    try {
      const response = await fetch(`/api/admin/owner/commissions/${commissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = (await response.json()) as {
        commission?: { status: CommissionStatus; paid_at: string | null };
        error?: string;
      };

      if (!response.ok || !payload.commission) {
        setErrorBanner(payload.error || 'Impossible de modifier le statut de commission.');
        return;
      }

      setSales((prev) =>
        prev.map((sale) =>
          sale.commission && sale.commission.id === commissionId
            ? {
                ...sale,
                commission: {
                  ...sale.commission,
                  status: payload.commission!.status,
                  paid_at: payload.commission!.paid_at,
                },
              }
            : sale,
        ),
      );
    } catch {
      setErrorBanner('Erreur réseau lors de la mise à jour.');
    } finally {
      setBusyCommissionId(null);
    }
  }

  async function handleInquiryStatusChange(inquiryId: string, nextStatus: InquiryStatus) {
    setBusyInquiryId(inquiryId);
    setErrorBanner(null);
    try {
      const response = await fetch(`/api/admin/owner/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorBanner(payload.error || 'Impossible de mettre à jour la demande.');
        return;
      }

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: nextStatus } : inq)),
      );
    } catch {
      setErrorBanner('Erreur réseau lors de la mise à jour de la demande.');
    } finally {
      setBusyInquiryId(null);
    }
  }

  function handleExportSalesCsv() {
    const headers = [
      'Date de vente',
      'Bien',
      'Localisation',
      'Agent',
      'Prix affiché (FCFA)',
      'Prix final (FCFA)',
      'Acheteur',
      'Téléphone acheteur',
      'Taux commission (%)',
      'Commission (FCFA)',
      'Statut commission',
      'Date paiement',
    ];

    const rows = filteredSales.map((sale) => [
      formatDateFr(sale.sold_at),
      sale.listing?.title ?? 'Bien supprimé',
      sale.listing ? `${sale.listing.neighborhood}, ${sale.listing.city}` : '',
      sale.agent?.full_name ?? sale.agent?.email ?? 'Non renseigné',
      sale.listed_price_fcfa,
      sale.final_sale_price_fcfa,
      sale.buyer_name ?? '',
      sale.buyer_phone ?? '',
      sale.commission?.rate_percent ?? '',
      sale.commission?.amount_fcfa ?? '',
      sale.commission?.status === 'payee' ? 'Payée' : 'Due',
      sale.commission?.paid_at ? formatDateFr(sale.commission.paid_at) : '',
    ]);

    const csv = serializeCsv(headers, rows);
    downloadCsvFile('doorwaarservice-ventes-commissions.csv', csv);
  }

  function handleExportInquiriesCsv() {
    const headers = [
      'Date réception',
      'Type',
      'Statut',
      'Nom client',
      'Téléphone',
      'Email',
      'Canal préféré',
      'Bien concerné',
      'Date visite souhaitée',
      'Message',
    ];

    const rows = filteredInquiries.map((inq) => [
      formatDateFr(inq.created_at),
      inq.inquiry_type === 'visite' ? 'Demande de visite' : 'Contact général',
      INQUIRY_STATUS_LABELS[inq.status],
      inq.full_name,
      inq.phone,
      inq.email ?? '',
      inq.preferred_channel,
      inq.listing_title ?? '',
      inq.preferred_visit_date ?? '',
      inq.message,
    ]);

    const csv = serializeCsv(headers, rows);
    downloadCsvFile('doorwaarservice-demandes-clients.csv', csv);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
            Pilotage Direction — Rôle Owner
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy sm:text-3xl">
            Ventes, commissions &amp; demandes clients
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Suivi financier en Francs CFA, calcul automatique des commissions et export CSV.
          </p>
        </div>

        <form
          onSubmit={handleSaveRate}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-border-subtle bg-surface p-3.5"
        >
          <div>
            <label
              htmlFor="commission-rate-input"
              className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
            >
              <Percent className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
              <span>Taux commission par défaut</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="commission-rate-input"
                type="number"
                min={0}
                max={100}
                step={0.25}
                value={commissionRateInput}
                onChange={(e) => setCommissionRateInput(e.target.value)}
                className="h-9 w-24 rounded-md border border-border-strong bg-canvas px-2.5 text-sm font-bold text-navy tabular-nums focus:border-navy focus:outline-none"
              />
              <span className="text-sm font-semibold text-navy">%</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={savingRate}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-navy px-4 text-xs font-semibold text-white hover:bg-navy-soft disabled:opacity-60"
          >
            {savingRate ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Check className="h-3.5 w-3.5 text-gold-light" strokeWidth={2} />
            )}
            <span>Appliquer ({savedRate} %)</span>
          </button>
        </form>
      </div>

      {rateMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900">
          {rateMessage}
        </div>
      ) : null}

      {errorBanner ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorBanner}
        </div>
      ) : null}

      {/* Indicateurs clés asymétriques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-navy p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-300">
            Volume total vendu ({sales.length})
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
            {formatFCFA(totalSalesAmount)}
          </p>
          <p className="mt-1 text-xs text-gold-light">
            Commissions générées : {formatFCFA(totalCommissionsAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Commissions dues
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-navy tabular-nums">
            {formatFCFA(dueCommissionsAmount)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">En attente de règlement</p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Commissions payées
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-navy tabular-nums">
            {formatFCFA(paidCommissionsAmount)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Encaissées et clôturées</p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
            Demandes clients
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-navy tabular-nums">
            {inquiries.length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Dont <strong className="text-navy">{newInquiriesCount}</strong> nouvelle(s) à traiter
          </p>
        </div>
      </div>

      {/* Section Ventes & Commissions */}
      <section className="rounded-xl border border-border-subtle bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-navy">
              Registre des ventes &amp; commissions
            </h2>
            <p className="text-xs text-ink-secondary">
              Chaque passage au statut « Vendu » calcule automatiquement la commission selon le
              taux configuré.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filtrer par statut de commission"
              value={commissionFilter}
              onChange={(e) =>
                setCommissionFilter(e.target.value as 'toutes' | CommissionStatus)
              }
              className="h-9 rounded-md border border-border-strong bg-canvas px-3 text-xs font-semibold text-navy focus:border-navy focus:outline-none"
            >
              <option value="toutes">Toutes les commissions</option>
              <option value="due">Dues uniquement</option>
              <option value="payee">Payées uniquement</option>
            </select>

            <button
              type="button"
              onClick={handleExportSalesCsv}
              disabled={filteredSales.length === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-canvas px-3.5 text-xs font-semibold text-navy hover:bg-sand disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
              <span>Export CSV ventes</span>
            </button>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            Aucune vente enregistrée pour ce filtre.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Bien</th>
                  <th className="py-3 pr-4">Agent</th>
                  <th className="py-3 pr-4">Prix affiché</th>
                  <th className="py-3 pr-4">Prix final</th>
                  <th className="py-3 pr-4">Commission</th>
                  <th className="py-3 pr-4">Statut</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredSales.map((sale) => {
                  const commission = sale.commission;
                  const isPaid = commission?.status === 'payee';
                  const isBusy = commission && busyCommissionId === commission.id;

                  return (
                    <tr key={sale.id} className="align-top">
                      <td className="py-3.5 pr-4 text-xs text-ink-secondary tabular-nums">
                        {formatDateFr(sale.sold_at)}
                      </td>
                      <td className="py-3.5 pr-4">
                        {sale.listing ? (
                          <Link
                            href={`/annonces/${sale.listing.slug}`}
                            className="font-semibold text-navy hover:underline"
                          >
                            {sale.listing.title}
                          </Link>
                        ) : (
                          <span className="font-medium text-ink-muted">Bien archivé</span>
                        )}
                        <p className="text-xs text-ink-muted">
                          {sale.listing
                            ? `${sale.listing.neighborhood}, ${sale.listing.city}`
                            : '—'}
                          {sale.buyer_name ? ` • Acheteur : ${sale.buyer_name}` : ''}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-ink-secondary">
                        {sale.agent?.full_name ?? sale.agent?.email ?? '—'}
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-ink-muted tabular-nums">
                        {formatFCFA(sale.listed_price_fcfa)}
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-bold text-navy tabular-nums">
                        {formatFCFA(sale.final_sale_price_fcfa)}
                      </td>
                      <td className="py-3.5 pr-4 text-xs tabular-nums">
                        {commission ? (
                          <div>
                            <span className="font-bold text-navy">
                              {formatFCFA(commission.amount_fcfa)}
                            </span>
                            <span className="block text-[11px] text-ink-muted">
                              Taux : {commission.rate_percent} %
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        {commission ? (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isPaid ? 'Payée' : 'Due'}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3.5 text-right">
                        {commission ? (
                          <button
                            type="button"
                            disabled={Boolean(isBusy)}
                            onClick={() =>
                              handleToggleCommissionStatus(
                                commission.id,
                                isPaid ? 'due' : 'payee',
                              )
                            }
                            className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors disabled:opacity-60 ${
                              isPaid
                                ? 'border border-border-strong bg-canvas text-ink-secondary hover:bg-sand'
                                : 'bg-navy text-white hover:bg-navy-soft'
                            }`}
                          >
                            {isBusy
                              ? '...'
                              : isPaid
                                ? 'Remettre due'
                                : 'Marquer payée'}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section Demandes clients reçues */}
      <section className="rounded-xl border border-border-subtle bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-navy">
              Demandes clients reçues
            </h2>
            <p className="text-xs text-ink-secondary">
              Demandes de visite issues des fiches annonces et messages envoyés depuis la page
              contact.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
                strokeWidth={1.75}
              />
              <input
                type="text"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder="Nom, tél., annonce..."
                className="h-9 rounded-md border border-border-strong bg-canvas pl-8 pr-3 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>

            <select
              aria-label="Filtrer par statut de demande"
              value={inquiryStatusFilter}
              onChange={(e) =>
                setInquiryStatusFilter(e.target.value as 'toutes' | InquiryStatus)
              }
              className="h-9 rounded-md border border-border-strong bg-canvas px-3 text-xs font-semibold text-navy focus:border-navy focus:outline-none"
            >
              <option value="toutes">Tous statuts</option>
              <option value="nouvelle">Nouvelle</option>
              <option value="contactee">Contactée</option>
              <option value="planifiee">Visite planifiée</option>
              <option value="cloturee">Clôturée</option>
            </select>

            <button
              type="button"
              onClick={handleExportInquiriesCsv}
              disabled={filteredInquiries.length === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-canvas px-3.5 text-xs font-semibold text-navy hover:bg-sand disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
              <span>Export CSV demandes</span>
            </button>
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            Aucune demande client reçue pour ce filtre.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredInquiries.map((inq) => {
              const cleanPhone = inq.phone.replace(/\D/g, '');

              return (
                <div
                  key={inq.id}
                  className="rounded-lg border border-border-subtle bg-canvas p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-sm font-bold text-navy">
                          {inq.full_name}
                        </span>
                        <span className="rounded bg-surface px-2 py-0.5 text-[11px] font-semibold text-gold-text border border-border-subtle">
                          {inq.inquiry_type === 'visite'
                            ? 'Demande de visite'
                            : 'Contact général'}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {formatDateFr(inq.created_at)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-secondary">
                        <a
                          href={`tel:${inq.phone}`}
                          className="inline-flex items-center gap-1 font-medium text-navy hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
                          <span>{inq.phone}</span>
                        </a>
                        {inq.email ? <span>{inq.email}</span> : null}
                        <span>Canal : {inq.preferred_channel}</span>
                        {inq.preferred_visit_date ? (
                          <span className="font-semibold text-navy">
                            Visite souhaitée : {formatDateFr(inq.preferred_visit_date)}
                          </span>
                        ) : null}
                      </div>

                      {inq.listing_title ? (
                        <p className="text-xs font-medium text-navy">
                          Bien : {inq.listing_title}
                        </p>
                      ) : null}

                      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                        {inq.message}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {cleanPhone ? (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Bonjour ${inq.full_name}, suite à votre demande sur DoorWaarSERVICE${inq.listing_title ? ` concernant "${inq.listing_title}"` : ''}.`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 text-xs font-semibold text-navy hover:bg-sand"
                          title="Contacter le client sur WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.75} />
                          <span>WhatsApp</span>
                        </a>
                      ) : null}

                      <select
                        aria-label={`Statut de la demande de ${inq.full_name}`}
                        value={inq.status}
                        disabled={busyInquiryId === inq.id}
                        onChange={(e) =>
                          handleInquiryStatusChange(inq.id, e.target.value as InquiryStatus)
                        }
                        className="h-9 rounded-md border border-border-strong bg-surface px-2.5 text-xs font-semibold text-navy focus:border-navy focus:outline-none"
                      >
                        {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
