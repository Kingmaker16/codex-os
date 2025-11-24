// =============================================
// HANDS v5.0 ULTRA — MAIN SERVER
// =============================================

import Fastify from "fastify";
import { registerRoutes } from "./router.js";

const app = Fastify({ logger: true });
const PORT = 4350;

async function main() {
  await registerRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`\n🚀 HANDS v5.0 ULTRA running on port ${PORT}`);
  console.log(`Mode: SEMI_AUTONOMOUS`);
  console.log(`Modules: Core | Creative | Social | Store`);
  console.log(`Integrations: Vision v2.5 | Safety v2\n`);
}

main().catch(err => {
  console.error("Failed to start Hands v5.0:", err);
  process.exit(1);
});
