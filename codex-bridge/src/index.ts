import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import { loadProviders } from "./providerLoader.js";
import type { ModelRequest } from "./providers/types.js";
import { registerV2Routes } from "./v2/router.js";

const app = Fastify();

async function start() {
  const providers = await loadProviders();
  
  // Register v2 roundtable endpoints
  registerV2Routes(app, providers);

  app.get("/health", async () => ({
    ok: true,
    version: "0.1.0",
    service: "codex-bridge"
  }));

  app.get("/providers", async () => Object.keys(providers));

  app.post("/respond", async (req, res) => {
    const { provider = "mock", model = "mock" } = (req.query as any) || {};
    const prov = providers[String(provider)];
    if (!prov) {
      res.status(400);
      return { error: `provider not found: ${provider}` };
    }

    const input = (req.body as ModelRequest) || { model: String(model), messages: [] };

    try {
      const out = await prov.respond(input);
      return { provider, model: input.model || model, ...out };
    } catch (err) {
      res.status(500);
      return { error: (err as Error).message || String(err) };
    }
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  app.listen({ port, host: "0.0.0.0" }).then(() => {
    console.log(`codex-bridge listening on :${port}`);
    console.log("loaded providers:", Object.keys(providers));
  });
}

start().catch(err => {
  // eslint-disable-next-line no-console
  console.error("startup error:", err);
  process.exit(1);
});