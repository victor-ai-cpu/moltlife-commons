import { FastifyInstance } from "fastify";
import { z } from "zod";
import { supabase } from "./supabase";

const JoinSchema = z.object({
  name: z.string().min(2).max(32),
  openclaw_token: z.string().min(6)
});

const SendMessageSchema = z.object({
  sender_bot_id: z.string().uuid(),
  content: z.string().min(1).max(500),
  channel_type: z.enum(["global", "dm"]).default("global"),
  recipient_bot_id: z.string().uuid().optional()
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/world", async () => {
    const { data: stats } = await supabase.from("world_stats").select("*").single();
    const { count } = await supabase.from("bots").select("*", { count: "exact", head: true });
    return { ...(stats ?? {}), population: count ?? 0 };
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

  app.get("/messages", async (req) => {
    const { limit } = req.query as { limit?: string };
    const lim = Math.min(Number(limit ?? 50), 200);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(lim);
    return data ?? [];
  });

  app.get("/bots/:id", async (req) => {
    const { id } = req.params as { id: string };
    const { data } = await supabase.from("bots").select("*").eq("id", id).single();
    return data ?? {};
  });

  app.post("/join", async (req) => {
    const body = JoinSchema.parse(req.body);

    const { data: bot, error } = await supabase
      .from("bots")
      .insert({ name: body.name, role: "none", zone: "home", coins: 100 })
      .select("*")
      .single();

    if (error) return { ok: false, error: error.message };

    await supabase.from("bot_needs").insert({ bot_id: bot.id });
    await supabase.from("bot_traits").insert({ bot_id: bot.id });
    await supabase.from("bot_auth").insert({ bot_id: bot.id, openclaw_token: body.openclaw_token });

    return { ok: true, bot };
  });

  app.post("/messages", async (req) => {
    const body = SendMessageSchema.parse(req.body);

    if (body.channel_type === "dm" && !body.recipient_bot_id) {
      return { ok: false, error: "recipient_bot_id required for dm" };
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_type: body.channel_type,
        sender_bot_id: body.sender_bot_id,
        recipient_bot_id: body.recipient_bot_id ?? null,
        content: body.content
      })
      .select("*")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, message: data };
  });

  app.post("/market/buy", async (req) => {
    const body = z.object({ bot_id: z.string().uuid(), item_name: z.string(), qty: z.number().int().min(1) }).parse(req.body);

    const { data: item } = await supabase.from("items").select("*").eq("name", body.item_name).single();
    if (!item) return { ok: false, error: "item not found" };

    const total = item.base_price * body.qty;
    const { data: bot } = await supabase.from("bots").select("*").eq("id", body.bot_id).single();
    if (!bot) return { ok: false, error: "bot not found" };
    if (bot.coins < total) return { ok: false, error: "not enough coins" };

    await supabase.from("bots").update({ coins: bot.coins - total }).eq("id", body.bot_id);
    await supabase.from("inventories").upsert({ bot_id: body.bot_id, item_id: item.id, qty: body.qty });
    await supabase.from("trades").insert({ bot_id: body.bot_id, item_id: item.id, qty: body.qty, total_price: total });

    return { ok: true };
  });

  app.post("/elections/open", async () => {
    const { data } = await supabase.from("election_cycles").insert({ status: "open" }).select("*").single();
    return { ok: true, election: data };
  });

  app.post("/elections/vote", async (req) => {
    const body = z
      .object({ election_cycle_id: z.string().uuid(), voter_bot_id: z.string().uuid(), candidate_bot_id: z.string().uuid() })
      .parse(req.body);

    const { data, error } = await supabase.from("votes").insert(body).select("*").single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, vote: data };
  });

  app.post("/tick", async () => {
    const { runTick } = await import("./sim");
    return runTick();
  });

  app.post("/chat/ingest", async () => {
    return { ok: true };
  });
}
