# Self-Audit Engine v1 ULTRA

**Service:** `codex-self-audit`  
**Port:** 5530  
**Mode:** SEMI_AUTONOMOUS

## Overview

Internal reviewer system that analyzes Codex outputs, plans, tasks, actions, and reasoning for quality, safety, and correctness.

## Validation Engines

### 1. Logic Validator
- Contradiction detection
- Circular reasoning identification
- Incomplete chain detection
- Missing step identification
- Dependency validation

### 2. Safety Validator
- Integrates with Safety Engine v2 (port 5090)
- Rule compliance checking
- Dangerous action flagging
- Restricted operation detection

### 3. Consistency Validator
- Brain v2 memory comparison
- Historical decision alignment
- Temporal consistency checking
- Context mismatch detection

### 4. Multi-LLM Validator
- GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Flash, Grok 4 Latest
- Cross-validation consensus
- Model disagreement detection
- Confidence scoring

### 5. Quality Scorer
- Overall score (0-100)
- Clarity, completeness, correctness, safety, usefulness
- Heuristic-based analysis
- Finding severity integration

## API Endpoints

### `GET /health`
Service health check with capabilities

### `POST /audit/run`
Run single audit

**Request:**
```json
{
  "sessionId": "test-audit-1",
  "content": "Plan: Step 1 - Initialize. Step 3 - Complete.",
  "contentType": "plan",
  "context": {
    "relatedMemories": [],
    "dependencies": [],
    "constraints": []
  },
  "enableLLMValidation": true,
  "enableSafetyCheck": true,
  "enableConsistencyCheck": true
}
```

**Response:**
```json
{
  "ok": true,
  "report": {
    "sessionId": "test-audit-1",
    "timestamp": "2025-11-23T...",
    "contentType": "plan",
    "findings": [
      {
        "id": "uuid",
        "type": "MISSING_STEP",
        "severity": "HIGH",
        "confidence": 0.8,
        "description": "Gap detected in sequence: step 1 to 3"
      }
    ],
    "llmVerdicts": [...],
    "qualityScore": {
      "overall": 72,
      "clarity": 80,
      "completeness": 60,
      "correctness": 75,
      "safety": 90,
      "usefulness": 70
    },
    "overallConfidence": 0.7,
    "suggestions": [...],
    "shouldBlock": false,
    "summary": "Found 1 issue(s): 1 high. Quality: 72/100."
  }
}
```

### `POST /audit/batch`
Run multiple audits

**Request:**
```json
{
  "items": [
    { "sessionId": "audit-1", "content": "...", "contentType": "output" },
    { "sessionId": "audit-2", "content": "...", "contentType": "plan" }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "reports": [...],
  "summary": {
    "total": 2,
    "passed": 1,
    "warnings": 0,
    "blocked": 1
  }
}
```

### `GET /audit/history?limit=20`
View recent audit history

## Finding Types

- **CONTRADICTION:** Conflicting statements
- **MISSING_STEP:** Sequence gaps
- **CIRCULAR_REASONING:** Self-referential logic
- **INCOMPLETE_CHAIN:** Unresolved conditionals
- **SAFETY_VIOLATION:** Rule violations
- **INCONSISTENCY:** Historical conflicts
- **TEMPORAL_MISMATCH:** Date errors
- **MODEL_DISAGREEMENT:** LLM consensus failure
- **QUALITY_ISSUE:** General quality problems

## Severity Levels

- **CRITICAL:** Blocking issue, immediate action required
- **HIGH:** Significant problem, should address
- **MEDIUM:** Moderate issue, review recommended
- **LOW:** Minor concern, optional fix

## Blocking Logic

Blocks execution if:
- Any CRITICAL findings
- 2+ SAFETY_VIOLATION findings
- Safety score < 50
- Overall quality score < 40

## Integration

### Orchestrator Route
`/selfAudit/*` → `http://localhost:5530`

### Brain Integration
All audits logged to domain `self_audit` with tags:
- `self-audit`
- Content type (plan/output/task/action/reasoning)
- Status (passed/blocked)

## Usage Examples

```bash
# Health check
curl -s http://localhost:5530/health | jq

# Run audit
curl -s -X POST http://localhost:5530/audit/run \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "content": "Step 1: Init. Step 2: Process.",
    "contentType": "plan",
    "enableLLMValidation": false
  }' | jq '.report.summary'

# View history
curl -s http://localhost:5530/audit/history?limit=10 | jq
```

## Architecture

```
src/
├── index.ts              # Server bootstrap
├── router.ts             # API endpoints
├── types.ts              # TypeScript interfaces
├── engines/
│   ├── logicValidator.ts       # Contradiction, missing steps
│   ├── safetyValidator.ts      # Safety Engine integration
│   ├── consistencyValidator.ts # Brain v2 comparison
│   ├── multiLLMValidator.ts    # Multi-model validation
│   └── qualityScorer.ts        # Quality metrics
└── core/
    └── auditEngine.ts          # Orchestration, reporting
```

## Safety Guarantees

- All CRITICAL findings trigger blocking recommendation
- Safety violations logged to Brain v2
- Multi-LLM consensus reduces false positives
- Historical consistency prevents drift
- Quality thresholds enforce standards

---

**Self-Audit Engine v1 ULTRA**: Codex's internal reviewer ensuring quality, safety, and correctness across all operations.
