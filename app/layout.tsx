import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DoorWaarSERVICE | Terrains et appartements meublés au Sénégal',
    template: '%s | DoorWaarSERVICE',
  },
  description:
    'DoorWaarSERVICE vous accompagne dans l’acquisition de terrains vérifiés et la location d’appartements meublés au Sénégal : Dakar, Diamniadio, Petite Côte et Thiès.',
  keywords: [
    'DoorWaarSERVICE',
    'immobilier Sénégal',
    'terrain à vendre Dakar',
    'terrain Diamniadio',
    'appartement meublé Dakar',
    'Almadies',
    'Saly',
    'location meublée Sénégal',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: 'DoorWaarSERVICE',
    title: 'DoorWaarSERVICE | Terrains et appartements meublés au Sénégal',
    description:
      'Terrains titrés ou viabilisés et appartements meublés prêts à vivre à Dakar, Diamniadio, Saly et Thiès.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
