import { AgentListingsManager } from '@/components/admin/AgentListingsManager';
import { requireStaffProfile } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ListingImage, ListingWithImages } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

function sortImages(images: ListingImage[] | undefined): ListingImage[] {
  if (!images) return [];
  return [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

export default async function AdminListingsPage() {
  const profile = await requireStaffProfile();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('listings')
    .select('*, listing_images(*)')
    .order('created_at', { ascending: false });

  // Un agent gère uniquement ses propres annonces ; le owner accède à la totalité
  if (profile.role === 'agent') {
    query = query.eq('created_by', profile.id);
  }

  const { data } = await query;

  const listings = ((data as ListingWithImages[]) ?? []).map((item) => ({
    ...item,
    listing_images: sortImages(item.listing_images),
  }));

  return <AgentListingsManager initialListings={listings} />;
}
