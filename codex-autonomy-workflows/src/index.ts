import Fastify from "fastify";
import { workflowRoutes } from "./router.js";

const PORT = 5430;

async function main() {
  const app = Fastify({ logger: true });
  await workflowRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("Autonomy Workflow Layer v1 ULTRA running on port", PORT);
}

main().catch(err => {
  console.error("Failed to start Autonomy Workflow Layer:", err);
  process.exit(1);
});
