/**
 * Knowledge Engine v2.5 - Skill Extraction
 * 
 * Turns knowledge into actionable rules
 */

import type { ExtractedSkill, Domain } from "./types.js";
import { runFusion } from "./fusionEngine.js";

export async function extractSkills(content: string, domain: Domain): Promise<ExtractedSkill[]> {
  const prompt = `Extract 2-4 actionable skills or rules from the following content for the ${domain} domain.

For each skill, provide:
1. Name: A short, descriptive name
2. Rule: A clear, actionable rule or guideline
3. Examples: 1-2 concrete examples
4. When to use: Situations where this skill applies

Content:
${content}

Format each skill as:
SKILL: [name]
RULE: [rule]
EXAMPLES: [example 1], [example 2]
APPLIES: [when to use]`;

  const fusion = await runFusion({ prompt });
  return parseSkills(fusion.result, domain, fusion.confidence);
}

function parseSkills(text: string, domain: Domain, confidence: number): ExtractedSkill[] {
  const skills: ExtractedSkill[] = [];
  const sections = text.split(/SKILL:/i).slice(1);

  for (const section of sections) {
    const nameMatch = section.match(/^([^\n]+)/);
    const ruleMatch = section.match(/RULE:\s*([^\n]+)/i);
    const examplesMatch = section.match(/EXAMPLES?:\s*([^\n]+)/i);
    const appliesMatch = section.match(/APPLIES?:\s*([^\n]+)/i);

    if (nameMatch && ruleMatch) {
      skills.push({
        name: nameMatch[1].trim(),
        domain,
        rule: ruleMatch[1].trim(),
        examples: examplesMatch 
          ? examplesMatch[1].split(",").map(e => e.trim()) 
          : [],
        confidence,
        applicability: appliesMatch
          ? appliesMatch[1].split(",").map(a => a.trim())
          : []
      });
    }
  }

  return skills;
}
