import Fastify from "fastify";
import { autonomyMemoryRoutes } from "./router.js";

const PORT = 5570;

async function main() {
  const app = Fastify({ logger: true });
  await autonomyMemoryRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("codex-autonomy-memory running on port", PORT);
}

main().catch(err => {
  console.error("Failed to start codex-autonomy-memory:", err);
  process.exit(1);
});
