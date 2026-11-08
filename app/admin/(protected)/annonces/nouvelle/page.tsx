import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ListingForm } from '@/components/admin/ListingForm';

export const dynamic = 'force-dynamic';

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Retour à la liste des annonces</span>
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-navy">
          Publier une nouvelle annonce
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Renseignez les caractéristiques du terrain ou de l’appartement meublé et ajoutez vos
          photos.
        </p>
      </div>

      <ListingForm mode="create" />
    </div>
  );
}
