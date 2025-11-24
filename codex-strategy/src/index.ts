import Fastify from "fastify";
import router from "./router.js";
import { initHydration } from "./hydration.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5050;

async function start() {
  const app = Fastify({
    logger: true
  });

  // Initialize hydration (Knowledge Engine warmup, etc.)
  await initHydration();

  // Register routes
  await router(app);

  // Start server
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`✅ codex-strategy listening on port ${PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
