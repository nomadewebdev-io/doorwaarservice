'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  Building2,
  ExternalLink,
  LogOut,
  Plus,
} from 'lucide-react';
import type { Profile } from '@/lib/types/database';

interface AdminNavBarProps {
  profile: Profile;
}

export function AdminNavBar({ profile }: AdminNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }

  return (
    <header className="border-b border-navy-soft bg-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-md border border-white/15 bg-navy-deep text-xs font-bold text-white"
            >
              <span>DW</span>
              <span className="mt-0.5 h-0.5 w-5 rounded-full bg-gold" />
            </span>
            <span>
              <span className="block font-display text-sm font-bold text-white">
                DoorWaarSERVICE
              </span>
              <span className="block text-[11px] text-gold-light">
                Espace {profile.role === 'owner' ? 'Propriétaire' : 'Agent'}
              </span>
            </span>
          </Link>

          <nav aria-label="Navigation administration" className="flex items-center gap-1 sm:ml-4">
            <Link
              href="/admin"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                pathname === '/admin' || pathname.startsWith('/admin/annonces')
                  ? 'bg-navy-soft text-white'
                  : 'text-slate-300 hover:bg-navy-soft/60 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
              <span>Annonces</span>
            </Link>

            <Link
              href="/admin/annonces/nouvelle"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-navy-soft/60 hover:text-white sm:text-sm"
            >
              <Plus className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
              <span className="hidden sm:inline">Nouvelle annonce</span>
              <span className="sm:hidden">Ajouter</span>
            </Link>

            {profile.role === 'owner' ? (
              <Link
                href="/admin/owner"
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  pathname.startsWith('/admin/owner')
                    ? 'bg-gold text-navy-deep'
                    : 'text-gold-light hover:bg-navy-soft/60 hover:text-white'
                }`}
              >
                <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
                <span>Pilotage Owner</span>
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold text-white">{profile.full_name}</p>
            <p className="text-[11px] text-slate-300">{profile.email}</p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-gold-light hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Site public</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-md bg-navy-deep px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-red-950 hover:text-white disabled:opacity-60"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{signingOut ? '...' : 'Quitter'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

