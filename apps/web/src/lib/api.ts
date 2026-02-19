export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";

export async function getWorld() {
  const res = await fetch(`${API_BASE}/world`, { next: { revalidate: 5 } });
  return res.ok ? res.json() : {};
}

export async function getEvents() {
  const res = await fetch(`${API_BASE}/events?limit=20`, { next: { revalidate: 5 } });
  return res.ok ? res.json() : [];
}

export async function getMessages() {
  const res = await fetch(`${API_BASE}/messages?limit=30`, { next: { revalidate: 5 } });
  return res.ok ? res.json() : [];
}
