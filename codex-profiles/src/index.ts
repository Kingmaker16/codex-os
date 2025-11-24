import Fastify from "fastify";
import { profileRoutes } from "./router.js";

const PORT = 5180;

async function main() {
  const app = Fastify({ logger: true });
  await profileRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  
  console.log("\n👤 ═══════════════════════════════════════════════════");
  console.log("   ACCOUNT CREATION ENGINE v1 (codex-profiles)");
  console.log("   ═══════════════════════════════════════════════════");
  console.log(`   Port: ${PORT}`);
  console.log("   Mode: SIMULATED_CREATION");
  console.log("   Features:");
  console.log("     • Generate TikTok/Instagram/YouTube profiles");
  console.log("     • Auto-store credentials in Vault v2");
  console.log("     • Register with Account Safety Engine");
  console.log("     • Log to Brain v2 memory");
  console.log("     • Risk tier management (SAFE/MEDIUM/EXPERIMENT)");
  console.log("   ═══════════════════════════════════════════════════");
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log("   ═══════════════════════════════════════════════════\n");
}

main().catch(err => {
  console.error("Failed to start codex-profiles:", err);
  process.exit(1);
});
