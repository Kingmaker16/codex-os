import fetch from "node-fetch";
import { LLMVerdict } from "../types.js";

const BRIDGE_URL = "http://localhost:4000";

const MODELS = [
  { provider: "openai", model: "gpt-4o" },
  { provider: "claude", model: "claude-3-5-sonnet-20241022" },
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "grok", model: "grok-4-latest" }
];

export async function validateWithLLMs(content: string): Promise<LLMVerdict[]> {
  const verdicts: LLMVerdict[] = [];

  const prompt = `Analyze this Codex output for logical errors, safety issues, or quality problems.

Content:
${content.slice(0, 800)}

Respond with:
1. PASS, FAIL, or WARNING
2. Confidence (0-1)
3. Brief notes (max 100 words)

Format: [VERDICT]|[CONFIDENCE]|[NOTES]`;

  for (const model of MODELS) {
    try {
      const resp = await fetch(
        `${BRIDGE_URL}/respond?provider=${model.provider}&model=${model.model}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200
          })
        }
      );

      const data = await resp.json() as any;
      const output = data.output || "";

      // Parse response
      const parts = output.split("|");
      const verdict = parts[0]?.trim().toUpperCase().includes("FAIL") ? "FAIL" :
                      parts[0]?.trim().toUpperCase().includes("WARNING") ? "WARNING" : "PASS";
      const confidence = parseFloat(parts[1]) || 0.5;
      const notes = parts[2] || output.slice(0, 100);

      verdicts.push({
        provider: model.provider,
        model: model.model,
        verdict,
        confidence,
        notes
      });
    } catch (err) {
      verdicts.push({
        provider: model.provider,
        model: model.model,
        verdict: "WARNING",
        confidence: 0.0,
        notes: "Model unavailable"
      });
    }
  }

  return verdicts;
}

export function computeConsensusConfidence(verdicts: LLMVerdict[]): number {
  if (verdicts.length === 0) return 0.5;

  const passCount = verdicts.filter(v => v.verdict === "PASS").length;
  const failCount = verdicts.filter(v => v.verdict === "FAIL").length;
  const totalVerdicts = verdicts.length;

  // High disagreement = low confidence
  if (Math.abs(passCount - failCount) <= 1) return 0.3;

  // Strong agreement = high confidence
  const agreement = Math.max(passCount, failCount) / totalVerdicts;
  return agreement;
}
