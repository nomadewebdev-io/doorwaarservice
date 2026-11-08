import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-text">
        Erreur 404
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">
        Page ou annonce introuvable
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink-secondary">
        Cette annonce a peut-être été retirée ou l’adresse saisie est incorrecte.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-5 text-sm font-semibold text-white hover:bg-navy-soft"
        >
          <ArrowLeft className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
          <span>Retour à l’accueil</span>
        </Link>
        <Link
          href="/catalogue"
          className="inline-flex h-11 items-center rounded-md border border-border-strong bg-surface px-5 text-sm font-semibold text-navy hover:bg-sand"
        >
          Parcourir le catalogue
        </Link>
      </div>
    </div>
  );
}
