// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Health Monitor
// Checks all Codex services and assigns global health status
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch";
import {
  getAllServices,
  getCriticalServices,
  type ServiceDefinition,
} from "./opsServiceMap.js";
import type { ServiceHealth, OpsStatus } from "./types.js";

const HEALTH_TIMEOUT = 2000;

export async function checkServiceHealth(
  service: ServiceDefinition
): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    const response = await fetch(
      `http://localhost:${service.port}${service.healthPath}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(HEALTH_TIMEOUT),
      }
    );

    const latency = Date.now() - startTime;
    const data = (await response.json()) as any;

    return {
      service: service.name,
      port: service.port,
      healthy: response.ok && data.ok === true,
      latency,
    };
  } catch (error: any) {
    return {
      service: service.name,
      port: service.port,
      healthy: false,
      error: error.message || "Connection failed",
    };
  }
}

export async function checkAllServices(): Promise<ServiceHealth[]> {
  const services = getAllServices();
  const healthChecks = services.map((service) => checkServiceHealth(service));
  return Promise.all(healthChecks);
}

export function computeOpsStatus(healthResults: ServiceHealth[]): OpsStatus {
  const criticalServices = getCriticalServices();
  const criticalNames = criticalServices.map((s) => s.name);

  const criticalHealth = healthResults.filter((h) =>
    criticalNames.includes(h.service)
  );
  const allHealthy = healthResults.every((h) => h.healthy);
  const criticalHealthy = criticalHealth.every((h) => h.healthy);

  if (criticalHealthy && allHealthy) {
    return "GREEN";
  } else if (criticalHealthy) {
    return "YELLOW"; // Some non-critical services down
  } else {
    return "RED"; // Critical service(s) down
  }
}
