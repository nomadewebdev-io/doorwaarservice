import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connexion Espace Pro',
  robots: { index: false, follow: false },
};

interface AdminLoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const redirectTo =
    rawNext && rawNext.startsWith('/admin') && rawNext !== '/admin/login'
      ? rawNext
      : '/admin';

  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const initialError =
    errorCode === 'unauthorized'
      ? 'profil introuvable ou accès refusé'
      : undefined;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-7 shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-navy text-xs font-bold text-white"
          >
            <span>DW</span>
            <span className="mt-0.5 h-0.5 w-6 rounded-full bg-gold" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-navy">DoorWaarSERVICE</p>
            <p className="text-xs font-medium text-gold-text">
              Administration Agent &amp; Propriétaire
            </p>
          </div>
        </div>

        <h1 className="mt-6 font-display text-xl font-bold text-navy">
          Connexion sécurisée
        </h1>
        <p className="mt-1 text-xs text-ink-secondary">
          Accès réservé au personnel habilité (agents immobiliers et direction).
        </p>

        <div className="mt-6">
          <AdminLoginForm
            supabaseReady={isSupabaseConfigured()}
            redirectTo={redirectTo}
            initialError={initialError}
          />
        </div>

        <div className="mt-6 border-t border-border-subtle pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-navy"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Retour au site public DoorWaarSERVICE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

