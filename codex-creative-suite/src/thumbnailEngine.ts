// thumbnailEngine.ts - Thumbnail Generation Engine

import type { ThumbnailConcept, SceneAnalysis } from "./types.js";

export class ThumbnailEngine {
  /**
   * Generate thumbnail concepts for video
   */
  async generateThumbnailConcepts(
    videoPath: string,
    platform: string,
    sceneAnalysis?: SceneAnalysis,
    count: number = 3
  ): Promise<ThumbnailConcept[]> {
    console.log(`[ThumbnailEngine] Generating ${count} thumbnail concepts for ${platform}`);

    const concepts: ThumbnailConcept[] = [];

    // Concept 1: Face + Bold Text
    concepts.push({
      concept: "Close-up face with emotional expression + bold contrasting text",
      elements: ["face", "text_overlay", "high_contrast", "emotion"],
      colorScheme: ["#FF0000", "#FFFF00", "#000000"],
      textOverlay: this.generateTextOverlay(platform),
      faceExpression: "surprise",
      visualHook: "Shocked/excited facial expression with eye-catching text",
      estimatedCTR: 0.08,
    });

    // Concept 2: Action Shot + Curiosity Gap
    concepts.push({
      concept: "Mid-action screenshot that creates curiosity gap",
      elements: ["action", "motion_blur", "curiosity", "text"],
      colorScheme: ["#FF6B00", "#4ECDC4", "#1A1A1A"],
      textOverlay: "WHAT HAPPENS NEXT?",
      visualHook: "Paused at peak action moment",
      estimatedCTR: 0.06,
    });

    // Concept 3: Before/After Split
    concepts.push({
      concept: "Before/After split screen comparison",
      elements: ["split_screen", "comparison", "arrows", "text"],
      colorScheme: ["#00FF00", "#FF0000", "#FFFFFF"],
      textOverlay: "BEFORE vs AFTER",
      visualHook: "Dramatic transformation visible at glance",
      estimatedCTR: 0.07,
    });

    // Use scene analysis if provided
    if (sceneAnalysis) {
      const customConcept = this.generateFromSceneAnalysis(sceneAnalysis, platform);
      if (customConcept) {
        concepts[2] = customConcept; // Replace concept 3
      }
    }

    return concepts.slice(0, count);
  }

  /**
   * Generate text overlay for thumbnail
   */
  private generateTextOverlay(platform: string): string {
    const overlays: Record<string, string[]> = {
      tiktok: ["OMG 😱", "WATCH THIS", "NO WAY", "INSANE 🔥"],
      reels: ["SWIPE UP", "MUST SEE", "THIS IS CRAZY", "POV:"],
      youtube: ["REVEALED", "THE TRUTH", "HOW TO", "WATCH NOW"],
      shorts: ["VIRAL", "TRENDING", "YOU WON'T BELIEVE", "SHOCKING"],
    };

    const options = overlays[platform] || overlays["tiktok"];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate thumbnail concept from scene analysis
   */
  private generateFromSceneAnalysis(
    analysis: SceneAnalysis,
    platform: string
  ): ThumbnailConcept | null {
    // Find most visually complex scene
    const complexScene = analysis.scenes.sort((a, b) => b.complexity - a.complexity)[0];

    if (!complexScene) return null;

    // Find moment with faces
    const faceDetection = analysis.faceDetections?.find(
      (f) =>
        f.timestamp >= complexScene.start &&
        f.timestamp <= complexScene.end &&
        f.count > 0
    );

    return {
      concept: "Scene-optimized thumbnail from highest visual interest moment",
      elements: ["key_frame", "faces", "color_pop", "text"],
      colorScheme: complexScene.dominantColors,
      textOverlay: this.generateTextOverlay(platform),
      faceExpression: faceDetection?.dominantExpression,
      visualHook: "Automatically selected peak visual moment",
      estimatedCTR: 0.075,
    };
  }

  /**
   * Generate Photoshop automation script for thumbnail creation
   */
  generatePhotoshopScript(concept: ThumbnailConcept, imagePath: string): string {
    // Generate ExtendScript (Photoshop scripting) commands
    const script = `
// Photoshop Thumbnail Automation Script
var doc = app.open(new File("${imagePath}"));

// Resize to optimal thumbnail dimensions
doc.resizeImage(1280, 720, 72, ResampleMethod.BICUBIC);

// Apply contrast enhancement
var contrastLayer = doc.artLayers.add();
contrastLayer.blendMode = BlendMode.OVERLAY;
contrastLayer.opacity = 30;

// Add text overlay
var textLayer = doc.artLayers.add();
textLayer.kind = LayerKind.TEXT;
var textItem = textLayer.textItem;
textItem.contents = "${concept.textOverlay || "WATCH THIS"}";
textItem.size = 120;
textItem.font = "Impact";
textItem.justification = Justification.CENTER;

// Position text at top
textItem.position = [doc.width / 2, 150];

// Add text stroke for readability
var strokeStyle = textLayer.blendingRanges[0];
textLayer.applyStyle({
  stroke: {
    enabled: true,
    size: 8,
    color: { red: 0, green: 0, blue: 0 }
  }
});

// Apply color scheme adjustments
${concept.colorScheme
  .map((color, i) => `// Accent color ${i + 1}: ${color}`)
  .join("\n")}

// Save as PNG
var saveOptions = new PNGSaveOptions();
saveOptions.compression = 9;
doc.saveAs(new File("${imagePath.replace(/\.\w+$/, "_thumbnail.png")}"), saveOptions);

doc.close(SaveOptions.DONOTSAVECHANGES);
`;

    return script;
  }

  /**
   * Get best frame timestamps for thumbnail extraction
   */
  getBestFrameTimestamps(
    videoPath: string,
    sceneAnalysis?: SceneAnalysis,
    count: number = 5
  ): number[] {
    if (!sceneAnalysis) {
      // Default timestamps without analysis
      return [1.0, 5.0, 10.0, 15.0, 20.0].slice(0, count);
    }

    const timestamps: number[] = [];

    // Add frames from complex scenes
    const complexScenes = sceneAnalysis.scenes
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, Math.ceil(count / 2));

    timestamps.push(
      ...complexScenes.map((s) => s.keyFrameTimestamp || s.start + (s.end - s.start) / 2)
    );

    // Add frames with faces
    if (sceneAnalysis.faceDetections) {
      const faceFrames = sceneAnalysis.faceDetections
        .filter(
          (f) =>
            f.dominantExpression === "surprise" || f.dominantExpression === "excitement"
        )
        .sort((a, b) => b.count - a.count)
        .slice(0, Math.floor(count / 2));

      timestamps.push(...faceFrames.map((f) => f.timestamp));
    }

    return timestamps.slice(0, count).sort((a, b) => a - b);
  }

  /**
   * Analyze thumbnail performance
   */
  analyzeThumbnailPerformance(
    thumbnailPath: string,
    views: number,
    clicks: number
  ): {
    ctr: number;
    performance: "low" | "medium" | "high";
    recommendations: string[];
  } {
    const ctr = clicks / views;
    let performance: "low" | "medium" | "high";
    const recommendations: string[] = [];

    if (ctr < 0.03) {
      performance = "low";
      recommendations.push("Increase text size and contrast");
      recommendations.push("Use more emotional facial expressions");
      recommendations.push("Add bright accent colors (red, yellow)");
      recommendations.push("Create stronger curiosity gap");
    } else if (ctr < 0.06) {
      performance = "medium";
      recommendations.push("A/B test different text overlays");
      recommendations.push("Experiment with face positioning");
      recommendations.push("Test color scheme variations");
    } else {
      performance = "high";
      recommendations.push("This thumbnail is performing well!");
      recommendations.push("Replicate successful elements in future thumbnails");
      recommendations.push("Consider slight variations to prevent fatigue");
    }

    return { ctr, performance, recommendations };
  }

  /**
   * Generate A/B test variations
   */
  generateABTestVariations(
    baseConcept: ThumbnailConcept,
    count: number = 3
  ): ThumbnailConcept[] {
    const variations: ThumbnailConcept[] = [];

    // Variation 1: Different text
    variations.push({
      ...baseConcept,
      textOverlay: "YOU WON'T BELIEVE THIS",
      concept: `${baseConcept.concept} (Text variant A)`,
    });

    // Variation 2: Different color scheme
    variations.push({
      ...baseConcept,
      colorScheme: ["#FF00FF", "#00FFFF", "#FFFF00"],
      concept: `${baseConcept.concept} (Color variant)`,
    });

    // Variation 3: No text overlay
    variations.push({
      ...baseConcept,
      textOverlay: undefined,
      concept: `${baseConcept.concept} (No text)`,
    });

    return variations.slice(0, count);
  }
}
