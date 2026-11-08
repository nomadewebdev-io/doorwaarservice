# DoorWaarSERVICE — Plateforme Immobilière (Sénégal)

Site web immobilier complet pour **DoorWaarSERVICE** (*Terrains et appartements meublés au Sénégal*), conçu avec **Next.js (App Router)**, **Tailwind CSS** et **Supabase** (Auth, PostgreSQL, RLS strictes et Storage).

## 1. Démarrage local

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Copier `.env.example` vers `.env.local` et renseigner vos clés :
   ```bash
   cp .env.example .env.local
   ```
3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

> Sans configuration Supabase active, les pages publiques fonctionnent avec le jeu d'annonces de démonstration local. L'espace d'administration (`/admin`) nécessite Supabase Auth.

## 2. Mise en place de Supabase

1. Créez un projet Supabase.
2. Exécutez le script SQL [supabase/migrations/001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql) dans **SQL Editor** :
   - Crée les tables `profiles`, `agency_settings`, `listings`, `listing_images`, `inquiries`, `sales`, `commissions`.
   - Active les politiques **RLS strictes** par rôle (`agent` et `owner`) ainsi que l'insertion publique sur `inquiries`.
   - Installe la fonction transactionnelle `mark_listing_sold(...)` et le trigger calculant automatiquement la commission à chaque vente.
   - Crée le bucket public `listing-images` pour les photos.
3. (Optionnel) Exécutez [supabase/seed.sql](./supabase/seed.sql) pour charger des annonces initiales au Sénégal.
4. Créez vos comptes dans **Authentication → Users**, puis associez leur rôle dans `public.profiles` :
   ```sql
   insert into public.profiles (id, email, full_name, role)
   values
     ('<UUID_UTILISATEUR_OWNER>', 'direction@doorwaarservice.sn', 'Directeur DoorWaarSERVICE', 'owner'),
     ('<UUID_UTILISATEUR_AGENT>', 'agent@doorwaarservice.sn', 'Conseiller Terrain', 'agent');
   ```

## 3. Personnalisation des couleurs

Les couleurs bleu nuit et doré/sable sont centralisées dans [app/globals.css](./app/globals.css) sous `:root` (`--dw-bg-navy`, `--dw-accent-gold`, etc.).
