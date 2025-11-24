import { v4 as uuidv4 } from "uuid";
import { Finding } from "../types.js";

export function validateLogic(content: string, contentType: string): Finding[] {
  const findings: Finding[] = [];

  // Check for contradictions
  const contradictions = detectContradictions(content);
  findings.push(...contradictions);

  // Check for circular reasoning
  const circular = detectCircularReasoning(content);
  findings.push(...circular);

  // Check for incomplete chains
  const incomplete = detectIncompleteChains(content);
  findings.push(...incomplete);

  // Check for missing steps
  const missing = detectMissingSteps(content, contentType);
  findings.push(...missing);

  return findings;
}

function detectContradictions(content: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.toLowerCase().split(/[.!?]+/).map(l => l.trim());

  // Look for negation patterns
  const negationPatterns = [
    { positive: /\b(will|should|must|can)\b/, negative: /\b(will not|won't|should not|shouldn't|must not|mustn't|cannot|can't)\b/ },
    { positive: /\b(is|are)\b/, negative: /\b(is not|isn't|are not|aren't)\b/ },
    { positive: /\b(enable|allow|permit)\b/, negative: /\b(disable|disallow|prevent|block)\b/ }
  ];

  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      for (const pattern of negationPatterns) {
        if (pattern.positive.test(lines[i]) && pattern.negative.test(lines[j])) {
          findings.push({
            id: uuidv4(),
            type: "CONTRADICTION",
            severity: "HIGH",
            confidence: 0.7,
            description: `Potential contradiction detected between statements`,
            context: `"${lines[i]}" vs "${lines[j]}"`
          });
        }
      }
    }
  }

  return findings;
}

function detectCircularReasoning(content: string): Finding[] {
  const findings: Finding[] = [];
  
  // Detect "because" loops
  const becausePattern = /\bbecause\b/gi;
  const matches = content.match(becausePattern);
  
  if (matches && matches.length > 3) {
    findings.push({
      id: uuidv4(),
      type: "CIRCULAR_REASONING",
      severity: "MEDIUM",
      confidence: 0.6,
      description: `Multiple causal chains detected (${matches.length} instances) - possible circular reasoning`
    });
  }

  return findings;
}

function detectIncompleteChains(content: string): Finding[] {
  const findings: Finding[] = [];

  // Look for incomplete if-then statements
  const ifWithoutThen = /\bif\b(?!.*\bthen\b)/gi;
  const matches = content.match(ifWithoutThen);

  if (matches && matches.length > 0) {
    findings.push({
      id: uuidv4(),
      type: "INCOMPLETE_CHAIN",
      severity: "MEDIUM",
      confidence: 0.65,
      description: `Found ${matches.length} conditional statement(s) without clear resolution`
    });
  }

  return findings;
}

function detectMissingSteps(content: string, contentType: string): Finding[] {
  const findings: Finding[] = [];

  if (contentType === "plan" || contentType === "task") {
    // Check for step numbering gaps
    const stepPattern = /\b(?:step|phase|stage)\s+(\d+)/gi;
    const steps: number[] = [];
    let match;

    while ((match = stepPattern.exec(content)) !== null) {
      steps.push(parseInt(match[1]));
    }

    if (steps.length > 1) {
      steps.sort((a, b) => a - b);
      for (let i = 0; i < steps.length - 1; i++) {
        if (steps[i + 1] - steps[i] > 1) {
          findings.push({
            id: uuidv4(),
            type: "MISSING_STEP",
            severity: "HIGH",
            confidence: 0.8,
            description: `Gap detected in sequence: step ${steps[i]} to ${steps[i + 1]}`
          });
        }
      }
    }
  }

  return findings;
}
