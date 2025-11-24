/**
 * Vision Engine v2 - AR Stream
 * 
 * Real-time AR glasses integration (WebSocket)
 */

import type { ARStreamFrame, ARStreamResponse } from "./types.js";
import { CONFIG } from "./config.js";
import { extractObjects, extractTextVision, analyzeSentiment } from "./fusionEngine.js";
import { analyzeFaces } from "./faceSentiment.js";

/**
 * Process AR frame in real-time
 */
export async function processARFrame(frame: ARStreamFrame): Promise<ARStreamResponse> {
  console.log(`[ARStream] Processing frame at ${frame.timestamp}ms`);

  const startTime = Date.now();

  // Run parallel analysis
  const [objects, text, faces, sentiment] = await Promise.all([
    extractObjects(frame.image, "List key objects, UI elements, and people").catch(() => []),
    extractTextVision(frame.image).catch(() => ""),
    analyzeFaces(frame.image).catch(() => []),
    analyzeSentiment(frame.image).catch(() => ({ emotion: "neutral", confidence: 0.5 }))
  ]);

  // Generate contextual suggestions
  const suggestions = generateARSuggestions(objects, text, sentiment);

  const processingTime = Date.now() - startTime;
  console.log(`[ARStream] Frame processed in ${processingTime}ms`);

  return {
    suggestions,
    objects: objects.map(obj => ({
      label: obj,
      confidence: 0.85,
      boundingBox: { x: 0, y: 0, width: 0, height: 0 }
    })),
    emotions: faces,
    text: text.split("\n").filter(t => t.trim()).map(t => ({
      text: t.trim(),
      confidence: 0.9
    })),
    timestamp: Date.now()
  };
}

/**
 * Generate contextual AR suggestions
 */
function generateARSuggestions(objects: string[], text: string, sentiment: { emotion: string }): string[] {
  const suggestions: string[] = [];

  // Context-aware suggestions
  if (objects.some(obj => obj.includes("person") || obj.includes("face"))) {
    suggestions.push(`Person detected - ${sentiment.emotion} emotion`);
  }

  if (objects.some(obj => obj.includes("screen") || obj.includes("monitor"))) {
    suggestions.push("Screen detected - capture for analysis");
  }

  if (text.toLowerCase().includes("error") || text.toLowerCase().includes("warning")) {
    suggestions.push("⚠️ Error message detected");
  }

  if (objects.some(obj => obj.includes("chart") || obj.includes("graph"))) {
    suggestions.push("📊 Chart detected - analyze patterns");
  }

  if (suggestions.length === 0) {
    suggestions.push("Ready for analysis");
  }

  return suggestions.slice(0, 5);
}

/**
 * WebSocket handler for AR stream
 */
export function createARStreamHandler() {
  return async (connection: any) => {
    console.log("[ARStream] New AR connection established");

    connection.socket.on("message", async (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "frame") {
          const frame: ARStreamFrame = {
            image: data.image,
            timestamp: data.timestamp || Date.now()
          };

          const response = await processARFrame(frame);
          connection.socket.send(JSON.stringify(response));
        }
      } catch (err: any) {
        console.error("[ARStream] Frame processing error:", err.message);
        connection.socket.send(JSON.stringify({
          error: "Frame processing failed",
          message: err.message
        }));
      }
    });

    connection.socket.on("close", () => {
      console.log("[ARStream] AR connection closed");
    });
  };
}
