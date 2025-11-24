import { CONFIG } from "../config.js";
import axios from "axios";

export async function logOperation(
  operation: string,
  details: Record<string, any>
): Promise<void> {
  try {
    await axios.post(`${CONFIG.SERVICES.OPS}/ops/log`, {
      operation,
      details,
      timestamp: new Date().toISOString()
    }, { timeout: 3000 });
  } catch (error) {
    console.error("Failed to log operation:", error);
  }
}

export async function reportMetrics(
  metrics: Record<string, number>
): Promise<void> {
  try {
    await axios.post(`${CONFIG.SERVICES.OPS}/ops/metrics`, {
      metrics,
      timestamp: new Date().toISOString()
    }, { timeout: 3000 });
  } catch (error) {
    console.error("Failed to report metrics:", error);
  }
}

export async function getSystemHealth(): Promise<{
  healthy: boolean;
  services: Record<string, boolean>;
}> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.OPS}/ops/health`, {
      timeout: 5000
    });

    return {
      healthy: response.data.healthy || false,
      services: response.data.services || {}
    };
  } catch (error) {
    console.error("Failed to get system health:", error);
    return { healthy: false, services: {} };
  }
}
