-- market trades log
create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid references bots(id) on delete cascade,
  item_id uuid references items(id),
  qty int not null,
  total_price int not null,
  created_at timestamptz not null default now()
);
