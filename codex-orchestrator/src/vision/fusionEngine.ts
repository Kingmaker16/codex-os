import { areCoordinatesNear, getMidpoint } from "./coordinateMapper.js";

export interface VisionClick {
  selector?: string;
  x?: number;
  y?: number;
  confidence: number;
  source: string; // 'openai' | 'claude' | 'fusion'
}

/**
 * Fuse vision results from multiple models using intelligent rules
 */
export function fuseVisionResults(
  openaiClicks: VisionClick[],
  claudeClicks: VisionClick[]
): VisionClick[] {
  const fused: VisionClick[] = [];
  const processedClaude = new Set<number>();

  // Process OpenAI clicks and find matching Claude clicks
  for (const oaiClick of openaiClicks) {
    let matched = false;

    for (let i = 0; i < claudeClicks.length; i++) {
      if (processedClaude.has(i)) continue;

      const claudeClick = claudeClicks[i];

      // Check if both have coordinates and are near each other
      if (
        oaiClick.x !== undefined &&
        oaiClick.y !== undefined &&
        claudeClick.x !== undefined &&
        claudeClick.y !== undefined
      ) {
        if (
          areCoordinatesNear(
            { x: oaiClick.x, y: oaiClick.y },
            { x: claudeClick.x, y: claudeClick.y },
            20
          )
        ) {
          // Both models agree! Merge and boost confidence
          const midpoint = getMidpoint(
            { x: oaiClick.x, y: oaiClick.y },
            { x: claudeClick.x, y: claudeClick.y }
          );
          fused.push({
            x: midpoint.x,
            y: midpoint.y,
            confidence: Math.min(
              0.98,
              (oaiClick.confidence + claudeClick.confidence) / 2 + 0.15
            ),
            source: "fusion",
          });
          processedClaude.add(i);
          matched = true;
          break;
        }
      }

      // Check if both have selectors and they match
      if (
        oaiClick.selector &&
        claudeClick.selector &&
        oaiClick.selector === claudeClick.selector
      ) {
        // Perfect selector match! Boost confidence
        fused.push({
          selector: oaiClick.selector,
          confidence: Math.min(
            0.98,
            (oaiClick.confidence + claudeClick.confidence) / 2 + 0.2
          ),
          source: "fusion",
        });
        processedClaude.add(i);
        matched = true;
        break;
      }
    }

    // If no match found, keep OpenAI click if confidence is sufficient
    if (!matched && oaiClick.confidence > 0.6) {
      fused.push({
        ...oaiClick,
        source: "openai",
      });
    }
  }

  // Add unprocessed Claude clicks if confidence is sufficient
  for (let i = 0; i < claudeClicks.length; i++) {
    if (!processedClaude.has(i) && claudeClicks[i].confidence > 0.6) {
      fused.push({
        ...claudeClicks[i],
        source: "claude",
      });
    }
  }

  // Remove low-confidence hallucinations
  const filtered = fused.filter((click) => click.confidence >= 0.4);

  // Sort by descending confidence
  filtered.sort((a, b) => b.confidence - a.confidence);

  // Limit to top 8 clicks to avoid overwhelming
  return filtered.slice(0, 8);
}

/**
 * Parse vision model response text into structured clicks
 */
export function parseVisionResponse(responseText: string): VisionClick[] {
  const clicks: VisionClick[] = [];

  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(responseText);

    if (Array.isArray(parsed.clicks)) {
      for (const click of parsed.clicks) {
        clicks.push({
          selector: click.selector,
          x: click.x,
          y: click.y,
          confidence: click.confidence ?? 0.7,
          source: "unknown",
        });
      }
    }
  } catch {
    // Fallback: parse text for coordinate patterns
    const coordRegex = /\((\d+),\s*(\d+)\)|x:\s*(\d+).*?y:\s*(\d+)/gi;
    let match;

    while ((match = coordRegex.exec(responseText)) !== null) {
      const x = parseInt(match[1] || match[3]);
      const y = parseInt(match[2] || match[4]);

      if (!isNaN(x) && !isNaN(y)) {
        clicks.push({
          x,
          y,
          confidence: 0.65,
          source: "unknown",
        });
      }
    }
  }

  return clicks;
}
