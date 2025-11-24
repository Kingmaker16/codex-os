/**
 * Knowledge Engine v2.5 - Domain Kernels
 * 
 * 6 isolated domain kernels: trading, ecomm, kingmaker, social, creative, generic
 * Each kernel manages its own knowledge base with strict isolation
 */

import type { Domain, KnowledgeBlock, ExtractedSkill, DomainKernel, KnowledgeRelation } from "./types.js";
import { CONFIG } from "./config.js";
import { logDomainKnowledge } from "./brainLogger.js";

// In-memory storage for domain kernels
const kernels: Map<Domain, DomainKernel> = new Map();

// Initialize all domain kernels
export function initializeKernels(): void {
  for (const domain of CONFIG.domains) {
    kernels.set(domain, {
      domain,
      knowledge: [],
      skills: [],
      relations: []
    });
  }
  console.log(`[DomainKernels] Initialized ${CONFIG.domains.length} domain kernels`);
}

/**
 * Save knowledge to a domain kernel
 */
export async function saveKnowledge(domain: Domain, block: KnowledgeBlock): Promise<void> {
  const kernel = kernels.get(domain);
  if (!kernel) {
    throw new Error(`Domain kernel not found: ${domain}`);
  }

  // Check if knowledge already exists
  const existing = kernel.knowledge.find(k => k.id === block.id);
  if (existing) {
    // Update existing knowledge
    Object.assign(existing, block);
  } else {
    // Add new knowledge
    kernel.knowledge.push(block);
  }

  await logDomainKnowledge(domain, {
    action: "save",
    blockId: block.id,
    keywords: block.keywords
  });
}

/**
 * Load knowledge from a domain kernel
 */
export function loadKnowledge(domain: Domain): KnowledgeBlock[] {
  const kernel = kernels.get(domain);
  return kernel ? [...kernel.knowledge] : [];
}

/**
 * Expand knowledge with related blocks
 */
export function expandKnowledge(domain: Domain, blockId: string): KnowledgeBlock[] {
  const kernel = kernels.get(domain);
  if (!kernel) return [];

  const block = kernel.knowledge.find(k => k.id === blockId);
  if (!block) return [];

  // Find related blocks
  const relatedIds = block.relations;
  const related = kernel.knowledge.filter(k => relatedIds.includes(k.id));

  return [block, ...related];
}

/**
 * Apply structured rules from skills
 */
export function applyStructuredRules(domain: Domain, context: string): ExtractedSkill[] {
  const kernel = kernels.get(domain);
  if (!kernel) return [];

  // Find applicable skills based on context
  return kernel.skills.filter(skill => {
    return skill.applicability.some(condition => 
      context.toLowerCase().includes(condition.toLowerCase())
    );
  });
}

/**
 * Save skill to domain kernel
 */
export async function saveSkill(domain: Domain, skill: ExtractedSkill): Promise<void> {
  const kernel = kernels.get(domain);
  if (!kernel) {
    throw new Error(`Domain kernel not found: ${domain}`);
  }

  // Check if skill already exists
  const existing = kernel.skills.find(s => s.name === skill.name);
  if (existing) {
    Object.assign(existing, skill);
  } else {
    kernel.skills.push(skill);
  }

  await logDomainKnowledge(domain, {
    action: "save_skill",
    skillName: skill.name,
    rule: skill.rule
  });
}

/**
 * Add relation between knowledge blocks
 */
export function addRelation(
  domain: Domain,
  from: string,
  to: string,
  type: KnowledgeRelation["type"],
  strength: number
): void {
  const kernel = kernels.get(domain);
  if (!kernel) return;

  // Check if relation already exists
  const existing = kernel.relations.find(r => r.from === from && r.to === to);
  if (existing) {
    existing.type = type;
    existing.strength = strength;
  } else {
    kernel.relations.push({ from, to, type, strength });
  }
}

/**
 * Get all skills for a domain
 */
export function getSkills(domain: Domain): ExtractedSkill[] {
  const kernel = kernels.get(domain);
  return kernel ? [...kernel.skills] : [];
}

/**
 * Search knowledge across domain
 */
export function searchKnowledge(domain: Domain, query: string): KnowledgeBlock[] {
  const kernel = kernels.get(domain);
  if (!kernel) return [];

  const queryLower = query.toLowerCase();
  return kernel.knowledge.filter(block => {
    return (
      block.content.toLowerCase().includes(queryLower) ||
      block.summary.toLowerCase().includes(queryLower) ||
      block.keywords.some(k => k.toLowerCase().includes(queryLower))
    );
  });
}

/**
 * Get kernel statistics
 */
export function getKernelStats(domain: Domain): {
  knowledge: number;
  skills: number;
  relations: number;
} {
  const kernel = kernels.get(domain);
  if (!kernel) return { knowledge: 0, skills: 0, relations: 0 };

  return {
    knowledge: kernel.knowledge.length,
    skills: kernel.skills.length,
    relations: kernel.relations.length
  };
}

/**
 * Get all kernels summary
 */
export function getAllKernelsSummary(): Record<string, any> {
  const summary: Record<string, any> = {};
  
  for (const domain of CONFIG.domains) {
    summary[domain] = getKernelStats(domain);
  }

  return summary;
}
