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
    return { userId: null, email: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
  };
}

export async function requireStaffProfile(): Promise<Profile> {
  const { userId, profile } = await getCurrentAuthContext();
  if (!userId || !profile) {
    redirect('/admin/login');
  }
  if (profile.role !== 'agent' && profile.role !== 'owner') {
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
