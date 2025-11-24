/**
 * Telemetry Client - Orchestrator Intelligence v2.0
 * 
 * Queries Telemetry Engine to inform routing and execution decisions.
 */

const TELEMETRY_BASE_URL = "http://localhost:4950";

/**
 * Get latency metrics for all services
 */
export async function getServiceLatencies(): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${TELEMETRY_BASE_URL}/telemetry/services`);
    if (!response.ok) {
      throw new Error(`Telemetry API error: ${response.statusText}`);
    }

    const data = await response.json();
    const latencies: Record<string, number> = {};

    // Parse telemetry response format
    // Expected: { services: [{ name, avgLatency, ... }] }
    if (data.services && Array.isArray(data.services)) {
      for (const svc of data.services) {
        latencies[svc.name] = svc.avgLatency || 0;
      }
    }

    return latencies;
  } catch (err) {
    console.warn("Failed to fetch service latencies from telemetry:", err);
    return {}; // Graceful fallback
  }
}

/**
 * Get recent error events from telemetry
 */
export async function getRecentErrors(): Promise<any[]> {
  try {
    const response = await fetch(`${TELEMETRY_BASE_URL}/telemetry/events?type=error&limit=50`);
    if (!response.ok) {
      throw new Error(`Telemetry API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.events || [];
  } catch (err) {
    console.warn("Failed to fetch recent errors from telemetry:", err);
    return [];
  }
}

/**
 * Check if a specific service is healthy based on telemetry
 */
export async function isServiceHealthy(serviceName: string): Promise<boolean> {
  try {
    const latencies = await getServiceLatencies();
    const latency = latencies[serviceName];

    // Service is unhealthy if:
    // - No latency data (not reporting)
    // - Latency > 5000ms (5 seconds)
    if (latency === undefined || latency > 5000) {
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`Failed to check health for ${serviceName}:`, err);
    return true; // Assume healthy if telemetry unavailable
  }
}

/**
 * Get service uptime percentage
 */
export async function getServiceUptime(serviceName: string): Promise<number> {
  try {
    const response = await fetch(`${TELEMETRY_BASE_URL}/telemetry/services/${serviceName}/uptime`);
    if (!response.ok) {
      throw new Error(`Telemetry API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.uptime || 0;
  } catch (err) {
    console.warn(`Failed to fetch uptime for ${serviceName}:`, err);
    return 0;
  }
}

/**
 * Record orchestrator execution metrics to telemetry
 * TODO: Implement POST to telemetry for orchestrator-specific metrics
 */
export async function recordExecutionMetrics(metrics: {
  graphId: string;
  duration: number;
  taskCount: number;
  successCount: number;
  failureCount: number;
}): Promise<void> {
  try {
    // Future: POST to telemetry engine
    // For now, just log
    console.log("[Telemetry] Execution metrics:", metrics);
  } catch (err) {
    console.warn("Failed to record execution metrics:", err);
  }
}

/**
 * Get model provider latencies (for smart routing)
 */
export async function getModelProviderLatencies(): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${TELEMETRY_BASE_URL}/telemetry/models`);
    if (!response.ok) {
      throw new Error(`Telemetry API error: ${response.statusText}`);
    }

    const data = await response.json();
    const latencies: Record<string, number> = {};

    if (data.providers && Array.isArray(data.providers)) {
      for (const provider of data.providers) {
        latencies[provider.name] = provider.avgLatency || 0;
      }
    }

    return latencies;
  } catch (err) {
    console.warn("Failed to fetch model provider latencies:", err);
    return {};
  }
}
