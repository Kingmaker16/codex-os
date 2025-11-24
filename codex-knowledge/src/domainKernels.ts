/**
 * Knowledge Engine v2 - Domain Kernels
 * 
 * Manages domain-specific knowledge storage in Brain.
 */

import { CONFIG, type DomainKernel } from "./config.js";
import type { ExtractedSkill, ResearchResult } from "./types.js";

/**
 * Write research result to appropriate domain kernel in Brain
 */
export async function writeToDomainKernel(domain: DomainKernel, data: any): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    // Store in domain-specific session
    await fetch(`${CONFIG.brainUrl}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "TurnAppended",
        event: {
          sessionId: domain,
          role: "system",
          text: JSON.stringify({
            type: "research_result",
            ...data,
            timestamp
          }),
          ts: timestamp
        }
      })
    });

    // Also log to main research log
    await fetch(`${CONFIG.brainUrl}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "TurnAppended",
        event: {
          sessionId: CONFIG.researchSessionId,
          role: "system",
          text: JSON.stringify({
            type: "research_log",
            domain,
            ...data,
            timestamp
          }),
          ts: timestamp
        }
      })
    });
    
  } catch (err: any) {
    console.error(`Failed to write to domain kernel ${domain}:`, err);
  }
}

/**
 * Write individual skill to domain kernel
 */
export async function writeSkill(domain: DomainKernel, skill: ExtractedSkill): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    await fetch(`${CONFIG.brainUrl}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "TurnAppended",
        event: {
          sessionId: domain,
          role: "system",
          text: JSON.stringify({
            ...skill,
            timestamp
          }),
          ts: timestamp
        }
      })
    });
  } catch (err) {
    console.error(`Failed to write skill to ${domain}:`, err);
  }
}



/**
 * Query domain kernel for existing knowledge
 */
export async function queryDomainKernel(domain: DomainKernel, query?: string): Promise<any> {
  try {
    const url = query
      ? `${CONFIG.brainUrl}/memory?sessionId=${domain}&query=${encodeURIComponent(query)}`
      : `${CONFIG.brainUrl}/memory?sessionId=${domain}`;
      
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error(`Failed to query domain kernel ${domain}:`, err);
    return null;
  }
}

/**
 * Get all skills from a domain kernel
 */
export async function getDomainSkills(domain: DomainKernel): Promise<ExtractedSkill[]> {
  const data = await queryDomainKernel(domain);
  
  if (!data || !data.memory || !data.memory.turns) {
    return [];
  }
  
  const skills: ExtractedSkill[] = [];
  
  for (const turn of data.memory.turns) {
    try {
      const parsed = JSON.parse(turn.text);
      if (parsed.type === "skill") {
        skills.push(parsed as ExtractedSkill);
      }
    } catch {
      continue;
    }
  }
  
  return skills;
}
