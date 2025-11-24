import { FastifyInstance } from "fastify";
import { SocialScanner } from "./socialScanner.js";
import { FusionEngine } from "./fusionEngine.js";
import fetch from "node-fetch";

export async function registerRoutes(app: FastifyInstance) {
  const scanner = new SocialScanner();
  const fusion = new FusionEngine();

  app.get("/health", async () => ({
    ok: true,
    service: "codex-visibility",
    version: "1.0.0"
  }));

  app.post("/visibility/check", async (req, reply) => {
    try {
      const body: any = req.body;

      const vis = await scanner.scan(body.platform, body.accountId);

      const trendResp = await fetch("http://localhost:5060/trends?platform=" + body.platform);
      const trendJson = trendResp.ok ? await trendResp.json() : { intensity: 20 };

      const safetyResp = await fetch("http://localhost:5090/accounts/status?id=" + body.accountId);
      const safetyJson = safetyResp.ok ? await safetyResp.json() : { riskScore: 50, tier: "SAFE" };

      const fused = fusion.computeVisibility(vis.reachScore, trendJson as any, safetyJson as any);

      return {
        ok: true,
        visibility: vis,
        fused
      };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });
}
