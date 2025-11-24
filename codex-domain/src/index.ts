import Fastify from "fastify";
import { domainRouter } from "./router.js";

const PORT = 5160;

async function main() {
  const app = Fastify({ logger: true });
  await domainRouter(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("\n🌐 ═══════════════════════════════════════════════════");
  console.log("   DOMAIN REGISTRAR ENGINE v1 (SIMULATED MODE)");
  console.log("   ═══════════════════════════════════════════════════");
  console.log(`   Port: ${PORT}`);
  console.log("   Mode: SIMULATED (No real purchases)");
  console.log("   Features:");
  console.log("     • Domain search & availability");
  console.log("     • Simulated domain purchase ($14.99)");
  console.log("     • DNS configuration");
  console.log("     • SSL certificate enablement");
  console.log("     • E-commerce store linking");
  console.log("   ═══════════════════════════════════════════════════");
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log("   ═══════════════════════════════════════════════════\n");
}

main();
