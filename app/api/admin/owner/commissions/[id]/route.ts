import { NextResponse } from 'next/server';
import { requireStaffApi } from '@/lib/auth/api-guards';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireStaffApi('owner');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status?: unknown; notes?: unknown };
    const status = body.status;

    if (status !== 'due' && status !== 'payee') {
      return NextResponse.json(
        { error: 'Statut de commission invalide (due ou payee attendu).' },
        { status: 400 },
      );
    }

    const updatePayload: {
      status: 'due' | 'payee';
      paid_at: string | null;
      notes?: string | null;
    } = {
      status,
      paid_at: status === 'payee' ? new Date().toISOString() : null,
    };

    if (typeof body.notes === 'string') {
      updatePayload.notes = body.notes.trim() || null;
    }

    const { data, error } = await guard.supabase
      .from('commissions')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Impossible de mettre à jour la commission.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ commission: data });
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
}

