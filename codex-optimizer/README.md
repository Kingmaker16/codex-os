# Multi-Domain Optimization Engine v1 ULTRA

**Service:** `codex-optimizer`  
**Port:** 5490  
**Mode:** SEMI_AUTONOMOUS

## Overview

Codex Optimizer provides comprehensive KPI tracking, reasoning, corrections, and A/B testing across all Codex OS domains.

## Features

- **Multi-Domain Analysis**: Social, E-commerce, Video, Trends, Monetization, Campaigns
- **KPI Tracking**: Automatic delta calculation and growth rate analysis
- **Service Health Monitoring**: Real-time health checks across 10+ services
- **Optimization Insights**: AI-powered recommendations with impact scoring
- **Correction Engine**: Automatic issue detection and correction suggestions
- **A/B Test Designer**: Hypothesis generation and test configuration
- **Multi-LLM Reasoning**: Consensus from GPT-4o, Claude, Gemini, Grok
- **Brain v2 Integration**: Automatic memory logging

## API Endpoints

### `GET /health`
Service health check

### `POST /optimizer/run`
Run optimization analysis

**Request:**
```json
{
  "sessionId": "opt-001",
  "domain": "social",
  "cycle": "daily",
  "includeABTests": true
}
```

**Response:**
```json
{
  "ok": true,
  "sessionId": "opt-001",
  "domain": "social",
  "timestamp": "2025-11-23T...",
  "kpis": [...],
  "insights": [...],
  "corrections": [...],
  "abTests": [...],
  "serviceHealth": [...],
  "llmConsensus": "...",
  "confidence": 0.85
}
```

### `GET /optimizer/domains`
List available optimization domains

## Domains

- **social**: Social media accounts, engagement, content
- **ecomm**: E-commerce stores, products, sales
- **video**: Video generation, creative suite, templates
- **trends**: Trend tracking, viral content, timing
- **monetization**: Revenue streams, affiliate, pricing
- **campaigns**: Content distribution, posting, reach
- **all**: Combined analysis across all domains

## Architecture

```
src/
├── types.ts                    # Core type definitions
├── router.ts                   # API routes
├── index.ts                    # Service bootstrap
├── brainLogger.ts              # Brain v2 integration
├── core/
│   ├── optimizerEngine.ts      # Main orchestration
│   ├── kpiTracker.ts           # KPI fetching & delta calculation
│   ├── reasoningEngine.ts      # Multi-LLM consensus
│   ├── correctionEngine.ts     # Issue detection & corrections
│   ├── abTestEngine.ts         # A/B test design
│   └── domainOptimizers/
│       ├── social.ts           # Social domain optimizer
│       ├── ecomm.ts            # E-commerce optimizer
│       ├── video.ts            # Video optimizer
│       ├── trends.ts           # Trends optimizer
│       ├── monetization.ts     # Monetization optimizer
│       └── campaigns.ts        # Campaigns optimizer
└── integration/
    ├── serviceClients.ts       # Service health checks
    └── orchestratorRouter.ts   # Orchestrator integration config
```

## Usage

```bash
# Build
npm run build

# Start
npm start

# Test
curl http://localhost:5490/health
curl -X POST http://localhost:5490/optimizer/run \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","domain":"all","cycle":"daily","includeABTests":true}'
```

## Integration with Orchestrator

Add to `codex-orchestrator/src/index.ts`:

```typescript
app.all("/optimizer/*", async (req, reply) => {
  const path = req.url.replace("/optimizer", "");
  const url = `http://localhost:5490${path}`;
  const resp = await fetch(url, {
    method: req.method,
    headers: { "Content-Type": "application/json" },
    body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
  });
  const data = await resp.json();
  return data;
});
```

## Safety

- Mode: SEMI_AUTONOMOUS
- No automatic writes to production services
- All high-impact actions require approval
- Service health monitoring prevents cascading failures
