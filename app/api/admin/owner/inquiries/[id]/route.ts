import { NextResponse } from 'next/server';
import { requireStaffApi } from '@/lib/auth/api-guards';
import { isValidInquiryStatus } from '@/lib/validation/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireStaffApi('owner');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status?: unknown; owner_notes?: unknown };
    if (!isValidInquiryStatus(body.status)) {
      return NextResponse.json(
        { error: 'Statut de demande invalide.' },
        { status: 400 },
      );
    }

    const payload: { status: string; owner_notes?: string | null } = {
      status: body.status,
    };

    if (typeof body.owner_notes === 'string') {
      payload.owner_notes = body.owner_notes.trim() || null;
    }

    const { data, error } = await guard.supabase
      .from('inquiries')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Impossible de mettre à jour la demande client.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ inquiry: data });
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
}
