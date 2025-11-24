// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Refinement Layer v1 - Main Refinement Engine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { RefinementRequest, RefinementResult } from "./types.js";
import { fuseRefinement } from "./fusionRefinement.js";

/**
 * Main refinement function
 * Takes user input and returns multi-LLM improved version
 */
export async function refineContent(
  req: RefinementRequest
): Promise<RefinementResult> {
  const { sessionId, domain, input } = req;

  // Validate input
  if (!input || input.trim().length === 0) {
    return {
      ok: false,
      sessionId,
      domain,
      improved: input,
      score: 0,
      issues: ["Input is empty"],
      suggestions: ["Provide content to refine"],
      modelBreakdown: [],
    };
  }

  // Run fusion refinement across all LLMs
  const fusionResult = await fuseRefinement(domain, input);

  return {
    ok: true,
    sessionId,
    domain,
    ...fusionResult,
  };
}
