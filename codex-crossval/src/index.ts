import Fastify from "fastify";
import { crossValRoutes } from "./router.js";

const PORT = 5470;

async function main() {
  const app = Fastify({ logger: true });
  await crossValRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("Codex Cross-Validation Engine v1 ULTRA running on port", PORT);
}

main().catch(err => {
  console.error("Failed to start codex-crossval:", err);
  process.exit(1);
});
