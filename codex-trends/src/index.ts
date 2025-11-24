import Fastify from "fastify";
import router from "./router.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5060;

async function start() {
  const app = Fastify({
    logger: true
  });

  // Register routes
  await router(app);

  // Start server
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`✅ codex-trends listening on port ${PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
