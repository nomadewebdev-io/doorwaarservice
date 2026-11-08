import { AgentListingsManager } from '@/components/admin/AgentListingsManager';
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
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .order('created_at', { ascending: false });

  const listings = ((data as ListingWithImages[]) ?? []).map((item) => ({
    ...item,
    listing_images: sortImages(item.listing_images),
  }));

  return <AgentListingsManager initialListings={listings} />;
}

