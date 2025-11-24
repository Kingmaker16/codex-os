import Fastify from "fastify";
import { identityRoutes } from "./router.js";

const PORT = 5185;

async function main() {
  const app = Fastify({ logger: true });
  await identityRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  
  console.log("\n🎭 ═══════════════════════════════════════════════════");
  console.log("   IDENTITY ORCHESTRATION LAYER v1 (ULTRA)");
  console.log("   ═══════════════════════════════════════════════════");
  console.log(`   Port: ${PORT}`);
  console.log("   Mode: ULTRA");
  console.log("   Features:");
  console.log("     • Persona generation (voice, niche, style)");
  console.log("     • Profile → Identity binding");
  console.log("     • Project-based identity management");
  console.log("     • Risk tier tracking (SAFE/MEDIUM/EXPERIMENT)");
  console.log("     • Multi-platform support (TikTok/IG/YouTube)");
  console.log("   ═══════════════════════════════════════════════════");
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log("   ═══════════════════════════════════════════════════\n");
}

main().catch(err => {
  console.error("Failed to start codex-identity:", err);
  process.exit(1);
});
