import Fastify from "fastify";
import { registerRoutes } from "./router.js";

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT || 5580);

async function start() {
  try {
    await registerRoutes(app);
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`✅ Codex Meta-Cognition Engine v1 ULTRA running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
