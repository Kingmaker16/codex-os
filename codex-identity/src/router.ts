import { FastifyInstance } from "fastify";
import { createIdentity, listAllIdentities, listForProject } from "./identityEngine.js";

export async function identityRoutes(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-identity",
    version: "1.0.0",
    mode: "ULTRA"
  }));

  app.post("/identity/create", async (req, reply) => {
    try {
      const { platform, niche, riskTier, project } = req.body as any;
      const identity = await createIdentity(platform, niche, riskTier, project);
      return { ok: true, identity };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.get("/identity/list", async () => ({
    ok: true,
    identities: listAllIdentities()
  }));

  app.get("/identity/project", async (req, reply) => {
    const project = (req.query as any).project;
    if (!project) {
      reply.status(400);
      return { ok: false, error: "Missing ?project=" };
    }
    return { ok: true, identities: listForProject(project) };
  });
}
