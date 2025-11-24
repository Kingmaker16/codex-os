import Fastify from "fastify";
import { rlRoutes } from "./router.js";

const PORT = 5495;

async function main() {
  const app = Fastify({ logger: true });
  await rlRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Codex Reinforcement Learning Loop v1 running on port ${PORT}`);
  console.log("Mode: SEMI_AUTONOMOUS (all policy changes require approval)");
  console.log("RL Type: Advantage Actor-Critic (A2C-lite)");
}

main().catch(err => {
  console.error("Failed to start codex-rl:", err);
  process.exit(1);
});
