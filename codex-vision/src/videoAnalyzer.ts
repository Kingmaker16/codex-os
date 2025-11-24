/**
 * Vision Engine v2 - Video Analyzer
 * 
 * Extract keyframes, detect objects, actions, and insights from video
 */

import type { VideoAnalysisRequest, VideoAnalysisResult, VideoTimestamp } from "./types.js";
import { runVisionFusion } from "./fusionEngine.js";
import { CONFIG } from "./config.js";

/**
 * Analyze video content using keyframe extraction and fusion
 */
export async function analyzeVideo(request: VideoAnalysisRequest): Promise<VideoAnalysisResult> {
  console.log("[VideoAnalyzer] Starting video analysis");

  // Extract keyframes from video chunks
  const frames = request.videoChunks || [];
  const maxFrames = Math.min(frames.length, CONFIG.maxVideoChunks);
  const selectedFrames = selectKeyframes(frames, maxFrames);

  console.log(`[VideoAnalyzer] Processing ${selectedFrames.length} keyframes`);

  // Analyze each keyframe
  const frameAnalyses = await Promise.all(
    selectedFrames.map(async (frame, index) => {
      try {
        const prompt = `Analyze this video frame. Describe:
1. Main objects and people
2. Actions happening
3. Scene context
4. Any text visible
5. Key insights or strategies

Be concise and specific.`;

        const fusion = await runVisionFusion({ image: frame, prompt });
        
        return {
          frameIndex: index,
          time: (index * CONFIG.keyframeInterval) / 30, // Assume 30 FPS
          description: fusion.result,
          confidence: fusion.confidence
        };
      } catch (err) {
        console.error(`[VideoAnalyzer] Frame ${index} analysis failed:`, err);
        return null;
      }
    })
  );

  const validAnalyses = frameAnalyses.filter((a): a is NonNullable<typeof a> => a !== null);

  // Extract objects, actions, and insights
  const objects = new Set<string>();
  const actions = new Set<string>();
  const insights: string[] = [];
  const timestamps: VideoTimestamp[] = [];

  for (const analysis of validAnalyses) {
    // Parse description for objects (nouns)
    const words = analysis.description.toLowerCase().split(/\s+/);
    const commonNouns = ["person", "people", "man", "woman", "hand", "screen", "button", "tool", "object"];
    words.forEach(word => {
      if (commonNouns.some(noun => word.includes(noun))) {
        objects.add(word);
      }
    });

    // Parse for actions (verbs)
    const actionWords = ["clicking", "typing", "moving", "selecting", "editing", "playing", "watching"];
    words.forEach(word => {
      if (actionWords.some(action => word.includes(action))) {
        actions.add(word);
      }
    });

    // Extract insights (sentences with "should", "can", "tip", "strategy")
    const sentences = analysis.description.split(/[.!?]/);
    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();
      if (lower.includes("should") || lower.includes("tip") || lower.includes("strategy") || lower.includes("can")) {
        insights.push(sentence.trim());
      }
    });

    timestamps.push({
      time: analysis.time,
      description: analysis.description,
      keyObjects: Array.from(objects).slice(0, 5)
    });
  }

  // Generate overall summary
  const summaryPrompt = `Based on these video frame analyses, provide a comprehensive 2-3 sentence summary:

${validAnalyses.map(a => `[${a.time}s] ${a.description}`).join("\n\n")}`;

  let summary = "Video analysis complete.";
  try {
    const summaryFusion = await runVisionFusion({
      image: selectedFrames[0] || "",
      prompt: summaryPrompt
    });
    summary = summaryFusion.result;
  } catch (err) {
    console.error("[VideoAnalyzer] Summary generation failed:", err);
  }

  const avgConfidence = validAnalyses.reduce((sum, a) => sum + a.confidence, 0) / validAnalyses.length;

  return {
    summary,
    timestamps,
    insights: insights.slice(0, 10),
    objects: Array.from(objects).slice(0, 20),
    actions: Array.from(actions).slice(0, 10),
    confidence: avgConfidence
  };
}

/**
 * Select keyframes from video frames
 */
function selectKeyframes(frames: string[], maxCount: number): string[] {
  if (frames.length <= maxCount) {
    return frames;
  }

  // Select evenly distributed frames
  const step = Math.floor(frames.length / maxCount);
  const selected: string[] = [];

  for (let i = 0; i < frames.length; i += step) {
    selected.push(frames[i]);
    if (selected.length >= maxCount) break;
  }

  return selected;
}
