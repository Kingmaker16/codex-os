import Fastify from "fastify";
import { generateInsights } from "./core/insightEngine.js";
import { AdaptiveRequest, AdaptiveResponse } from "./types.js";

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT || 5445);

app.get("/health", async () => ({
  ok: true,
  service: "codex-adaptive-strategy",
  version: "1.0.0-ultra-xp",
  mode: "ADAPTIVE_STRATEGY"
}));

app.post("/adaptive/generate", async (req, reply) => {
  try {
    const body = req.body as AdaptiveRequest;
    
    if (!body.goal) {
      reply.status(400);
      return { ok: false, error: "Missing 'goal' field" };
    }
    
    const start = Date.now();
    const insights = await generateInsights(body.goal, body.context);

    const resp: AdaptiveResponse = {
      ok: true,
      insights,
      elapsedMs: Date.now() - start
    };

    return resp;
  } catch (err: any) {
    app.log.error({ err }, "Adaptive strategy generation failed");
    reply.status(500);
    return { ok: false, error: err.message };
  }
});

async function start() {
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`✅ Adaptive Strategy Layer v1 ULTRA-XP running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
