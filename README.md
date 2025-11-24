# Codex OS

**Autonomous Multi-Service Operating System for AI-Driven Workflows**

Codex OS is a distributed, microservices-based autonomous system designed to orchestrate complex workflows across social media, content creation, e-commerce, identity management, and optimization domains.

## 🚀 Quick Start

### Prerequisites
- Node.js v24+
- npm or yarn
- macOS (for Hands v5 UI automation)

### Installation
```bash
cd ~/Codex
npm install
```

### Boot All Services
```bash
npm run codex:start
```

This starts 42+ microservices across 7 functional groups.

## 📦 Architecture

### Service Groups

**CORE (3 services)**
- Brain v2 (4100) - Memory & domain streams
- Bridge (4000) - Model provider gateway
- Orchestrator (4200) - Multi-service coordination

**EXECUTION (10 services)**
- Hands v5 (4300) - UI automation
- Video Engine (4700) - Video processing
- Vision v3 (4650) - Scene analysis
- Social Engine (4800) - Social media ops
- Creative Suite (5250) - Content generation
- Campaign (5120) - Campaign management
- E-Commerce (5100) - Commerce operations
- Distribution v2 (5301) - Content distribution
- Routing v2 (5560) - Request routing
- Monetization (4850) - Revenue optimization

**SAFETY (8 services)**
- Self-Audit (5530) - Self-auditing
- SRL (5540) - Self-regulation layer
- Hardening (5555) - System hardening
- Mesh (5565) - Multi-layer safety coordination
- Autonomy Engine (5420) - Autonomous decision-making
- Autonomy Workflow (5430) - Workflow automation
- Autonomy Memory (5570) - Decision history
- Account Safety (5090) - Account protection

**AI (7 services)**
- Knowledge (4500) - Knowledge management
- Strategy (5050) - Strategic planning
- Trends (5060) - Trend analysis
- Simulation (5070) - Scenario simulation
- Adaptive Intelligence (5440) - Adaptive AI
- Adaptive Strategy (5445) - Strategy adaptation
- Meta-Cognition (5580) - Self-reflection

**IDENTITY (4 services)**
- Profiles (5180) - Profile management
- Identity (5185) - Identity services
- Vault (5175) - Secure storage
- Domain (5160) - Domain management

**INFRA (6 services)**
- Ops (5350) - Operations management
- Telemetry (4950) - System monitoring
- Stability (4850) - Stability checks
- Visibility (5200) - Observability
- Engagement (5210) - User engagement
- Voice v2 (9000) - Voice interface

**OPTIMIZATION (4 services)**
- Performance Refinement (5520) - Performance tuning
- Optimizer (5490) - Multi-domain optimization
- CrossVal (5470) - Cross-validation
- RL (5495) - Reinforcement learning

## 🎯 Demo Scripts

### Autonomy Demo
```bash
./codex_demo_autonomy.sh
```
Demonstrates autonomous orchestration of a 3-day Smart Bottle Pro launch with safety checks, workflow planning, and optimization.

### Visual Demo
```bash
./codex_visual_demo.sh
```
Shows UI automation capabilities via Hands v5 (requires Accessibility permissions).

## 🔧 Development

### Build All Services
```bash
npm run build:all
```

### Stop All Services
```bash
npm run codex:stop
```

### Boot Manager v2
```bash
cd codex-boot-manager
npm run dev
```

## 📊 Service Health

Check all service health:
```bash
curl http://localhost:4200/health
```

## 🏗️ Project Structure

```
Codex/
├── codex-boot-manager/     # Boot orchestration
├── codex-bridge/           # Model provider gateway
├── codex-brain/            # Memory & domain streams
├── codex-orchestrator/     # Multi-service coordination
├── codex-hands/            # UI automation (Hands v5)
├── codex-vision-2.6/       # Computer vision
├── codex-social/           # Social media engine
├── codex-*-*/              # 35+ additional services
└── packages/
    ├── build-agent/        # Service scaffolding CLI
    └── contracts/          # Shared event types
```

## 🛡️ Safety Architecture

Codex OS implements multi-layer safety:
1. **Autonomy Engine** - Decision evaluation with confidence scoring
2. **SRL** - Self-regulation and compliance checks
3. **Hardening** - Service health validation
4. **Mesh** - Coordinated safety workflows

## 📝 License

Private project - All rights reserved

## 👥 Contributors

Codex OS Development Team
