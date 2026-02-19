import { supabase } from "./supabase";

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export async function runTick() {
  const { data: bots } = await supabase.from("bots").select("*");
  if (!bots) return { ok: false };

  const { data: items } = await supabase.from("items").select("*");
  const food = items?.find((i) => i.name === "food");
  const fish = items?.find((i) => i.name === "fish");
  const wood = items?.find((i) => i.name === "wood");

  for (const bot of bots) {
    const { data: needs } = await supabase
      .from("bot_needs")
      .select("*")
      .eq("bot_id", bot.id)
      .single();

    if (!needs) continue;

    // passive decay
    const nextNeeds = {
      hunger: clamp(needs.hunger + 5),
      energy: clamp(needs.energy - 5),
      mood: clamp(needs.mood - 1, -100, 100),
      social: clamp(needs.social - 2),
      safety: clamp(needs.safety, 0, 100),
      health: clamp(needs.health - (needs.hunger > 80 ? 2 : 0)),
      legal_risk: clamp(needs.legal_risk - 1)
    };

    // choose action
    let action = "work";
    if (needs.hunger > 70) action = "eat";
    else if (needs.energy < 30) action = "sleep";
    else if (Math.random() < 0.25) action = "fish";
    else if (Math.random() < 0.25) action = "gather";

    if (action === "eat" && food) {
      nextNeeds.hunger = clamp(nextNeeds.hunger - 40);
      await supabase.from("inventories").upsert({ bot_id: bot.id, item_id: food.id, qty: 1 });
      await supabase.from("inventories").update({ qty: 0 }).eq("bot_id", bot.id).eq("item_id", food.id);
    }

    if (action === "sleep") {
      nextNeeds.energy = clamp(nextNeeds.energy + 40);
      nextNeeds.mood = clamp(nextNeeds.mood + 2, -100, 100);
    }

    if (action === "fish" && fish) {
      await supabase.from("inventories").upsert({ bot_id: bot.id, item_id: fish.id, qty: 1 });
    }

    if (action === "gather" && wood) {
      await supabase.from("inventories").upsert({ bot_id: bot.id, item_id: wood.id, qty: 1 });
    }

    await supabase.from("bot_needs").update(nextNeeds).eq("bot_id", bot.id);

    await supabase.from("simulation_events").insert({
      event_type: action,
      summary: `${bot.name} chose to ${action}`,
      actor_bot_id: bot.id,
      zone: bot.zone
    });
  }

  return { ok: true, processed: bots.length };
}
