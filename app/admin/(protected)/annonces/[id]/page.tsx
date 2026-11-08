import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ListingForm } from '@/components/admin/ListingForm';
import { ListingPhotoManager } from '@/components/admin/ListingPhotoManager';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ListingImage, ListingWithImages } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

function sortImages(images: ListingImage[] | undefined): ListingImage[] {
  if (!images) return [];
  return [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('id', id)
    .maybeSingle<ListingWithImages>();

  if (!data) {
    notFound();
  }

  const listing: ListingWithImages = {
    ...data,
    listing_images: sortImages(data.listing_images),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Retour à la liste des annonces</span>
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-navy">
          Modifier l’annonce
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">{listing.title}</p>
      </div>

      <ListingPhotoManager
        listingId={listing.id}
        listingTitle={listing.title}
        initialImages={listing.listing_images}
      />

      <ListingForm mode="edit" initialListing={listing} />
    </div>
  );
}

