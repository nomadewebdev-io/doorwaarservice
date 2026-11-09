import { OwnerDashboardClient } from '@/components/admin/OwnerDashboardClient';
import { requireOwnerProfile } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Commission, Inquiry, SaleWithDetails } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

interface RawSaleRow extends Omit<SaleWithDetails, 'commission'> {
  commission: Commission | Commission[] | null;
}

export default async function OwnerDashboardPage() {
  await requireOwnerProfile();
  const supabase = await createSupabaseServerClient();

  const [{ data: settingsData }, { data: salesData }, { data: inquiriesData }] =
    await Promise.all([
      supabase.from('settings').select('default_commission_rate').eq('id', 1).maybeSingle(),
      supabase
        .from('sales')
        .select(
          '*, listing:listings(id, slug, title, property_type, city, neighborhood), agent:profiles(id, full_name, email), commission:commissions(*)',
        )
        .order('sold_at', { ascending: false }),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
    ]);

  const defaultRate = Number(settingsData?.default_commission_rate ?? 5);

  const normalizedSales: SaleWithDetails[] = ((salesData as RawSaleRow[]) ?? []).map(
    (row) => ({
      ...row,
      commission: Array.isArray(row.commission)
        ? (row.commission[0] ?? null)
        : (row.commission ?? null),
    }),
  );

  return (
    <OwnerDashboardClient
      initialCommissionRate={Number.isFinite(defaultRate) ? defaultRate : 5}
      initialSales={normalizedSales}
      initialInquiries={(inquiriesData as Inquiry[]) ?? []}
    />
  );
}

