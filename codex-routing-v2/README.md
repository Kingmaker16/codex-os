# Content Routing Engine v2 ULTRA

🎯 **Intelligent multi-platform content routing powered by 4-LLM consensus and advanced scoring algorithms**

---

## Overview

Content Routing Engine v2 ULTRA analyzes content and determines the optimal platform for distribution using:
- **4-LLM Consensus**: Parallel calls to GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Flash, and Grok 4
- **Multi-Factor Scoring**: Trend alignment, visibility potential, risk assessment, posting velocity
- **Simulation Mode**: Predict reach, engagement, revenue, and success probability
- **Real-time Optimization**: Dynamic route scoring and platform comparison

---

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start service
npm start
# Service runs on http://localhost:5560
```

---

## API Endpoints

### 1. Health Check
```bash
GET /health
```

**Response:**
```json
{
  "ok": true,
  "service": "codex-routing-v2",
  "version": "2.0.0",
  "port": 5560
}
```

---

### 2. Analyze Route (Full Analysis)
```bash
POST /routing/analyze
```

**Request:**
```json
{
  "contentId": "my-video-001",
  "content": {
    "id": "my-video-001",
    "type": "short",
    "duration": 30,
    "language": "en",
    "title": "Viral dance challenge",
    "description": "Trending dance moves"
  },
  "targetPlatforms": ["tiktok", "youtube", "instagram"],
  "trendWeighted": true
}
```

**Response:**
```json
{
  "routeId": "uuid-123",
  "contentId": "my-video-001",
  "routes": [
    {
      "platform": "tiktok",
      "score": 0.87,
      "trendScore": 0.92,
      "visibilityScore": 0.85,
      "riskScore": 0.75,
      "velocityScore": 0.88,
      "confidence": 0.89,
      "reasoning": "tiktok: high trend alignment, strong visibility potential, optimal posting velocity"
    }
  ],
  "topRoute": { /* same as routes[0] */ },
  "alternatives": [ /* routes[1-3] */ ],
  "llmConsensus": {
    "topChoice": "tiktok",
    "confidence": 0.85,
    "agreement": 0.75,
    "suggestions": [...]
  },
  "timestamp": "2025-11-22T12:00:00.000Z",
  "status": "ANALYZED"
}
```

---

### 3. Get Platform Scores
```bash
POST /routing/scores
```

**Request:**
```json
{
  "content": {
    "id": "my-video-001",
    "type": "short",
    "duration": 30,
    "language": "en",
    "title": "Quick cooking hack"
  },
  "platforms": ["tiktok", "youtube", "instagram", "twitter"]
}
```

**Response:**
```json
{
  "contentId": "my-video-001",
  "scores": [
    {
      "platform": "tiktok",
      "totalScore": 0.87,
      "breakdown": {
        "trend": 0.92,
        "visibility": 0.85,
        "risk": 0.75,
        "velocity": 0.88
      },
      "confidence": 0.89,
      "reasoning": "tiktok: high trend alignment, strong visibility potential"
    }
  ]
}
```

---

### 4. Optimize Routes
```bash
POST /routing/optimize
```

**Request:**
```json
{
  "routeId": "uuid-123",
  "weights": {
    "trend": 0.4,
    "visibility": 0.3,
    "risk": 0.2,
    "velocity": 0.1
  }
}
```

**Response:**
```json
{
  "routeId": "uuid-123",
  "routes": [ /* re-scored routes */ ],
  "topRoute": { /* highest scoring route */ },
  "status": "OPTIMIZED"
}
```

---

### 5. Simulate Route
```bash
POST /routing/simulate
```

**Request:**
```json
{
  "routeId": "uuid-123",
  "routeIndex": 0
}
```

**Response:**
```json
{
  "routeId": "sim-1732276800000",
  "route": { /* route details */ },
  "predictedReach": 150000,
  "predictedEngagement": 7500,
  "predictedRisk": 0.25,
  "estimatedRevenue": 3.75,
  "successProbability": 0.82,
  "warnings": [],
  "recommendations": [
    "✅ Excellent route - proceed with confidence",
    "🔥 High trend alignment - post soon to capitalize"
  ]
}
```

---

### 6. Simulate All Routes
```bash
POST /routing/simulate-all
```

**Request:**
```json
{
  "routeId": "uuid-123"
}
```

**Response:**
```json
{
  "routeId": "uuid-123",
  "simulations": [ /* array of simulations */ ],
  "bestRoute": { /* simulation with highest success probability */ },
  "comparison": [
    {
      "platform": "tiktok",
      "successProbability": 0.85,
      "predictedReach": 200000,
      "estimatedRevenue": 5.2
    }
  ]
}
```

---

### 7. Get LLM Consensus Only
```bash
POST /routing/llm-consensus
```

**Request:**
```json
{
  "content": {
    "id": "my-video-001",
    "type": "short",
    "duration": 30,
    "language": "en",
    "title": "Breaking tech news"
  }
}
```

**Response:**
```json
{
  "contentId": "my-video-001",
  "consensus": {
    "topChoice": "twitter",
    "confidence": 0.78,
    "agreement": 0.75,
    "suggestions": [
      {
        "provider": "gpt4o",
        "platform": "twitter",
        "confidence": 0.85,
        "reasoning": "News content performs best on Twitter for immediate engagement",
        "timing": "morning",
        "riskAssessment": "LOW"
      }
    ],
    "divergence": ["gemini suggests tiktok (Short format suits trending news)"]
  },
  "timestamp": "2025-11-22T12:00:00.000Z"
}
```

---

### 8. Get Route Status
```bash
GET /routing/status/:routeId
```

**Response:**
```json
{
  "routeId": "uuid-123",
  "contentId": "my-video-001",
  "status": "OPTIMIZED",
  "routeCount": 3,
  "topPlatform": "tiktok",
  "createdAt": "2025-11-22T12:00:00.000Z",
  "updatedAt": "2025-11-22T12:05:00.000Z"
}
```

---

### 9. Get All Routes
```bash
GET /routing/routes
```

**Response:**
```json
{
  "count": 5,
  "routes": [
    {
      "routeId": "uuid-123",
      "contentId": "my-video-001",
      "status": "OPTIMIZED",
      "topPlatform": "tiktok",
      "topScore": 0.87,
      "createdAt": "2025-11-22T12:00:00.000Z"
    }
  ]
}
```

---

### 10. Compare Platforms
```bash
POST /routing/compare
```

**Request:**
```json
{
  "content": { /* content object */ },
  "platforms": ["tiktok", "youtube", "instagram"]
}
```

**Response:**
```json
{
  "contentId": "my-video-001",
  "comparison": [
    {
      "rank": 1,
      "platform": "tiktok",
      "score": 0.87,
      "strengths": ["Strong trend alignment", "High visibility potential"],
      "weaknesses": []
    },
    {
      "rank": 2,
      "platform": "instagram",
      "score": 0.72,
      "strengths": ["Optimal posting velocity"],
      "weaknesses": ["Low trend match"]
    }
  ]
}
```

---

### 11. Recommend Best Platform
```bash
POST /routing/recommend
```

**Request:**
```json
{
  "content": { /* content object */ }
}
```

**Response:**
```json
{
  "contentId": "my-video-001",
  "recommended": {
    "platform": "tiktok",
    "score": 0.87,
    "confidence": 0.89,
    "reasoning": "tiktok: high trend alignment, strong visibility potential"
  },
  "simulation": { /* full simulation result */ }
}
```

---

### 12. Quick Route (Fast Recommendation)
```bash
POST /routing/quick
```

**Request:**
```json
{
  "content": { /* content object */ }
}
```

**Response:**
```json
{
  "platform": "tiktok",
  "score": 0.82,
  "reasoning": "tiktok: high trend alignment, strong visibility potential"
}
```

---

### 13. Batch Routing
```bash
POST /routing/batch
```

**Request:**
```json
{
  "contents": [
    { "id": "video-1", "type": "short", "duration": 25, "language": "en", "title": "Tip 1" },
    { "id": "video-2", "type": "long", "duration": 600, "language": "es", "title": "Tutorial" }
  ]
}
```

**Response:**
```json
{
  "count": 2,
  "results": [
    {
      "contentId": "video-1",
      "topRoute": { "platform": "tiktok", "score": 0.85, ... },
      "alternatives": [ /* top 2 alternatives */ ]
    }
  ]
}
```

---

## Architecture

### Core Scoring Engines

1. **Trend Scorer** (`core/trendScorer.ts`)
   - Queries Trends Engine (5060) for trend alignment
   - Calculates content-trend match score
   - Weight: 35%

2. **Visibility Scorer** (`core/visibilityScorer.ts`)
   - Queries Visibility Engine (5080) for reach prediction
   - Estimates platform-specific visibility potential
   - Weight: 30%

3. **Risk Scorer** (`core/riskScorer.ts`)
   - Assesses account risk, platform risk, content risk
   - Integrates with Accounts service (5090)
   - Weight: 20%

4. **Velocity Scorer** (`core/velocityScorer.ts`)
   - Analyzes platform posting velocity and capacity
   - Identifies optimal posting windows
   - Weight: 15%

### Multi-LLM Engine

**4-LLM Consensus** (`core/routingLLMEngine.ts`):
- **GPT-4o**: Strategic timing analysis
- **Claude 3.5 Sonnet**: Audience analysis
- **Gemini 2.5 Flash**: Trend alignment
- **Grok 4**: Engagement pattern recognition

Parallel execution with confidence-weighted fusion.

### Route Optimizer

**Optimizer** (`core/routeOptimizer.ts`):
- Combines all scores using configurable weights
- Applies platform diversity constraints
- Filters by minimum score and safety thresholds
- Returns ranked route options

### Route Simulator

**Simulator** (`core/routeSimulator.ts`):
- Predicts reach based on visibility score
- Estimates engagement (5% baseline × trend boost)
- Calculates revenue (CPM + engagement bonus)
- Computes success probability
- Generates warnings and recommendations

---

## Service Integrations

| Service | Port | Purpose |
|---------|------|---------|
| Bridge | 4000 | Multi-LLM routing |
| Brain v2 | 4100 | Event logging & pattern analysis |
| Trends | 5060 | Trend data & scoring |
| Visibility | 5080 | Reach & engagement prediction |
| Accounts | 5090 | Account risk assessment |
| Distribution v2 | 5301 | Velocity profiles |
| Creative Suite | 5250 | Content adaptation |
| Ops | 5350 | Metrics & logging |

---

## Configuration

**Score Weights** (edit `config.ts`):
```typescript
SCORE_WEIGHTS: {
  trend: 0.35,      // Trend alignment
  visibility: 0.30,  // Visibility potential
  risk: 0.20,        // Risk mitigation
  velocity: 0.15     // Velocity optimization
}
```

**Platform Configurations**:
```typescript
PLATFORMS: {
  tiktok: { maxRisk: 0.7, optimalLength: 30, peakHours: [10, 14, 18, 20] },
  youtube: { maxRisk: 0.5, optimalLength: 600, peakHours: [12, 18] },
  instagram: { maxRisk: 0.6, optimalLength: 60, peakHours: [9, 12, 17, 21] },
  twitter: { maxRisk: 0.8, optimalLength: 15, peakHours: [8, 12, 16, 20] },
  linkedin: { maxRisk: 0.4, optimalLength: 180, peakHours: [8, 12, 17] }
}
```

---

## Testing

```bash
# Run routing tests
node tests/testRouting.mjs

# Run scoring tests
node tests/testScoring.mjs
```

**Test Coverage**:
- Health check
- Route analysis with LLM consensus
- Platform scoring and comparison
- Route simulation (single & batch)
- Quick routing
- Batch routing
- Status tracking

---

## Key Features

✅ **4-LLM Consensus** - Parallel calls to 4 leading LLMs for optimal routing  
✅ **Multi-Factor Scoring** - Trend, visibility, risk, velocity weighted scoring  
✅ **Real-time Simulation** - Predict reach, engagement, revenue before publishing  
✅ **Platform Comparison** - Side-by-side analysis of all platform options  
✅ **Custom Weights** - Adjust scoring weights for specific use cases  
✅ **Batch Processing** - Route multiple pieces of content in parallel  
✅ **Pattern Learning** - Integrates with Brain v2 for historical analysis  
✅ **Safety-First** - Risk assessment and platform-specific safety thresholds  

---

## Use Cases

1. **Content Distribution Planning**
   - Analyze content → Get platform recommendations → Simulate outcomes

2. **Multi-Platform Strategy**
   - Compare all platforms → Identify strengths/weaknesses → Optimize for multiple channels

3. **Trend Capitalization**
   - Enable trend weighting → Route to highest-trending platform → Schedule at peak hours

4. **Risk Management**
   - Assess content risk → Filter unsafe platforms → Select low-risk routes

5. **Batch Operations**
   - Upload content library → Batch route all items → Generate distribution calendar

---

## Integration Example

```javascript
// Step 1: Analyze content
const analysis = await fetch('http://localhost:5560/routing/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contentId: 'video-123',
    content: {
      id: 'video-123',
      type: 'short',
      duration: 30,
      language: 'en',
      title: 'Viral dance challenge'
    },
    trendWeighted: true
  })
});

const { routeId, topRoute, llmConsensus } = await analysis.json();

// Step 2: Simulate top route
const simulation = await fetch('http://localhost:5560/routing/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ routeId, routeIndex: 0 })
});

const { predictedReach, successProbability } = await simulation.json();

// Step 3: If success probability > 80%, proceed with distribution
if (successProbability > 0.8) {
  // Call Distribution v2 to schedule post
}
```

---

## Metrics & Logging

All routing operations are logged to:
- **Brain v2** (4100): Event storage in 'routing' domain
- **Ops Engine** (5350): Metrics and operation tracking

**Key Metrics**:
- `routes_analyzed`: Number of routes analyzed
- `batch_routed`: Batch routing operations
- Operation logs: `route_analyze`, `route_optimize`, `route_simulate`, `llm_consensus`

---

## Next Steps

1. **Historical Pattern Learning**: Use Brain v2 to identify successful routing patterns
2. **A/B Testing**: Compare routing strategies across content types
3. **Auto-Optimization**: Dynamically adjust weights based on success rates
4. **Real-time Alerts**: Notify when optimal routing windows open
5. **Dashboard Integration**: Build UI for visual route comparison

---

## Support

For issues or questions:
- Service: `codex-routing-v2`
- Port: `5560`
- Health: `http://localhost:5560/health`

---

**Content Routing Engine v2 ULTRA** - Intelligent platform routing powered by AI 🚀
