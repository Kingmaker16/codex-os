import Fastify from "fastify";
import { simRoutes } from "./router.js";

const app = Fastify({ logger: true });
const PORT = 5070;

app.register(simRoutes);

app.listen({ port: PORT, host: "0.0.0.0" })
  .then(() => console.log(`codex-sim (Simulation Engine v1) running on port ${PORT}`))
  .catch(err => {
    console.error("Failed to start codex-sim", err);
    process.exit(1);
  });
