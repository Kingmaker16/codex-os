# Codex System Orchestrator Mesh v1

**Service:** `codex-mesh`  
**Port:** `5565`  
**Mode:** `SEMI_AUTONOMOUS_MESH`

## Purpose
Intelligent workflow orchestrator that connects autonomy evaluation, hardening checks, self-regulation, and workflow creation into coordinated multi-service execution plans.

## Features

### 1. Multi-Service Orchestration
Coordinates execution across:
- **Autonomy Engine** (5420): Decision evaluation
- **Self-Regulation Layer** (5540): Pre-execution validation
- **Hardening Engine** (5555): Service health & stability checks
- **Workflow Layer** (5430): Workflow creation & execution
- **Ops Service** (5350): Operational monitoring
- **Strategy Service** (5050): Strategic planning
- **Simulation Engine** (5070): Dry-run testing

### 2. Execution Modes
- **SIMULATION**: Test run without side effects
- **DRY_RUN**: Validation only, no execution
- **LIVE**: Full production execution

### 3. Step-by-Step Execution
- Create mesh plans with multiple sequential steps
- Track status per step: PENDING → IN_PROGRESS → DONE/ERROR
- Resume execution with `/mesh/step` endpoint
- Query plan status at any time

### 4. Brain v2 Integration
- All plan updates logged to domain "ops"
- Tagged with ["mesh", "orchestration", domain]
- Historical tracking for audit and analysis

## Architecture

```
Mesh Plan Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. Autonomy Evaluation                                  │
│    → POST /autonomy/evaluate                            │
│    → Determines if goal is achievable                   │
├─────────────────────────────────────────────────────────┤
│ 2. Self-Regulation Check (SRL)                          │
│    → POST /srl/check                                    │
│    → Validates goal clarity, loop risk, safety          │
├─────────────────────────────────────────────────────────┤
│ 3. Hardening Check                                      │
│    → POST /hardening/check                              │
│    → Verifies service health, detects anomalies         │
├─────────────────────────────────────────────────────────┤
│ 4. Workflow Creation                                    │
│    → POST /workflow/create                              │
│    → Generates executable workflow                      │
└─────────────────────────────────────────────────────────┘
```

## Endpoints

### `GET /health`
Service health check.

**Response:**
```json
{
  "ok": true,
  "service": "codex-mesh",
  "version": "1.0.0",
  "mode": "SEMI_AUTONOMOUS_MESH"
}
```

### `POST /mesh/create`
Create a new mesh orchestration plan.

**Request:**
```json
{
  "sessionId": "session-123",
  "domain": "social",
  "goal": "Plan and execute a 7-day TikTok & Shorts content cycle.",
  "mode": "DRY_RUN"
}
```

**Response:**
```json
{
  "ok": true,
  "plan": {
    "id": "uuid-123",
    "sessionId": "session-123",
    "domain": "social",
    "goal": "Plan and execute...",
    "mode": "DRY_RUN",
    "createdAt": "2025-11-22T...",
    "updatedAt": "2025-11-22T...",
    "steps": [
      {
        "id": "step-1",
        "label": "Evaluate autonomy decision",
        "service": "autonomy",
        "endpoint": "/autonomy/evaluate",
        "payload": { "goal": "...", "domain": "social" },
        "status": "PENDING"
      },
      // ... more steps
    ]
  }
}
```

### `POST /mesh/step`
Execute the next pending step in a plan.

**Request:**
```json
{
  "planId": "uuid-123"
}
```

**Response:**
```json
{
  "ok": true,
  "plan": {
    "id": "uuid-123",
    "steps": [
      {
        "id": "step-1",
        "status": "DONE",
        "result": { /* service response */ }
      },
      {
        "id": "step-2",
        "status": "PENDING"
      }
    ]
  }
}
```

### `GET /mesh/plan?id=<planId>`
Get details of a specific plan.

**Response:**
```json
{
  "ok": true,
  "plan": { /* MeshPlan object */ }
}
```

### `GET /mesh/plans`
List all active mesh plans.

**Response:**
```json
{
  "ok": true,
  "plans": [
    { /* MeshPlan 1 */ },
    { /* MeshPlan 2 */ }
  ]
}
```

## Supported Domains

- `social` - Social media operations
- `ecomm` - E-commerce workflows
- `video` - Video content generation
- `strategy` - Strategic planning
- `trends` - Trend analysis
- `campaign` - Campaign management
- `monetization` - Revenue optimization
- `system` - System operations

## Integration Points

**Connected Services:**
- Autonomy Engine (5420)
- Workflow Layer (5430)
- Hardening Engine (5555)
- Self-Regulation Layer (5540)
- Ops Service (5350)
- Strategy Service (5050)
- Simulation Engine (5070)
- Brain v2 (4100)

## Build & Run

```bash
npm install
npm run build
npm start
```

## Testing

```bash
# Health check
curl http://localhost:5565/health

# Create mesh plan
curl -X POST http://localhost:5565/mesh/create \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "domain": "social",
    "goal": "Execute social media strategy",
    "mode": "DRY_RUN"
  }'

# Execute next step (replace <planId> with actual ID)
curl -X POST http://localhost:5565/mesh/step \
  -H "Content-Type: application/json" \
  -d '{"planId": "<planId>"}'

# List all plans
curl http://localhost:5565/mesh/plans
```

## Use Cases

1. **Autonomous Workflow Execution**
   - Create plan → Evaluate autonomy → Check regulations → Verify hardening → Execute

2. **Multi-Domain Coordination**
   - Social + Video + Monetization workflows
   - Strategy → Trends → Campaign execution

3. **Safety-First Operations**
   - SRL validates before hardening
   - Hardening verifies before workflow creation
   - Each step logged to Brain v2

4. **Progressive Execution**
   - Create plan and review steps
   - Execute step-by-step with human oversight
   - Resume from any point on error

## State Management

Plans stored in-memory (Map-based). All state tracked with timestamps. Brain v2 provides persistent historical log.

## Error Handling

- Step failures marked as ERROR with error message
- Execution stops on error (manual intervention required)
- All errors logged to Brain v2 for analysis
