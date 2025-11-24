/**
 * Vision Engine v2 - Vision Controller
 * 
 * Main orchestration for vision analysis tasks
 */

import type {
  ImageAnalysisRequest,
  ImageAnalysisResult,
  VideoAnalysisRequest,
  VideoAnalysisResult,
  ScreenAnalysisRequest,
  ScreenAnalysisResult,
  UIMapRequest,
  UIMapResult,
  OCRRequest,
  OCRResult,
  ChartAnalysisRequest,
  ChartAnalysisResult
} from "./types.js";

import { runVisionFusion, extractObjects, extractTextVision, analyzeSentiment } from "./fusionEngine.js";
import { analyzeVideo } from "./videoAnalyzer.js";
import { analyzeScreen } from "./screenAnalyzer.js";
import { mapUI } from "./uiMapper.js";
import { performOCR } from "./ocrEngine.js";
import { analyzeFaces } from "./faceSentiment.js";
import { detectObjects } from "./objectDetector.js";
import { analyzeChart } from "./chartReader.js";
import { CONFIG } from "./config.js";

/**
 * Analyze image (general purpose)
 */
export async function analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
  console.log(`[VisionController] Analyzing image (mode: ${request.mode || "general"})`);

  const prompt = request.prompt || getModePrompt(request.mode || "general");

  // Run fusion analysis
  const fusion = await runVisionFusion({
    image: request.image,
    prompt
  });

  // Extract structured data based on mode
  let objects = await extractObjects(request.image);
  let text = await extractTextVision(request.image);
  let faces = request.mode === "face" ? await analyzeFaces(request.image) : undefined;
  let sentiment = request.mode === "face" ? (await analyzeSentiment(request.image)).emotion : undefined;

  const result: ImageAnalysisResult = {
    description: fusion.result,
    objects: objects.map(label => ({
      label,
      confidence: 0.85
    })),
    text: text.split("\n").filter(t => t.trim()).map(t => ({
      text: t.trim(),
      confidence: 0.9
    })),
    faces,
    sentiment,
    confidence: fusion.confidence,
    models: fusion.sources.map(s => `${s.provider}:${s.model}`),
    timestamp: new Date().toISOString()
  };

  // Log to Brain
  await logToBrain("codex-vision-log", {
    type: "image_analysis",
    mode: request.mode,
    result
  });

  return result;
}

/**
 * Get mode-specific prompts
 */
function getModePrompt(mode: string): string {
  const prompts: Record<string, string> = {
    general: "Describe this image in detail. Identify all objects, people, text, and UI elements.",
    ui: "Analyze this UI screenshot. Identify all interactive elements, menus, buttons, and controls.",
    chart: "Analyze this chart. Identify patterns, support/resistance levels, and trading signals.",
    face: "Analyze faces in this image. Describe emotions, engagement, and attention levels.",
    ocr: "Extract all visible text from this image, preserving formatting."
  };

  return prompts[mode] || prompts.general;
}

/**
 * Log analysis to Brain
 */
async function logToBrain(sessionId: string, data: any): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    await fetch(`${CONFIG.brainUrl}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "TurnAppended",
        event: {
          sessionId,
          role: "system",
          text: JSON.stringify(data),
          ts: timestamp
        }
      })
    });
  } catch (err) {
    console.error("[VisionController] Brain logging failed:", err);
  }
}

/**
 * Export all analysis functions
 */
export {
  analyzeVideo,
  analyzeScreen,
  mapUI,
  performOCR,
  analyzeFaces,
  detectObjects,
  analyzeChart
};
