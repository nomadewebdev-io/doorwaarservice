import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateInquiryInput } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateInquiryInput(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        {
          error: 'Veuillez corriger les champs signalés.',
          errors: validation.errors ?? {},
        },
        { status: 400 },
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          ok: true,
          mode: 'demo',
          message:
            'Demande validée (mode démonstration : connectez Supabase pour enregistrer les demandes en base).',
        },
        { status: 201 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('inquiries').insert({
      listing_id: validation.data.listing_id,
      listing_title: validation.data.listing_title,
      inquiry_type: validation.data.inquiry_type,
      full_name: validation.data.full_name,
      phone: validation.data.phone,
      email: validation.data.email,
      preferred_channel: validation.data.preferred_channel,
      preferred_visit_date: validation.data.preferred_visit_date,
      message: validation.data.message,
      status: 'nouvelle',
    });

    if (error) {
      console.error('Erreur insertion demande client :', error);
      return NextResponse.json(
        { error: 'Impossible d’enregistrer votre demande pour le moment.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Erreur API /api/inquiries :', err);
    return NextResponse.json(
      { error: 'Requête invalide.' },
      { status: 400 },
    );
  }
}
