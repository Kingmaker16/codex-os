import { FastifyInstance } from "fastify";
import { ProfileCreateRequest } from "./types.js";
import { createProfile, listAllProfiles, getProfileStatus } from "./profileEngine.js";

export async function profileRoutes(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-profiles",
    version: "1.0.0",
    mode: "SIMULATED_CREATION"
  }));

  app.post("/profiles/create", async (req, reply) => {
    try {
      const body = req.body as ProfileCreateRequest;
      const profile = await createProfile(body);
      return { ok: true, profile };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.get("/profiles/list", async () => ({
    ok: true,
    profiles: listAllProfiles()
  }));

  app.get("/profiles/status", async (req, reply) => {
    const id = (req.query as any).id;
    const status = getProfileStatus(id);
    if (!status) {
      reply.status(404);
      return { ok: false, error: "Profile not found" };
    }
    return { ok: true, status };
  });
}
