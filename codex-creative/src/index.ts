import Fastify from "fastify";
import { creativeRoutes } from "./router.js";

const app = Fastify({ logger: true });

app.register(creativeRoutes);

const PORT = 5200;

app.listen({ port: PORT, host: "0.0.0.0" })
  .then(() => console.log(`codex-creative running on port ${PORT}`))
  .catch(err => {
    console.error("Failed to start codex-creative", err);
    process.exit(1);
  });
