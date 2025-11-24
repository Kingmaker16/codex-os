# Meta-Cognition Engine v1 ULTRA

**Service**: `codex-metacog`  
**Port**: 5580  
**Version**: 1.0.0-ultra  
**Mode**: META_COGNITION

## Overview

The Meta-Cognition Engine analyzes text for cognitive issues including uncertainty, contradictions, hallucination risks, and clarity problems. It provides confidence scoring and approval recommendations for potentially problematic content.

## Features

### 4 Core Engines

1. **Uncertainty Engine** - Detects uncertainty indicators
   - Patterns: "maybe", "probably", "not sure", "unclear", "might", "could be"
   - Severity: MEDIUM

2. **Contradiction Engine** - Identifies conflicting statements
   - Detects: can/cannot conflicts, yes/no contradictions
   - Severity: HIGH

3. **Hallucination Risk Engine** - Flags overly certain claims
   - Patterns: "100% guaranteed", "always works", "never fails", "absolutely certain"
   - Severity: HIGH

4. **Clarity Engine** - Assesses content clarity
   - Too short: < 20 characters
   - Too long unstructured: > 500 chars without punctuation
   - Severity: MEDIUM

### Confidence Scoring

- **0.95**: No findings (clean)
- **0.70**: Medium severity findings only
- **0.40**: High severity findings
- **0.20**: Critical severity findings

### Approval Requirements

- **requiresApproval: true** - When HIGH or CRITICAL severity findings detected
- **requiresApproval: false** - Clean or only LOW/MEDIUM findings

## API Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "ok": true,
  "service": "codex-metacog",
  "version": "1.0.0-ultra",
  "mode": "META_COGNITION"
}
```

### Analyze Text
```bash
POST /metacog/analyze
```

**Request:**
```json
{
  "text": "Maybe this always works perfectly",
  "context": {}
}
```

**Response:**
```json
{
  "ok": true,
  "report": {
    "findings": [
      {
        "type": "UNCERTAINTY",
        "severity": "MEDIUM",
        "description": "Detected uncertainty indicators: maybe"
      },
      {
        "type": "HALLUCINATION_RISK",
        "severity": "HIGH",
        "description": "Detected overly certain statements: always works"
      }
    ],
    "confidence": 0.4,
    "requiresApproval": true,
    "improvedVersion": "Maybe this always works perfectly [Meta-Cognition: refined for clarity and consistency]",
    "sourceModels": [
      "uncertainty-engine",
      "contradiction-engine",
      "hallucination-engine",
      "clarity-engine"
    ]
  }
}
```

## Test Cases

### Test 1: Uncertainty Detection
```bash
curl -s -X POST http://localhost:5580/metacog/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Maybe we should proceed with this approach"}'
```

**Expected**: UNCERTAINTY finding (MEDIUM severity)

### Test 2: Contradiction Detection
```bash
curl -s -X POST http://localhost:5580/metacog/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"The system can process requests. The system cannot process requests."}'
```

**Expected**: CONTRADICTION finding (HIGH severity), requiresApproval: true

### Test 3: Hallucination Risk
```bash
curl -s -X POST http://localhost:5580/metacog/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"This is 100% guaranteed to work perfectly"}'
```

**Expected**: HALLUCINATION_RISK finding (HIGH severity), requiresApproval: true

### Test 4: Multiple Issues
```bash
curl -s -X POST http://localhost:5580/metacog/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Maybe we should deploy this. It always works perfectly and never fails. But the system can handle it, although the system cannot handle high load."}'
```

**Expected**: UNCERTAINTY (MEDIUM), CONTRADICTION (HIGH), HALLUCINATION_RISK (HIGH)

### Via Orchestrator (Port 4200)
```bash
curl -s -X POST http://localhost:4200/metacog/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"This always works without any issues"}'
```

## Integration Points

### Self-Audit Engine (5530)
- Can use Meta-Cognition for reasoning validation
- Cross-validate logic quality

### Self-Regulation Layer (5540)
- Pre-execution meta-cognition checks
- Block execution on HIGH severity findings

### Autonomy Engine (5420)
- Validate autonomy decisions for cognitive issues
- Ensure decision clarity and consistency

### Brain v2 (4100)
- Log meta-cognition findings to domain "metacog"
- Track cognitive issue patterns over time

## Development

### Install Dependencies
```bash
npm install
```

### Build
```bash
npm run build
```

### Start Service
```bash
npm start
# or for development:
npm run dev
```

### Project Structure
```
codex-metacog/
├── src/
│   ├── types.ts                    # Type definitions
│   ├── router.ts                   # API routes
│   ├── index.ts                    # Main entry point
│   └── engines/
│       ├── uncertaintyEngine.ts    # Uncertainty detection
│       ├── contradictionEngine.ts  # Contradiction detection
│       ├── hallucinationEngine.ts  # Hallucination risk detection
│       ├── clarityEngine.ts        # Clarity assessment
│       └── metacogEngine.ts        # Fusion engine
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture

```
Input Text
    ↓
Uncertainty Engine → Findings
    ↓
Contradiction Engine → Findings
    ↓
Hallucination Engine → Findings
    ↓
Clarity Engine → Findings
    ↓
Meta-Cognition Fusion
    ↓
    ├─ Confidence Score (0.2 - 0.95)
    ├─ Approval Required (true/false)
    ├─ Improved Version (optional)
    └─ Source Models List
```

## Notes

- All engines run synchronously (fast pattern matching)
- No external LLM calls required
- Suitable for real-time analysis
- Can be extended with additional cognitive checks
- Pattern-based detection (rule-based system)

## Version History

- **1.0.0-ultra** (Nov 2025) - Initial release with 4 core engines
