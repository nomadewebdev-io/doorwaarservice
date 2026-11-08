import { DEMO_LISTINGS } from '@/lib/data/demo-listings';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CatalogFilters, ListingImage, ListingWithImages } from '@/lib/types/database';

function sortImages(images: ListingImage[] | undefined): ListingImage[] {
  if (!images || images.length === 0) return [];
  return [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

function normalizeListing(item: ListingWithImages): ListingWithImages {
  return {
    ...item,
    amenities: Array.isArray(item.amenities) ? item.amenities : [],
    listing_images: sortImages(item.listing_images),
  };
}

function applyInMemoryFilters(
  listings: ListingWithImages[],
  filters: CatalogFilters,
): ListingWithImages[] {
  const locationTerm = filters.location?.trim().toLowerCase() || '';

  const filtered = listings.filter((listing) => {
    if (!listing.is_published) return false;
    if (filters.type && filters.type !== 'tous' && listing.property_type !== filters.type) {
      return false;
    }
    if (filters.status && filters.status !== 'tous' && listing.status !== filters.status) {
      return false;
    }
    if (locationTerm) {
      const searchable = `${listing.city} ${listing.neighborhood} ${listing.address_landmark ?? ''}`.toLowerCase();
      if (!searchable.includes(locationTerm)) return false;
    }
    if (typeof filters.minPrice === 'number' && listing.price_fcfa < filters.minPrice) {
      return false;
    }
    if (typeof filters.maxPrice === 'number' && listing.price_fcfa > filters.maxPrice) {
      return false;
    }
    if (typeof filters.minSurface === 'number') {
      if (!listing.surface_sqm || listing.surface_sqm < filters.minSurface) return false;
    }
    if (typeof filters.minBedrooms === 'number' && filters.minBedrooms > 0) {
      if (listing.bedrooms === null || listing.bedrooms < filters.minBedrooms) return false;
    }
    return true;
  });

  const sortBy = filters.sort ?? 'recent';
  return [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price_fcfa - b.price_fcfa;
    if (sortBy === 'price_desc') return b.price_fcfa - a.price_fcfa;
    if (sortBy === 'surface_desc') return (b.surface_sqm ?? 0) - (a.surface_sqm ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function getPublicListings(
  filters: CatalogFilters = {},
): Promise<ListingWithImages[]> {
  if (!isSupabaseConfigured()) {
    return applyInMemoryFilters(DEMO_LISTINGS, filters).map(normalizeListing);
  }

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from('listings')
      .select('*, listing_images(*)')
      .eq('is_published', true);

    if (filters.type && filters.type !== 'tous') {
      query = query.eq('property_type', filters.type);
    }
    if (filters.status && filters.status !== 'tous') {
      query = query.eq('status', filters.status);
    }
    if (typeof filters.minPrice === 'number' && Number.isFinite(filters.minPrice)) {
      query = query.gte('price_fcfa', filters.minPrice);
    }
    if (typeof filters.maxPrice === 'number' && Number.isFinite(filters.maxPrice)) {
      query = query.lte('price_fcfa', filters.maxPrice);
    }
    if (typeof filters.minSurface === 'number' && Number.isFinite(filters.minSurface)) {
      query = query.gte('surface_sqm', filters.minSurface);
    }
    if (
      typeof filters.minBedrooms === 'number' &&
      Number.isFinite(filters.minBedrooms) &&
      filters.minBedrooms > 0
    ) {
      query = query.gte('bedrooms', filters.minBedrooms);
    }

    const locationTerm = filters.location?.trim();
    if (locationTerm) {
      const escaped = locationTerm.replace(/[%_]/g, '');
      query = query.or(
        `city.ilike.%${escaped}%,neighborhood.ilike.%${escaped}%,address_landmark.ilike.%${escaped}%`,
      );
    }

    const sortBy = filters.sort ?? 'recent';
    if (sortBy === 'price_asc') {
      query = query.order('price_fcfa', { ascending: true });
    } else if (sortBy === 'price_desc') {
      query = query.order('price_fcfa', { ascending: false });
    } else if (sortBy === 'surface_desc') {
      query = query.order('surface_sqm', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return ((data as ListingWithImages[]) || []).map(normalizeListing);
  } catch (err) {
    console.error('Erreur chargement catalogue Supabase :', err);
    return [];
  }
}

export async function getRecentListings(limit = 5): Promise<ListingWithImages[]> {
  const listings = await getPublicListings({ sort: 'recent' });
  const sorted = [...listings].sort((a, b) => {
    if (a.status === 'disponible' && b.status !== 'disponible') return -1;
    if (a.status !== 'disponible' && b.status === 'disponible') return 1;
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return sorted.slice(0, limit);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getListingBySlugOrId(
  slugOrId: string,
): Promise<ListingWithImages | null> {
  if (!isSupabaseConfigured()) {
    const found = DEMO_LISTINGS.find(
      (item) => item.slug === slugOrId || item.id === slugOrId,
    );
    return found ? normalizeListing(found) : null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from('listings')
      .select('*, listing_images(*)')
      .eq('is_published', true);

    if (UUID_REGEX.test(slugOrId)) {
      query = query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);
    } else {
      query = query.eq('slug', slugOrId);
    }

    const { data, error } = await query.maybeSingle<ListingWithImages>();
    if (error || !data) return null;
    return normalizeListing(data);
  } catch (err) {
    console.error('Erreur récupération annonce :', err);
    return null;
  }
}

export async function getAvailableLocations(): Promise<string[]> {
  const listings = await getPublicListings();
  const locations = new Set<string>();
  for (const item of listings) {
    locations.add(item.city);
    locations.add(item.neighborhood);
  }
  return Array.from(locations).sort((a, b) => a.localeCompare(b, 'fr'));
}

