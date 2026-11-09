import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { Profile } from '@/lib/types/database';

export interface AuthContext {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
}

export async function getCurrentAuthContext(): Promise<AuthContext> {
  if (!isSupabaseConfigured()) {
    return { userId: null, email: null, profile: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    if (userError) {
      console.error('[Auth Session] Erreur getUser():', {
        message: userError.message,
        status: userError.status,
      });
    }
    return { userId: null, email: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (profileError) {
    console.error('[Auth Session] Erreur lecture public.profiles pour user:', {
      userId: user.id,
      error: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
    });
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
  };
}

export async function requireStaffProfile(): Promise<Profile> {
  const { userId, profile } = await getCurrentAuthContext();
  if (!userId) {
    redirect('/admin/login');
  }
  if (!profile || (profile.role !== 'agent' && profile.role !== 'owner')) {
    console.error('[Auth Session] Refus d’accès à l’espace pro : profil introuvable ou rôle non habilité', {
      userId,
      role: profile?.role ?? null,
    });
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // Ignoré
    }
    redirect('/admin/login?error=unauthorized');
  }
  return profile;
}

export async function requireOwnerProfile(): Promise<Profile> {
  const profile = await requireStaffProfile();
  if (profile.role !== 'owner') {
    redirect('/admin?error=owner_required');
  }
  return profile;
}
