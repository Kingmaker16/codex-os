import Fastify from "fastify";
import { registerRoutes } from "./router.js";

const app = Fastify({ logger: true });
const PORT = 5110;

async function main() {
  await registerRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`codex-engagement (Engagement Engine v1) running on :${PORT}`);
}

main().catch(err => {
  console.error("Failed to start codex-engagement", err);
  process.exit(1);
});
