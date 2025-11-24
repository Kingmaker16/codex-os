import fetch from "node-fetch";
import { ServiceHealth } from "../types.js";

const SERVICES = [
  { service: "codex-bridge", port: 4000 },
  { service: "codex-brain", port: 4100 },
  { service: "codex-orchestrator", port: 4200 },
  { service: "codex-strategy", port: 4300 },
  { service: "codex-accounts", port: 5020 },
  { service: "codex-visibility", port: 5030 },
  { service: "codex-engagement", port: 5040 },
  { service: "codex-campaign", port: 5050 },
  { service: "codex-creative-suite", port: 5230 },
  { service: "codex-distribution-v2", port: 5301 },
  { service: "codex-routing-v2", port: 5560 },
  { service: "codex-vault", port: 5175 },
  { service: "codex-autonomy", port: 5420 }
];

export async function checkServiceHealth(): Promise<ServiceHealth[]> {
  const healthChecks = SERVICES.map(async s => {
    const start = Date.now();
    try {
      const resp = await fetch(`http://localhost:${s.port}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(3000)
      });
      const responseTime = Date.now() - start;
      return {
        service: s.service,
        port: s.port,
        healthy: resp.ok,
        responseTime
      } as ServiceHealth;
    } catch {
      return {
        service: s.service,
        port: s.port,
        healthy: false
      } as ServiceHealth;
    }
  });

  return Promise.all(healthChecks);
}
