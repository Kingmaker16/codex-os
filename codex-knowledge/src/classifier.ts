/**
 * Knowledge Engine v2 - Research Classifier
 * 
 * Classifies research topics into domain kernels using multi-model fusion.
 */

import { CONFIG, type DomainKernel } from "./config.js";
import type { DomainClassification } from "./types.js";

/**
 * Classify research topic into appropriate domain kernel
 */
export async function classifyDomain(query: string, context?: string): Promise<DomainClassification> {
  try {
    const prompt = `Classify the following research topic into ONE of these domains:
- trading: Stock/crypto trading, market analysis, technical analysis
- ecomm: E-commerce, dropshipping, online business, marketing
- kingmaker: Influence, social dynamics, leadership, persuasion
- social: Social media, content creation, audience building
- creative: Design, art, music, video editing, creative work

Topic: "${query}"
${context ? `Context: ${context}` : ""}

Respond with ONLY the domain name (trading/ecomm/kingmaker/social/creative) and your confidence (0-1).
Format: domain,confidence,reasoning`;

    // Use OpenAI for fast classification
    const response = await fetch(`${CONFIG.bridgeUrl}/respond?provider=openai&model=gpt-4o-mini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`Classification failed: HTTP ${response.status}`);
    }

    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || "";
    
    // Parse response
    const lines = text.split("\n");
    const firstLine = lines[0].trim();
    const parts = firstLine.split(",");
    
    const domainStr = parts[0]?.trim().toLowerCase();
    const confidence = parseFloat(parts[1]?.trim() || "0.5");
    const reasoning = parts.slice(2).join(",").trim() || lines.slice(1).join(" ").trim();
    
    // Validate domain
    const validDomains = ["trading", "ecomm", "kingmaker", "social", "creative"];
    const domain = validDomains.includes(domainStr) 
      ? `codex-skill-${domainStr}` as DomainKernel
      : "unknown" as const;
    
    return {
      domain,
      confidence: Math.max(0, Math.min(1, confidence)),
      reasoning: reasoning || "Classification based on topic analysis"
    };
    
  } catch (err: any) {
    console.error("Classification error:", err);
    return {
      domain: "unknown",
      confidence: 0,
      reasoning: `Error: ${err.message}`
    };
  }
}

/**
 * Determine research depth needed
 */
export function determineDepth(query: string): "shallow" | "medium" | "deep" {
  const queryLower = query.toLowerCase();
  
  // Deep research indicators
  const deepKeywords = ["comprehensive", "detailed", "in-depth", "thorough", "complete", "everything about"];
  if (deepKeywords.some(kw => queryLower.includes(kw))) {
    return "deep";
  }
  
  // Shallow research indicators
  const shallowKeywords = ["quick", "summary", "overview", "basics", "introduction", "briefly"];
  if (shallowKeywords.some(kw => queryLower.includes(kw))) {
    return "shallow";
  }
  
  // Default to medium
  return "medium";
}
