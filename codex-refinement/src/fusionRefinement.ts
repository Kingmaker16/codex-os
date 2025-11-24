// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Refinement Layer v1 - Multi-LLM Fusion Engine
// Queries 4 LLM providers in parallel and fuses results for best output
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch";
import type { FusionResult, ModelOutput } from "./types.js";

const BRIDGE_PORT = 4000;
const LLM_TIMEOUT = 15000;

interface LLMProvider {
  provider: string;
  model: string;
}

const PROVIDERS: LLMProvider[] = [
  { provider: "openai", model: "gpt-4o" },
  { provider: "claude", model: "claude-3-5-sonnet-20241022" },
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "grok", model: "grok-2" },
];

/**
 * Call a single LLM provider via Bridge
 */
async function callLLM(
  provider: string,
  model: string,
  prompt: string
): Promise<ModelOutput | null> {
  try {
    const response = await fetch(
      `http://localhost:${BRIDGE_PORT}/respond?provider=${encodeURIComponent(
        provider
      )}&model=${encodeURIComponent(model)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(LLM_TIMEOUT),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as any;

    if (!data.output) {
      return null;
    }

    return {
      provider,
      model,
      output: data.output,
      usage: data.usage,
    };
  } catch (error) {
    console.error(`[REFINEMENT] ${provider} failed:`, error);
    return null;
  }
}

/**
 * Build refinement prompt
 */
function buildRefinementPrompt(domain: string, input: string): string {
  return `You are Codex Refinement Engine. Your job is to improve content quality.

Domain: ${domain}

Instructions:
1. Analyze the content for clarity, engagement, cohesion, and effectiveness
2. Identify specific weaknesses and problems
3. Provide an improved version that's more compelling and clear
4. Suggest 2-3 actionable improvements

Content to refine:
"""
${input}
"""

Output format (plain text, no JSON):
IMPROVED:
[your improved version]

ISSUES:
- [issue 1]
- [issue 2]

SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]

SCORE: [0.0 to 1.0]
`;
}

/**
 * Parse LLM output into structured format
 */
function parseOutput(output: string): {
  improved: string;
  issues: string[];
  suggestions: string[];
  score: number;
} {
  const lines = output.split("\n");
  let improved = "";
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0.7;

  let section = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("IMPROVED:")) {
      section = "improved";
      continue;
    } else if (trimmed.startsWith("ISSUES:")) {
      section = "issues";
      continue;
    } else if (trimmed.startsWith("SUGGESTIONS:")) {
      section = "suggestions";
      continue;
    } else if (trimmed.startsWith("SCORE:")) {
      const match = trimmed.match(/(\d+\.?\d*)/);
      if (match) {
        score = parseFloat(match[1]);
      }
      continue;
    }

    if (section === "improved" && trimmed) {
      improved += (improved ? "\n" : "") + trimmed;
    } else if (section === "issues" && trimmed.startsWith("-")) {
      issues.push(trimmed.substring(1).trim());
    } else if (section === "suggestions" && trimmed.startsWith("-")) {
      suggestions.push(trimmed.substring(1).trim());
    }
  }

  return {
    improved: improved || output,
    issues: issues.length > 0 ? issues : ["No issues detected"],
    suggestions:
      suggestions.length > 0 ? suggestions : ["No suggestions provided"],
    score: Math.min(Math.max(score, 0), 1),
  };
}

/**
 * Fuse multiple LLM outputs into a single best result
 */
export async function fuseRefinement(
  domain: string,
  input: string
): Promise<FusionResult> {
  const prompt = buildRefinementPrompt(domain, input);

  // Query all providers in parallel
  const results = await Promise.all(
    PROVIDERS.map((p) => callLLM(p.provider, p.model, prompt))
  );

  // Filter successful responses
  const validOutputs = results.filter((r): r is ModelOutput => r !== null);

  if (validOutputs.length === 0) {
    // Fallback: no LLMs responded
    return {
      improved: input,
      score: 0.5,
      issues: ["All LLM providers failed to respond"],
      suggestions: ["Try again later or check service health"],
      modelBreakdown: [],
    };
  }

  // Parse all outputs
  const parsed = validOutputs.map((output) => ({
    ...output,
    parsed: parseOutput(output.output),
  }));

  // Fusion strategy: Select highest score, or longest improvement
  parsed.sort((a, b) => {
    if (Math.abs(a.parsed.score - b.parsed.score) > 0.1) {
      return b.parsed.score - a.parsed.score; // Higher score first
    }
    return b.parsed.improved.length - a.parsed.improved.length; // Longer content
  });

  const best = parsed[0];

  // Collect all unique issues and suggestions
  const allIssues = new Set<string>();
  const allSuggestions = new Set<string>();

  for (const p of parsed) {
    p.parsed.issues.forEach((i) => allIssues.add(i));
    p.parsed.suggestions.forEach((s) => allSuggestions.add(s));
  }

  // Calculate consensus score (average of all scores)
  const avgScore =
    parsed.reduce((sum, p) => sum + p.parsed.score, 0) / parsed.length;

  return {
    improved: best.parsed.improved,
    score: avgScore,
    issues: Array.from(allIssues).slice(0, 5), // Top 5 issues
    suggestions: Array.from(allSuggestions).slice(0, 5), // Top 5 suggestions
    modelBreakdown: validOutputs,
  };
}
