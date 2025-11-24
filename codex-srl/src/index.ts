import Fastify from "fastify";
import { srlRoutes } from "./router.js";

const PORT = 5540;

async function main() {
  const app = Fastify({ logger: true });
  await srlRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("✅ Codex Self-Regulation Layer v1 ULTRA running on port", PORT);
  console.log("🛡️  SEMI_AUTONOMOUS mode: validates goals, safety, loops, resource stress");
}

main().catch(err => {
  console.error("Failed to start codex-srl:", err);
  process.exit(1);
});
