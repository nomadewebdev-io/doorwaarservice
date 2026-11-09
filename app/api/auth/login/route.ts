import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: 'Configuration Supabase manquante sur le serveur.' },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'email ou mot de passe incorrect' },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    // 1. Appel signInWithPassword Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Log technique exact côté serveur SANS JAMAIS afficher de clé ni de mot de passe
      console.error('[Auth Server Error] Échec signInWithPassword:', {
        status: authError?.status,
        name: authError?.name,
        message: authError?.message,
      });

      return NextResponse.json(
        { ok: false, error: 'email ou mot de passe incorrect' },
        { status: 401 },
      );
    }

    // 2. Lecture immédiate du rôle dans public.profiles juste après la connexion
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      // Log technique exact côté serveur de l'erreur RLS ou DB
      console.error('[Auth Server Error] Échec lecture rôle dans public.profiles:', {
        userId: authData.user.id,
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });

      // Révocation de la session
      await supabase.auth.signOut();

      return NextResponse.json(
        { ok: false, error: 'profil introuvable ou accès refusé' },
        { status: 403 },
      );
    }

    if (!profile || (profile.role !== 'agent' && profile.role !== 'owner')) {
      // Log technique exact côté serveur : profil absent ou rôle non autorisé
      console.error('[Auth Server Error] Profil introuvable ou rôle non habilité:', {
        userId: authData.user.id,
        hasProfile: Boolean(profile),
        role: profile?.role ?? null,
      });

      // Révocation immédiate de la session
      await supabase.auth.signOut();

      return NextResponse.json(
        { ok: false, error: 'profil introuvable ou accès refusé' },
        { status: 403 },
      );
    }

    // Connexion réussie et rôle agent/owner validé
    console.info('[Auth Server] Connexion pro réussie:', {
      userId: authData.user.id,
      role: profile.role,
    });

    return NextResponse.json({
      ok: true,
      role: profile.role,
      session: authData.session
        ? {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
          }
        : null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[Auth Server Error] Exception inattendue lors de la connexion:', errorMsg);
    return NextResponse.json(
      { ok: false, error: 'Erreur technique lors de la connexion.' },
      { status: 500 },
    );
  }
}
