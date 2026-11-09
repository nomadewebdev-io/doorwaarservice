/**
 * Nettoie et normalise l'URL du projet Supabase :
 * - Supprime les espaces superflus
 * - Retire /rest/v1 ou /rest/v1/ si collé par inadvertance depuis le dashboard Supabase
 * - Retire les barres obliques finales
 */
export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

/**
 * Nettoie la clé d'API (anonyme classique JWT ou clé publishable sb_publishable_...)
 */
export function normalizeSupabaseKey(rawKey?: string): string {
  if (!rawKey) return '';
  return rawKey.trim();
}

export function isSupabaseConfigured(): boolean {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeSupabaseKey(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  return Boolean(
    url &&
      anonKey &&
      url.startsWith('https://') &&
      !url.includes('votre-projet') &&
      !anonKey.includes('votre-cle'),
  );
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = normalizeSupabaseKey(rawKey);

  if (!url || !anonKey) {
    throw new Error(
      'Variables Supabase manquantes : configurez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).',
    );
  }
  return { url, anonKey };
}
