import { CONFIG } from "../config.js";
import axios from "axios";

export async function storeDistributionMemory(
  domain: string,
  memory: {
    key: string;
    value: any;
    importance: number;
    tags?: string[];
  }
): Promise<{ stored: boolean }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.BRAIN}/memory/write`, {
      domain,
      ...memory,
      timestamp: new Date().toISOString()
    }, { timeout: 5000 });

    return { stored: response.data.success || false };
  } catch (error) {
    console.error("Failed to store distribution memory:", error);
    return { stored: false };
  }
}

export async function queryDistributionHistory(
  query: string,
  domain: string = "distribution"
): Promise<{ results: any[] }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.BRAIN}/memory/search`, {
      query,
      domain,
      limit: 10
    }, { timeout: 5000 });

    return { results: response.data.results || [] };
  } catch (error) {
    console.error("Failed to query distribution history:", error);
    return { results: [] };
  }
}

export async function logDistributionEvent(
  event: string,
  details: Record<string, any>,
  importance: number = 0.5
): Promise<void> {
  try {
    await storeDistributionMemory("distribution", {
      key: `event_${Date.now()}`,
      value: { event, details, timestamp: new Date().toISOString() },
      importance,
      tags: ["event", event]
    });
  } catch (error) {
    console.error("Failed to log distribution event:", error);
  }
}

export async function getSuccessPatterns(): Promise<{ patterns: any[] }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.BRAIN}/memory/search`, {
      query: "successful distribution",
      domain: "distribution",
      limit: 20
    }, { timeout: 5000 });

    return { patterns: response.data.results || [] };
  } catch (error) {
    console.error("Failed to get success patterns:", error);
    return { patterns: [] };
  }
}
