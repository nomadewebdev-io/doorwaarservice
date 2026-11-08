import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';

type GuardSuccess = {
  ok: true;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  profile: Profile;
};

type GuardFailure = {
  ok: false;
  response: NextResponse;
};

export async function requireStaffApi(
  requiredRole?: 'owner',
): Promise<GuardSuccess | GuardFailure> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Supabase n’est pas configuré sur cet environnement.' },
        { status: 503 },
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentification requise.' },
        { status: 401 },
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (profileError || !profile) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Profil staff introuvable pour ce compte.' },
        { status: 403 },
      ),
    };
  }

  if (profile.role !== 'agent' && profile.role !== 'owner') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Accès refusé.' }, { status: 403 }),
    };
  }

  if (requiredRole === 'owner' && profile.role !== 'owner') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Accès réservé au propriétaire (owner).' },
        { status: 403 },
      ),
    };
  }

  return { ok: true, supabase, profile };
}

