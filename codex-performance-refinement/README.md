# Codex Performance Refinement Engine v1 ULTRA

**Service:** `codex-performance-refinement`  
**Port:** 5520  
**Mode:** SEMI_AUTONOMOUS

## Overview

Performance refinement engine that identifies weaknesses, mines patterns, and generates actionable recommendations across all Codex domains.

## Features

- **Weakness Detection:** Identifies declines, plateaus, and underperformance vs benchmarks
- **Pattern Mining:** Discovers correlations across trend velocity, posting cadence, watch time, CTR, RPM
- **Multi-LLM Recommendations:** Consensus from GPT-4o, Claude, Gemini, Grok
- **Progress Tracking:** 7-day improvement history with delta tracking
- **Brain v2 Integration:** All reports logged for audit trail
- **Safety:** High-impact recommendations require approval

## Domain Coverage

- **social:** Social media accounts, engagement, content
- **ecomm:** E-commerce stores, products, sales
- **video:** Video generation, watch time, retention
- **strategy:** Strategic execution, planning
- **trends:** Trend velocity, alignment, timing
- **campaign:** Content distribution, posting, reach
- **monetization:** Revenue, RPM, conversion rates

## API Endpoints

### `GET /health`
Service health check

### `POST /refinement/run`
Run performance refinement analysis

**Request:**
```json
{
  "sessionId": "test-refine-1",
  "domain": "social",
  "metrics": {
    "views": 10500,
    "ctr": 0.3,
    "engagement": 450,
    "trendVelocity": 0.64
  },
  "includeLLMRecommendations": true
}
```

**Response:**
```json
{
  "ok": true,
  "report": {
    "sessionId": "test-refine-1",
    "domain": "social",
    "timestamp": "2025-11-23T...",
    "weaknessCount": 2,
    "patternCount": 1,
    "recommendationCount": 3,
    "improvementScore": -5.2,
    "health": {
      "score": 72,
      "grade": "C",
      "status": "FAIR"
    },
    "weaknesses": [...],
    "patterns": [...],
    "recommendations": [...],
    "llmConsensus": "..."
  }
}
```

### `POST /refinement/history`
View historical progress deltas

**Request:**
```json
{
  "domain": "social",
  "days": 7
}
```

**Response:**
```json
{
  "ok": true,
  "history": [
    {
      "date": "2025-11-23T...",
      "domain": "social",
      "improvementScore": -5.2,
      "metricsSnapshot": {...}
    }
  ],
  "trend": "DECLINING",
  "count": 7
}
```

### `GET /refinement/domains`
List available refinement domains

## Weakness Types

- **DECLINE:** Metric decreased >10% from recent average
- **PLATEAU:** Minimal variance over last 5 periods
- **UNDERPERFORMANCE:** Below benchmark by >30%

## Impact Levels

- **HIGH:** Critical issues requiring immediate attention (requires approval)
- **MEDIUM:** Moderate issues affecting performance
- **LOW:** Minor optimizations

## Pattern Detection

1. **Velocity-Engagement Correlation:** Trend velocity vs engagement relationship
2. **CTR-to-Views Conversion:** Click-through effectiveness
3. **Posting Frequency Saturation:** Over-posting diluting engagement
4. **Monetization Efficiency:** Watch time to revenue conversion
5. **Engagement-Revenue Gap:** Engagement quality vs monetization

## Recommendation Categories

- **Content Optimization:** Thumbnails, titles, hooks
- **Engagement Strategy:** CTAs, interactive elements
- **Trend Alignment:** Monitoring frequency, response time
- **Content Quality:** Pacing, retention optimization
- **Posting Strategy:** Frequency, timing adjustments
- **Revenue Optimization:** Ad placement, affiliate integration
- **Monetization Strategy:** Product placements, revenue streams

## Usage

```bash
# Build
npm run build

# Start
npm start

# Test health
curl -s http://localhost:5520/health

# Run refinement
curl -s -X POST http://localhost:5520/refinement/run \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-refine-1",
    "domain": "social",
    "metrics": {
      "views": 10500,
      "ctr": 0.3,
      "engagement": 450,
      "trendVelocity": 0.64
    }
  }'

# View history
curl -s -X POST http://localhost:5520/refinement/history \
  -H "Content-Type: application/json" \
  -d '{"domain":"social","days":7}'
```

## Workflow

1. **Input Metrics:** Receive current performance data
2. **Detect Weaknesses:** Compare against benchmarks and historical trends
3. **Mine Patterns:** Discover correlations and failure points
4. **Generate Recommendations:** Rule-based + LLM-enhanced suggestions
5. **Track Progress:** Calculate improvement score, maintain 7-day history
6. **Log Report:** Write to Brain v2 for audit trail
7. **Return Results:** Structured report with health score and recommendations

## Safety Guarantees

- **Approval Gates:** HIGH-impact recommendations require explicit approval
- **Audit Trail:** All refinement runs logged to Brain v2
- **Benchmarking:** Conservative benchmarks prevent false positives
- **Multi-LLM Validation:** Consensus from 4 frontier models
- **Progress Tracking:** Historical context prevents knee-jerk reactions

## Health Scoring

```
Base Score: 100
- Severity Score × 5 (HIGH=3, MEDIUM=2, LOW=1)
- Weakness Count × 3
+ Improvement Score × 2

Grade Scale:
A (90-100): Excellent
B (80-89):  Good
C (70-79):  Fair
D (60-69):  Needs Improvement
F (<60):    Critical
```

## Integration

All refinement reports automatically logged to Brain v2:
- Domain: `performance_refinement`
- Tags: `["refinement", domain, "performance", "recommendations"]`
- Content includes weakness summary, pattern insights, top recommendations

## Architecture

```
src/
├── index.ts                 # Service bootstrap
├── router.ts                # API endpoints
├── types.ts                 # TypeScript interfaces
├── refinementEngine.ts      # Main orchestration
├── weaknessDetector.ts      # Decline/plateau/underperformance detection
├── patternMiner.ts          # Correlation and failure point discovery
├── recommendationEngine.ts  # Rule-based + LLM-enhanced suggestions
├── progressTracker.ts       # 7-day improvement history
└── brainLogger.ts           # Brain v2 integration
```
