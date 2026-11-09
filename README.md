# DoorWaarSERVICE — Plateforme Immobilière (Kolda, Sénégal)

Site web immobilier complet pour **DoorWaarSERVICE** (*Terrains et appartements meublés au Sénégal* — activité dédiée à la région de Kolda / Haute-Casamance), conçu avec **Next.js (App Router)**, **Tailwind CSS** et **Supabase** (Auth, PostgreSQL, RLS strictes et Storage).

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

Consultez [SETUP.md](./SETUP.md) pour le guide rapide en 8 étapes :
1. Exécutez le script SQL idempotent [supabase/migrations/001_init.sql](./supabase/migrations/001_init.sql) dans **SQL Editor**.
2. Créez vos utilisateurs dans **Authentication → Users**.
3. Exécutez [supabase/seed_roles.sql](./supabase/seed_roles.sql) après avoir renseigné vos adresses e-mail pour assigner les rôles `owner` et `agent`.
4. (Optionnel) Exécutez [supabase/seed.sql](./supabase/seed.sql) pour charger les annonces initiales de Kolda.

## 3. Personnalisation des couleurs

Les couleurs bleu nuit et doré/sable sont centralisées dans [app/globals.css](./app/globals.css) sous `:root` (`--dw-bg-navy`, `--dw-accent-gold`, etc.).
