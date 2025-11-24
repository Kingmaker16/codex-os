import Fastify from "fastify";
import { auditRoutes } from "./router.js";

const PORT = 5530;

async function main() {
  const app = Fastify({ logger: true });
  await auditRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`✅ Self-Audit Engine v1 ULTRA online on port ${PORT}`);
  console.log("🔍 Internal reviewer active: logic, safety, consistency, multi-LLM validation");
}

main().catch(err => {
  console.error("Failed to start codex-self-audit:", err);
  process.exit(1);
});
