import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { AuditRequest, AuditReport, Finding, FixSuggestion } from "../types.js";
import { validateLogic } from "../engines/logicValidator.js";
import { validateSafety } from "../engines/safetyValidator.js";
import { validateConsistency } from "../engines/consistencyValidator.js";
import { validateWithLLMs, computeConsensusConfidence } from "../engines/multiLLMValidator.js";
import { computeQualityScore } from "../engines/qualityScorer.js";

const BRAIN_URL = "http://localhost:4100";

export async function runAudit(req: AuditRequest): Promise<AuditReport> {
  const timestamp = new Date().toISOString();
  const findings: Finding[] = [];

  // 1. Logic validation (always run)
  const logicFindings = validateLogic(req.content, req.contentType);
  findings.push(...logicFindings);

  // 2. Safety validation (optional)
  if (req.enableSafetyCheck !== false) {
    const safetyFindings = await validateSafety(req.content, req.sessionId);
    findings.push(...safetyFindings);
  }

  // 3. Consistency validation (optional)
  if (req.enableConsistencyCheck !== false) {
    const consistencyFindings = await validateConsistency(
      req.content,
      req.sessionId,
      req.context?.relatedMemories
    );
    findings.push(...consistencyFindings);
  }

  // 4. Multi-LLM validation (optional)
  let llmVerdicts;
  if (req.enableLLMValidation) {
    llmVerdicts = await validateWithLLMs(req.content);
    
    // Add findings from LLM disagreement
    const failCount = llmVerdicts.filter(v => v.verdict === "FAIL").length;
    if (failCount >= 2) {
      findings.push({
        id: uuidv4(),
        type: "MODEL_DISAGREEMENT",
        severity: failCount >= 3 ? "HIGH" : "MEDIUM",
        confidence: 0.7,
        description: `${failCount} out of ${llmVerdicts.length} models flagged issues`,
        context: llmVerdicts.filter(v => v.verdict === "FAIL")
          .map(v => `${v.provider}: ${v.notes}`)
          .join("; ")
      });
    }
  }

  // 5. Quality scoring
  const qualityScore = computeQualityScore(req.content, findings);

  // 6. Overall confidence
  const overallConfidence = llmVerdicts
    ? computeConsensusConfidence(llmVerdicts)
    : computeConfidenceFromFindings(findings);

  // 7. Generate fix suggestions
  const suggestions = generateFixSuggestions(findings);

  // 8. Determine if should block
  const shouldBlock = determineBlocking(findings, qualityScore);

  // 9. Generate summary
  const summary = generateSummary(findings, qualityScore, shouldBlock);

  // 10. Log to Brain
  await logAuditToBrain({
    sessionId: req.sessionId,
    contentType: req.contentType,
    findingCount: findings.length,
    qualityScore: qualityScore.overall,
    shouldBlock,
    summary
  });

  return {
    ok: true,
    sessionId: req.sessionId,
    timestamp,
    contentType: req.contentType,
    findings,
    llmVerdicts,
    qualityScore,
    overallConfidence,
    suggestions,
    shouldBlock,
    summary
  };
}

function computeConfidenceFromFindings(findings: Finding[]): number {
  if (findings.length === 0) return 0.95;

  const criticalCount = findings.filter(f => f.severity === "CRITICAL").length;
  const highCount = findings.filter(f => f.severity === "HIGH").length;

  if (criticalCount > 0) return 0.3;
  if (highCount > 2) return 0.5;
  if (highCount > 0) return 0.7;

  return 0.85;
}

function generateFixSuggestions(findings: Finding[]): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];

  for (const finding of findings) {
    if (finding.severity === "CRITICAL" || finding.severity === "HIGH") {
      suggestions.push({
        id: uuidv4(),
        findingId: finding.id,
        action: getSuggestionForFinding(finding),
        rationale: finding.description,
        estimatedImpact: finding.severity === "CRITICAL" ? "High" : "Medium",
        requiresApproval: finding.type === "SAFETY_VIOLATION"
      });
    }
  }

  return suggestions;
}

function getSuggestionForFinding(finding: Finding): string {
  switch (finding.type) {
    case "CONTRADICTION":
      return "Review and resolve contradicting statements";
    case "MISSING_STEP":
      return "Add missing steps to complete the sequence";
    case "CIRCULAR_REASONING":
      return "Restructure logic to avoid circular dependencies";
    case "INCOMPLETE_CHAIN":
      return "Complete conditional statements with resolutions";
    case "SAFETY_VIOLATION":
      return "Revise content to comply with safety rules";
    case "INCONSISTENCY":
      return "Align with historical decisions or document exception";
    case "TEMPORAL_MISMATCH":
      return "Correct date inconsistencies";
    case "MODEL_DISAGREEMENT":
      return "Review content for clarity and accuracy";
    default:
      return "Review and address quality issue";
  }
}

function determineBlocking(findings: Finding[], quality: any): boolean {
  const criticalCount = findings.filter(f => f.severity === "CRITICAL").length;
  const safetyViolations = findings.filter(f => f.type === "SAFETY_VIOLATION").length;

  if (criticalCount > 0) return true;
  if (safetyViolations >= 2) return true;
  if (quality.safety < 50) return true;
  if (quality.overall < 40) return true;

  return false;
}

function generateSummary(findings: Finding[], quality: any, shouldBlock: boolean): string {
  if (findings.length === 0) {
    return `Audit passed: No issues detected. Quality score: ${quality.overall}/100`;
  }

  const critical = findings.filter(f => f.severity === "CRITICAL").length;
  const high = findings.filter(f => f.severity === "HIGH").length;
  const medium = findings.filter(f => f.severity === "MEDIUM").length;

  let summary = `Found ${findings.length} issue(s): `;
  const parts = [];
  if (critical > 0) parts.push(`${critical} critical`);
  if (high > 0) parts.push(`${high} high`);
  if (medium > 0) parts.push(`${medium} medium`);
  summary += parts.join(", ");

  summary += `. Quality: ${quality.overall}/100.`;

  if (shouldBlock) {
    summary += " ⚠️ BLOCKING RECOMMENDATION";
  }

  return summary;
}

async function logAuditToBrain(data: any): Promise<void> {
  try {
    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "self_audit",
        sessionId: data.sessionId,
        title: `Self-Audit: ${data.contentType}`,
        content: JSON.stringify(data),
        tags: ["self-audit", data.contentType, data.shouldBlock ? "blocked" : "passed"]
      })
    });
  } catch {}
}
