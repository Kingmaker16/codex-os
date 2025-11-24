import Fastify from "fastify";
import { meshRoutes } from "./router.js";

const PORT = 5565;

async function main() {
  const app = Fastify({ logger: true });
  await meshRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("Codex System Orchestrator Mesh v1 running on port", PORT);
}

main().catch(err => {
  console.error("Failed to start codex-mesh:", err);
  process.exit(1);
});
