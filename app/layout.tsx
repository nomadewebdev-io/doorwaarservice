import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { siteConfig, getLocalBusinessJsonLd } from '@/src/config/site';

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: siteConfig.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = getLocalBusinessJsonLd();

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
