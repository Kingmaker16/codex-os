import { ServiceConfig } from "./serviceConfig.js";

interface CircuitState {
  failures: number;
  openedAt?: number;
}

const states: Map<string, CircuitState> = new Map();

export function isServiceOpen(name: string, cfg: ServiceConfig): boolean {
  const st = states.get(name);
  if (!st) return false;
  if (st.failures < cfg.circuitBreakerThreshold) return false;
  const now = Date.now();
  if (!st.openedAt) {
    st.openedAt = now;
    return true;
  }
  // After 30 seconds, allow one more try
  if (now - st.openedAt > 30_000) {
    st.failures = 0;
    st.openedAt = undefined;
    return false;
  }
  return true;
}

export function recordFailure(name: string) {
  const current = states.get(name) ?? { failures: 0 };
  current.failures += 1;
  states.set(name, current);
}

export function recordSuccess(name: string) {
  states.set(name, { failures: 0 });
}
