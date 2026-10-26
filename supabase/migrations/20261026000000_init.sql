-- Decidia : schéma initial + RLS
create extension if not exists pgcrypto;

create type persona as enum ('individual', 'entrepreneur', 'manager');
create type plan as enum ('free', 'pro', 'team');
create type decision_status as enum ('draft', 'analyzed', 'decided', 'success', 'partial', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  persona persona not null default 'entrepreneur',
  plan plan not null default 'free',
  is_founder boolean not null default false,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  locale text not null default 'fr',
  created_at timestamptz not null default now()
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anon_id text,
  title text not null,
  problem_text text not null,
  persona persona not null default 'entrepreneur',
  locale text not null default 'fr',
  status decision_status not null default 'draft',
  confidence_score int check (confidence_score between 0 and 100),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  constraint owner_present check (user_id is not null or anon_id is not null)
);
create index decisions_user_idx on public.decisions (user_id, created_at desc);
create index decisions_anon_idx on public.decisions (anon_id) where anon_id is not null;

create table public.context_answers (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  question text not null,
  answer text not null default '',
  position int not null default 0
);
create index context_answers_decision_idx on public.context_answers (decision_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  report_json jsonb not null,
  model_version text not null,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  cost_usd numeric(10, 6) not null default 0,
  created_at timestamptz not null default now()
);
create index reports_decision_idx on public.reports (decision_id, created_at desc);

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  kind text not null check (kind in ('d14', 'd30')),
  due_at timestamptz not null,
  sent_at timestamptz,
  outcome text check (outcome in ('success', 'partial', 'failed')),
  user_notes text,
  ai_adjustment_json jsonb,
  answered_at timestamptz,
  unique (decision_id, kind)
);
create index followups_due_idx on public.followups (due_at) where sent_at is null;

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anon_id text,
  ip_hash text,
  type text not null,
  model text,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  cost_usd numeric(10, 6) not null default 0,
  created_at timestamptz not null default now()
);
create index usage_events_user_idx on public.usage_events (user_id, created_at desc);
create index usage_events_ip_idx on public.usage_events (ip_hash, created_at desc);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'fr',
  consent boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index waitlist_email_idx on public.waitlist (lower(email));

-- Profil créé automatiquement à l'inscription. Ne doit jamais faire échouer une inscription
-- (le projet peut servir à d'autres applications) : toute erreur est ignorée.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Comptes déjà existants
insert into public.profiles (id, email, full_name)
select id, coalesce(email, ''), coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name')
from auth.users
on conflict (id) do nothing;

-- ---------- RLS : chaque utilisateur ne voit que ses lignes ----------
alter table public.profiles enable row level security;
alter table public.decisions enable row level security;
alter table public.context_answers enable row level security;
alter table public.reports enable row level security;
alter table public.followups enable row level security;
alter table public.usage_events enable row level security;
alter table public.waitlist enable row level security; -- aucune policy : accès service uniquement

create policy profiles_select_own on public.profiles for select using (id = auth.uid());
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- L'utilisateur ne peut modifier que son nom et son profil : jamais plan, Stripe ou statut fondateur.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, persona, locale) on public.profiles to authenticated;

create policy decisions_select_own on public.decisions for select using (user_id = auth.uid());
create policy decisions_insert_own on public.decisions for insert with check (user_id = auth.uid());
create policy decisions_update_own on public.decisions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy decisions_delete_own on public.decisions for delete using (user_id = auth.uid());

create policy answers_own on public.context_answers for all
  using (exists (select 1 from public.decisions d where d.id = decision_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.decisions d where d.id = decision_id and d.user_id = auth.uid()));

-- Rapports, suivis et coûts : lecture seule côté utilisateur, écriture par le serveur (clé service).
create policy reports_select_own on public.reports for select
  using (exists (select 1 from public.decisions d where d.id = decision_id and d.user_id = auth.uid()));
create policy followups_select_own on public.followups for select
  using (exists (select 1 from public.decisions d where d.id = decision_id and d.user_id = auth.uid()));
create policy usage_select_own on public.usage_events for select using (user_id = auth.uid());

-- La fonction du déclencheur n'a pas à être appelable via l'API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
