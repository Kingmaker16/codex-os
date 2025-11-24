import fetch from "node-fetch";
import { ServiceStatus } from "../types.js";

const SERVICE_HEALTH_ENDPOINTS: { name: string; url: string }[] = [
  { name: "orchestrator", url: "http://localhost:4200/orchestrator/status" },
  { name: "brain",        url: "http://localhost:4100/v2/health" },
  { name: "ops",          url: "http://localhost:5350/ops/health" },
  { name: "telemetry",    url: "http://localhost:4950/health" },
  { name: "stability",    url: "http://localhost:4950/health" },
  { name: "srl",          url: "http://localhost:5540/health" },
  { name: "selfAudit",    url: "http://localhost:5530/health" },
  { name: "crossval",     url: "http://localhost:5470/health" },
  { name: "optimizer",    url: "http://localhost:5490/health" }
];

export async function checkServiceHealth(): Promise<ServiceStatus[]> {
  const out: ServiceStatus[] = [];
  for (const svc of SERVICE_HEALTH_ENDPOINTS) {
    const start = Date.now();
    try {
      const resp = await fetch(svc.url, { method: "GET" });
      const latency = Date.now() - start;
      out.push({
        name: svc.name,
        healthy: resp.ok,
        lastLatencyMs: latency
      });
    } catch (err: any) {
      const latency = Date.now() - start;
      out.push({
        name: svc.name,
        healthy: false,
        lastLatencyMs: latency,
        lastError: String(err.message ?? "Unknown error")
      });
    }
  }
  return out;
}
