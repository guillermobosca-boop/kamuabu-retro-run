create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  slug text not null unique,
  shopify_customer_id text,
  country_code text,
  avatar_style text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.run_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  city_key text not null check (city_key in ('valencia', 'roma', 'paris', 'venecia', 'londres')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  build_version text,
  seed text,
  device_type text,
  user_agent text,
  ip_hash text,
  status text not null default 'started'
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.run_sessions(id) on delete set null,
  player_id uuid not null references public.players(id) on delete cascade,
  city_key text not null check (city_key in ('valencia', 'roma', 'paris', 'venecia', 'londres')),
  score integer not null default 0,
  distance integer not null default 0,
  enemies_killed integer not null default 0,
  mini_boss_killed boolean not null default false,
  boss_killed boolean not null default false,
  combo_max integer not null default 1,
  hits_taken integer not null default 0,
  weapon_peak text,
  run_duration_ms integer not null default 0,
  socks_collected integer not null default 0,
  shirts_collected integer not null default 0,
  scooters_collected integer not null default 0,
  valid boolean not null default true,
  validation_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.player_bests (
  player_id uuid primary key references public.players(id) on delete cascade,
  best_global_score integer not null default 0,
  best_global_run_id uuid references public.runs(id) on delete set null,
  best_valencia_score integer not null default 0,
  best_roma_score integer not null default 0,
  best_paris_score integer not null default 0,
  best_venecia_score integer not null default 0,
  best_londres_score integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('weekly', 'monthly', 'special')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default false,
  rules_json jsonb not null default '{}'::jsonb
);

create table if not exists public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id) on delete set null,
  scope text not null check (scope in ('global', 'weekly', 'city')),
  city_key text,
  rank_position integer not null,
  player_id uuid not null references public.players(id) on delete cascade,
  run_id uuid not null references public.runs(id) on delete cascade,
  score integer not null,
  captured_at timestamptz not null default now()
);

create index if not exists idx_runs_player_valid_score on public.runs (player_id, valid, score desc);
create index if not exists idx_runs_city_valid_score on public.runs (city_key, valid, score desc);
create index if not exists idx_runs_created_at on public.runs (created_at desc);
create index if not exists idx_run_sessions_player_city on public.run_sessions (player_id, city_key, started_at desc);

create or replace view public.leaderboard_global as
with ranked as (
  select
    r.id as run_id,
    r.player_id,
    p.nickname,
    r.city_key,
    r.score,
    r.combo_max,
    r.enemies_killed,
    r.run_duration_ms,
    r.created_at,
    row_number() over (
      partition by r.player_id
      order by r.score desc, r.run_duration_ms asc, r.created_at asc
    ) as player_rank
  from public.runs r
  join public.players p on p.id = r.player_id
  where r.valid is true
)
select
  run_id,
  player_id,
  nickname,
  city_key,
  score,
  combo_max,
  enemies_killed,
  run_duration_ms,
  created_at
from ranked
where player_rank = 1;

create or replace view public.leaderboard_weekly as
with weekly_runs as (
  select *
  from public.runs
  where valid is true
    and created_at >= now() - interval '7 days'
),
ranked as (
  select
    r.id as run_id,
    r.player_id,
    p.nickname,
    r.city_key,
    r.score,
    r.combo_max,
    r.enemies_killed,
    r.run_duration_ms,
    r.created_at,
    row_number() over (
      partition by r.player_id
      order by r.score desc, r.run_duration_ms asc, r.created_at asc
    ) as player_rank
  from weekly_runs r
  join public.players p on p.id = r.player_id
)
select
  run_id,
  player_id,
  nickname,
  city_key,
  score,
  combo_max,
  enemies_killed,
  run_duration_ms,
  created_at
from ranked
where player_rank = 1;

create or replace view public.leaderboard_city as
with ranked as (
  select
    r.id as run_id,
    r.player_id,
    p.nickname,
    r.city_key,
    r.score,
    r.combo_max,
    r.enemies_killed,
    r.run_duration_ms,
    r.created_at,
    row_number() over (
      partition by r.player_id, r.city_key
      order by r.score desc, r.run_duration_ms asc, r.created_at asc
    ) as player_rank
  from public.runs r
  join public.players p on p.id = r.player_id
  where r.valid is true
)
select
  run_id,
  player_id,
  nickname,
  city_key,
  score,
  combo_max,
  enemies_killed,
  run_duration_ms,
  created_at
from ranked
where player_rank = 1;
