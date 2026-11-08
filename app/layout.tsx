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
    'Basée à Kolda, l’agence DoorWaarSERVICE vous accompagne dans l’acquisition de terrains vérifiés et la location d’appartements meublés dans toute la région de Kolda (Haute-Casamance) : Kolda, Vélingara, Diaobé et Médina Yoro Foulah.',
  keywords: [
    'DoorWaarSERVICE',
    'immobilier Kolda',
    'terrain à vendre Kolda',
    'terrain Vélingara',
    'appartement meublé Kolda',
    'Bouna Kane',
    'Sikilo Kolda',
    'Diaobé',
    'Haute-Casamance',
    'Sénégal',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: 'DoorWaarSERVICE',
    title: 'DoorWaarSERVICE | Terrains et appartements meublés à Kolda',
    description:
      'Terrains titrés ou viabilisés et appartements meublés prêts à vivre à Kolda, Vélingara, Diaobé et Médina Yoro Foulah.',
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
