/**
 * Knowledge Engine v2.5 - Fusion Engine
 * 
 * Multi-model fusion for reasoning
 * Runs 4 models in parallel, weights by confidence, merges results
 */

import type { FusionRequest, FusionResult, FusionSource } from "./types.js";
import { CONFIG } from "./config.js";

const BRIDGE_URL = CONFIG.bridgeUrl;

export async function runFusion(request: FusionRequest): Promise<FusionResult> {
  console.log(`[FusionEngine] Running fusion with ${CONFIG.providers.length} models`);

  const providers = request.providers || CONFIG.providers.map(p => p.name);
  const startTime = Date.now();

  // Run all models in parallel
  const results = await Promise.allSettled(
    CONFIG.providers
      .filter(p => providers.includes(p.name))
      .map(provider => queryProvider(provider.name, provider.model, request.prompt, request.context))
  );

  const sources: FusionSource[] = [];
  const successful: FusionSource[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      sources.push(result.value);
      if (result.value.response) {
        successful.push(result.value);
      }
    }
  }

  if (successful.length === 0) {
    return {
      result: "All fusion models failed",
      confidence: 0,
      sources,
      consensus: false,
      timestamp: new Date().toISOString()
    };
  }

  // Weight responses by confidence
  const weighted = successful.map(s => ({
    response: s.response,
    weight: s.confidence
  }));

  // Merge into unified result
  const fusedResult = mergeFusionResults(weighted);
  const consensus = checkConsensus(successful);
  const avgConfidence = successful.reduce((sum, s) => sum + s.confidence, 0) / successful.length;

  console.log(`[FusionEngine] Fusion complete: ${successful.length}/${sources.length} models succeeded`);

  return {
    result: fusedResult,
    confidence: avgConfidence,
    sources,
    consensus,
    timestamp: new Date().toISOString()
  };
}

async function queryProvider(
  provider: string,
  model: string,
  prompt: string,
  context?: string
): Promise<FusionSource> {
  const startTime = Date.now();

  try {
    const messages = [];
    if (context) {
      messages.push({ role: "system", content: context });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch(`${BRIDGE_URL}/respond?provider=${provider}&model=${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        max_tokens: 2000,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(CONFIG.fusionTimeout)
    });

    if (!response.ok) {
      throw new Error(`Provider ${provider} returned ${response.status}`);
    }

    const data = await response.json() as any;
    const latency = Date.now() - startTime;

    return {
      provider,
      model,
      response: data.content || data.text || "",
      confidence: calculateConfidence(data),
      latency
    };
  } catch (error: any) {
    console.warn(`[FusionEngine] ${provider} failed:`, error.message);
    return {
      provider,
      model,
      response: "",
      confidence: 0,
      latency: Date.now() - startTime
    };
  }
}

function mergeFusionResults(weighted: Array<{ response: string; weight: number }>): string {
  if (weighted.length === 0) return "";
  if (weighted.length === 1) return weighted[0].response;

  // Sort by weight (highest first)
  weighted.sort((a, b) => b.weight - a.weight);

  // Use highest confidence response as base
  const primary = weighted[0].response;

  // Append unique insights from other responses
  let merged = primary;
  const primaryLower = primary.toLowerCase();

  for (let i = 1; i < weighted.length; i++) {
    const response = weighted[i].response;
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      if (!primaryLower.includes(sentenceLower) && weighted[i].weight > 0.6) {
        merged += "\n\n" + sentence.trim() + ".";
      }
    }
  }

  return merged;
}

function checkConsensus(sources: FusionSource[]): boolean {
  if (sources.length < 2) return true;

  // Check if responses have significant overlap
  const responses = sources.map(s => s.response.toLowerCase());
  let overlapCount = 0;

  for (let i = 0; i < responses.length; i++) {
    for (let j = i + 1; j < responses.length; j++) {
      const overlap = calculateOverlap(responses[i], responses[j]);
      if (overlap > 0.5) overlapCount++;
    }
  }

  const totalPairs = (responses.length * (responses.length - 1)) / 2;
  return overlapCount / totalPairs > 0.5;
}

function calculateOverlap(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

function calculateConfidence(data: any): number {
  // Default confidence based on response quality
  if (!data.content && !data.text) return 0;

  const responseText = data.content || data.text || "";
  const length = responseText.length;

  // Longer, more detailed responses get higher confidence
  if (length > 1000) return 0.95;
  if (length > 500) return 0.85;
  if (length > 200) return 0.75;
  if (length > 50) return 0.65;
  return 0.5;
}
