/**
 * Vision Engine v2 - Fusion Engine
 * 
 * Multi-model vision AGI with consensus scoring
 */

import { CONFIG, type VisionProvider } from "./config.js";
import type { FusionRequest, FusionResponse } from "./types.js";

/**
 * Run multi-model vision fusion
 */
export async function runVisionFusion(request: FusionRequest): Promise<FusionResponse> {
  const providers = request.providers 
    ? CONFIG.visionProviders.filter(p => request.providers!.includes(p.provider))
    : CONFIG.visionProviders;

  const responses = await Promise.all(
    providers.map(async (config) => {
      try {
        const response = await fetch(
          `${CONFIG.bridgeUrl}/respond?provider=${config.provider}&model=${config.model}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: request.prompt },
                    { type: "image_url", image_url: { url: `data:image/png;base64,${request.image}` } }
                  ]
                }
              ],
              max_tokens: 1000
            })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json() as any;
        const content = data.choices?.[0]?.message?.content || "";

        return {
          provider: config.provider,
          model: config.model,
          response: content,
          confidence: content.length > 50 ? 0.9 : 0.6
        };
      } catch (err: any) {
        console.error(`Vision fusion error (${config.provider}):`, err.message);
        return null;
      }
    })
  );

  const validResponses = responses.filter((r): r is NonNullable<typeof r> => r !== null);

  if (validResponses.length === 0) {
    throw new Error("All vision models failed");
  }

  const consensus = validResponses.length >= 2;
  const avgConfidence = validResponses.reduce((sum, r) => sum + r.confidence, 0) / validResponses.length;
  const mergedResult = mergeVisionResponses(validResponses);

  return {
    result: mergedResult,
    confidence: avgConfidence,
    sources: validResponses,
    consensus
  };
}

/**
 * Merge multiple vision model responses
 */
function mergeVisionResponses(responses: Array<{ provider: string; response: string; confidence: number }>): string {
  if (responses.length === 1) {
    return responses[0].response;
  }

  // For multiple responses, combine insights with attribution
  return responses
    .map((r, i) => `[Model ${i + 1} - ${r.provider}]\n${r.response}`)
    .join("\n\n---\n\n");
}

/**
 * Extract objects from vision analysis using fusion
 */
export async function extractObjects(image: string, prompt?: string): Promise<string[]> {
  const fusionPrompt = prompt || "List all objects, people, and UI elements visible in this image. Return as a comma-separated list.";
  
  try {
    const fusion = await runVisionFusion({ image, prompt: fusionPrompt });
    const objectText = fusion.result.toLowerCase();
    
    // Parse comma-separated or line-separated list
    const objects = objectText
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50);
    
    return [...new Set(objects)]; // Remove duplicates
  } catch (err: any) {
    console.error("Object extraction error:", err);
    return [];
  }
}

/**
 * Extract text using vision OCR
 */
export async function extractTextVision(image: string): Promise<string> {
  const prompt = "Extract all visible text from this image. Return only the text content, preserving formatting where possible.";
  
  try {
    const fusion = await runVisionFusion({ image, prompt });
    return fusion.result;
  } catch (err: any) {
    console.error("Text extraction error:", err);
    return "";
  }
}

/**
 * Analyze sentiment/emotion from image
 */
export async function analyzeSentiment(image: string): Promise<{ emotion: string; confidence: number }> {
  const prompt = "Analyze the emotional tone and sentiment of this image. What emotions are present? Return a single primary emotion and confidence (0-1).";
  
  try {
    const fusion = await runVisionFusion({ image, prompt });
    const text = fusion.result.toLowerCase();
    
    // Simple emotion detection
    const emotions = ["happy", "sad", "angry", "surprised", "neutral", "engaged", "focused"];
    const detected = emotions.find(e => text.includes(e)) || "neutral";
    
    return {
      emotion: detected,
      confidence: fusion.confidence
    };
  } catch (err: any) {
    console.error("Sentiment analysis error:", err);
    return { emotion: "neutral", confidence: 0.5 };
  }
}
