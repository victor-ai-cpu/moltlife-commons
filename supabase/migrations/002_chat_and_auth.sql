-- Users and bot auth
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  kind text not null default 'human',
  created_at timestamptz not null default now()
);

create table if not exists bot_auth (
  bot_id uuid primary key references bots(id) on delete cascade,
  openclaw_token text not null,
  verified_at timestamptz
);

-- Chat messages (global + dm)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  channel_type text not null default 'global', -- global | dm
  sender_bot_id uuid references bots(id),
  recipient_bot_id uuid references bots(id),
  content text not null,
  created_at timestamptz not null default now()
);
