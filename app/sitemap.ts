import type { MetadataRoute } from 'next';
import { getPublicListings } from '@/lib/data/listings-service';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${siteUrl}/catalogue`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const listings = await getPublicListings();
  const listingPages: MetadataRoute.Sitemap = listings.map((item) => ({
    url: `${siteUrl}/annonces/${item.slug}`,
    lastModified: new Date(item.updated_at || item.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...listingPages];
}

