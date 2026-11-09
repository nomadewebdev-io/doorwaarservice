-- ============================================================================
-- DoorWaarSERVICE - Migration 002 : Correction des policies RLS sur profiles
-- ============================================================================
-- Objectifs :
-- 1. Permettre à chaque utilisateur connecté (authenticated) de lire son propre profil :
--    auth.uid() = id (sans aucune récursion RLS).
-- 2. Permettre au rôle 'owner' de consulter et administrer l'ensemble des profils.
-- 3. Accorder explicitement les droits SELECT et UPDATE au rôle authenticated.
-- Idempotent : peut être ré-exécuté plusieurs fois sans générer d'erreur.
-- ============================================================================

-- 1. Fonctions utilitaires sécurisées (security definer avec search_path fixé)
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'owner' from public.profiles where id = auth.uid() limit 1),
    false
  );
$$;

create or replace function public.is_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'agent' from public.profiles where id = auth.uid() limit 1),
    false
  );
$$;

create or replace function public.is_agent_or_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('agent', 'owner') from public.profiles where id = auth.uid() limit 1),
    false
  );
$$;

-- 2. Activation formelle de RLS sur la table profiles
alter table public.profiles enable row level security;

-- 3. Suppression idempotente des anciennes policies pour éviter les conflits
drop policy if exists "profiles_select_self_or_owner" on public.profiles;
drop policy if exists "profiles_select_self" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_owner_all" on public.profiles;
drop policy if exists "profiles_update_self_or_owner" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_owner_all" on public.profiles;

-- 4. Policy de lecture propre : un utilisateur connecté lit sa propre ligne (auth.uid() = id)
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- 5. Policy de lecture élargie : un utilisateur owner peut lire tous les profils
create policy "profiles_select_owner_all"
  on public.profiles for select
  to authenticated
  using (public.is_owner());

-- 6. Policy de mise à jour propre : un utilisateur peut modifier son propre profil
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 7. Policy de mise à jour élargie : un owner peut modifier tous les profils
create policy "profiles_update_owner_all"
  on public.profiles for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 8. Permissions explicites sur le schéma et la table pour le rôle authenticated
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
