-- Economy basics
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_price int not null
);

create table if not exists inventories (
  bot_id uuid references bots(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  qty int not null default 0,
  primary key (bot_id, item_id)
);

create table if not exists market_orders (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid references bots(id) on delete cascade,
  item_id uuid references items(id),
  order_type text not null, -- buy | sell
  qty int not null,
  price int not null,
  created_at timestamptz not null default now()
);

-- Governance basics
create table if not exists election_cycles (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'open',
  opens_at timestamptz not null default now(),
  closes_at timestamptz
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  election_cycle_id uuid references election_cycles(id) on delete cascade,
  bot_id uuid references bots(id) on delete cascade
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  election_cycle_id uuid references election_cycles(id) on delete cascade,
  voter_bot_id uuid references bots(id) on delete cascade,
  candidate_bot_id uuid references bots(id) on delete cascade,
  cast_at timestamptz not null default now()
);
