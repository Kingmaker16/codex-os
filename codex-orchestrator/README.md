# Codex Orchestrator Intelligence v2.0

**Status**: ✅ Operational (Port 4200)  
**Version**: 2.0.0

---

## Overview

Orchestrator Intelligence v2.0 is the **central coordination hub** for the Codex ecosystem. It interprets high-level user commands, plans multi-step workflows across multiple services, and orchestrates their execution with intelligent routing and dependency management.

**Key Features**:
- 🤖 **AI-Powered Planning** — Interprets natural language commands into structured task graphs
- 🔄 **Multi-Service Orchestration** — Coordinates tasks across 10+ microservices
- 📊 **Task Graph Management** — Manages dependencies, execution order, and status tracking
- 🧠 **Intelligent Routing** — Routes tasks to appropriate services based on type and availability
- 📈 **Telemetry-Aware** — Uses service health metrics for smart routing decisions
- 🔐 **Session Memory** — Maintains workflow state across multiple requests

---

## Architecture

### Integration Points

**Codex Bridge** (Port 4000):
- AI model access (GPT-4, Claude, Gemini, etc.)
- Task planning and interpretation

**Codex Brain** (Port 4100):
- Session memory and audit logging
- Task graph history

**Codex Social** (Port 4800):
- Social media operations (upload, captions, trends)
- Content planning and scheduling

**Codex Video** (Port 5000):
- Video generation and editing

**Codex Knowledge v2** (Port 4500):
- Research and knowledge queries

**Codex Monetization** (Port 4850):
- Revenue tracking and cost logging

**Codex Hands v4** (Port 4300):
- Browser automation tasks

**Codex Vision v2.5** (Port 4600):
- Image analysis and OCR

**Codex Voice** (Port 4750):
- Text-to-speech and speech-to-text

**Codex Telemetry** (Port 4950):
- Service health metrics and latencies

---

## Task Graph System

### Task Structure

```typescript
interface OrchestratorTask {
  id: string;                    // Unique task identifier (e.g., "t1", "t2")
  type: string;                  // Task type (see supported types below)
  status: "pending" | "running" | "done" | "failed";
  dependsOn: string[];           // Task IDs that must complete first
  payload: any;                  // Task-specific input data
  result?: any;                  // Output from execution
  error?: string;                // Error message if failed
}
```

### Supported Task Types

**Social Media**:
- `social_post`, `post_video` → Upload to social media
- `social_plan`, `plan_content` → Create content calendar
- `social_caption`, `generate_caption` → Generate AI captions
- `social_trends` → Get trending topics

**Content Creation**:
- `generate_video`, `create_video` → Generate video content

**Knowledge & Research**:
- `research`, `knowledge_query` → Query Knowledge Engine

**System Operations**:
- `optimize_mac`, `system_optimize` → Mac optimization
- `diagnostics`, `health_check` → Run system diagnostics

**Monetization**:
- `summarize_revenue`, `get_revenue` → Get revenue summary
- `record_revenue` → Record revenue data

**Automation**:
- `hands_task`, `browser_automation` → Browser automation
- `vision_analyze`, `image_analysis` → Image analysis
- `voice_tts`, `text_to_speech` → Text-to-speech
- `voice_stt`, `speech_to_text` → Speech-to-text

### Task Graph Example

```json
{
  "id": "graph_1732345678_abc123",
  "tasks": [
    {
      "id": "t1",
      "type": "research",
      "status": "done",
      "dependsOn": [],
      "payload": { "topic": "viral TikTok pet products", "count": 3 },
      "result": { "products": ["Product A", "Product B", "Product C"] }
    },
    {
      "id": "t2",
      "type": "generate_video",
      "status": "done",
      "dependsOn": ["t1"],
      "payload": { "scriptFromTask": "t1", "duration": 60 },
      "result": { "videoPath": "/tmp/video.mp4" }
    },
    {
      "id": "t3",
      "type": "social_post",
      "status": "pending",
      "dependsOn": ["t2"],
      "payload": { "videoFromTask": "t2", "platforms": ["tiktok"] }
    }
  ],
  "createdAt": "2025-11-22T10:00:00.000Z",
  "updatedAt": "2025-11-22T10:05:00.000Z"
}
```

---

## API Endpoints

### Health Check
```bash
GET /health
```
**Response**:
```json
{
  "ok": true,
  "service": "codex-orchestrator",
  "version": "2.0.0",
  "features": [
    "chat",
    "task-planning",
    "task-execution",
    "multi-service-orchestration",
    "ai-workflow-intelligence"
  ]
}
```

---

## 🆕 Orchestrator Intelligence v2.0 Endpoints

### Plan Task Graph
```bash
POST /orchestrator/plan
Content-Type: application/json
```
**Body**:
```json
{
  "sessionId": "user-session-123",
  "command": "Research 3 viral pet products, create one video, and schedule it to post on TikTok."
}
```
**Response**:
```json
{
  "ok": true,
  "graphId": "graph_1732345678_abc123",
  "sessionId": "user-session-123",
  "tasks": [
    {
      "id": "t1",
      "type": "research",
      "status": "pending",
      "dependsOn": [],
      "payload": { "topic": "viral TikTok pet products", "count": 3 }
    },
    {
      "id": "t2",
      "type": "generate_video",
      "status": "pending",
      "dependsOn": ["t1"],
      "payload": { "scriptFromTask": "t1", "duration": 60 }
    },
    {
      "id": "t3",
      "type": "social_post",
      "status": "pending",
      "dependsOn": ["t2"],
      "payload": { "videoFromTask": "t2", "platforms": ["tiktok"] }
    }
  ],
  "createdAt": "2025-11-22T10:00:00.000Z"
}
```

### Execute Task Graph
```bash
POST /orchestrator/execute
Content-Type: application/json
```
**Body**:
```json
{
  "sessionId": "user-session-123",
  "graphId": "graph_1732345678_abc123"
}
```
**Response**:
```json
{
  "ok": true,
  "graph": {
    "id": "graph_1732345678_abc123",
    "tasks": [
      {
        "id": "t1",
        "type": "research",
        "status": "done",
        "result": { "products": [...] }
      },
      {
        "id": "t2",
        "type": "generate_video",
        "status": "done",
        "result": { "videoPath": "/tmp/video.mp4" }
      },
      {
        "id": "t3",
        "type": "social_post",
        "status": "done",
        "result": { "postUrl": "https://tiktok.com/..." }
      }
    ],
    "updatedAt": "2025-11-22T10:05:00.000Z"
  }
}
```

### Get Task Graph Status
```bash
GET /orchestrator/status?sessionId=user-session-123&graphId=graph_1732345678_abc123
```
**Response**:
```json
{
  "ok": true,
  "graph": { ... },
  "stats": {
    "total": 3,
    "pending": 0,
    "running": 1,
    "done": 2,
    "failed": 0
  }
}
```

### Quick Run (Plan + Execute)
```bash
POST /orchestrator/quickRun
Content-Type: application/json
```
**Body**:
```json
{
  "sessionId": "user-session-123",
  "command": "Check monetization summary and get TikTok fitness trends"
}
```
**Response**:
```json
{
  "ok": true,
  "graphId": "graph_1732345678_xyz456",
  "graph": {
    "tasks": [
      {
        "id": "t1",
        "type": "summarize_revenue",
        "status": "done",
        "result": { "revenue": 1234.56, "costs": 234.56, "profit": 1000.00 }
      },
      {
        "id": "t2",
        "type": "social_trends",
        "status": "done",
        "result": { "trends": [...] }
      }
    ]
  },
  "command": "Check monetization summary and get TikTok fitness trends"
}
```

---

## Legacy v1 Endpoints

### Chat
```bash
POST /chat
Content-Type: application/json
```
**Body**:
```json
{
  "sessionId": "chat-session-1",
  "provider": "openai",
  "model": "gpt-4o",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

### Skill Extraction
```bash
POST /skills/extract
Content-Type: application/json
```

### Hands Execution
```bash
POST /hands/execute
Content-Type: application/json
```

### Vision Analysis
```bash
POST /vision/*
Content-Type: application/json
```

### Diagnostics
```bash
POST /diagnostics/run
```

### Knowledge Engine Proxy
```bash
POST /research/:endpoint
GET /kernels
```

### Monetization Proxy
```bash
GET /monetization/*
POST /monetization/*
```

---

## Installation & Usage

### Run Locally
```bash
cd codex-orchestrator
npm install
npm run build
npm start
```

### Development Mode
```bash
npm run dev
```

### Docker
```bash
docker build -t codex-orchestrator .
docker run -p 4200:4200 codex-orchestrator
```

---

## Implementation Details

### New Modules (v2.0)

**`src/intents/taskGraph.ts`**:
- Task graph data structures
- Dependency resolution
- Status tracking

**`src/intents/routePlanner.ts`**:
- Service routing logic
- Task type to endpoint mapping

**`src/context/sessionMemory.ts`**:
- In-memory session state
- Task graph storage

**`src/models/modelSelector.ts`**:
- AI model selection for planning
- Cost estimation

**`src/telemetry/telemetryClient.ts`**:
- Service health monitoring
- Latency tracking

**`src/agents/executionAgent.ts`**:
- Task graph execution engine
- Multi-service coordination

---

## Future Enhancements

**Telemetry-Aware Routing**:
- Avoid slow or failed services
- Dynamic failover to alternative providers

**Persistent Task Graphs**:
- Store graphs in Brain for recovery
- Resume execution after service restart

**Advanced Dependency Handling**:
- Parallel task execution
- Conditional branching
- Loop constructs

**Cost Optimization**:
- Model selection based on budget
- Service call caching

**Monitoring Dashboard**:
- Real-time task graph visualization
- Execution metrics and analytics

---

## Troubleshooting

**Bridge Connection Failed**:
- Ensure `codex-bridge` is running on port 4000
- Check `curl http://localhost:4000/health`

**Task Execution Hangs**:
- Check target service availability
- Review telemetry for service errors

**Planning Returns Invalid JSON**:
- AI model may need better prompting
- Check Bridge logs for model errors

---

## Testing

### Manual Test Workflow

```bash
# 1. Check health
curl http://localhost:4200/health | jq .

# 2. Plan a task graph
curl -X POST http://localhost:4200/orchestrator/plan \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "command": "Get monetization summary"
  }' | jq .

# 3. Execute the graph (use graphId from step 2)
curl -X POST http://localhost:4200/orchestrator/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "graphId": "graph_..."
  }' | jq .

# 4. Check status
curl "http://localhost:4200/orchestrator/status?sessionId=test-1&graphId=graph_..." | jq .

# 5. Quick run (plan + execute in one call)
curl -X POST http://localhost:4200/orchestrator/quickRun \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-2",
    "command": "Research trending TikTok topics for fitness"
  }' | jq .
```

---

## License

MIT
````
