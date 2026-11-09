-- DoorWaarSERVICE - Attribution des rôles Owner et Agent
-- Instructions : Remplacez __OWNER_EMAIL__ et __AGENT_EMAIL__ par les adresses e-mail réelles
-- des utilisateurs préalablement créés dans Supabase (Authentication > Users), puis exécutez ce script.

do $$
declare
  v_owner_email text := '__OWNER_EMAIL__';
  v_agent_email text := '__AGENT_EMAIL__';
  v_owner_id uuid;
  v_agent_id uuid;
begin
  -- 1. Attribution du rôle 'owner'
  select id into v_owner_id
  from auth.users
  where lower(email) = lower(v_owner_email);

  if v_owner_id is not null then
    insert into public.profiles (id, email, full_name, role)
    values (v_owner_id, v_owner_email, 'Direction DoorWaarSERVICE', 'owner')
    on conflict (id) do update set
      role = 'owner',
      email = excluded.email,
      updated_at = now();

    raise notice 'Utilisateur % (%) configuré avec succès avec le rôle OWNER.', v_owner_email, v_owner_id;
  else
    raise warning 'Utilisateur Owner introuvable pour l''email % : créez d''abord le compte dans Authentication.', v_owner_email;
  end if;

  -- 2. Attribution du rôle 'agent'
  select id into v_agent_id
  from auth.users
  where lower(email) = lower(v_agent_email);

  if v_agent_id is not null then
    insert into public.profiles (id, email, full_name, role)
    values (v_agent_id, v_agent_email, 'Agent Commercial Kolda', 'agent')
    on conflict (id) do update set
      role = 'agent',
      email = excluded.email,
      updated_at = now();

    raise notice 'Utilisateur % (%) configuré avec succès avec le rôle AGENT.', v_agent_email, v_agent_id;
  else
    raise warning 'Utilisateur Agent introuvable pour l''email % : créez d''abord le compte dans Authentication.', v_agent_email;
  end if;
end $$;
