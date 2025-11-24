# Codex Hardening Engine v1 ULTRA

**Service:** `codex-hardening`  
**Port:** `5555`  
**Mode:** `ULTRA_HARDENED`

## Purpose
Cross-service stability monitoring, anomaly detection, and execution hardening to prevent cascading failures and protect system integrity.

## Features

### 1. Service Health Monitoring
- Real-time health checks across critical services
- Latency tracking and anomaly detection
- Automatic detection of service unavailability

### 2. Anomaly Detection
- **SERVICE_DOWN**: Critical services not responding
- **HIGH_LATENCY**: Services responding slowly (>3000ms)
- **LOOP_RISK**: Repeated identical actions indicating potential loops

### 3. Hardening Decision Engine
- **allowExecution**: Whether the workflow can proceed
- **requireApproval**: Whether human approval is required
- **confidence**: 0-1 score indicating decision certainty

### 4. Brain v2 Integration
- All decisions logged to domain "system"
- Tagged with ["hardening", "stability", domain]
- Historical tracking for pattern analysis

## Endpoints

### `GET /health`
Service health check.

**Response:**
```json
{
  "ok": true,
  "service": "codex-hardening",
  "version": "1.0.0",
  "mode": "ULTRA_HARDENED"
}
```

### `POST /hardening/check`
Run hardening checks before workflow execution.

**Request:**
```json
{
  "sessionId": "session-123",
  "workflowId": "wf-456",
  "domain": "social",
  "actionSummary": "Run 20 posts in 1 hour",
  "servicesInvolved": ["orchestrator", "social", "distribution-v2"],
  "plannedActions": ["post_tiktok", "post_tiktok", "post_tiktok"]
}
```

**Response:**
```json
{
  "ok": true,
  "sessionId": "session-123",
  "domain": "social",
  "allowExecution": true,
  "requireApproval": true,
  "issues": [
    {
      "type": "LOOP_RISK",
      "level": "WARN",
      "message": "Potential loop risk: same action repeated many times back-to-back."
    }
  ],
  "summary": "[WARN] LOOP_RISK: Potential loop risk...",
  "confidence": 0.7
}
```

## Decision Logic

### Critical Issues (BLOCK)
- `allowExecution: false`
- `requireApproval: true`
- `confidence: 0.3`

### Warning Issues
- `allowExecution: true`
- `requireApproval: true`
- `confidence: 0.7`

### No Issues
- `allowExecution: true`
- `requireApproval: false`
- `confidence: 0.95`

## Monitored Services
- Orchestrator (4200)
- Brain v2 (4100)
- Ops Service (5350)
- Telemetry (4950)
- SRL (5540)
- Self-Audit (5530)
- Crossval (5470)
- Optimizer (5490)

## Build & Run

```bash
npm install
npm run build
npm start
```

## Testing

```bash
# Health check
curl http://localhost:5555/health

# Hardening check
curl -X POST http://localhost:5555/hardening/check \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "domain": "social",
    "actionSummary": "Test workflow",
    "servicesInvolved": ["orchestrator"],
    "plannedActions": ["action1", "action2"]
  }'
```

## Integration Points
- **Brain v2 (4100)**: Decision logging
- **SRL (5540)**: Pre-execution validation layer
- **Self-Audit (5530)**: Output quality validation
- **Ops Service (5350)**: Operational monitoring
- **Telemetry (4950)**: System metrics

## Architecture
```
Hardening Engine
├── Service Health Monitor
│   └── Real-time health checks (9 services)
├── Anomaly Detector
│   ├── Service availability
│   ├── Latency monitoring
│   └── Failure pattern detection
├── Loop Guard
│   └── Repetitive action detection
├── Decision Engine
│   ├── Execution gating
│   ├── Approval requirements
│   └── Confidence scoring
└── Brain Logger
    └── Historical decision tracking
```
