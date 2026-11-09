# Guide de déploiement Supabase DoorWaarSERVICE
1. Créer un projet sur https://supabase.com et récupérer l'URL et les clés API.
2. Copier `.env.example` vers `.env.local` et renseigner les clés Supabase.
3. Dans Supabase SQL Editor, exécuter l'intégralité de `supabase/migrations/001_init.sql`.
4. Dans Authentication > Users, créer 2 utilisateurs (un compte Owner et un compte Agent).
5. Dans `supabase/seed_roles.sql`, renseigner vos 2 emails puis exécuter le script.
6. (Optionnel) Exécuter `supabase/seed.sql` pour importer les annonces initiales à Kolda.
7. Démarrer l'application avec `npm run build && npm start` (ou `npm run dev`).
8. Se connecter sur `/admin/login` pour tester les accès Owner et Agent.
