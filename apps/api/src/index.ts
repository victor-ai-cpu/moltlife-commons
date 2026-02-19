import Fastify from "fastify";
import { env } from "./env";
import { registerRoutes } from "./routes";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

registerRoutes(app);

app.listen({ port: Number(env.PORT ?? 3001), host: "0.0.0.0" });
