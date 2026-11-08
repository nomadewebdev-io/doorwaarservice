import { NextResponse } from 'next/server';
import { requireStaffApi } from '@/lib/auth/api-guards';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      final_sale_price_fcfa?: unknown;
      buyer_name?: unknown;
      buyer_phone?: unknown;
      notes?: unknown;
    };

    const finalSalePrice = Number(body.final_sale_price_fcfa);
    if (!Number.isFinite(finalSalePrice) || finalSalePrice <= 0) {
      return NextResponse.json(
        {
          error: 'Le prix de vente final en FCFA est obligatoire et doit être supérieur à zéro.',
        },
        { status: 400 },
      );
    }

    const { data: saleId, error } = await guard.supabase.rpc('mark_listing_sold', {
      p_listing_id: id,
      p_final_sale_price_fcfa: Math.round(finalSalePrice),
      p_buyer_name: typeof body.buyer_name === 'string' ? body.buyer_name : null,
      p_buyer_phone: typeof body.buyer_phone === 'string' ? body.buyer_phone : null,
      p_notes: typeof body.notes === 'string' ? body.notes : null,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Échec de l’enregistrement de la vente.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, saleId });
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
}

