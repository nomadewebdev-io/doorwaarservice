import type {
  InquiryStatus,
  LegalStatus,
  ListingStatus,
  PreferredChannel,
  PricePeriod,
  PropertyType,
  TransactionType,
} from '@/lib/types/database';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export interface InquiryInput {
  listing_id?: string | null;
  listing_title?: string | null;
  inquiry_type: 'visite' | 'contact';
  full_name: string;
  phone: string;
  email?: string | null;
  preferred_channel: PreferredChannel;
  preferred_visit_date?: string | null;
  message: string;
}

export function validateInquiryInput(raw: Record<string, unknown>): ValidationResult<InquiryInput> {
  const errors: Record<string, string> = {};

  const fullName = typeof raw.full_name === 'string' ? raw.full_name.trim() : '';
  const phone = typeof raw.phone === 'string' ? raw.phone.trim() : '';
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';
  const inquiryType = raw.inquiry_type === 'contact' ? 'contact' : 'visite';
  const channel =
    raw.preferred_channel === 'telephone' || raw.preferred_channel === 'email'
      ? raw.preferred_channel
      : 'whatsapp';
  const preferredVisitDate =
    typeof raw.preferred_visit_date === 'string' && raw.preferred_visit_date.trim()
      ? raw.preferred_visit_date.trim()
      : null;

  if (fullName.length < 2) {
    errors.full_name = 'Veuillez saisir votre nom complet (minimum 2 caractères).';
  }

  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    errors.phone = 'Veuillez indiquer un numéro de téléphone sénégalais ou international valide.';
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Adresse e-mail invalide.';
  }

  if (message.length < 5) {
    errors.message = 'Précisez votre demande (minimum 5 caractères).';
  }

  if (preferredVisitDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredVisitDate)) {
    errors.preferred_visit_date = 'Date de visite invalide.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      listing_id: typeof raw.listing_id === 'string' && raw.listing_id ? raw.listing_id : null,
      listing_title:
        typeof raw.listing_title === 'string' && raw.listing_title.trim()
          ? raw.listing_title.trim()
          : null,
      inquiry_type: inquiryType,
      full_name: fullName,
      phone,
      email: email || null,
      preferred_channel: channel,
      preferred_visit_date: preferredVisitDate,
      message,
    },
  };
}

export interface ListingInput {
  title: string;
  property_type: PropertyType;
  transaction_type: TransactionType;
  status: ListingStatus;
  price_fcfa: number;
  price_period: PricePeriod;
  city: string;
  neighborhood: string;
  address_landmark: string | null;
  surface_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  legal_status: LegalStatus | null;
  amenities: string[];
  description: string;
  is_featured: boolean;
  is_published: boolean;
}

const VALID_LEGAL_STATUSES: LegalStatus[] = [
  'Titre Foncier',
  'Bail',
  'Délibération',
  'Contrat de bail meublé',
];

export function validateListingInput(raw: Record<string, unknown>): ValidationResult<ListingInput> {
  const errors: Record<string, string> = {};

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const propertyType: PropertyType = raw.property_type === 'terrain' ? 'terrain' : 'appartement';
  const transactionType: TransactionType =
    raw.transaction_type === 'vente'
      ? 'vente'
      : raw.transaction_type === 'location'
        ? 'location'
        : propertyType === 'terrain'
          ? 'vente'
          : 'location';

  const status: ListingStatus =
    raw.status === 'reserve' || raw.status === 'vendu' ? raw.status : 'disponible';

  const priceFcfa = Number(raw.price_fcfa);
  const pricePeriod: PricePeriod =
    raw.price_period === 'mois' || raw.price_period === 'nuit' ? raw.price_period : 'total';

  const city = typeof raw.city === 'string' ? raw.city.trim() : '';
  const neighborhood = typeof raw.neighborhood === 'string' ? raw.neighborhood.trim() : '';
  const addressLandmark =
    typeof raw.address_landmark === 'string' && raw.address_landmark.trim()
      ? raw.address_landmark.trim()
      : null;

  const surfaceRaw = raw.surface_sqm === '' || raw.surface_sqm === null || raw.surface_sqm === undefined ? null : Number(raw.surface_sqm);
  const bedroomsRaw = raw.bedrooms === '' || raw.bedrooms === null || raw.bedrooms === undefined ? null : Number(raw.bedrooms);
  const bathroomsRaw = raw.bathrooms === '' || raw.bathrooms === null || raw.bathrooms === undefined ? null : Number(raw.bathrooms);

  const legalStatusRaw = typeof raw.legal_status === 'string' ? raw.legal_status.trim() : '';
  const legalStatus = VALID_LEGAL_STATUSES.includes(legalStatusRaw as LegalStatus)
    ? (legalStatusRaw as LegalStatus)
    : null;

  const amenities = Array.isArray(raw.amenities)
    ? raw.amenities.map((item) => String(item).trim()).filter(Boolean)
    : typeof raw.amenities === 'string'
      ? raw.amenities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const description = typeof raw.description === 'string' ? raw.description.trim() : '';

  if (title.length < 5) {
    errors.title = 'Le titre doit contenir au moins 5 caractères.';
  }
  if (!Number.isFinite(priceFcfa) || priceFcfa <= 0) {
    errors.price_fcfa = 'Le prix en FCFA doit être supérieur à 0.';
  }
  if (city.length < 2) {
    errors.city = 'La ville est obligatoire.';
  }
  if (neighborhood.length < 2) {
    errors.neighborhood = 'Le quartier ou la zone est obligatoire.';
  }
  if (surfaceRaw !== null && (!Number.isFinite(surfaceRaw) || surfaceRaw <= 0)) {
    errors.surface_sqm = 'La surface doit être un nombre positif.';
  }
  if (bedroomsRaw !== null && (!Number.isFinite(bedroomsRaw) || bedroomsRaw < 0)) {
    errors.bedrooms = 'Le nombre de chambres est invalide.';
  }
  if (bathroomsRaw !== null && (!Number.isFinite(bathroomsRaw) || bathroomsRaw < 0)) {
    errors.bathrooms = 'Le nombre de salles de bain est invalide.';
  }
  if (description.length < 20) {
    errors.description = 'La description doit contenir au moins 20 caractères.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title,
      property_type: propertyType,
      transaction_type: transactionType,
      status,
      price_fcfa: Math.round(priceFcfa),
      price_period: pricePeriod,
      city,
      neighborhood,
      address_landmark: addressLandmark,
      surface_sqm: surfaceRaw !== null ? Math.round(surfaceRaw) : null,
      bedrooms: bedroomsRaw !== null ? Math.round(bedroomsRaw) : null,
      bathrooms: bathroomsRaw !== null ? Math.round(bathroomsRaw) : null,
      legal_status: legalStatus,
      amenities,
      description,
      is_featured: Boolean(raw.is_featured),
      is_published: raw.is_published === undefined ? true : Boolean(raw.is_published),
    },
  };
}

export function isValidInquiryStatus(value: unknown): value is InquiryStatus {
  return value === 'nouvelle' || value === 'contactee' || value === 'planifiee' || value === 'cloturee';
}
