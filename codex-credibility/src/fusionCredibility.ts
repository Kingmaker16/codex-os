// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Credibility Engine v1 - Multi-LLM Fusion Analysis
// Detects weak claims, unsupported promises, and suggests proof
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch";
import type {
  CredibilityDomain,
  CredibilityIssue,
  CredibilityResult,
  LLMResponse,
} from "./types.js";

const BRIDGE_PORT = 4000;
const LLM_TIMEOUT = 20000;

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
 * Call a single LLM provider for credibility analysis
 */
async function callLLM(
  provider: string,
  model: string,
  prompt: string
): Promise<any> {
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
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(LLM_TIMEOUT),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[CREDIBILITY] ${provider} failed:`, error);
    return null;
  }
}

/**
 * Build credibility analysis prompt
 */
function buildCredibilityPrompt(
  domain: CredibilityDomain,
  content: string
): string {
  return `You are Codex Credibility Analyzer. Your job is to detect weak claims and improve trustworthiness.

Domain: ${domain}

Task:
1. Analyze content for trustworthiness, clarity, and realism
2. Identify: vague claims, unsupported promises, risky claims, overhype, missing proof
3. Suggest improvements that increase trust (specifics, examples, disclaimers, proof)
4. Output ONLY valid JSON in this exact format:

{
  "improved": "improved version with specific claims and proof",
  "score": 85,
  "issues": [
    {
      "type": "OVERPROMISE",
      "message": "Claim is unrealistic",
      "suggestion": "Add realistic timeframe or disclaimer"
    }
  ]
}

Issue types: VAGUE, UNSUPPORTED, OVERPROMISE, RISKY_CLAIM, MISSING_PROOF, UNCLEAR

Content to analyze:
"""
${content}
"""

Output JSON only, no markdown:`;
}

/**
 * Parse LLM output and extract JSON
 */
function parseOutput(output: string): LLMResponse | null {
  try {
    // Try to extract JSON from markdown code blocks
    let jsonStr = output.trim();

    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }

    // Remove any leading/trailing non-JSON text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (
      !parsed.improved ||
      typeof parsed.score !== "number" ||
      !Array.isArray(parsed.issues)
    ) {
      return null;
    }

    return {
      improved: parsed.improved,
      score: Math.min(Math.max(parsed.score, 0), 100),
      issues: parsed.issues.map((issue: any) => ({
        type: issue.type || "UNCLEAR",
        message: issue.message || "Issue detected",
        suggestion: issue.suggestion || "Review and improve",
      })),
    };
  } catch (error) {
    console.error("[CREDIBILITY] Parse error:", error);
    return null;
  }
}

/**
 * Main credibility analysis with multi-LLM fusion
 */
export async function analyzeCredibility(
  sessionId: string,
  domain: CredibilityDomain,
  content: string
): Promise<CredibilityResult> {
  const prompt = buildCredibilityPrompt(domain, content);

  // Query all providers in parallel
  const results = await Promise.all(
    PROVIDERS.map((p) => callLLM(p.provider, p.model, prompt))
  );

  // Filter and parse successful responses
  const validOutputs = results.filter((r) => r && r.output);
  const parsed: Array<{ raw: any; parsed: LLMResponse }> = [];

  for (const output of validOutputs) {
    const result = parseOutput(output.output);
    if (result) {
      parsed.push({ raw: output, parsed: result });
    }
  }

  // Fallback if no valid responses
  if (parsed.length === 0) {
    return {
      ok: true,
      sessionId,
      domain,
      content,
      improved: content,
      score: 60,
      issues: [
        {
          type: "UNCLEAR",
          message: "Unable to analyze credibility (all LLMs failed)",
          suggestion: "Try again or check content format",
        },
      ],
      modelBreakdown: validOutputs,
    };
  }

  // Calculate consensus score (average)
  const avgScore =
    parsed.reduce((sum, p) => sum + p.parsed.score, 0) / parsed.length;

  // Merge all issues (deduplicate by message)
  const issuesMap = new Map<string, CredibilityIssue>();
  for (const p of parsed) {
    for (const issue of p.parsed.issues) {
      issuesMap.set(issue.message, issue);
    }
  }
  const mergedIssues = Array.from(issuesMap.values());

  // Select best improved version (highest score, or longest)
  const sortedByScore = parsed.sort((a, b) => {
    if (Math.abs(a.parsed.score - b.parsed.score) > 5) {
      return b.parsed.score - a.parsed.score;
    }
    return b.parsed.improved.length - a.parsed.improved.length;
  });

  const bestImproved = sortedByScore[0].parsed.improved;

  return {
    ok: true,
    sessionId,
    domain,
    content,
    improved: bestImproved,
    score: Math.round(avgScore),
    issues: mergedIssues,
    modelBreakdown: validOutputs,
  };
}
