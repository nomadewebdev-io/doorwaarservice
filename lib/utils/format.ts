import type { ListingStatus, PricePeriod, PropertyType } from '@/lib/types/database';

export const SITE_CONFIG = {
  name: 'DoorWaarSERVICE',
  slogan: 'Terrains et appartements meublés au Sénégal',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '221770000000',
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+221 77 000 00 00',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@doorwaarservice.sn',
  officeAddress: 'Sacré-Cœur 3, VDN — Dakar, Sénégal',
  officeHours: 'Lundi – Samedi : 08h30 – 19h00',
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
  city: string;
  neighborhood: string;
  priceFcfa: number;
  pricePeriod: PricePeriod;
}): string {
  const cleanNumber = SITE_CONFIG.whatsappNumber.replace(/\D/g, '');
  const formattedPrice = formatListingPrice(params.priceFcfa, params.pricePeriod);
  const message = `Bonjour DoorWaarSERVICE, je suis intéressé(e) par l'annonce : "${params.title}" (${params.neighborhood}, ${params.city}) affichée à ${formattedPrice}. Pouvez-vous m'en dire plus pour une visite ?`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppDirectUrl(customMessage?: string): string {
  const cleanNumber = SITE_CONFIG.whatsappNumber.replace(/\D/g, '');
  const text =
    customMessage ||
    'Bonjour DoorWaarSERVICE, je souhaite des informations sur vos terrains et appartements meublés au Sénégal.';
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
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
