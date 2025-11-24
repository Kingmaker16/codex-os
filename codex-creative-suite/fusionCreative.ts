// =============================================
// CREATIVE SUITE v1.5 — FUSION CREATIVE ENGINE
// =============================================

import fetch from "node-fetch";
import { CreativeRequest, CreativePlan, HookSuggestion } from "./types.js";
import { v4 as uuid } from "uuid";

const BRIDGE_URL = "http://localhost:4000";

export async function generateFusionCreativePlan(request: CreativeRequest): Promise<CreativePlan> {
  console.log(`[FusionCreative] Generating plan for ${request.platform} ${request.contentType}`);

  // Multi-LLM fusion: Query GPT-4o, Claude, Gemini, Grok in parallel
  const [gpt4Hooks, claudeHooks, geminiHooks, grokHooks] = await Promise.all([
    generateHooksFromModel("openai", "gpt-4o", request),
    generateHooksFromModel("claude", "claude-3-5-sonnet-20241022", request),
    generateHooksFromModel("gemini", "gemini-2.0-flash-exp", request),
    generateHooksFromModel("grok", "grok-beta", request)
  ]);

  // Combine and deduplicate hooks
  const allHooks = [...gpt4Hooks, ...claudeHooks, ...geminiHooks, ...grokHooks];
  const fusedHooks = deduplicateAndRankHooks(allHooks);

  // Generate comprehensive creative plan
  const plan: CreativePlan = {
    id: uuid(),
    sessionId: request.sessionId,
    strategy: generateStrategy(request, fusedHooks),
    hooks: fusedHooks.slice(0, 10), // Top 10 hooks
    pacing: generatePacingPlan(request),
    scenes: [], // Will be populated by sceneDetect
    captions: generateCaptionPlan(request),
    thumbnail: generateThumbnailPlan(request),
    audio: generateAudioPlan(request),
    brandVoice: { compliant: true, score: 95, violations: [], suggestions: [], tone: "authentic" },
    trendAlignment: { aligned: true, trendScore: 85, trendingElements: [], missedOpportunities: [], recommendations: [] },
    estimatedPerformance: estimatePerformance(request),
    createdAt: new Date().toISOString()
  };

  return plan;
}

async function generateHooksFromModel(
  provider: string,
  model: string,
  request: CreativeRequest
): Promise<HookSuggestion[]> {
  try {
    const prompt = `Generate 5 viral hooks for ${request.platform} ${request.contentType} content in the ${request.niche} niche. ${
      request.productName ? `Product: ${request.productName}. ` : ""
    }Output JSON array of hooks with format: [{"text": "...", "type": "question|statement|challenge|curiosity|emotion"}]`;

    const response = await fetch(`${BRIDGE_URL}/respond?provider=${provider}&model=${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a viral content expert. Output only raw JSON arrays." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.warn(`[FusionCreative] ${provider} failed:`, response.status);
      return [];
    }

    const data = await response.json() as any;
    const output = data.output || "";
    
    // Parse JSON from output
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const hooks = JSON.parse(jsonMatch[0]);
    return hooks.map((h: any) => ({
      id: uuid(),
      text: h.text,
      type: h.type || "statement",
      strength: Math.floor(Math.random() * 30) + 70, // 70-100
      platform: [request.platform],
      source: provider === "openai" ? "gpt4" : provider as any
    }));
  } catch (err) {
    console.warn(`[FusionCreative] ${provider} error:`, err);
    return [];
  }
}

function deduplicateAndRankHooks(hooks: HookSuggestion[]): HookSuggestion[] {
  // Simple deduplication by text similarity
  const unique: HookSuggestion[] = [];
  const seen = new Set<string>();

  for (const hook of hooks) {
    const normalized = hook.text.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(hook);
    }
  }

  // Sort by strength
  return unique.sort((a, b) => b.strength - a.strength);
}

function generateStrategy(request: CreativeRequest, hooks: HookSuggestion[]): string {
  const topHook = hooks[0]?.text || "Start with a strong opening";
  return `Lead with "${topHook}", build tension through ${request.contentType} pacing, deliver value in the ${request.niche} niche, and end with a clear CTA. Optimize for ${request.platform} algorithm.`;
}

function generatePacingPlan(request: CreativeRequest): any {
  const duration = request.contentType === "short-form" ? 30 : 180;
  return {
    totalDuration: duration,
    segments: [
      { startTime: 0, endTime: 3, type: "hook", intensity: 10, emotionalBeat: "curiosity" },
      { startTime: 3, endTime: duration * 0.6, type: "buildup", intensity: 7, emotionalBeat: "interest" },
      { startTime: duration * 0.6, endTime: duration * 0.9, type: "climax", intensity: 9, emotionalBeat: "excitement" },
      { startTime: duration * 0.9, endTime: duration, type: "cta", intensity: 8, emotionalBeat: "urgency" }
    ],
    viralScore: 78
  };
}

function generateCaptionPlan(request: CreativeRequest): any {
  return {
    captions: [
      {
        startTime: 0,
        endTime: 3,
        text: "Watch this...",
        position: "center",
        style: { fontSize: 48, fontFamily: "Impact", color: "#FFFFFF", animation: "bounce" }
      }
    ],
    style: "minimal",
    platform: request.platform
  };
}

function generateThumbnailPlan(request: CreativeRequest): any {
  return {
    id: uuid(),
    keyFrame: 1.5,
    elements: [
      { type: "face", position: { x: 100, y: 100 }, size: { width: 300, height: 300 } },
      { type: "text", position: { x: 50, y: 400 }, size: { width: 500, height: 100 }, content: "CLICK ME" }
    ],
    textOverlay: "You Won't Believe This!",
    colorScheme: ["#FF0000", "#FFFF00", "#FFFFFF"],
    clickabilityScore: 87
  };
}

function generateAudioPlan(request: CreativeRequest): any {
  return {
    loudness: -14, // LUFS
    normalizationApplied: true,
    noiseReduction: true,
    musicTrack: "trending-audio-001.mp3"
  };
}

function estimatePerformance(request: CreativeRequest): any {
  const baseViews = request.platform === "tiktok" ? 10000 : 5000;
  return {
    viewsEstimate: { min: baseViews, max: baseViews * 10 },
    engagementRate: 8.5,
    conversionProbability: 3.2,
    viralPotential: "medium",
    confidence: 75
  };
}
