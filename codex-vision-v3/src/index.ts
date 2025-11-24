import Fastify from "fastify";
import { visionV3Routes } from "./router.js";

const app = Fastify({ logger: true });
const PORT = 4660;

async function main() {
  await visionV3Routes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("Codex Vision Engine v3 ULTRA running on port", PORT);
}

main().catch(err => {
  console.error("Failed to start Codex Vision v3:", err);
  process.exit(1);
});
