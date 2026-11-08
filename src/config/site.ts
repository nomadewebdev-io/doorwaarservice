/**
 * Configuration principale de DoorWaarSERVICE
 * Source unique de vérité pour l'identité, les coordonnées et le référencement.
 * Ne rien dupliquer en dur dans les composants.
 */

export interface SiteConfig {
  name: string;
  slogan: string;
  zone: string;
  region: string;
  whatsapp: {
    raw: string; // Format international sans espace pour liens wa.me (221774898243)
    display: string; // Format lisible pour l'affichage (+221 77 489 82 43)
  };
  phone: {
    raw: string;
    display: string;
  };
  // Laissés vides et masqués automatiquement dans l'UI tant qu'ils ne sont pas renseignés
  address: string;
  email: string;
  hours: string;
  neighborhoods: string[];
  siteUrl: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const siteConfig: SiteConfig = {
  name: 'DoorWaarSERVICE',
  slogan: 'Terrains et appartements meublés au Sénégal',
  zone: 'Kolda',
  region: 'Région de Kolda, Sénégal',
  whatsapp: {
    raw: '221774898243',
    display: '+221 77 489 82 43',
  },
  phone: {
    raw: '+221774898243',
    display: '+221 77 489 82 43',
  },
  address: '',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.CONTACT_EMAIL || 'kingzaf97@gmail.com',
  hours: 'Service en ligne, demandes acceptées 24h/24',
  neighborhoods: [],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://doorwaarservice.sn',
  seo: {
    title: 'DoorWaarSERVICE | Terrains et appartements meublés à Kolda',
    description:
      'DoorWaarSERVICE sélectionne des terrains vérifiés et des appartements meublés prêts à vivre à Kolda (Sénégal). Prix transparents en FCFA et accompagnement sécurisé.',
    keywords: [
      'DoorWaarSERVICE',
      'immobilier Kolda',
      'terrain à vendre Kolda',
      'appartement meublé Kolda',
      'location meublée Kolda',
      'foncier Kolda',
      'Kolda Sénégal',
    ],
  },
};

/**
 * Construit un lien WhatsApp (wa.me) pré-rempli vers le numéro officiel.
 * Si le titre de l'annonce est précisé, il est inclus dans le message.
 */
export function buildWhatsAppUrl(listingTitle?: string | null, customMessage?: string): string {
  if (customMessage) {
    return `https://wa.me/${siteConfig.whatsapp.raw}?text=${encodeURIComponent(customMessage)}`;
  }

  if (listingTitle && listingTitle.trim()) {
    const message = `Bonjour ${siteConfig.name}, je suis intéressé(e) par votre annonce "${listingTitle.trim()}" à ${siteConfig.zone}. Pouvez-vous me donner plus d'informations pour une visite ?`;
    return `https://wa.me/${siteConfig.whatsapp.raw}?text=${encodeURIComponent(message)}`;
  }

  const defaultMessage = `Bonjour ${siteConfig.name}, je souhaite des informations sur vos terrains et appartements meublés à ${siteConfig.zone}.`;
  return `https://wa.me/${siteConfig.whatsapp.raw}?text=${encodeURIComponent(defaultMessage)}`;
}

/**
 * Génère le schéma JSON-LD LocalBusiness / RealEstateAgent pour le SEO.
 * Les champs optionnels (adresse, email, horaires) sont inclus uniquement s'ils sont renseignés.
 */
export function getLocalBusinessJsonLd() {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteConfig.name,
    description: siteConfig.seo.description,
    url: siteConfig.siteUrl,
    telephone: siteConfig.phone.display,
    priceRange: 'FCFA',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: siteConfig.zone,
      containedInPlace: {
        '@type': 'Country',
        name: 'Sénégal',
      },
    },
  };

  if (siteConfig.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address,
      addressLocality: siteConfig.zone,
      addressCountry: 'SN',
    };
  }

  if (siteConfig.email) {
    jsonLd.email = siteConfig.email;
  }

  if (siteConfig.hours) {
    jsonLd.openingHours = siteConfig.hours;
  }

  return jsonLd;
}

