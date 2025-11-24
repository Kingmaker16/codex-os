/**
 * Vision Engine v2 - Object Detector
 * 
 * Multi-model object detection
 */

import type { DetectedObject } from "./types.js";
import { extractObjects } from "./fusionEngine.js";

/**
 * Detect objects in image
 */
export async function detectObjects(image: string, filter?: string[]): Promise<DetectedObject[]> {
  console.log("[ObjectDetector] Detecting objects");

  const prompt = filter && filter.length > 0
    ? `Identify and list all instances of these objects: ${filter.join(", ")}`
    : "Identify and list all objects, people, screens, UI regions, and notable elements.";

  const objectList = await extractObjects(image, prompt);

  const objects: DetectedObject[] = objectList.map(label => ({
    label: label.trim(),
    confidence: 0.85,
    boundingBox: { x: 0, y: 0, width: 0, height: 0 }
  }));

  return objects;
}

/**
 * Detect specific trading/casino elements
 */
export async function detectTradingElements(image: string): Promise<DetectedObject[]> {
  const tradingElements = [
    "roulette wheel",
    "trading chart",
    "candlestick",
    "volume bar",
    "support line",
    "resistance line",
    "liquidity zone",
    "order block"
  ];

  return detectObjects(image, tradingElements);
}
