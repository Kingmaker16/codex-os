import Fastify from "fastify";
import { optimizerRoutes } from "./router.js";

const PORT = 5490;

async function main() {
  const app = Fastify({ logger: true });
  await optimizerRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Multi-Domain Optimization Engine v1 ULTRA running on port ${PORT}`);
  console.log("Domains: social, ecomm, video, trends, monetization, campaigns, all");
  console.log("Mode: SEMI_AUTONOMOUS");
}

main().catch(err => {
  console.error("Failed to start codex-optimizer:", err);
  process.exit(1);
});
