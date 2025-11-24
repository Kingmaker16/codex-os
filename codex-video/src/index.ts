import Fastify from "fastify";
import router from "./router.js";
import { VIDEO_CONFIG } from "./config.js";

const app = Fastify({ logger: true });

app.register(router);

async function main() {
  await app.listen({ port: VIDEO_CONFIG.port, host: "0.0.0.0" });
  console.log(`Codex Video Engine v1 running on port ${VIDEO_CONFIG.port}`);
}

main();
