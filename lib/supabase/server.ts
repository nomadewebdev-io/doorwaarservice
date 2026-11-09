import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseEnv, normalizeSupabaseUrl } from '@/lib/supabase/config';

export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignoré dans les Server Components en lecture seule ; le rafraîchissement passe par proxy.ts
        }
      },
    },
  });
}

/**
 * Client Supabase administratif doté des privilèges service_role.
 * STRICTEMENT utilisable côté serveur (Node.js/Next Server).
 * Ne JAMAIS importer ce client dans un composant client ('use client').
 */
export function createSupabaseAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const url = normalizeSupabaseUrl(rawUrl);

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Variables manquantes pour createSupabaseAdminClient : configurez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY côté serveur.',
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
