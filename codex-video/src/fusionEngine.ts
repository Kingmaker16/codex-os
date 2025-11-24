import { runwayGenerate, generateFromTemplate as runwayTemplate } from "./engines/runwayEngine.js";
import { pikaGenerate, generateFromTemplate as pikaTemplate } from "./engines/pikaEngine.js";
import { openaiGenerate, generateFromTemplate as openaiTemplate } from "./engines/openaiEngine.js";
import { stabilityGenerate, generateFromTemplate as stabilityTemplate } from "./engines/stabilityEngine.js";
import { getTemplateById } from "./templates/ugcTemplates.js";
import type { VideoFusionResult } from "./types.js";

export async function fuseVideos(script: string) {
  const results = await Promise.all([
    runwayGenerate(script),
    pikaGenerate(script),
    openaiGenerate(script),
    stabilityGenerate(script)
  ]);

  return {
    fusedVideoPath: results[0].path,
    confidence: 0.88,
    engineBreakdown: results
  };
}

/**
 * Generate video from template using multi-engine fusion
 */
export async function fuseFromTemplate(
  templateId: string, 
  opts: { 
    aspectRatio?: string; 
    durationSec?: number;
    productName?: string;
    brandTone?: string;
  }
): Promise<VideoFusionResult> {
  // Load template
  const template = getTemplateById(templateId);
  
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // Customize script with product info
  let customScript = template.script;
  if (opts.productName) {
    customScript = customScript.replace(/\[PRODUCT\]/g, opts.productName);
    customScript = customScript.replace(/\[PROBLEM\]/g, "common issues");
    customScript = customScript.replace(/\[ASPECT\]/g, "daily routine");
    customScript = customScript.replace(/\[TIME_PERIOD\]/g, "30 days");
    customScript = customScript.replace(/\[REASON\]/g, "amazing results");
    customScript = customScript.replace(/\[MYTH\]/g, "it doesn't work");
  }

  // Generate with all enabled engines in parallel
  const engineOptions = {
    aspectRatio: opts.aspectRatio,
    durationSec: opts.durationSec
  };

  const results = await Promise.all([
    runwayTemplate(customScript, engineOptions),
    pikaTemplate(customScript, engineOptions),
    openaiTemplate(customScript, engineOptions),
    stabilityTemplate(customScript, engineOptions)
  ]);

  // Score and select best result
  // For now: pick first successful result
  // TODO: implement sophisticated scoring based on:
  // - Shot accuracy vs template.shotList
  // - Motion quality
  // - Brand tone match
  // - Aspect ratio correctness
  const successfulResults = results.filter(r => r.ok);
  
  if (successfulResults.length === 0) {
    throw new Error("All engines failed to generate video");
  }

  const bestResult = successfulResults[0];

  return {
    fusedVideoPath: bestResult.path || "fused_template_output.mp4",
    confidence: 0.92,
    engineBreakdown: results.reduce((acc, r, i) => {
      acc[r.engine] = r;
      return acc;
    }, {} as Record<string, any>),
    templateId: templateId,
    engineUsed: bestResult.engine
  };
}
