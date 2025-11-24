# Self-Regulation Layer v1 ULTRA

**Service:** `codex-srl`  
**Port:** 5540  
**Mode:** SEMI_AUTONOMOUS

## Overview

Self-regulation system that validates Codex workflows before execution. Provides safety checks, goal validation, loop detection, and resource monitoring.

## Features

- **Goal Drift Detection**: Ensures objectives are clear and well-defined
- **Safety Validation**: Integrates with Self-Audit Engine (5530) for critical issue detection
- **Loop Risk Detection**: Identifies repetitive action patterns
- **System Stress Monitoring**: Checks CPU and resource usage
- **Brain Integration**: All decisions logged to Brain v2

## API Endpoints

### `GET /health`
Service health check

### `POST /srl/check`
Run self-regulation check

**Request:**
```json
{
  "sessionId": "srl-test-1",
  "domain": "social",
  "contentSummary": "Run 30 TikTok posts today using SAFE+MEDIUM accounts.",
  "plannedActions": [
    "post_tiktok",
    "post_tiktok",
    "post_tiktok"
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "sessionId": "srl-test-1",
  "domain": "social",
  "allowExecution": true,
  "requireApproval": false,
  "findings": [],
  "summary": "No issues detected.",
  "confidence": 0.9
}
```

## Finding Types

- **GOAL_DRIFT**: Unclear or missing objectives
- **SAFETY_RISK**: Critical safety issues detected
- **LOOP_RISK**: Repetitive action patterns
- **CONTRADICTION**: Conflicting instructions
- **RESOURCE_STRESS**: High CPU/memory usage
- **ACCOUNT_RISK**: Account safety concerns
- **POLICY_DEVIATION**: Violates operational policies
- **UNCLEAR_OBJECTIVE**: Vague or ambiguous goals

## Regulation Levels

- **INFO**: Informational, no action required
- **WARN**: Warning, approval recommended
- **BLOCK**: Critical, execution should be blocked

## Decision Logic

- **BLOCK findings**: `allowExecution = false`, `requireApproval = true`
- **WARN findings**: `allowExecution = true`, `requireApproval = true`
- **No findings**: `allowExecution = true`, `requireApproval = false`

## Confidence Scoring

- **0.9**: No issues detected
- **0.6**: Warnings present, approval recommended
- **0.2**: Blocking issues, high risk

## Integration Points

- **Self-Audit Engine (5530)**: Critical issue detection
- **Safety Engine (5090)**: Account safety validation
- **Ops Service (5350)**: System health monitoring
- **Telemetry (4950)**: Resource usage metrics
- **Brain v2 (4100)**: Decision logging

## Usage

```bash
# Health check
curl -s http://localhost:5540/health | jq

# Run regulation check
curl -s -X POST http://localhost:5540/srl/check \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "domain": "social",
    "contentSummary": "Post content to TikTok",
    "plannedActions": ["post_tiktok"]
  }' | jq
```

## Safety Guarantees

- NO direct destructive actions
- All decisions logged to Brain v2
- Critical issues trigger execution blocks
- Approval gates for warnings
- System stress monitoring prevents overload

---

**Self-Regulation Layer v1 ULTRA**: Codex's internal validator ensuring safe autonomous operation.
