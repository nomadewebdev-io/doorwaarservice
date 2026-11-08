-- DoorWaarSERVICE - Schéma PostgreSQL complet, fonctions métier et politiques RLS strictes
-- Exécuter dans l'éditeur SQL de Supabase ou via `supabase db push`

create extension if not exists pgcrypto;

-- 1. Profils utilisateurs liés à auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  role text not null default 'agent' check (role in ('agent', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Paramètres agence (taux de commission par défaut configurable, 5 % initial)
create table if not exists public.agency_settings (
  id integer primary key default 1 check (id = 1),
  default_commission_rate numeric(5,2) not null default 5.00
    check (default_commission_rate >= 0 and default_commission_rate <= 100),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.agency_settings (id, default_commission_rate)
values (1, 5.00)
on conflict (id) do nothing;

-- 3. Annonces immobilières (terrains à vendre & appartements meublés)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(trim(title)) >= 5),
  property_type text not null check (property_type in ('terrain', 'appartement')),
  transaction_type text not null check (transaction_type in ('vente', 'location')),
  status text not null default 'disponible' check (status in ('disponible', 'reserve', 'vendu')),
  price_fcfa bigint not null check (price_fcfa > 0),
  price_period text not null default 'total' check (price_period in ('total', 'mois', 'nuit')),
  city text not null,
  neighborhood text not null,
  address_landmark text,
  surface_sqm integer check (surface_sqm is null or surface_sqm > 0),
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),
  legal_status text check (
    legal_status is null
    or legal_status in ('Titre Foncier', 'Bail', 'Délibération', 'Contrat de bail meublé')
  ),
  amenities text[] not null default '{}',
  description text not null check (char_length(trim(description)) >= 20),
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_status_published on public.listings (is_published, status, created_at desc);
create index if not exists idx_listings_type_city on public.listings (property_type, city, neighborhood);

-- 4. Photos des annonces
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_listing_images_listing_id on public.listing_images (listing_id, sort_order asc);

-- 5. Demandes clients (visites d'annonces & contact général)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  listing_title text,
  inquiry_type text not null default 'visite' check (inquiry_type in ('visite', 'contact')),
  full_name text not null check (char_length(trim(full_name)) >= 2),
  phone text not null check (char_length(trim(phone)) >= 6),
  email text,
  preferred_channel text not null default 'whatsapp' check (preferred_channel in ('whatsapp', 'telephone', 'email')),
  preferred_visit_date date,
  message text not null check (char_length(trim(message)) >= 5),
  status text not null default 'nouvelle' check (status in ('nouvelle', 'contactee', 'planifiee', 'cloturee')),
  owner_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inquiries_created_at on public.inquiries (created_at desc);
create index if not exists idx_inquiries_status on public.inquiries (status);

-- 6. Ventes finalisées (obligatoire lorsqu'une annonce passe à 'vendu')
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings(id) on delete restrict,
  agent_id uuid references public.profiles(id) on delete set null,
  listed_price_fcfa bigint not null check (listed_price_fcfa > 0),
  final_sale_price_fcfa bigint not null check (final_sale_price_fcfa > 0),
  buyer_name text,
  buyer_phone text,
  notes text,
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_sold_at on public.sales (sold_at desc);

-- 7. Commissions automatiques associées aux ventes
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null unique references public.sales(id) on delete cascade,
  agent_id uuid references public.profiles(id) on delete set null,
  rate_percent numeric(5,2) not null check (rate_percent >= 0 and rate_percent <= 100),
  amount_fcfa bigint not null check (amount_fcfa >= 0),
  status text not null default 'due' check (status in ('due', 'payee')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_commissions_status on public.commissions (status, created_at desc);

-- Fonctions utilitaires de rôle (SECURITY DEFINER pour éviter la récursion RLS)
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_agent_or_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role in ('agent', 'owner') from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'owner' from public.profiles where id = auth.uid()), false)
$$;

-- Trigger générique updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_inquiries_updated_at on public.inquiries;
create trigger trg_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

drop trigger if exists trg_commissions_updated_at on public.commissions;
create trigger trg_commissions_updated_at
  before update on public.commissions
  for each row execute function public.set_updated_at();

-- Empêcher un utilisateur authentifié de s'auto-promouvoir au rôle owner
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.role() <> 'service_role' and not public.is_owner() then
      raise exception 'Seul un administrateur propriétaire peut modifier un rôle.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_role_guard on public.profiles;
create trigger trg_profiles_role_guard
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- Empêcher le passage au statut 'vendu' sans enregistrement de vente associé
create or replace function public.enforce_sale_before_vendu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'vendu' and old.status is distinct from 'vendu' then
    if not exists (select 1 from public.sales where listing_id = new.id) then
      raise exception 'Le passage au statut Vendu exige la saisie du prix de vente final via mark_listing_sold.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_listings_enforce_sale on public.listings;
create trigger trg_listings_enforce_sale
  before update on public.listings
  for each row execute function public.enforce_sale_before_vendu();

-- Calcul et création automatique de la commission à chaque insertion dans sales
create or replace function public.create_commission_on_sale()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rate numeric(5,2);
  v_commission bigint;
begin
  select default_commission_rate into v_rate
  from public.agency_settings
  where id = 1;

  v_rate := coalesce(v_rate, 5.00);
  v_commission := round((new.final_sale_price_fcfa::numeric * v_rate) / 100.0)::bigint;

  insert into public.commissions (
    sale_id,
    agent_id,
    rate_percent,
    amount_fcfa,
    status
  ) values (
    new.id,
    new.agent_id,
    v_rate,
    v_commission,
    'due'
  );

  return new;
end;
$$;

drop trigger if exists trg_sales_auto_commission on public.sales;
create trigger trg_sales_auto_commission
  after insert on public.sales
  for each row execute function public.create_commission_on_sale();

-- RPC transactionnel pour marquer un bien Vendu avec prix final obligatoire
create or replace function public.mark_listing_sold(
  p_listing_id uuid,
  p_final_sale_price_fcfa bigint,
  p_buyer_name text default null,
  p_buyer_phone text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.listings%rowtype;
  v_sale_id uuid;
begin
  if not public.is_agent_or_owner() then
    raise exception 'Accès refusé : rôle agent ou propriétaire requis.';
  end if;

  if p_final_sale_price_fcfa is null or p_final_sale_price_fcfa <= 0 then
    raise exception 'Le prix de vente final en FCFA doit être supérieur à zéro.';
  end if;

  select * into v_listing
  from public.listings
  where id = p_listing_id
  for update;

  if not found then
    raise exception 'Annonce introuvable.';
  end if;

  if v_listing.status = 'vendu' then
    raise exception 'Cette annonce est déjà marquée comme vendue.';
  end if;

  insert into public.sales (
    listing_id,
    agent_id,
    listed_price_fcfa,
    final_sale_price_fcfa,
    buyer_name,
    buyer_phone,
    notes,
    sold_at
  ) values (
    v_listing.id,
    auth.uid(),
    v_listing.price_fcfa,
    p_final_sale_price_fcfa,
    nullif(trim(p_buyer_name), ''),
    nullif(trim(p_buyer_phone), ''),
    nullif(trim(p_notes), ''),
    now()
  )
  returning id into v_sale_id;

  update public.listings
  set status = 'vendu',
      updated_at = now()
  where id = v_listing.id;

  return v_sale_id;
end;
$$;

-- Activation RLS sur toutes les tables
alter table public.profiles enable row level security;
alter table public.agency_settings enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.sales enable row level security;
alter table public.commissions enable row level security;

-- Politiques RLS : profiles
drop policy if exists "profiles_select_self_or_owner" on public.profiles;
create policy "profiles_select_self_or_owner"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_owner());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_owner())
  with check (auth.uid() = id or public.is_owner());

-- Politiques RLS : agency_settings
drop policy if exists "agency_settings_select_staff" on public.agency_settings;
create policy "agency_settings_select_staff"
  on public.agency_settings for select
  to authenticated
  using (public.is_agent_or_owner());

drop policy if exists "agency_settings_update_owner" on public.agency_settings;
create policy "agency_settings_update_owner"
  on public.agency_settings for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- Politiques RLS : listings
drop policy if exists "listings_select_public_or_staff" on public.listings;
create policy "listings_select_public_or_staff"
  on public.listings for select
  to anon, authenticated
  using (is_published = true or public.is_agent_or_owner());

drop policy if exists "listings_insert_staff" on public.listings;
create policy "listings_insert_staff"
  on public.listings for insert
  to authenticated
  with check (public.is_agent_or_owner() and (created_by is null or created_by = auth.uid()));

drop policy if exists "listings_update_staff" on public.listings;
create policy "listings_update_staff"
  on public.listings for update
  to authenticated
  using (public.is_agent_or_owner())
  with check (public.is_agent_or_owner());

drop policy if exists "listings_delete_staff" on public.listings;
create policy "listings_delete_staff"
  on public.listings for delete
  to authenticated
  using (public.is_agent_or_owner());

-- Politiques RLS : listing_images
drop policy if exists "listing_images_select_public_or_staff" on public.listing_images;
create policy "listing_images_select_public_or_staff"
  on public.listing_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.is_published = true or public.is_agent_or_owner())
    )
  );

drop policy if exists "listing_images_insert_staff" on public.listing_images;
create policy "listing_images_insert_staff"
  on public.listing_images for insert
  to authenticated
  with check (public.is_agent_or_owner());

drop policy if exists "listing_images_update_staff" on public.listing_images;
create policy "listing_images_update_staff"
  on public.listing_images for update
  to authenticated
  using (public.is_agent_or_owner())
  with check (public.is_agent_or_owner());

drop policy if exists "listing_images_delete_staff" on public.listing_images;
create policy "listing_images_delete_staff"
  on public.listing_images for delete
  to authenticated
  using (public.is_agent_or_owner());

-- Politiques RLS : inquiries
-- Insertion publique autorisée (statut forcé à 'nouvelle'), lecture/mise à jour réservées à owner
drop policy if exists "inquiries_insert_public" on public.inquiries;
create policy "inquiries_insert_public"
  on public.inquiries for insert
  to anon, authenticated
  with check (status = 'nouvelle');

drop policy if exists "inquiries_select_owner" on public.inquiries;
create policy "inquiries_select_owner"
  on public.inquiries for select
  to authenticated
  using (public.is_owner());

drop policy if exists "inquiries_update_owner" on public.inquiries;
create policy "inquiries_update_owner"
  on public.inquiries for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "inquiries_delete_owner" on public.inquiries;
create policy "inquiries_delete_owner"
  on public.inquiries for delete
  to authenticated
  using (public.is_owner());

-- Politiques RLS : sales (création atomique uniquement via RPC mark_listing_sold)
drop policy if exists "sales_select_owner_or_own_agent" on public.sales;
create policy "sales_select_owner_or_own_agent"
  on public.sales for select
  to authenticated
  using (public.is_owner() or (public.is_agent_or_owner() and agent_id = auth.uid()));

drop policy if exists "sales_insert_staff" on public.sales;

drop policy if exists "sales_update_owner" on public.sales;
create policy "sales_update_owner"
  on public.sales for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- Politiques RLS : commissions (lecture et gestion strictement réservées au rôle owner)
drop policy if exists "commissions_select_owner" on public.commissions;
create policy "commissions_select_owner"
  on public.commissions for select
  to authenticated
  using (public.is_owner());

drop policy if exists "commissions_update_owner" on public.commissions;
create policy "commissions_update_owner"
  on public.commissions for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- Bucket Supabase Storage pour les photos d'annonces
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listing_images_bucket_public_read" on storage.objects;
create policy "listing_images_bucket_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'listing-images');

drop policy if exists "listing_images_bucket_staff_insert" on storage.objects;
create policy "listing_images_bucket_staff_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images' and public.is_agent_or_owner());

drop policy if exists "listing_images_bucket_staff_update" on storage.objects;
create policy "listing_images_bucket_staff_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'listing-images' and public.is_agent_or_owner())
  with check (bucket_id = 'listing-images' and public.is_agent_or_owner());

drop policy if exists "listing_images_bucket_staff_delete" on storage.objects;
create policy "listing_images_bucket_staff_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'listing-images' and public.is_agent_or_owner());
