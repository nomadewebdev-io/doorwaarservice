'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface AdminLoginFormProps {
  supabaseReady: boolean;
  redirectTo: string;
  initialError?: string;
}

export function AdminLoginForm({
  supabaseReady,
  redirectTo,
  initialError,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError ?? null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabaseReady) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setErrorMsg(data?.error || 'email ou mot de passe incorrect');
        return;
      }

      // Synchronisation immédiate du client Supabase côté navigateur
      if (data.session) {
        try {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.setSession(data.session);
        } catch {
          // Les cookies HTTP du serveur gèrent la session principale
        }
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMsg('Erreur de connexion au service d’authentification.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!supabaseReady ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
          <p className="font-bold">Configuration Supabase requise</p>
          <p className="mt-1">
            Renseignez <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans{' '}
            <code className="font-mono">.env.local</code> puis exécutez la migration SQL pour
            activer la connexion agent et propriétaire.
          </p>
        </div>
      ) : null}

      {errorMsg ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
        >
          {errorMsg}
        </div>
      ) : null}

      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold text-navy">
          Adresse e-mail professionnelle
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!supabaseReady}
          placeholder="agent@doorwaarservice.sn"
          className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none disabled:opacity-60"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-navy">
          Mot de passe
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!supabaseReady}
          placeholder="••••••••"
          className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={!supabaseReady || submitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
            <span>Connexion...</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
            <span>Se connecter à l’espace pro</span>
          </>
        )}
      </button>
    </form>
  );
}
