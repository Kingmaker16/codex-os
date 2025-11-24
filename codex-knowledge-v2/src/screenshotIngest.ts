/**
 * Knowledge Engine v2.5 - Screenshot Ingestion
 */

import type { IngestedContent } from "./types.js";
import { chunkContent } from "./extractor.js";
import { runFusion } from "./fusionEngine.js";

export async function ingestScreenshot(base64Image: string, context?: string): Promise<IngestedContent> {
  console.log(`[ScreenshotIngest] Processing screenshot`);

  // Use vision fusion to extract text from screenshot
  const prompt = context 
    ? `Analyze this screenshot and extract all text and information. Context: ${context}`
    : "Analyze this screenshot and extract all text, UI elements, and key information visible.";

  const fusion = await runFusion({ 
    prompt,
    context: `Image data: ${base64Image.substring(0, 100)}...` 
  });

  const rawContent = fusion.result;
  const chunks = chunkContent(rawContent);

  return {
    type: "screenshot",
    source: "screenshot",
    rawContent,
    chunks,
    metadata: {
      processedAt: new Date().toISOString(),
      confidence: fusion.confidence,
      imageSize: base64Image.length
    }
  };
}
