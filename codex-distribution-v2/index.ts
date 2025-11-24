import Fastify from "fastify";
import { CONFIG } from "./config.js";
import { registerRoutes } from "./router.js";

const server = Fastify({
  logger: true
});

async function start() {
  try {
    await registerRoutes(server);

    await server.listen({
      port: CONFIG.PORT,
      host: "0.0.0.0"
    });

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 ${CONFIG.SERVICE_NAME} v${CONFIG.VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${CONFIG.PORT}
🛡️ Safety Mode: ${CONFIG.SAFETY_MODE}
🔗 15 Endpoints Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
