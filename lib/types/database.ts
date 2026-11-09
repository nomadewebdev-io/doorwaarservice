export type UserRole = 'agent' | 'owner';

export type PropertyType = 'terrain' | 'appartement';

export type TransactionType = 'vente' | 'location';

export type ListingStatus = 'disponible' | 'reserve' | 'vendu';

export type PricePeriod = 'total' | 'mois' | 'nuit';

export type LegalStatus =
  | 'Titre Foncier'
  | 'Bail'
  | 'Délibération'
  | 'Contrat de bail meublé';

export type InquiryType = 'visite' | 'contact';

export type PreferredChannel = 'whatsapp' | 'telephone' | 'email';

export type InquiryStatus = 'nouvelle' | 'contactee' | 'planifiee' | 'cloturee';

export type CommissionStatus = 'due' | 'payee';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  default_commission_rate: number;
  updated_by: string | null;
  updated_at: string;
}

export type AgencySettings = Settings;

export interface StatusHistory {
  id: string;
  listing_id: string;
  changed_by: string | null;
  old_status: string | null;
  new_status: string;
  price_fcfa: number | null;
  created_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  slug: string;
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
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingWithImages extends Listing {
  listing_images: ListingImage[];
}

export interface Inquiry {
  id: string;
  listing_id: string | null;
  listing_title: string | null;
  inquiry_type: InquiryType;
  full_name: string;
  phone: string;
  email: string | null;
  preferred_channel: PreferredChannel;
  preferred_visit_date: string | null;
  message: string;
  status: InquiryStatus;
  owner_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  listing_id: string;
  agent_id: string | null;
  listed_price_fcfa: number;
  final_sale_price_fcfa: number;
  buyer_name: string | null;
  buyer_phone: string | null;
  notes: string | null;
  sold_at: string;
  created_at: string;
}

export interface Commission {
  id: string;
  sale_id: string;
  agent_id: string | null;
  rate_percent: number;
  amount_fcfa: number;
  status: CommissionStatus;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleWithDetails extends Sale {
  listing: Pick<Listing, 'id' | 'slug' | 'title' | 'property_type' | 'city' | 'neighborhood'> | null;
  agent: Pick<Profile, 'id' | 'full_name' | 'email'> | null;
  commission: Commission | null;
}

export type CatalogSortOption = 'recent' | 'price_asc' | 'price_desc' | 'surface_desc';

export interface CatalogFilters {
  type?: PropertyType | 'tous';
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  minBedrooms?: number;
  status?: ListingStatus | 'tous';
  sort?: CatalogSortOption;
}

