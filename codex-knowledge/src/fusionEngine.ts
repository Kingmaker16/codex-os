/**
 * Knowledge Engine v2 - Multi-Model Fusion Engine
 * 
 * AGI-level research using multiple AI models in parallel with consensus fusion.
 */

import { CONFIG, type DomainKernel } from "./config.js";
import type { FusionResponse, ExtractedSkill } from "./types.js";

/**
 * Run multi-model fusion on a research query
 */
export async function runFusion(prompt: string, systemContext?: string): Promise<FusionResponse> {
  const responses = await Promise.all(
    CONFIG.fusionProviders.map(async (config) => {
      try {
        const response = await fetch(
          `${CONFIG.bridgeUrl}/respond?provider=${config.provider}&model=${config.model}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                ...(systemContext ? [{ role: "system", content: systemContext }] : []),
                { role: "user", content: prompt }
              ],
              max_tokens: 2000
            })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json() as any;
        const content = data.choices?.[0]?.message?.content || "";

        return {
          provider: config.provider,
          model: config.model,
          response: content,
          confidence: content.length > 100 ? 0.8 : 0.5
        };
      } catch (err: any) {
        return {
          provider: config.provider,
          model: config.model,
          response: "",
          confidence: 0
        };
      }
    })
  );

  // Filter out failed responses
  const validResponses = responses.filter(r => r.confidence > 0);

  if (validResponses.length === 0) {
    throw new Error("All fusion models failed");
  }

  // Compute consensus
  const consensus = validResponses.length >= 2;

  // Merge responses with confidence weighting
  const mergedResult = mergeResponses(validResponses);

  // Calculate overall confidence
  const avgConfidence = validResponses.reduce((sum, r) => sum + r.confidence, 0) / validResponses.length;

  return {
    result: mergedResult,
    confidence: avgConfidence,
    sources: validResponses,
    consensus
  };
}

/**
 * Merge multiple AI responses into a single coherent result
 */
function mergeResponses(responses: Array<{ provider: string; response: string; confidence: number }>): string {
  if (responses.length === 1) {
    return responses[0].response;
  }

  // For multiple responses, combine unique insights
  // In production, this would use more sophisticated NLP
  // For now, concatenate with attribution
  
  return responses
    .map((r, i) => `[Model ${i + 1} - ${r.provider}]\n${r.response}`)
    .join("\n\n---\n\n");
}

/**
 * Extract skills from research using AI fusion
 */
export async function extractSkillsWithFusion(
  chunks: Array<{ text: string; relevance: number }>,
  query: string,
  domain: DomainKernel
): Promise<ExtractedSkill[]> {
  const combinedText = chunks.map(c => c.text).join("\n\n");
  
  const prompt = `Analyze this text and extract actionable skills, rules, workflows, heuristics, or patterns for the ${domain} domain.

Research Query: ${query}

Text:
${combinedText.slice(0, 3000)}

Extract ONLY concrete, actionable information in this JSON format:
[{
  "type": "rule|workflow|heuristic|pattern",
  "title": "brief title",
  "description": "what it does",
  "steps": ["step 1", "step 2"],
  "conditions": ["when to use"],
  "examples": ["example application"],
  "confidence": 0.0-1.0
}]

Return ONLY valid JSON array.`;

  try {
    const fusion = await runFusion(prompt, "You are an expert knowledge extraction system.");
    
    // Parse JSON from the first valid response
    for (const source of fusion.sources) {
      try {
        // Find JSON array in response
        const jsonMatch = source.response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const skills = JSON.parse(jsonMatch[0]);
          return skills.map((skill: any) => ({
            ...skill,
            domain
          }));
        }
      } catch {
        continue;
      }
    }
    
    return [];
  } catch (err) {
    console.error("Skill extraction error:", err);
    return [];
  }
}

/**
 * Generate comprehensive summary using fusion
 */
export async function generateSummary(chunks: string[], topic: string): Promise<string> {
  const combinedText = chunks.join("\n\n").slice(0, 8000);
  
  const prompt = `Summarize this research about "${topic}" in 3-5 concise paragraphs focusing on key insights and actionable takeaways:

${combinedText}`;

  try {
    const fusion = await runFusion(prompt, "You are an expert research synthesizer.");
    return fusion.result.slice(0, 2000); // Limit summary length
  } catch (err) {
    return `Research summary for: ${topic}\n\n[Summary generation failed]`;
  }
}
