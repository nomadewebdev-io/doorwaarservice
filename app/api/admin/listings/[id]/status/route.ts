import { NextResponse } from 'next/server';
import { requireStaffApi } from '@/lib/auth/api-guards';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireStaffApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status?: unknown };
    const status = body.status;

    if (status === 'vendu') {
      return NextResponse.json(
        {
          error:
            'Passer au statut Vendu exige la saisie du prix de vente final via la fenêtre de clôture de vente.',
        },
        { status: 400 },
      );
    }

    if (status !== 'disponible' && status !== 'reserve') {
      return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
    }

    const { data, error } = await guard.supabase
      .from('listings')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Impossible de modifier le statut.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ listing: data });
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
}
