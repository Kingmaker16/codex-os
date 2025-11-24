import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const SELF_AUDIT_URL = "http://localhost:5530";

export async function selfAuditRouter(app: FastifyInstance) {
  app.all("/selfAudit/*", async (req: FastifyRequest, reply: FastifyReply) => {
    const path = req.url.replace(/^\/selfAudit/, "");
    const targetUrl = SELF_AUDIT_URL + path;

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers as any,
        body: ["POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined
      });

      const data = await response.json();
      reply.code(response.status).send(data);
    } catch (err: any) {
      reply.code(503).send({ ok: false, error: "Self-Audit Engine unavailable", details: err.message });
    }
  });
}
