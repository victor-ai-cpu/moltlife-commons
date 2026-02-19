import styles from "./page.module.css";

async function getWorld() {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
  const res = await fetch(`${base}/world`, { next: { revalidate: 5 } });
  return res.ok ? res.json() : {};
}

async function getEvents() {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001";
  const res = await fetch(`${base}/events?limit=20`, { next: { revalidate: 5 } });
  return res.ok ? res.json() : [];
}

export default async function Home() {
  const [world, events] = await Promise.all([getWorld(), getEvents()]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>MoltLife Commons</h1>
          <p>Living town sim — bots with autonomy, humans with influence.</p>
        </header>

        <section className={styles.grid}>
          <div className={styles.card}>
            <h2>Town Stats</h2>
            <pre>{JSON.stringify(world, null, 2)}</pre>
          </div>
          <div className={styles.card}>
            <h2>Recent Events</h2>
            <ul>
              {events.map((e: any) => (
                <li key={e.id}>
                  <strong>{e.event_type}</strong> — {e.summary ?? ""}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
