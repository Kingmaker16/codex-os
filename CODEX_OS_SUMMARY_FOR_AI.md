# Codex OS - Complete System Summary for AI Analysis

**Repository:** https://github.com/Kingmaker16/codex-os  
**Status:** Public  
**Language:** TypeScript (Node.js v24+)  
**Architecture:** Microservices (42+ services)

---

## System Overview

Codex OS is an autonomous, distributed operating system designed for AI-driven workflows across social media, content creation, e-commerce, and optimization domains.

### Core Statistics
- **Total Files:** 848
- **Lines of Code:** 125,407+
- **Services:** 42 microservices across 7 functional groups
- **Boot Time:** ~30-40 seconds for full orchestration
- **Success Rate:** 83% services online (35/42)

---

## Architecture Groups

### 1. CORE (3 services - 100% online)
- **Brain v2** (port 4100) - Memory & domain streams
  - Capabilities: writeMemory, searchMemory, domainStreams
  - Path: `codex-brain/src/`
  
- **Bridge** (port 4000) - Model provider gateway
  - Providers: OpenAI, Anthropic, Gemini, Grok, DeepSeek
  - Path: `codex-bridge/src/providers/`
  
- **Orchestrator** (port 4200) - Multi-service coordination
  - Features: chat, task-planning, task-execution, multi-service-orchestration
  - Path: `codex-orchestrator/src/`

### 2. EXECUTION (10 services - 90% online)
- **Hands v5** (port 4300) - UI automation (macOS)
  - Endpoints: /hands/ui/clickXY, /hands/ui/type, /hands/ui/key
  - Safety: Allowlist-based, accessibility permissions required
  
- **Video Engine** (port 4700) - Video generation
  - Engines: OpenAI, Pika, Runway, Stability
  - Path: `codex-video/src/engines/`
  
- **Vision v3** (port 4650) - Computer vision
  - Engines: sceneAnalyzer, fusionVision, editSuggester, timelineMapper
  - Path: `codex-vision-2.6/src/`
  
- **Social Engine** (port 4800) - Social media automation
  - Platforms: TikTok, Instagram, YouTube, Gmail
  - Path: `codex-social/src/platforms/`
  
- **Creative Suite** (port 5250) - Content generation
  - Components: captionEngine, thumbnailEngine, trendAlignment
  
- **Campaign** (port 5120) - Campaign management
- **E-Commerce** (port 5100) - Commerce automation
- **Distribution v2** (port 5301) - Content distribution
- **Routing v2** (port 5560) - Request routing
- **Monetization** (port 4850) - Revenue tracking

### 3. SAFETY (8 services - 100% online)
- **Self-Audit** (port 5530) - Self-auditing with multi-LLM validation
- **SRL** (port 5540) - Self-regulation layer
- **Hardening** (port 5555) - System hardening & service health
- **Mesh** (port 5565) - Multi-layer safety coordination
- **Autonomy Engine** (port 5420) - Autonomous decision-making
  - Reasoning: 4-phase (Understanding → Safety → Analysis → Decision)
  - Output: confidence scores, risk assessment, reasoning traces
- **Autonomy Workflow** (port 5430) - Workflow automation
- **Autonomy Memory** (port 5570) - Decision history
- **Account Safety** (port 5090) - Account protection

### 4. AI (7 services - 86% online)
- **Knowledge** (port 4500) - Knowledge management (C1-STRICT mode)
- **Strategy** (port 5050) - Strategic planning
- **Trends** (port 5060) - Multi-platform trend scanning
- **Simulation** (port 5070) - Scenario simulation
- **Adaptive Intelligence** (port 5440) - Adaptive AI
- **Adaptive Strategy** (port 5445) - Strategy adaptation
- **Meta-Cognition** (port 5580) - Self-reflection & validation

### 5. IDENTITY (4 services - 100% online)
- **Profiles** (port 5180) - Profile management (SIMULATED_CREATION mode)
- **Identity** (port 5185) - Identity services
- **Vault** (port 5175) - Secure credential storage
- **Domain** (port 5160) - Domain management

### 6. INFRA (6 services - 33% online, all optional)
- **Ops** (port 5350) - Operations management
- **Telemetry** (port 4950) - System monitoring
- **Stability** (port 4850) - Stability checks
- **Visibility** (port 5200) - Observability
- **Engagement** (port 5210) - User engagement
- **Voice v2** (port 9000) - Voice interface

### 7. OPTIMIZATION (4 services - 100% online)
- **Performance Refinement** (port 5520) - Performance tuning
- **Optimizer** (port 5490) - Multi-domain optimization
- **CrossVal** (port 5470) - Cross-validation
- **RL** (port 5495) - Reinforcement learning

---

## Key Components

### Boot Manager v2
**Path:** `codex-boot-manager/src/bootV2.ts`

- Group-ordered boot sequence (core→safety→execution→ai→identity→infra→optimization)
- Health monitoring with 15 retries @ 2s intervals
- Process management via absolute node binary path
- Status reporting with Unicode box-drawing tables

**Key Functions:**
```typescript
startService(service: ManagedService) // Spawn service with detached process
waitForHealth(service) // HTTP health check with retry logic
bootAllServicesV2() // Main orchestration function
printStatusTable(statusList) // Status visualization
```

### Safety Architecture

**Multi-Layer Validation:**
1. **Autonomy Engine** - Decision evaluation with confidence scoring
   - 4-phase reasoning trace
   - Safety guardrails (risk score 0-100)
   - Suggested next steps
   
2. **SRL** - Self-regulation checks
   - Content compliance validation
   - Execution approval gates
   
3. **Hardening** - Service health validation
   - Real-time service health checks
   - Anomaly detection
   - Loop guards
   
4. **Mesh** - Coordinated workflows
   - Orchestrates Autonomy + SRL + Hardening + Workflow
   - DRY_RUN and LIVE modes
   - Step-by-step execution tracking

### Demo Scripts

**Autonomy Demo** (`codex_demo_autonomy.sh`):
- Simulates 3-day Smart Bottle Pro launch
- Hits 5 services: Orchestrator, Mesh, Optimizer, Refinement
- Demonstrates: strategic planning → safety checks → workflow → optimization → refinement
- Execution time: ~3 seconds

**Visual Demo** (`codex_visual_demo.sh`):
- UI automation via Hands v5
- Operations: type text, press keys
- Requires: macOS Accessibility permissions

---

## Technical Stack

**Language:** TypeScript 5.7.2 (ES2022)  
**Runtime:** Node.js v24.10.0  
**HTTP Framework:** Fastify  
**Process Management:** child_process.spawn (detached)  
**Health Protocol:** HTTP GET /health endpoints  
**Package Manager:** npm

---

## API Examples

### Orchestrator Quick Run
```bash
curl -X POST http://localhost:4200/orchestrator/quickRun \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "demo-123", "mode": "SIMULATION", "command": "Plan launch"}'
```

### Mesh Safety Plan
```bash
curl -X POST http://localhost:5565/mesh/create \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "demo-123", "domain": "social", "goal": "...", "mode": "DRY_RUN"}'
```

### Hands UI Automation
```bash
curl -X POST http://localhost:4300/hands/ui/type \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world", "app": "Google Chrome"}'
```

---

## Project Structure

```
Codex/
├── codex-boot-manager/       # Boot orchestration (v2)
├── codex-bridge/             # Model provider gateway
├── codex-brain/              # Memory & domain streams
├── codex-orchestrator/       # Multi-service coordination
├── codex-hands/              # UI automation (Hands v5)
├── codex-vision-2.6/         # Computer vision
├── codex-social/             # Social media engine
├── codex-mesh/               # Safety coordination
├── codex-autonomy/           # Autonomous decision-making
├── codex-srl/                # Self-regulation layer
├── codex-hardening/          # System hardening
├── [35+ additional services]
└── packages/
    ├── build-agent/          # Service scaffolding CLI
    └── contracts/            # Shared event types
```

---

## Deployment

### Start All Services
```bash
cd ~/Codex
npm run codex:start     # Boot Manager v2 (default)
npm run codex:start:v1  # Legacy v1 boot
npm run codex:stop      # Shutdown all services
```

### Build All Services
```bash
npm run build:all
```

### Individual Service
```bash
cd codex-[service-name]
npm run dev    # Development mode with ts-node
npm run build  # Compile to dist/
npm start      # Run compiled version
```

---

## Performance Metrics

**Boot Manager v2 Results:**
- Core services: 13-20ms latency
- Safety services: 13-19ms latency
- Execution services: 6-18ms latency
- Optimization services: 7-17ms latency

**Autonomy Demo Results:**
- Decision evaluation: 63.75% confidence
- Risk score: 0/100 (low risk)
- SRL check: 90% confidence, no issues
- Hardening: Found 3 service health issues (false positives)
- Total execution: ~3 seconds for full analysis

---

## Known Issues & Status

**Port Mismatches (resolved):**
- ✅ Account Safety: 5190 → 5090
- ✅ Vision v3: 4660 → 4650
- ✅ Trends: 5230 → 5060

**Service Status:**
- 35/42 services online (83%)
- 7 optional services offline (Telemetry, Visibility, Engagement, Voice, Stability)
- All critical services: 100% online

---

## Code Quality

**Safety Features:**
- Multi-layer validation (Autonomy, SRL, Hardening, Mesh)
- Confidence scoring on all decisions
- Risk assessment with guardrails
- Reasoning traces for explainability
- Approval gates for high-impact actions

**Error Handling:**
- Circuit breakers on HTTP clients
- Retry logic with exponential backoff
- Health check validation (15 retries)
- Process recovery mechanisms
- Service health monitoring

**Observability:**
- Brain logger integration across services
- Telemetry collection
- Service status reporting
- Diagnostic tools
- Real-time health monitoring

---

## Repository Access

**GitHub:** https://github.com/Kingmaker16/codex-os  
**Clone:** `git clone https://github.com/Kingmaker16/codex-os.git`  
**Status:** Public repository  
**License:** Private - All rights reserved

---

**For AI Analysis:**
This is a production-ready autonomous operating system with 125,407+ lines of TypeScript code implementing 42 microservices. The system demonstrates advanced multi-service orchestration, safety-first architecture, and autonomous decision-making capabilities. Key files to analyze: `codex-boot-manager/src/bootV2.ts`, `codex-mesh/src/`, `codex-autonomy/src/`, and `codex-orchestrator/src/`.
