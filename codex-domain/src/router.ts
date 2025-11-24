import { FastifyInstance } from "fastify";
import { DomainEngine } from "./domainEngine.js";

export async function domainRouter(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-domain",
    mode: "SIMULATED",
    version: "1.0.0"
  }));

  app.get("/search", async (req: any) => {
    const domain = req.query.domain;
    return DomainEngine.search(domain);
  });

  app.post("/purchase", async (req: any) => {
    return DomainEngine.purchase(req.body);
  });

  app.post("/dns", async (req: any) => {
    const { domain, records } = req.body;
    return DomainEngine.configureDNS(domain, records);
  });

  app.post("/ssl", async (req: any) => {
    return DomainEngine.enableSSL(req.body.domain);
  });

  app.post("/linkStore", async (req: any) => {
    return DomainEngine.linkToStore(req.body.domain, req.body.storeId);
  });

  app.get("/status", async (req: any) => {
    return DomainEngine.getStatus(req.query.domain);
  });
}
