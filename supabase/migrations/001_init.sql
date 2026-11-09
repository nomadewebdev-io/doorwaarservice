-- DoorWaarSERVICE - Initialisation complète et idempotente de la base Supabase
-- Exécutable dans l'éditeur SQL de Supabase ou via `supabase db push`

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- 1.1 Profils utilisateurs (liés à auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  role text not null default 'agent' check (role in ('agent', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1.2 Paramètres de l'agence (taux de commission par défaut, 5 % initial)
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  default_commission_rate numeric(5,2) not null default 5.00
    check (default_commission_rate >= 0 and default_commission_rate <= 100),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.settings (id, default_commission_rate)
values (1, 5.00)
on conflict (id) do nothing;

-- Vue rétro-compatible pour l'ancien nom agency_settings si nécessaire
create or replace view public.agency_settings as
  select * from public.settings;

-- 1.3 Annonces immobilières (terrains à vendre & appartements meublés)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(trim(title)) >= 5),
  property_type text not null check (property_type in ('terrain', 'appartement')),
  transaction_type text not null check (transaction_type in ('vente', 'location')),
  status text not null default 'disponible' check (status in ('disponible', 'reserve', 'vendu', 'loue', 'en_attente')),
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
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_status_published on public.listings (is_published, status, created_at desc);
create index if not exists idx_listings_type_city on public.listings (property_type, city, neighborhood);
create index if not exists idx_listings_created_by on public.listings (created_by);

-- 1.4 Photos des annonces
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

-- 1.5 Demandes clients (visites & contact)
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

-- 1.6 Historique des changements de statut d'annonce (audit append-only)
create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  old_status text,
  new_status text not null,
  price_fcfa bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_status_history_listing on public.status_history (listing_id, created_at desc);

-- 1.7 Ventes finalisées
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

-- 1.8 Commissions automatiques (terrains vendus uniquement)
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

-- ============================================================================
-- 2. FONCTIONS DE RÔLE & SÉCURITÉ
-- ============================================================================

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
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

create or replace function public.is_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'agent' from public.profiles where id = auth.uid()), false)
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

-- Trigger updated_at générique
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

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
  before update on public.settings
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

-- ============================================================================
-- 3. TRIGGERS MÉTIER EXIGÉS
-- ============================================================================

-- 3.1 Création automatique d'un profil 'agent' à chaque nouvel utilisateur auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'Agent DoorWaarSERVICE'
    ),
    'agent'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3.2 Empêcher un utilisateur non-owner de modifier son rôle ou celui d'un autre
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.role() <> 'service_role' and not public.is_owner() then
      raise exception 'Seul un propriétaire administrateur peut modifier un rôle utilisateur.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_role_guard on public.profiles;
create trigger trg_profiles_role_guard
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- 3.3 Enregistrement dans status_history à chaque changement de statut
create or replace function public.log_listing_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price bigint;
begin
  if tg_op = 'INSERT' then
    insert into public.status_history (
      listing_id,
      changed_by,
      old_status,
      new_status,
      price_fcfa,
      created_at
    ) values (
      new.id,
      coalesce(auth.uid(), new.created_by),
      null,
      new.status,
      new.price_fcfa,
      now()
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    select final_sale_price_fcfa into v_price
    from public.sales
    where listing_id = new.id
    order by created_at desc
    limit 1;

    v_price := coalesce(v_price, new.price_fcfa);

    insert into public.status_history (
      listing_id,
      changed_by,
      old_status,
      new_status,
      price_fcfa,
      created_at
    ) values (
      new.id,
      auth.uid(),
      old.status,
      new.status,
      v_price,
      now()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_listings_status_history on public.listings;
create trigger trg_listings_status_history
  after insert or update on public.listings
  for each row execute function public.log_listing_status_change();

-- 3.4 Table status_history non modifiable ni supprimable par l'agent
create or replace function public.prevent_status_history_tampering()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_owner() and auth.role() <> 'service_role' then
    raise exception 'Table status_history non modifiable ni supprimable par l''agent.';
  end if;
  return null;
end;
$$;

drop trigger if exists trg_status_history_tampering on public.status_history;
create trigger trg_status_history_tampering
  before update or delete on public.status_history
  for each row execute function public.prevent_status_history_tampering();

-- 3.5 Passage d'un terrain à "Vendu" sans prix de vente = refusé
create or replace function public.check_listing_vendu_requirements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'vendu' and old.status is distinct from 'vendu' then
    if new.property_type = 'terrain' then
      if not exists (
        select 1 from public.sales
        where listing_id = new.id and final_sale_price_fcfa > 0
      ) then
        raise exception 'Passage au statut Vendu refusé : le prix de vente final est obligatoire pour un terrain.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_listings_check_vendu on public.listings;
create trigger trg_listings_check_vendu
  before update on public.listings
  for each row execute function public.check_listing_vendu_requirements();

-- 3.6 Création automatique de commission (taux lu dans settings, défaut 5 %). Aucune commission sur les locations.
create or replace function public.create_commission_on_sale()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prop_type text;
  v_rate numeric(5,2);
  v_commission bigint;
begin
  select property_type into v_prop_type
  from public.listings
  where id = new.listing_id;

  -- Aucune commission sur les locations (appartements) : commissions réservées aux ventes de terrains
  if v_prop_type = 'terrain' then
    select default_commission_rate into v_rate
    from public.settings
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
    )
    on conflict (sale_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sales_auto_commission on public.sales;
create trigger trg_sales_auto_commission
  after insert on public.sales
  for each row execute function public.create_commission_on_sale();

-- 3.7 Une annonce Loué/Vendu ne peut pas être supprimée par l'agent (archivage seulement)
create or replace function public.prevent_delete_sold_or_rented_listings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status in ('vendu', 'loue') and not public.is_owner() and auth.role() <> 'service_role' then
    raise exception 'Une annonce vendue ou louée ne peut pas être supprimée par un agent. Veuillez l''archiver (dépublier) à la place.';
  end if;
  return old;
end;
$$;

drop trigger if exists trg_prevent_delete_sold_listings on public.listings;
create trigger trg_prevent_delete_sold_listings
  before delete on public.listings
  for each row execute function public.prevent_delete_sold_or_rented_listings();

-- 3.8 Procédure stockée transactionnelle mark_listing_sold
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

  if not public.is_owner() and v_listing.created_by is distinct from auth.uid() then
    raise exception 'Accès refusé : un agent ne peut clôturer que ses propres annonces.';
  end if;

  if v_listing.status = 'vendu' then
    raise exception 'Cette annonce est déjà marquée comme vendue.';
  end if;

  -- 1. Enregistrement de la vente
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

  -- 2. Mise à jour de l'annonce à Vendu
  update public.listings
  set status = 'vendu',
      updated_at = now()
  where id = v_listing.id;

  return v_sale_id;
end;
$$;

grant execute on function public.mark_listing_sold(uuid, bigint, text, text, text) to authenticated;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS STRICTE)
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.status_history enable row level security;
alter table public.sales enable row level security;
alter table public.commissions enable row level security;

-- 4.1 Profiles : lecture/modification de son propre profil, accès total pour owner
drop policy if exists "profiles_select_self_or_owner" on public.profiles;
create policy "profiles_select_self_or_owner"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_owner());

drop policy if exists "profiles_update_self_or_owner" on public.profiles;
create policy "profiles_update_self_or_owner"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_owner())
  with check (auth.uid() = id or public.is_owner());

-- 4.2 Settings : accès réservé exclusivement au rôle owner (jamais agent)
drop policy if exists "settings_all_owner" on public.settings;
create policy "settings_all_owner"
  on public.settings for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 4.3 Listings :
-- - public = lecture des annonces publiées uniquement (jamais "En attente")
-- - agent = ses propres annonces uniquement
-- - owner = accès total
drop policy if exists "listings_select_public" on public.listings;
create policy "listings_select_public"
  on public.listings for select
  to anon
  using (is_published = true and status <> 'en_attente');

drop policy if exists "listings_select_authenticated" on public.listings;
create policy "listings_select_authenticated"
  on public.listings for select
  to authenticated
  using (
    public.is_owner()
    or created_by = auth.uid()
    or (is_published = true and status <> 'en_attente')
  );

drop policy if exists "listings_insert_staff" on public.listings;
create policy "listings_insert_staff"
  on public.listings for insert
  to authenticated
  with check (
    public.is_owner()
    or (public.is_agent() and created_by = auth.uid())
  );

drop policy if exists "listings_update_staff" on public.listings;
create policy "listings_update_staff"
  on public.listings for update
  to authenticated
  using (
    public.is_owner()
    or (public.is_agent() and created_by = auth.uid())
  )
  with check (
    public.is_owner()
    or (public.is_agent() and created_by = auth.uid())
  );

drop policy if exists "listings_delete_staff" on public.listings;
create policy "listings_delete_staff"
  on public.listings for delete
  to authenticated
  using (
    public.is_owner()
    or (
      public.is_agent()
      and created_by = auth.uid()
      and status not in ('vendu', 'loue')
    )
  );

-- 4.4 Listing Images :
-- - public = photos des annonces publiées uniquement
-- - agent = photos de ses propres annonces uniquement
-- - owner = accès total
drop policy if exists "listing_images_select_public" on public.listing_images;
create policy "listing_images_select_public"
  on public.listing_images for select
  to anon
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.is_published = true
        and l.status <> 'en_attente'
    )
  );

drop policy if exists "listing_images_select_authenticated" on public.listing_images;
create policy "listing_images_select_authenticated"
  on public.listing_images for select
  to authenticated
  using (
    public.is_owner()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.created_by = auth.uid()
    )
    or exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.is_published = true
        and l.status <> 'en_attente'
    )
  );

drop policy if exists "listing_images_insert_staff" on public.listing_images;
create policy "listing_images_insert_staff"
  on public.listing_images for insert
  to authenticated
  with check (
    public.is_owner()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.created_by = auth.uid()
    )
  );

drop policy if exists "listing_images_update_staff" on public.listing_images;
create policy "listing_images_update_staff"
  on public.listing_images for update
  to authenticated
  using (
    public.is_owner()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.created_by = auth.uid()
    )
  )
  with check (
    public.is_owner()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.created_by = auth.uid()
    )
  );

drop policy if exists "listing_images_delete_staff" on public.listing_images;
create policy "listing_images_delete_staff"
  on public.listing_images for delete
  to authenticated
  using (
    public.is_owner()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.created_by = auth.uid()
    )
  );

-- 4.5 Inquiries :
-- - public = insertion autorisée
-- - owner = accès total
drop policy if exists "inquiries_insert_public" on public.inquiries;
create policy "inquiries_insert_public"
  on public.inquiries for insert
  to anon, authenticated
  with check (status = 'nouvelle');

drop policy if exists "inquiries_owner_all" on public.inquiries;
create policy "inquiries_owner_all"
  on public.inquiries for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 4.6 Status History :
-- - agent = consultation de ses propres annonces uniquement, aucune modification ni suppression
-- - owner = consultation complète
drop policy if exists "status_history_select_staff" on public.status_history;
create policy "status_history_select_staff"
  on public.status_history for select
  to authenticated
  using (
    public.is_owner()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.created_by = auth.uid()
    )
  );

drop policy if exists "status_history_owner_all" on public.status_history;
create policy "status_history_owner_all"
  on public.status_history for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 4.7 Sales :
-- - réservé exclusivement au rôle owner (jamais agent)
drop policy if exists "sales_owner_all" on public.sales;
create policy "sales_owner_all"
  on public.sales for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 4.8 Commissions :
-- - réservé exclusivement au rôle owner (jamais agent)
drop policy if exists "commissions_owner_all" on public.commissions;
create policy "commissions_owner_all"
  on public.commissions for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================================
-- 5. BUCKET STORAGE "listing-images"
-- ============================================================================
-- Lecture publique, écriture réservée aux utilisateurs connectés sur leur propre dossier,
-- types image uniquement, taille max 5 Mo (5242880 octets).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "listing_images_bucket_public_read" on storage.objects;
create policy "listing_images_bucket_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'listing-images');

drop policy if exists "listing_images_bucket_user_folder_insert" on storage.objects;
create policy "listing_images_bucket_user_folder_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_owner()
    )
  );

drop policy if exists "listing_images_bucket_user_folder_update" on storage.objects;
create policy "listing_images_bucket_user_folder_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_owner()
    )
  )
  with check (
    bucket_id = 'listing-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_owner()
    )
  );

drop policy if exists "listing_images_bucket_user_folder_delete" on storage.objects;
create policy "listing_images_bucket_user_folder_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_owner()
    )
  );
