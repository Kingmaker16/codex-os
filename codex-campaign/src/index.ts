import Fastify from "fastify";
import { registerRoutes } from "./router.js";

const app = Fastify({ logger: true });
const PORT = 5120;

async function main() {
  await registerRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`codex-campaign (Campaign Engine v1) running on :${PORT}`);
}

main().catch(err => {
  console.error("Failed to start codex-campaign", err);
  process.exit(1);
});
