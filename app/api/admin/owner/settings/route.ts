import { NextResponse } from 'next/server';
import { requireStaffApi } from '@/lib/auth/api-guards';

export async function PATCH(request: Request) {
  const guard = await requireStaffApi('owner');
  if (!guard.ok) return guard.response;

  try {
    const body = (await request.json()) as { default_commission_rate?: unknown };
    const rate = Number(body.default_commission_rate);

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      return NextResponse.json(
        { error: 'Le taux de commission doit être compris entre 0 % et 100 %.' },
        { status: 400 },
      );
    }

    const roundedRate = Math.round(rate * 100) / 100;

    const { data, error } = await guard.supabase
      .from('settings')
      .update({
        default_commission_rate: roundedRate,
        updated_by: guard.profile.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Impossible de mettre à jour le taux de commission.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ settings: data });
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
}

