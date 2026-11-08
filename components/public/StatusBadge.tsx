import type { ListingStatus } from '@/lib/types/database';
import { getStatusLabel } from '@/lib/utils/format';

interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

const STATUS_STYLES: Record<ListingStatus, string> = {
  disponible:
    'border-[var(--dw-status-available-border)] bg-[var(--dw-status-available-bg)] text-[var(--dw-status-available-text)]',
  reserve:
    'border-[var(--dw-status-reserved-border)] bg-[var(--dw-status-reserved-bg)] text-[var(--dw-status-reserved-text)]',
  vendu:
    'border-[var(--dw-status-sold-border)] bg-[var(--dw-status-sold-bg)] text-[var(--dw-status-sold-text)]',
};

const DOT_STYLES: Record<ListingStatus, string> = {
  disponible: 'bg-emerald-600',
  reserve: 'bg-amber-600',
  vendu: 'bg-slate-500',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} aria-hidden="true" />
      <span>{getStatusLabel(status)}</span>
    </span>
  );
}
