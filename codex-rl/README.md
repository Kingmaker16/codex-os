# Codex Reinforcement Learning Loop v1

**Service:** `codex-rl`  
**Port:** 5495  
**Mode:** SEMI_AUTONOMOUS  
**RL Type:** Advantage Actor-Critic (A2C-lite)

## Overview

Codex RL implements a reinforcement learning feedback loop that learns optimal policies for content distribution, engagement, and monetization strategies based on real-world performance metrics.

## Safety Features

- **Mode:** SEMI_AUTONOMOUS - All policy updates require explicit approval
- **Approval Gates:** Required for any rewrite of strategy, distribution, campaign, or e-commerce tactics
- **Logging:** All RL runs stored in Brain v2 under domain "rl"
- **Experience Buffer:** Ring buffer storing last 1000 experiences

## Architecture

### Reward Function

Weighted combination of performance deltas:
- Trend Δ (weight 0.3)
- Visibility Δ (weight 0.3)
- Engagement Δ (weight 0.2)
- Revenue Δ (weight 0.2)

### Value Estimation

Simplified advantage estimation:
```
A = R - baseline
```
where baseline is the average reward from recent experiences.

### Policy Updates

All policy proposals:
1. Are generated from high-reward action patterns
2. **ALWAYS** set `requiresApproval: true`
3. Must be explicitly approved before application
4. Are logged to Brain v2 for audit trail

## API Endpoints

### `GET /health`
Service health check with buffer statistics

### `POST /rl/run`
Run RL cycle with environment interaction

**Request:**
```json
{
  "sessionId": "test-rl-1",
  "episodes": 5
}
```

**Response:**
```json
{
  "ok": true,
  "episode": {
    "id": "uuid",
    "sessionId": "test-rl-1",
    "totalReward": 2.34,
    "episodeLength": 5,
    "avgReward": 0.468,
    "timestamp": "2025-11-23T..."
  },
  "bufferStats": {
    "experienceCount": 25,
    "episodeCount": 5,
    "maxBufferSize": 1000,
    "avgReward": 0.42
  }
}
```

### `POST /rl/replay`
Retrieve past episodes for analysis

**Request:**
```json
{
  "sessionId": "test-rl-1",
  "limit": 10
}
```

### `POST /rl/policy`
Generate or approve policy proposals

**Generate Proposal:**
```json
{
  "approve": false
}
```

**Approve Policy:**
```json
{
  "approve": true,
  "policyId": "uuid"
}
```

**Response:**
```json
{
  "ok": true,
  "policy": {
    "id": "uuid",
    "description": "Policy proposal based on recent experience analysis",
    "actionWeights": {
      "strategy": 0.4,
      "distribution": 0.35,
      "campaign": 0.25
    },
    "proposedChanges": [
      "Increase strategy action frequency by 40%",
      "Increase distribution action frequency by 35%"
    ],
    "requiresApproval": true,
    "approved": false,
    "confidence": 0.7,
    "timestamp": "2025-11-23T..."
  },
  "message": "Policy proposal generated. Set approve=true to apply.",
  "requiresApproval": true
}
```

### `GET /rl/buffer`
Get experience buffer statistics

## Usage

```bash
# Build
npm run build

# Start
npm start

# Test health
curl -s http://localhost:5495/health

# Run RL cycle
curl -s -X POST http://localhost:5495/rl/run \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-rl-1","episodes":5}'

# Generate policy proposal
curl -s -X POST http://localhost:5495/rl/policy \
  -H "Content-Type: application/json" \
  -d '{"approve":false}'

# Approve policy (requires previous proposal)
curl -s -X POST http://localhost:5495/rl/policy \
  -H "Content-Type: application/json" \
  -d '{"approve":true}'

# Replay episodes
curl -s -X POST http://localhost:5495/rl/replay \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-rl-1","limit":5}'
```

## RL Workflow

1. **State Observation:** Fetch current metrics (trend, visibility, engagement, revenue)
2. **Action Selection:** Sample action from policy distribution
3. **Environment Step:** Execute action (simulated or real)
4. **Reward Computation:** Calculate weighted reward from metric deltas
5. **Experience Storage:** Add to ring buffer (max 1000)
6. **Advantage Estimation:** Compute A = R - baseline
7. **Policy Update:** Propose new policy (requires approval)
8. **Brain Logging:** Store episode and policy proposals

## Files

```
src/
├── index.ts              # Fastify server bootstrap
├── router.ts             # API endpoints
├── types.ts              # TypeScript interfaces
├── rewardEngine.ts       # Reward calculation
├── policyEngine.ts       # Policy proposals (with approval gates)
├── valueEngine.ts        # Advantage estimation
├── experienceBuffer.ts   # Ring buffer for experiences
├── rlOrchestrator.ts     # Main RL cycle coordination
└── brainLogger.ts        # Brain v2 integration
```

## Safety Guarantees

1. **No Automatic Policy Application:** All policy changes require explicit approval
2. **Audit Trail:** All episodes and proposals logged to Brain v2
3. **Experience Limits:** Ring buffer prevents unbounded memory growth
4. **Normalized Rewards:** Tanh normalization prevents extreme values
5. **Confidence Scoring:** Policy proposals include confidence metrics

## Future Enhancements

- Multi-objective optimization (Pareto frontier)
- Proximal Policy Optimization (PPO) for more stable updates
- Model-based RL for sample efficiency
- Hierarchical RL for complex strategy decomposition
- Safe exploration with uncertainty quantification
