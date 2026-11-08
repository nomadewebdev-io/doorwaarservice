import type { ListingStatus, PricePeriod, PropertyType } from '@/lib/types/database';
import { siteConfig, buildWhatsAppUrl } from '@/src/config/site';

export { siteConfig };

// Alias pour rétro-compatibilité
export const SITE_CONFIG = {
  name: siteConfig.name,
  slogan: siteConfig.slogan,
  zone: siteConfig.zone,
  whatsappNumber: siteConfig.whatsapp.raw,
  contactPhone: siteConfig.phone.display,
  contactEmail: siteConfig.email,
  officeAddress: siteConfig.address,
  officeHours: siteConfig.hours,
} as const;

export function formatFCFA(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${new Intl.NumberFormat('fr-FR').format(safeAmount)} FCFA`;
}

export function formatListingPrice(amount: number, period: PricePeriod): string {
  const base = formatFCFA(amount);
  if (period === 'mois') return `${base} / mois`;
  if (period === 'nuit') return `${base} / nuit`;
  return base;
}

export function getStatusLabel(status: ListingStatus): string {
  const labels: Record<ListingStatus, string> = {
    disponible: 'Disponible',
    reserve: 'Réservé',
    vendu: 'Vendu',
  };
  return labels[status];
}

export function getPropertyTypeLabel(type: PropertyType): string {
  return type === 'terrain' ? 'Terrain à vendre' : 'Appartement meublé';
}

export function buildWhatsAppListingUrl(params: {
  title: string;
  city?: string;
  neighborhood?: string;
  priceFcfa?: number;
  pricePeriod?: PricePeriod;
}): string {
  return buildWhatsAppUrl(params.title);
}

export function buildWhatsAppDirectUrl(customMessage?: string): string {
  return buildWhatsAppUrl(null, customMessage);
}

export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

export function formatDateFr(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const sanitized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  const escaped = sanitized.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function serializeCsv(headers: string[], rows: unknown[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(';');
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(';'));
  return `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;
}

