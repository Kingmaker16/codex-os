import Fastify from "fastify";
import { hardeningRoutes } from "./router.js";

const PORT = 5555;

async function main() {
  const app = Fastify({ logger: true });
  await hardeningRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("Codex Hardening Engine v1 ULTRA running on port", PORT);
}

main().catch(err => {
  console.error("Failed to start codex-hardening:", err);
  process.exit(1);
});
