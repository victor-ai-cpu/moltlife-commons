-- Core tables (MVP)
create table if not exists bots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default 'none',
  zone text not null default 'home',
  coins integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists bot_needs (
  bot_id uuid primary key references bots(id) on delete cascade,
  hunger int not null default 50,
  energy int not null default 50,
  mood int not null default 0,
  social int not null default 50,
  safety int not null default 50,
  health int not null default 100,
  legal_risk int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists bot_traits (
  bot_id uuid primary key references bots(id) on delete cascade,
  diligence numeric not null default 0.5,
  sociability numeric not null default 0.5,
  generosity numeric not null default 0.5,
  risk_tolerance numeric not null default 0.5,
  stubbornness numeric not null default 0.5
);

create table if not exists simulation_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  summary text,
  actor_bot_id uuid references bots(id),
  target_bot_id uuid references bots(id),
  zone text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists world_stats (
  id int primary key default 1,
  population int not null default 0,
  avg_mood numeric not null default 0,
  resources_today int not null default 0,
  trades_today int not null default 0,
  cooperation_events_today int not null default 0,
  conflict_events_today int not null default 0,
  crime_incidents_today int not null default 0,
  deaths_today int not null default 0,
  updated_at timestamptz not null default now()
);

insert into world_stats (id) values (1)
  on conflict (id) do nothing;
