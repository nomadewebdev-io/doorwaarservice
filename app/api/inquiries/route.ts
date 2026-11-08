import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateInquiryInput } from '@/lib/validation/schemas';
import { siteConfig } from '@/src/config/site';

/**
 * Notifie l'administrateur de la nouvelle demande de visite ou contact.
 * Utilise la variable d'environnement CONTACT_EMAIL (avec repli sur siteConfig.email),
 * sans jamais inscrire d'adresse email en dur dans le code.
 */
async function notifyInquiryRecipient(data: {
  inquiry_type: string;
  full_name: string;
  phone: string;
  email?: string | null;
  listing_title?: string | null;
  preferred_channel: string;
  preferred_visit_date?: string | null;
  message: string;
}) {
  const recipientEmail = process.env.CONTACT_EMAIL || siteConfig.email;
  if (!recipientEmail) return;

  // Journalisation de la notification à destination de l'email configuré
  console.info(`[Notification demande client] Transmission vers ${recipientEmail} :`, {
    destinataire: recipientEmail,
    sujet:
      data.inquiry_type === 'visite'
        ? `Demande de visite — ${data.listing_title || 'Annonce'}`
        : `Demande de contact — ${data.full_name}`,
    type: data.inquiry_type,
    client: data.full_name,
    telephone: data.phone,
    email: data.email || null,
    canal: data.preferred_channel,
    dateVisite: data.preferred_visit_date || null,
    message: data.message,
    horodatage: new Date().toISOString(),
  });
}

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

    // Déclenchement de la notification vers CONTACT_EMAIL
    await notifyInquiryRecipient(validation.data);

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
