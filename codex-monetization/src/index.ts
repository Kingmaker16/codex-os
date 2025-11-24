// Codex Monetization Engine v1 - Main Server

import Fastify from "fastify";
import { registerRoutes } from "./router.js";

const PORT = parseInt(process.env.PORT || "4850", 10);

const fastify = Fastify({
  logger: false,
});

// Register routes
await registerRoutes(fastify);

// Start server
try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  
  console.log("\n🚀 Codex Monetization Engine v1");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📊 Revenue tracking across 5 verticals`);
  console.log(`💰 Profit forecasting & LTV analysis`);
  console.log(`⚠️  Risk modeling & mitigation strategies`);
  console.log(`📈 Content performance mapping`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/monetization/health\n`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
