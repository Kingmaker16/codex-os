/**
 * Knowledge Engine v2.5 - Domain Classifier
 * 
 * Classifies content into domain kernels
 */

import type { Domain, ClassificationResult } from "./types.js";
import { runFusion } from "./fusionEngine.js";
import { CONFIG } from "./config.js";

export async function classifyDomain(content: string, hint?: Domain): Promise<ClassificationResult> {
  if (hint) {
    return {
      domain: hint,
      confidence: 1.0,
      reasoning: "Domain explicitly provided"
    };
  }

  const prompt = `Classify the following content into ONE of these domains:
- trading: Stock trading, crypto, financial markets, technical analysis
- ecomm: E-commerce, dropshipping, product sourcing, online stores
- kingmaker: Influencer strategy, personal branding, audience building, content creation
- social: Social media marketing, community management, engagement tactics
- creative: Content creation, video editing, graphic design, creative workflows
- generic: General knowledge that doesn't fit other domains

Content:
${content.substring(0, 1000)}

Respond with ONLY the domain name (lowercase) and a brief reason.`;

  const fusion = await runFusion({ prompt });
  const responseLower = fusion.result.toLowerCase();

  // Extract domain from response
  for (const domain of CONFIG.domains) {
    if (responseLower.includes(domain)) {
      return {
        domain,
        confidence: fusion.confidence,
        reasoning: fusion.result
      };
    }
  }

  return {
    domain: "generic",
    confidence: 0.5,
    reasoning: "No specific domain detected, defaulting to generic"
  };
}
