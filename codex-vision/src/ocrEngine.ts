/**
 * Vision Engine v2 - OCR Engine
 * 
 * High-accuracy OCR using multi-model vision
 */

import type { OCRRequest, OCRResult, ExtractedText } from "./types.js";
import { extractTextVision, runVisionFusion } from "./fusionEngine.js";

/**
 * Extract text from image using vision models
 */
export async function performOCR(request: OCRRequest): Promise<OCRResult> {
  console.log("[OCR] Extracting text from image");

  const prompt = `Extract all visible text from this image. Include:
1. Main text content
2. Menu items
3. Button labels
4. Dialog messages
5. Error messages
6. Subtitles

Return only the text, preserving line breaks and formatting.`;

  const fusion = await runVisionFusion({
    image: request.image,
    prompt
  });

  // Also use simplified text extraction
  const simpleText = await extractTextVision(request.image);

  // Combine results
  const combinedText = fusion.result.length > simpleText.length ? fusion.result : simpleText;

  // Parse into blocks
  const blocks: ExtractedText[] = combinedText
    .split("\n")
    .filter(line => line.trim().length > 0)
    .map(line => ({
      text: line.trim(),
      confidence: 0.9,
      boundingBox: { x: 0, y: 0, width: 0, height: 0 }
    }));

  return {
    text: combinedText,
    blocks,
    confidence: fusion.confidence
  };
}
