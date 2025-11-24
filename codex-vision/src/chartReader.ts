/**
 * Vision Engine v2 - Chart Reader
 * 
 * Detect chart patterns, support/resistance, and trading signals
 */

import type { ChartAnalysisRequest, ChartAnalysisResult, ChartPattern, TradingSignal } from "./types.js";
import { runVisionFusion } from "./fusionEngine.js";

/**
 * Analyze trading chart for patterns and signals
 */
export async function analyzeChart(request: ChartAnalysisRequest): Promise<ChartAnalysisResult> {
  console.log(`[ChartReader] Analyzing ${request.type || "unknown"} chart`);

  const prompt = `Analyze this trading chart and identify:
1. Chart patterns (head and shoulders, double top/bottom, triangles, flags, wedges)
2. Support levels (price points where buying pressure exists)
3. Resistance levels (price points where selling pressure exists)
4. Volume blocks (high/low volume areas)
5. Liquidity zones (areas of high trading activity)
6. Order blocks (demand/supply zones)
7. Trendlines (uptrend, downtrend, consolidation)
8. Trading signals (buy, sell, hold recommendations)

Provide specific price levels and confidence scores.`;

  const fusion = await runVisionFusion({
    image: request.chart,
    prompt
  });

  // Parse chart analysis
  const patterns = parseChartPatterns(fusion.result);
  const supportLevels = parsePriceLevels(fusion.result, "support");
  const resistanceLevels = parsePriceLevels(fusion.result, "resistance");
  const signals = parseTradingSignals(fusion.result);

  return {
    patterns,
    supportLevels,
    resistanceLevels,
    volumeBlocks: [],
    liquidityZones: [],
    orderBlocks: [],
    trendlines: [],
    signals
  };
}

/**
 * Parse chart patterns
 */
function parseChartPatterns(text: string): ChartPattern[] {
  const patterns: ChartPattern[] = [];
  const patternNames = [
    "head and shoulders",
    "inverse head and shoulders",
    "double top",
    "double bottom",
    "ascending triangle",
    "descending triangle",
    "symmetrical triangle",
    "bull flag",
    "bear flag",
    "rising wedge",
    "falling wedge"
  ];

  const lines = text.toLowerCase().split("\n");

  for (const line of lines) {
    for (const patternName of patternNames) {
      if (line.includes(patternName)) {
        const signal = line.includes("bullish") || line.includes("buy") ? "bullish"
          : line.includes("bearish") || line.includes("sell") ? "bearish"
            : "neutral";

        patterns.push({
          type: patternName,
          confidence: 0.8,
          location: { x: 0, y: 0, width: 0, height: 0 },
          signal
        });
      }
    }
  }

  return patterns;
}

/**
 * Parse price levels
 */
function parsePriceLevels(text: string, type: "support" | "resistance"): number[] {
  const levels: number[] = [];
  const regex = type === "support"
    ? /support.*?([\d,.]+)/gi
    : /resistance.*?([\d,.]+)/gi;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const price = parseFloat(match[1].replace(/,/g, ""));
    if (!isNaN(price) && price > 0) {
      levels.push(price);
    }
  }

  return [...new Set(levels)].sort((a, b) => a - b);
}

/**
 * Parse trading signals
 */
function parseTradingSignals(text: string): TradingSignal[] {
  const signals: TradingSignal[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes("buy") || lower.includes("long")) {
      signals.push({
        action: "buy",
        confidence: 0.75,
        reasoning: line.trim()
      });
    } else if (lower.includes("sell") || lower.includes("short")) {
      signals.push({
        action: "sell",
        confidence: 0.75,
        reasoning: line.trim()
      });
    } else if (lower.includes("hold") || lower.includes("wait")) {
      signals.push({
        action: "hold",
        confidence: 0.7,
        reasoning: line.trim()
      });
    }
  }

  return signals.slice(0, 3);
}
