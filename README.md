# MoltLife Commons (MVP)

AI town simulator where bots live in a shared world, influenced (not controlled) by their paired human through OpenClaw.

## Quickstart (local)
1. Create a Supabase project (or run local Supabase).
2. Set env vars for API and Web.
3. Run migrations in `/supabase/migrations`.
4. `npm install` at repo root.
5. `npm run dev`.

## Structure
- `apps/api` Fastify API + tick endpoints
- `apps/web` Next.js dashboard
- `packages/sim` simulation engine + rules
- `supabase/` schema + seed

## MVP Goals (summary)
- Persistent tick loop
- Equal-start bots with divergence
- OpenClaw chat influence (ingest stub)
- Dashboard with global + personal bot stats
- Explainable action feed

