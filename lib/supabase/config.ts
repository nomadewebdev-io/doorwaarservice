/**
 * Configuration Supabase pour DoorWaarSERVICE
 * Comprend les valeurs par défaut du projet en fallback pour garantir
 * le bon fonctionnement immédiat en environnement local et hébergé (Vercel / Netlify).
 */

const DEFAULT_SUPABASE_URL = 'https://otnulacmpzqdsyvoyoxf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bnVsYWNtcHpxZHN5dm95b3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNzQ0NDMsImV4cCI6MjEwOTc1MDQ0M30.8HCj4TWWtZk25d7f36-prhmo3q37TR_HkxCExs2J6Jg';

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
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(
    url &&
      anonKey &&
      url.startsWith('https://') &&
      !url.includes('votre-projet') &&
      !anonKey.includes('votre-cle'),
  );
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const resolvedUrl =
    envUrl && !envUrl.includes('votre-projet')
      ? envUrl
      : DEFAULT_SUPABASE_URL;

  const resolvedKey =
    envKey && !envKey.includes('votre-cle')
      ? envKey
      : DEFAULT_SUPABASE_ANON_KEY;

  const url = normalizeSupabaseUrl(resolvedUrl);
  const anonKey = normalizeSupabaseKey(resolvedKey);

  if (!url || !anonKey) {
    throw new Error(
      'Variables Supabase manquantes : configurez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return { url, anonKey };
}
