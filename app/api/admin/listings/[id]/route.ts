import { NextResponse } from 'next/server';
import { requireStaffApi } from '@/lib/auth/api-guards';
import { validateListingInput } from '@/lib/validation/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

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

    const { data: existing, error: fetchError } = await guard.supabase
      .from('listings')
      .select('id, status')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Annonce introuvable.' }, { status: 404 });
    }

    const wantsTransitionToSold =
      validation.data.status === 'vendu' && existing.status !== 'vendu';

    if (wantsTransitionToSold) {
      const finalPrice = Number(body.final_sale_price_fcfa);
      if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
        return NextResponse.json(
          {
            error:
              'Passer cette annonce au statut Vendu exige la saisie du prix de vente final en FCFA.',
            errors: {
              final_sale_price_fcfa: 'Le prix de vente final en FCFA est obligatoire.',
            },
          },
          { status: 400 },
        );
      }

      const { error: saleError } = await guard.supabase.rpc('mark_listing_sold', {
        p_listing_id: id,
        p_final_sale_price_fcfa: Math.round(finalPrice),
        p_buyer_name: typeof body.buyer_name === 'string' ? body.buyer_name : null,
        p_buyer_phone: typeof body.buyer_phone === 'string' ? body.buyer_phone : null,
        p_notes: typeof body.sale_notes === 'string' ? body.sale_notes : null,
      });

      if (saleError) {
        return NextResponse.json(
          { error: saleError.message || 'Impossible d’enregistrer la vente finale.' },
          { status: 400 },
        );
      }
    }

    const { data: updated, error: updateError } = await guard.supabase
      .from('listings')
      .update(validation.data)
      .eq('id', id)
      .select('*, listing_images(*)')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Impossible de mettre à jour l’annonce.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ listing: updated });
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  const { data: images } = await guard.supabase
    .from('listing_images')
    .select('storage_path')
    .eq('listing_id', id);

  const { error } = await guard.supabase.from('listings').delete().eq('id', id);

  if (error) {
    if (error.code === '23503') {
      return NextResponse.json(
        {
          error:
            'Impossible de supprimer une annonce rattachée à une vente enregistrée. Dépubliez-la pour la retirer du site public.',
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: 'Impossible de supprimer cette annonce.' },
      { status: 500 },
    );
  }

  const storagePaths = (images ?? [])
    .map((img) => img.storage_path)
    .filter((p): p is string => Boolean(p));

  if (storagePaths.length > 0) {
    await guard.supabase.storage.from('listing-images').remove(storagePaths);
  }

  return NextResponse.json({ ok: true });
}

