import fetch from "node-fetch";
import type { TrendResponse } from "./types.js";

const BRAIN_URL = "http://localhost:4100";

/**
 * Log trend response to Brain for knowledge accumulation
 */
export async function logTrends(resp: TrendResponse): Promise<void> {
  try {
    const event = {
      sessionId: "codex-trends",
      timestamp: resp.generatedAt,
      role: "system",
      type: "trend_scan",
      text: JSON.stringify({
        niche: resp.query.niche,
        platform: resp.query.platform,
        itemCount: resp.items.length,
        topTopics: resp.items.slice(0, 5).map(t => t.topic),
        summary: `Scanned ${resp.query.platform} for ${resp.query.niche}. Found ${resp.items.length} trending topics.`
      })
    };
    
    const response = await fetch(`${BRAIN_URL}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
    
    if (!response.ok) {
      console.warn("[BrainLogger] Failed to log trends to Brain:", response.status);
    } else {
      console.log(`[BrainLogger] Logged trends for "${resp.query.niche}" to Brain`);
    }
  } catch (error) {
    console.error("[BrainLogger] Error logging trends to Brain:", error);
    // Don't throw - Brain unavailability shouldn't break trend engine
  }
}
