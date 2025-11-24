# Adaptive Strategy Layer v1 ULTRA-XP

**Service**: `codex-adaptive-strategy`  
**Port**: 5445  
**Version**: 1.0.0-ultra-xp  
**Mode**: ADAPTIVE_STRATEGY

## Overview

The Adaptive Strategy Layer generates strategic insights by querying multiple LLM providers (GPT-4o, Claude, Gemini, GPT-4o-mini) in parallel, creating a fusion of perspectives for comprehensive business guidance.

## Features

### Multi-LLM Insight Generation

Queries **4 AI providers** simultaneously:
1. **OpenAI GPT-4o** - Strategic analysis
2. **Anthropic Claude 3.5 Sonnet** - Thoughtful reasoning
3. **Google Gemini 2.0 Flash** - Rapid insights
4. **OpenAI GPT-4o-mini** - Efficient validation

### Smart Insight Scoring

- **Confidence**: 0.7-0.85 (successful insights), 0.3 (errors)
- **Impact**: 0.6-0.75 (based on provider order)
- **Approval Requirements**: Claude insights require approval by default

### Action-Oriented Responses

Each insight includes:
- **Title**: Provider-identified insight
- **Description**: Strategic recommendations (2-3 bullet points)
- **Confidence & Impact scores**
- **requiresApproval**: Boolean flag
- **sourceModels**: Provider model names
- **actionItems**: Next steps for execution

## API Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "ok": true,
  "service": "codex-adaptive-strategy",
  "version": "1.0.0-ultra-xp",
  "mode": "ADAPTIVE_STRATEGY"
}
```

### Generate Strategic Insights
```bash
POST /adaptive/generate
```

**Request:**
```json
{
  "sessionId": "session-123",
  "goal": "Launch a new AI-powered product in Q1 2026",
  "context": {
    "budget": 100000,
    "team_size": 5
  },
  "domains": ["product", "marketing"]
}
```

**Response:**
```json
{
  "ok": true,
  "insights": [
    {
      "id": "uuid-1",
      "title": "Strategic Insight from openai",
      "description": "- Prioritize Resource Allocation...\n- Leverage Partnerships...\n- Conduct Market Validation...",
      "confidence": 0.7,
      "impact": 0.6,
      "requiresApproval": false,
      "sourceModels": ["gpt-4o"],
      "actionItems": [
        "Review strategic insight",
        "Validate against business objectives",
        "Execute through Orchestrator if approved"
      ]
    },
    {
      "id": "uuid-2",
      "title": "Strategic Insight from anthropic",
      "description": "- Focus on MVP Development...\n- Build Strategic Partnerships...",
      "confidence": 0.75,
      "impact": 0.65,
      "requiresApproval": true,
      "sourceModels": ["claude-3-5-sonnet-20241022"],
      "actionItems": [...]
    }
  ],
  "elapsedMs": 13337
}
```

## Test Cases

### Test 1: Product Launch Strategy
```bash
curl -s -X POST http://localhost:5445/adaptive/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "goal": "Launch a new AI-powered product in Q1 2026",
    "context": {"budget": 100000, "team_size": 5}
  }'
```

**Expected**: 4 insights from different providers with strategic recommendations

### Test 2: Customer Retention
```bash
curl -s -X POST http://localhost:5445/adaptive/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-2",
    "goal": "Optimize customer retention for SaaS product",
    "context": {"current_churn": 0.15, "arr": 500000}
  }'
```

**Expected**: Multi-provider insights on retention strategies

### Test 3: Via Orchestrator (Port 4200)
```bash
curl -s -X POST http://localhost:4200/adaptive-strategy/adaptive/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "orch-test",
    "goal": "Scale marketing operations efficiently"
  }'
```

**Expected**: Same insights, routed through orchestrator

## Performance

- **Execution Time**: ~13-15 seconds (4 sequential LLM calls)
- **Parallel Processing**: Can be optimized with Promise.all
- **Token Usage**: ~400 tokens per provider (1600 total)
- **Error Handling**: Continues on provider failure, marks as error in response

## Integration Points

### Codex Bridge (4000)
- **Required**: Bridge must be running for LLM access
- Uses `/respond` endpoint with provider/model params

### System Orchestrator (4200)
- Route: `/adaptive-strategy/*` → port 5445
- Full integration for workflow execution

### Meta-Cognition Engine (5580)
- Can validate strategic insights for cognitive issues
- Cross-check reasoning quality

### Self-Audit Engine (5530)
- Audit generated insights for quality/safety
- Validate before execution

### Autonomy Engine (5420)
- Use insights for autonomous decision-making
- Feed into autonomy workflows

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
codex-adaptive-strategy/
├── src/
│   ├── types.ts                  # Type definitions
│   ├── index.ts                  # Main entry point
│   └── core/
│       └── insightEngine.ts      # Multi-LLM insight generation
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture

```
User Request (goal + context)
    ↓
Insight Engine
    ↓
    ├─ Query GPT-4o       → Strategic Analysis
    ├─ Query Claude       → Thoughtful Reasoning
    ├─ Query Gemini       → Rapid Insights
    └─ Query GPT-4o-mini  → Efficient Validation
    ↓
Fusion & Scoring
    ↓
    ├─ Confidence: 0.3 - 0.85
    ├─ Impact: 0.2 - 0.75
    ├─ Approval Required (Claude)
    └─ Action Items
    ↓
Response (4 insights + timing)
```

## Provider Configuration

Current providers (can be modified in `insightEngine.ts`):

```typescript
const PROVIDERS = [
  { provider: "openai", model: "gpt-4o" },
  { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
  { provider: "gemini", model: "gemini-2.0-flash-exp" },
  { provider: "openai", model: "gpt-4o-mini", label: "gpt-4o-mini" }
];
```

## Error Handling

When a provider fails:
- Insight includes error description
- Confidence drops to 0.3
- Impact drops to 0.2
- requiresApproval: true (for safety)
- actionItems suggest retry or alternative

## Future Enhancements

1. **Parallel LLM Queries** - Use Promise.all for 4x speedup
2. **Caching Layer** - Cache similar goals to reduce costs
3. **Provider Weighting** - Confidence based on historical accuracy
4. **Insight Ranking** - Sort by confidence × impact score
5. **Brain v2 Logging** - Store insights for pattern analysis
6. **Autonomy Integration** - Auto-execute high-confidence insights

## Notes

- Requires Codex Bridge (4000) to be running
- Supports custom provider API keys via Bridge configuration
- Sequential execution ensures reliability over speed
- Can handle provider failures gracefully
- Each insight is independent and actionable

## Version History

- **1.0.0-ultra-xp** (Nov 2025) - Initial release with 4-provider multi-LLM fusion
