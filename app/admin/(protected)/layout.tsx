import type { Metadata } from 'next';
import { AdminNavBar } from '@/components/admin/AdminNavBar';
import { requireStaffProfile } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Administration | DoorWaarSERVICE',
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireStaffProfile();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AdminNavBar profile={profile} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

