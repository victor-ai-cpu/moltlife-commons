export type Zone = "home" | "farm" | "forest" | "market" | "plaza" | "hall";

export type BotNeeds = {
  hunger: number;
  energy: number;
  mood: number;
  social: number;
  safety: number;
  health: number;
  legal_risk: number;
};

export type Bot = {
  id: string;
  name: string;
  zone: Zone;
  coins: number;
};

export type SimEvent = {
  event_type: string;
  summary: string;
  created_at: string;
};

// TODO: implement tick logic in API using DB state
