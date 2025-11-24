# Codex Simulation Engine v1 (codex-sim)

**Port:** 5070  
**Status:** ✅ Operational

## Purpose
Simulates orchestrated workflows (social + ecomm) end-to-end without hitting real platforms or spending money. Perfect for testing complex multi-step workflows before deploying to production.

## Architecture
- **Service:** Fastify REST API on port 5070
- **Integration:** Calls Orchestrator `/orchestrator/quickRun` for each simulation step
- **Storage:** In-memory simulation results (no persistence in v1)

## Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "ok": true,
  "service": "codex-sim",
  "version": "1.0.0"
}
```

### `POST /sim/run`
Run a simulation scenario.

**Request Body:**
```json
{
  "sessionId": "sim-001",
  "scenario": "social_ecomm_launch" | "content_only" | "store_only",
  "niche": "home fitness",
  "productName": "Smart Bottle Pro",
  "days": 7
}
```

**Scenarios:**
- `social_ecomm_launch`: Full workflow (strategy → content → store → ads)
- `content_only`: Content planning and generation only
- `store_only`: E-commerce store creation only

**Response:**
```json
{
  "ok": true,
  "scenario": "social_ecomm_launch",
  "sessionId": "sim-001",
  "steps": [
    {
      "step": "Plan a 7-day strategy...",
      "ok": true,
      "details": { ... }
    }
  ],
  "summary": "Simulation completed successfully. All steps reported ok=true."
}
```

## Installation

```bash
cd ~/Codex/codex-sim
npm install
npm run build
npm start &
```

## Testing

```bash
# Health check
curl http://localhost:5070/health

# Run full social + ecomm simulation
curl -X POST http://localhost:5070/sim/run \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sim-001",
    "scenario": "social_ecomm_launch",
    "niche": "home fitness",
    "productName": "Smart Bottle Pro",
    "days": 7
  }'

# Run content-only simulation
curl -X POST http://localhost:5070/sim/run \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sim-002",
    "scenario": "content_only",
    "niche": "pet care"
  }'
```

## Orchestrator Integration

Registered at: `/sim/*`

Access via Orchestrator:
```bash
curl -X POST http://localhost:4200/sim/run \
  -H "Content-Type: application/json" \
  -d '{ "sessionId": "sim-001", "scenario": "content_only", "niche": "fitness" }'
```

## Implementation Details

**Files:**
- `src/types.ts`: TypeScript interfaces (SimulationRequest, SimulationResult, SimulationStepResult)
- `src/simEngine.ts`: Core simulation logic, calls Orchestrator quickRun for each step
- `src/router.ts`: Fastify routes (`/health`, `/sim/run`)
- `src/index.ts`: Server entry point (port 5070)

**Simulation Flow:**
1. Receive simulation request with scenario + niche
2. Decompose scenario into steps (strategy, content, store, ads)
3. Execute each step via Orchestrator `/orchestrator/quickRun`
4. Collect results and generate summary
5. Return aggregated SimulationResult

**Error Handling:**
- Gracefully handles Orchestrator unavailability
- Returns detailed error info per step
- Provides summary with failure count

## Known Limitations (v1)

1. **Bridge Claude 400 Errors**: Currently experiencing 400 errors when Orchestrator calls Bridge with Claude provider. Works with other providers (OpenAI, mock).
2. **No Persistence**: Simulation results are not stored (in-memory only)
3. **Sequential Execution**: Steps run sequentially (no parallelization)
4. **Basic Scenarios**: Only 3 pre-defined scenarios supported

## Future Enhancements (v2)

- [ ] Custom scenario builder (user-defined steps)
- [ ] Parallel step execution
- [ ] Result persistence (SQLite or Brain)
- [ ] Cost estimation per scenario
- [ ] Dry-run validation before execution
- [ ] Simulation history and replay

## Service Dependencies

- **Required:**
  - codex-orchestrator (port 4200) - For task planning and execution
  - codex-bridge (port 4000) - For LLM calls (via Orchestrator)

- **Optional:**
  - codex-brain (port 4100) - For session logging
  - codex-strategy (port 5050) - For strategy planning
  - codex-trends (port 5060) - For trend analysis
  - codex-ecommerce (port 5100) - For store generation
  - codex-video (port 4700) - For video content

## Version History

- **v1.0.0** (2024-01-19): Initial release
  - 3 simulation scenarios
  - Orchestrator integration
  - Basic error handling
