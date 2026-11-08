'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

const BUDGET_PRESETS = [
  { label: 'Tout budget', value: '' },
  { label: 'Jusqu’à 500 000 FCFA (location)', value: '500000' },
  { label: 'Jusqu’à 1 000 000 FCFA (location)', value: '1000000' },
  { label: 'Jusqu’à 20 000 000 FCFA (terrain)', value: '20000000' },
  { label: 'Jusqu’à 35 000 000 FCFA (terrain)', value: '35000000' },
  { label: 'Jusqu’à 60 000 000 FCFA', value: '60000000' },
];

export function QuickSearchBar() {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState<'tous' | 'terrain' | 'appartement'>('tous');
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (propertyType !== 'tous') params.set('type', propertyType);
    if (location.trim()) params.set('location', location.trim());
    if (maxPrice) params.set('maxPrice', maxPrice);

    const queryString = params.toString();
    router.push(queryString ? `/catalogue?${queryString}` : '/catalogue');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm sm:p-5"
      aria-label="Recherche rapide de biens"
    >
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12 md:items-end">
        <div className="md:col-span-3">
          <label
            htmlFor="quick-type"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-secondary"
          >
            Type de bien
          </label>
          <select
            id="quick-type"
            value={propertyType}
            onChange={(e) =>
              setPropertyType(e.target.value as 'tous' | 'terrain' | 'appartement')
            }
            className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm font-medium text-ink focus:border-navy focus:outline-none"
          >
            <option value="tous">Terrains &amp; Appartements</option>
            <option value="terrain">Terrains à vendre</option>
            <option value="appartement">Appartements meublés</option>
          </select>
        </div>

        <div className="md:col-span-4">
          <label
            htmlFor="quick-location"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-secondary"
          >
            Ville ou quartier
          </label>
          <input
            id="quick-location"
            type="text"
            list="senegal-locations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex : Almadies, Diamniadio, Saly, Point E..."
            className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none"
          />
          <datalist id="senegal-locations">
            <option value="Les Almadies" />
            <option value="Ngor" />
            <option value="Point E" />
            <option value="Mermoz" />
            <option value="Sacré-Cœur" />
            <option value="Diamniadio" />
            <option value="Saly Portudal" />
            <option value="Lac Rose" />
            <option value="Thiès" />
          </datalist>
        </div>

        <div className="md:col-span-3">
          <label
            htmlFor="quick-budget"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-secondary"
          >
            Budget maximum
          </label>
          <select
            id="quick-budget"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-11 w-full rounded-md border border-border-strong bg-canvas px-3 text-sm font-medium text-ink focus:border-navy focus:outline-none"
          >
            {BUDGET_PRESETS.map((preset) => (
              <option key={preset.label} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-soft"
          >
            <Search className="h-4 w-4 text-gold-light" strokeWidth={1.75} />
            <span>Rechercher</span>
          </button>
        </div>
      </div>
    </form>
  );
}
