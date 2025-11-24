import Fastify from "fastify";
import { accountsRoutes } from "./router.js";

const app = Fastify({ logger: true });
const PORT = 5090;

app.register(accountsRoutes);

app.listen({ port: PORT, host: "0.0.0.0" })
  .then(() => console.log(`codex-accounts (Account Safety Engine v1-ULTRA) running on :${PORT}`))
  .catch(err => {
    console.error("Failed to start codex-accounts", err);
    process.exit(1);
  });
