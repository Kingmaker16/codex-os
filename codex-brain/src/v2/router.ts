import { FastifyInstance } from "fastify";
import { writeMemory, searchMemory, getAllMemories } from "./memoryStore.js";
import { MemoryWriteRequest, MemorySearchRequest } from "./types.js";

export async function brainV2Routes(app: FastifyInstance) {
  app.get("/v2/health", async () => ({
    ok: true,
    service: "codex-brain",
    version: "2.0.0",
    capabilities: ["writeMemory", "searchMemory", "domainStreams"]
  }));

  app.post("/v2/memory/write", async (req, reply) => {
    try {
      const body = req.body as MemoryWriteRequest;
      const rec = writeMemory(body);
      return { ok: true, record: rec };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.post("/v2/memory/search", async (req, reply) => {
    try {
      const body = req.body as MemorySearchRequest;
      const result = searchMemory(body);
      return { ok: true, ...result };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.get("/v2/memory/all", async () => ({
    ok: true,
    records: getAllMemories()
  }));
}
