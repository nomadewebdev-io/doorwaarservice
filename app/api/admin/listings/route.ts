import { NextResponse } from 'next/server';
import { requireStaffApi } from '@/lib/auth/api-guards';
import { slugifyTitle } from '@/lib/utils/format';
import { validateListingInput } from '@/lib/validation/schemas';

export async function GET() {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  let query = guard.supabase
    .from('listings')
    .select('*, listing_images(*)')
    .order('created_at', { ascending: false });

  if (guard.profile.role === 'agent') {
    query = query.eq('created_by', guard.profile.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Impossible de charger les annonces.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ listings: data ?? [] });
}

export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateListingInput(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        {
          error: 'Données d’annonce invalides.',
          errors: validation.errors ?? {},
        },
        { status: 400 },
      );
    }

    if (validation.data.status === 'vendu') {
      return NextResponse.json(
        {
          error:
            'Créez d’abord l’annonce comme Disponible ou Réservé avant d’enregistrer une vente finale.',
        },
        { status: 400 },
      );
    }

    const baseSlug = slugifyTitle(validation.data.title) || 'bien-immobilier';
    const uniqueSuffix = Math.random().toString(36).slice(2, 7);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const { data, error } = await guard.supabase
      .from('listings')
      .insert({
        ...validation.data,
        slug,
        created_by: guard.profile.id,
      })
      .select('*, listing_images(*)')
      .single();

    if (error) {
      console.error('Erreur création annonce :', error);
      return NextResponse.json(
        { error: 'Impossible de créer l’annonce.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ listing: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 });
  }
}

