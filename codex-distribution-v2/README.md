# Distribution Engine v2 ULTRA

**Multi-LLM, Trend-Weighted, Safety-First Distribution Orchestrator**

Version: 2.0.0  
Port: 5301  
Safety Mode: SEMI_AUTONOMOUS

---

## Overview

Distribution Engine v2 ULTRA is a comprehensive content distribution orchestrator that combines:

- **Multi-LLM Fusion**: GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Flash, Grok 4
- **Trend-Weighted Scheduling**: Real-time trend analysis from Trends Engine (5060)
- **Account Safety & Rotation**: Risk scoring and intelligent account selection
- **Velocity Optimization**: Platform-specific posting frequency and timing
- **Language Localization**: Spanish, Arabic, English content variants
- **Repurposing**: Automatic content adaptation for each platform
- **Safety Mode**: SEMI_AUTONOMOUS requires approval for all publishes
- **Brain v2 Integration**: All distribution events logged to memory domain

---

## Architecture

### Core Modules

**State Management** (`state/`)
- `stateManager.ts` - Active plans, calendars, queue, metrics

**Scheduling** (`scheduler/`)
- `distributionScheduler.ts` - 7-day calendar generation

**Planning** (`planners/`)
- `calendarPlanner.ts` - Weekly calendar with optimal slots
- `languagePlanner.ts` - Multi-language content distribution
- `velocityPlanner.ts` - Platform-specific posting velocity
- `trendPlanner.ts` - Trend-weighted slot scoring

**Routing** (`routing/`)
- `accountRouter.ts` - Intelligent account selection
- `platformRouter.ts` - Optimal platform selection

**Engines** (`engines/`)
- `repurposeEngine.ts` - Content adaptation for platforms
- `multiLLMEngine.ts` - 4-LLM fusion for suggestions
- `riskEngine.ts` - Account risk assessment
- `safetyEngine.ts` - SEMI_AUTONOMOUS enforcement
- `fallbackEngine.ts` - Failure handling & retry logic

**Integrations** (`integrations/`)
- `socialIntegration.ts` - Social Engine (4800)
- `videoIntegration.ts` - Video Engine (4700)
- `creativeIntegration.ts` - Creative Suite (5250)
- `visibilityIntegration.ts` - Visibility Engine (5080)
- `rotationIntegration.ts` - Account Rotation (5550)
- `trendIntegration.ts` - Trends Engine (5060)
- `monetizationIntegration.ts` - Ops Engine (5350)
- `opsIntegration.ts` - Ops logging
- `brainIntegration.ts` - Brain v2 (4100)

---

## REST API Endpoints

### 1. Health Check
```bash
GET /health
```

**Response:**
```json
{
  "ok": true,
  "service": "codex-distribution-v2",
  "version": "2.0.0",
  "safetyMode": "SEMI_AUTONOMOUS",
  "port": 5301
}
```

### 2. Create Distribution Plan
```bash
POST /distribution/create
```

**Request:**
```json
{
  "contentId": "content-123",
  "platforms": ["tiktok", "youtube", "instagram"],
  "languages": ["en", "es", "ar"],
  "velocity": 1.5,
  "trendWeighted": true
}
```

**Response:**
```json
{
  "ok": true,
  "plan": {
    "id": "plan-uuid",
    "contentId": "content-123",
    "platforms": ["tiktok", "youtube", "instagram"],
    "status": "DRAFT"
  }
}
```

### 3. Generate Plan (with LLM + Trends)
```bash
POST /distribution/plan
```

**Request:**
```json
{
  "planId": "plan-uuid"
}
```

**Response:**
```json
{
  "ok": true,
  "plan": { ... },
  "calendar": {
    "id": "calendar-uuid",
    "weekStart": "2025-11-22T00:00:00.000Z",
    "weekEnd": "2025-11-29T00:00:00.000Z",
    "slots": [
      {
        "id": "slot-uuid",
        "platform": "tiktok",
        "datetime": "2025-11-22T10:00:00.000Z",
        "accountId": "",
        "contentType": "video",
        "language": "en",
        "status": "PLANNED",
        "trendScore": 0.85
      }
    ]
  },
  "trendData": [ ... ],
  "llmSuggestions": [ ... ]
}
```

### 4. Run Distribution
```bash
POST /distribution/run
```

**Request:**
```json
{
  "planId": "plan-uuid",
  "simulate": true
}
```

**Response:**
```json
{
  "ok": true,
  "planId": "plan-uuid",
  "results": [
    {
      "slotId": "slot-uuid",
      "success": true,
      "publishedUrl": "https://...",
      "timestamp": "2025-11-22T10:00:00.000Z"
    }
  ]
}
```

### 5. Get Plan Status
```bash
GET /distribution/status?planId=plan-uuid
```

**Response:**
```json
{
  "ok": true,
  "plan": {
    "id": "plan-uuid",
    "status": "EXECUTING",
    "slots": [ ... ]
  }
}
```

### 6. Generate Calendar
```bash
POST /distribution/calendar
```

**Request:**
```json
{
  "platforms": ["tiktok", "youtube"],
  "languages": ["en", "es"]
}
```

### 7. Get Calendar Slots
```bash
GET /distribution/slots?calendarId=cal-uuid&platform=tiktok
```

### 8. Repurpose Content
```bash
POST /distribution/repurpose
```

**Request:**
```json
{
  "contentId": "video-123",
  "sourcePlatform": "youtube",
  "targetPlatforms": ["tiktok", "instagram"],
  "language": "en"
}
```

**Response:**
```json
{
  "ok": true,
  "repurposedContent": {
    "tiktok": "video-123-tiktok",
    "instagram": "video-123-instagram"
  }
}
```

### 9. Language Distribution
```bash
POST /distribution/language
```

**Request:**
```json
{
  "contentId": "content-123",
  "targetLanguages": ["en", "es", "ar"]
}
```

### 10. Get Velocity Profile
```bash
GET /distribution/velocity?platform=tiktok
```

**Response:**
```json
{
  "ok": true,
  "profile": {
    "platform": "tiktok",
    "optimalPostsPerDay": 5,
    "minGapHours": 4,
    "peakHours": [10, 14, 18, 20]
  },
  "optimalVelocity": 2.3
}
```

### 11. Get Trends
```bash
POST /distribution/trends
```

**Request:**
```json
{
  "platforms": ["tiktok", "youtube", "instagram"]
}
```

### 12. Get Active Accounts
```bash
GET /distribution/accounts?platform=tiktok
```

### 13. Select Optimal Platforms
```bash
POST /distribution/platforms
```

**Request:**
```json
{
  "contentId": "content-123",
  "availablePlatforms": ["tiktok", "youtube", "instagram"]
}
```

**Response:**
```json
{
  "ok": true,
  "optimalPlatforms": ["tiktok", "instagram", "youtube"]
}
```

### 14. Publish Content
```bash
POST /distribution/publish
```

**Request:**
```json
{
  "slotId": "slot-uuid",
  "accountId": "account-uuid",
  "contentId": "content-123",
  "platform": "tiktok",
  "safetyMode": "SEMI_AUTONOMOUS",
  "simulate": true
}
```

⚠️ **SAFETY NOTE**: In SEMI_AUTONOMOUS mode, `simulate: false` will be rejected.

### 15. Simulate Distribution
```bash
POST /distribution/simulate
```

**Request:**
```json
{
  "planId": "plan-uuid"
}
```

**Response:**
```json
{
  "ok": true,
  "simulation": {
    "planId": "plan-uuid",
    "totalSlots": 150,
    "safetyReport": {
      "mode": "SEMI_AUTONOMOUS",
      "safeSlots": 140,
      "riskySlots": 10,
      "avgRiskScore": 0.35
    },
    "visibilityScores": {
      "tiktok": 0.85,
      "youtube": 0.78,
      "instagram": 0.82
    },
    "estimatedReach": 245000,
    "recommendedAction": "PROCEED"
  }
}
```

---

## Platform Configurations

| Platform | Max Posts/Day | Min Gap (hours) | Peak Hours | Content Types |
|----------|---------------|-----------------|------------|---------------|
| TikTok | 5 | 4 | 10, 14, 18, 20 | video, short |
| YouTube | 2 | 12 | 12, 18 | video |
| Instagram | 4 | 6 | 9, 12, 17, 21 | reel, post, story |
| Twitter | 8 | 2 | 8, 12, 16, 20 | post |
| LinkedIn | 2 | 24 | 8, 12, 17 | post, video |

---

## Multi-LLM Fusion

Distribution Engine v2 uses 4 LLM providers in parallel for optimal distribution suggestions:

1. **OpenAI GPT-4o** - Best for strategic timing
2. **Claude 3.5 Sonnet** - Best for audience analysis
3. **Gemini 2.5 Flash** - Best for trend alignment
4. **Grok 4** - Best for engagement patterns

All suggestions are fused using confidence scoring to generate final distribution plan.

---

## Safety Modes

### SEMI_AUTONOMOUS (Current)
- **Requires Approval**: All publishes must be simulated or manually approved
- **Max Risk Score**: 0.6
- **Allowed Actions**: SCHEDULE, QUEUE, SIMULATE
- **Use Case**: Default production mode with human oversight

### MANUAL
- **Requires Approval**: Always
- **Max Risk Score**: 1.0
- **Allowed Actions**: REVIEW_ONLY
- **Use Case**: High-stakes or sensitive content

### FULL_AUTONOMOUS
- **Requires Approval**: No
- **Max Risk Score**: 0.3
- **Allowed Actions**: SCHEDULE, QUEUE, PUBLISH, SIMULATE
- **Use Case**: Low-risk, high-volume distribution (DISABLED by default)

---

## Risk Assessment

Risk scores are calculated based on:

- Account suspension history
- Recent failure rate
- Platform risk level
- Content type
- Posting velocity

**Risk Levels:**
- **LOW** (0.0-0.3): Safe to publish
- **MEDIUM** (0.3-0.6): Add delays, monitor
- **HIGH** (0.6-0.8): Rotate account, extend delay
- **CRITICAL** (0.8-1.0): Skip publication, manual review

---

## Fallback Logic

When publication fails, the engine automatically:

1. **Rate Limit** → Delay 2 hours
2. **Account Suspended** → Switch platform
3. **Network Error** → Retry after 30 minutes
4. **Unknown Error** → Mark failed, log to Brain v2

Failed slots are redistributed to alternative platforms when possible.

---

## Brain v2 Integration

All distribution events are logged to Brain v2 under the `distribution` domain:

- Plan creation/execution
- Publication success/failure
- Risk assessments
- Trend alignments
- Account rotations

Query distribution history:
```javascript
GET /memory/search?domain=distribution&query=successful+distribution
```

---

## Usage Examples

### Complete Distribution Flow

```bash
# 1. Create plan
curl -X POST http://localhost:5301/distribution/create \
  -H 'Content-Type: application/json' \
  -d '{
    "contentId": "my-video-001",
    "platforms": ["tiktok", "youtube", "instagram"],
    "languages": ["en", "es"],
    "velocity": 2.0,
    "trendWeighted": true
  }'

# Response: { "ok": true, "plan": { "id": "plan-abc123", ... } }

# 2. Generate distribution plan with LLM + Trends
curl -X POST http://localhost:5301/distribution/plan \
  -H 'Content-Type: application/json' \
  -d '{ "planId": "plan-abc123" }'

# Response: { "ok": true, "calendar": { "slots": [...150 slots...] } }

# 3. Simulate distribution
curl -X POST http://localhost:5301/distribution/simulate \
  -H 'Content-Type: application/json' \
  -d '{ "planId": "plan-abc123" }'

# Response: { "simulation": { "recommendedAction": "PROCEED", ... } }

# 4. Run distribution (simulation mode)
curl -X POST http://localhost:5301/distribution/run \
  -H 'Content-Type: application/json' \
  -d '{ "planId": "plan-abc123", "simulate": true }'

# Response: { "ok": true, "results": [...] }
```

---

## Service Dependencies

- **Bridge (4000)**: Multi-LLM routing
- **Brain v2 (4100)**: Memory storage
- **Orchestrator (4200)**: Workflow coordination
- **Hands v5 (4350)**: Action execution
- **Video Engine (4700)**: Video processing
- **Social Engine (4800)**: Publishing
- **Trends Engine (5060)**: Trend analysis
- **Visibility Engine (5080)**: Visibility scoring
- **Accounts (5090)**: Account management
- **Creative Suite (5250)**: Content repurposing
- **Ops Engine (5350)**: Logging & metrics
- **Account Rotation (5550)**: Safe account selection

---

## Testing

Run all tests:
```bash
npm test
```

Individual test suites:
```bash
node tests/testDistribution.mjs  # Core distribution flow
node tests/testCalendar.mjs      # Calendar generation
node tests/testSafety.mjs        # Safety mode enforcement
```

---

## Development

**Build:**
```bash
npm run build
```

**Start:**
```bash
npm start
```

**Dev Mode:**
```bash
npm run dev
```

---

## Metrics

Access distribution metrics:
```bash
GET /distribution/status
```

**Returns:**
```json
{
  "ok": true,
  "plans": [...],
  "metrics": {
    "totalPublished": 1247,
    "successRate": 0.94,
    "avgVisibilityScore": 0.78
  }
}
```

---

## Next Steps

1. **Real Account Integration**: Connect to actual social media accounts via Social Engine
2. **Content Library**: Integrate with Content Management System
3. **Analytics Dashboard**: Build UI for distribution monitoring
4. **A/B Testing**: Add split testing for timing/platforms
5. **Auto-Optimization**: Learn from success patterns in Brain v2
6. **Webhook Notifications**: Real-time alerts for publication status

---

## License

Part of Codex OS Distribution Suite  
Version 2.0.0 ULTRA
