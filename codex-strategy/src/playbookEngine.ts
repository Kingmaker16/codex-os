import fetch from "node-fetch";
import type { StrategyQuestion, StrategyPlay } from "./types.js";
import { getBasePlays, mergePlays } from "./strategyKernel.js";

const KNOWLEDGE_ENGINE_URL = "http://localhost:4500";

/**
 * Build a playbook for a strategy question
 * Enriches base plays with Knowledge Engine insights
 */
export async function buildPlaybookForQuestion(q: StrategyQuestion): Promise<StrategyPlay[]> {
  // Start with base plays for each domain
  let allBasePlays: StrategyPlay[] = [];
  for (const domain of q.domain) {
    allBasePlays = allBasePlays.concat(getBasePlays(domain));
  }

  // Try to enrich with Knowledge Engine research
  try {
    const knowledgePlays = await getKnowledgeEnrichedPlays(q);
    return mergePlays(allBasePlays, knowledgePlays);
  } catch (error) {
    console.warn("[PlaybookEngine] Knowledge Engine enrichment failed, using base plays only:", error);
    return allBasePlays;
  }
}

/**
 * Query Knowledge Engine for domain-specific insights
 * Convert insights into actionable plays
 */
async function getKnowledgeEnrichedPlays(q: StrategyQuestion): Promise<StrategyPlay[]> {
  // TODO: Implement real Knowledge Engine integration
  // For now, return empty array (base plays will be used)
  
  /*
  const enrichedPlays: StrategyPlay[] = [];
  
  for (const domain of q.domain) {
    try {
      // Query Knowledge Engine for recent research in this domain
      const researchQuery = {
        sessionId: q.sessionId,
        type: "trend_analysis",
        query: `${domain} strategy trends and best practices for ${q.goal}`,
        kernelId: domain
      };
      
      const response = await fetch(`${KNOWLEDGE_ENGINE_URL}/research/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(researchQuery)
      });
      
      if (!response.ok) {
        console.warn(`[PlaybookEngine] Knowledge Engine query failed for ${domain}`);
        continue;
      }
      
      const result = await response.json();
      
      // Parse insights into plays
      // This would extract actionable items from research results
      // For example, if research mentions "short-form video trending", 
      // create a play: "Double down on short-form video content"
      
      if (result.insights && Array.isArray(result.insights)) {
        for (const insight of result.insights.slice(0, 3)) {
          enrichedPlays.push({
            id: `knowledge-${domain}-${Date.now()}-${Math.random()}`,
            domain: domain,
            description: insight.actionable || insight.summary,
            rationale: insight.rationale || "Based on recent market research",
            riskLevel: "medium"
          });
        }
      }
    } catch (error) {
      console.warn(`[PlaybookEngine] Error querying Knowledge Engine for ${domain}:`, error);
    }
  }
  
  return enrichedPlays;
  */
  
  // Stub: return empty for now
  return [];
}

/**
 * TODO: Additional playbook features to implement
 * - Query Knowledge Engine /kernels endpoint to verify domain availability
 * - Parse Knowledge Engine results into structured StrategyPlay objects
 * - Add trend signal integration (what's hot right now)
 * - Add competitor analysis integration
 * - Add seasonal/temporal play suggestions
 */
