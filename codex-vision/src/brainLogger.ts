/**
 * Vision Engine v2.5 - Brain Logger
 * 
 * Logs all vision suggestions and analysis to Brain
 * Session: "codex-vision-suggestions"
 */

const BRAIN_URL = "http://localhost:4100";

export async function logToBrain(sessionId: string, entry: any): Promise<void> {
  try {
    await fetch(`${BRAIN_URL}/brain/append`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        entry: typeof entry === "string" ? entry : JSON.stringify(entry, null, 2)
      })
    });
  } catch (error) {
    console.warn(`[BrainLogger] Failed to log to Brain:`, error);
    // Don't throw - logging failure shouldn't stop vision operations
  }
}
