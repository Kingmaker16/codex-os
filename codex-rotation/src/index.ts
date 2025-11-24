import Fastify from "fastify";
import { rotationRoutes } from "./router.js";
import { startRotationScheduler } from "./scheduler.js";

const app = Fastify({ logger: true });
const PORT = 5550;

async function main() {
  await rotationRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("Codex Rotation Engine v1 running on port", PORT);
  startRotationScheduler();
}

main().catch(err => {
  console.error("Failed to start Codex Rotation Engine v1:", err);
  process.exit(1);
});
