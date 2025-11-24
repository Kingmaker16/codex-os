/**
 * Vision Engine v2 - Face & Sentiment Engine
 * 
 * Detect emotions, engagement, and attention
 */

import type { FaceData } from "./types.js";
import { runVisionFusion, analyzeSentiment } from "./fusionEngine.js";

/**
 * Analyze faces and emotions in image
 */
export async function analyzeFaces(image: string): Promise<FaceData[]> {
  console.log("[FaceSentiment] Analyzing faces");

  const prompt = `Analyze all faces in this image and for each face report:
1. Primary emotion (happy, sad, angry, surprised, neutral, engaged, focused)
2. Secondary emotions if present
3. Engagement level (0-1)
4. Attention level (0-1)

Format: Face 1: [emotion], engagement: [0-1], attention: [0-1]`;

  const fusion = await runVisionFusion({ image, prompt });
  const sentiment = await analyzeSentiment(image);

  // Parse response for face data
  const faces: FaceData[] = parseFaceData(fusion.result, sentiment);

  return faces;
}

/**
 * Parse face data from analysis text
 */
function parseFaceData(text: string, sentiment: { emotion: string; confidence: number }): FaceData[] {
  const faces: FaceData[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (/face\s*\d+/i.test(line)) {
      const emotions: Record<string, number> = {};
      const lower = line.toLowerCase();

      // Parse primary emotion
      const emotionMatch = lower.match(/(happy|sad|angry|surprised|neutral|engaged|focused)/);
      if (emotionMatch) {
        emotions[emotionMatch[1]] = 0.9;
      } else {
        emotions[sentiment.emotion] = sentiment.confidence;
      }

      // Parse engagement
      const engagementMatch = line.match(/engagement:\s*([\d.]+)/i);
      const engagement = engagementMatch ? parseFloat(engagementMatch[1]) : 0.5;

      // Parse attention
      const attentionMatch = line.match(/attention:\s*([\d.]+)/i);
      const attention = attentionMatch ? parseFloat(attentionMatch[1]) : 0.5;

      faces.push({
        emotions,
        engagement,
        attention,
        boundingBox: { x: 0, y: 0, width: 100, height: 100 }
      });
    }
  }

  // If no faces parsed, return default
  if (faces.length === 0) {
    faces.push({
      emotions: { [sentiment.emotion]: sentiment.confidence },
      engagement: 0.5,
      attention: 0.5
    });
  }

  return faces;
}
