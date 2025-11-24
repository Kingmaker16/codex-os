import axios from "axios";
import { SERVICE_CONFIGS, ServiceConfig } from "./serviceConfig.js";
import { isServiceOpen, recordFailure, recordSuccess } from "./circuitBreaker.js";

export type OrchestratorMode = "SIMULATION" | "DRY_RUN" | "LIVE";

export interface OrchestratorRequestContext {
  mode: OrchestratorMode;
}

function getServiceConfig(name: string): ServiceConfig {
  const cfg = SERVICE_CONFIGS.find(s => s.name === name);
  if (!cfg) {
    throw new Error(`No service config for ${name}`);
  }
  return cfg;
}

export async function callService(
  serviceName: string,
  path: string,
  options: any,
  ctx: OrchestratorRequestContext
): Promise<{ ok: boolean; status: number; data: any }> {

  const cfg = getServiceConfig(serviceName);

  if (ctx.mode === "SIMULATION") {
    return { ok: true, status: 200, data: { simulated: true, serviceName, path } };
  }

  if (isServiceOpen(serviceName, cfg)) {
    return {
      ok: false,
      status: 503,
      data: { error: `Circuit open for ${serviceName}` }
    };
  }

  if (ctx.mode === "DRY_RUN") {
    return {
      ok: true,
      status: 200,
      data: { dryRun: true, serviceName, path }
    };
  }

  let lastError: any = null;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const resp = await axios({
        method: options.method || 'GET',
        url: cfg.baseUrl + path,
        data: options.body,
        headers: options.headers,
        timeout: cfg.timeoutMs
      });

      recordSuccess(serviceName);
      return { ok: true, status: resp.status, data: resp.data };
    } catch (err: any) {
      recordFailure(serviceName);
      if (err.response) {
        lastError = { status: err.response.status, data: err.response.data };
      } else {
        lastError = err;
      }
    }
  }

  return {
    ok: false,
    status: lastError?.status ?? 500,
    data: { error: String(lastError?.message ?? "Unknown error") }
  };
}
