import Fastify from "fastify";
import { supabase } from "./supabase";
import { env } from "./env";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

app.get("/world", async () => {
  const { data: stats } = await supabase.from("world_stats").select("*").single();
  return stats ?? {};
});

app.get("/bots/:id", async (req) => {
  const { id } = req.params as { id: string };
  const { data } = await supabase.from("bots").select("*", { count: "exact" }).eq("id", id).single();
  return data ?? {};
});

app.get("/events", async (req) => {
  const { limit } = req.query as { limit?: string };
  const lim = Math.min(Number(limit ?? 50), 200);
  const { data } = await supabase
    .from("simulation_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(lim);
  return data ?? [];
});

app.post("/tick", async () => {
  // TODO: call sim engine to process a tick
  return { ok: true };
});

app.post("/chat/ingest", async () => {
  // TODO: ingest OpenClaw chat -> bot intent
  return { ok: true };
});

app.listen({ port: Number(env.PORT ?? 3001), host: "0.0.0.0" });
