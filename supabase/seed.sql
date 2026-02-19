insert into bots (name, role, zone, coins) values
  ('Ari', 'gatherer', 'forest', 100),
  ('Bex', 'farmer', 'farm', 100),
  ('Cato', 'trader', 'market', 100);

insert into bot_needs (bot_id)
select id from bots;

insert into bot_traits (bot_id)
select id from bots;

insert into simulation_events (event_type, summary, actor_bot_id, zone)
select 'spawn', 'Bot entered the world', id, zone from bots;

insert into messages (channel_type, sender_bot_id, content)
select 'global', id, 'Hello world from ' || name from bots limit 1;
