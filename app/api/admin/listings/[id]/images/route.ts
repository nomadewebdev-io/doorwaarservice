import { NextResponse } from 'next/server';
import { requireStaffApi } from '@/lib/auth/api-guards';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function canManageListing(
  guard: { supabase: any; profile: { id: string; role: string } },
  listingId: string,
): Promise<boolean> {
  if (guard.profile.role === 'owner') return true;
  const { data } = await guard.supabase
    .from('listings')
    .select('created_by')
    .eq('id', listingId)
    .maybeSingle();
  return data?.created_by === guard.profile.id;
}

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  if (!(await canManageListing(guard, id))) {
    return NextResponse.json(
      { error: 'Accès refusé : vous ne pouvez ajouter des photos qu’à vos propres annonces.' },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      storage_path?: string | null;
      image_url?: string;
      alt_text?: string | null;
      is_cover?: boolean;
      sort_order?: number;
    };

    if (!body.image_url || typeof body.image_url !== 'string') {
      return NextResponse.json({ error: 'URL de l’image requise.' }, { status: 400 });
    }

    if (body.is_cover) {
      await guard.supabase
        .from('listing_images')
        .update({ is_cover: false })
        .eq('listing_id', id);
    }

    const { data, error } = await guard.supabase
      .from('listing_images')
      .insert({
        listing_id: id,
        storage_path: body.storage_path ?? null,
        image_url: body.image_url,
        alt_text: body.alt_text ?? null,
        is_cover: Boolean(body.is_cover),
        sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Impossible d’enregistrer la photo.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ image: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  if (!(await canManageListing(guard, id))) {
    return NextResponse.json(
      { error: 'Accès refusé : vous ne pouvez modifier que les photos de vos propres annonces.' },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as { imageId?: string };
    if (!body.imageId) {
      return NextResponse.json({ error: 'Identifiant image manquant.' }, { status: 400 });
    }

    await guard.supabase
      .from('listing_images')
      .update({ is_cover: false })
      .eq('listing_id', id);

    const { data, error } = await guard.supabase
      .from('listing_images')
      .update({ is_cover: true })
      .eq('id', body.imageId)
      .eq('listing_id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Impossible de définir la photo principale.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ image: data });
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  if (!(await canManageListing(guard, id))) {
    return NextResponse.json(
      { error: 'Accès refusé : vous ne pouvez supprimer que les photos de vos propres annonces.' },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get('imageId');

  if (!imageId) {
    return NextResponse.json({ error: 'Paramètre imageId manquant.' }, { status: 400 });
  }

  const { data: existing } = await guard.supabase
    .from('listing_images')
    .select('id, storage_path')
    .eq('id', imageId)
    .eq('listing_id', id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Photo introuvable.' }, { status: 404 });
  }

  const { error } = await guard.supabase
    .from('listing_images')
    .delete()
    .eq('id', imageId)
    .eq('listing_id', id);

  if (error) {
    return NextResponse.json(
      { error: 'Impossible de supprimer la photo.' },
      { status: 500 },
    );
  }

  if (existing.storage_path) {
    await guard.supabase.storage.from('listing-images').remove([existing.storage_path]);
  }

  return NextResponse.json({ ok: true });
}
