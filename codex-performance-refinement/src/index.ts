import Fastify from "fastify";
import { refinementRoutes } from "./router.js";

const PORT = 5520;

async function main() {
  const app = Fastify({ logger: true });
  await refinementRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Codex Performance Refinement Engine v1 ULTRA running on port ${PORT}`);
  console.log("Mode: SEMI_AUTONOMOUS (high-impact recommendations require approval)");
}

main().catch(err => {
  console.error("Failed to start codex-performance-refinement:", err);
  process.exit(1);
});
