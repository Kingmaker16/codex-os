import Fastify from "fastify";
import { registerRoutes } from "./router.js";

const app = Fastify({ logger: true });

async function main() {
  await registerRoutes(app);

  const port = 5080;
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`codex-visibility running on :${port}`);
}

main();
