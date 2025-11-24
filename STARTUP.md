# Codex OS - One-Click Startup Guide

## Quick Start

From the Codex root directory (`~/Codex`):

```bash
# Start everything
npm run codex:start

# Stop everything
npm run codex:stop
```

That's it! Codex Boot Manager handles the rest.

## What Happens on Boot

1. **Port Cleanup** - Kills any stale processes
2. **Sequential Launch**:
   - Brain (4100) - Memory & persistence
   - Bridge (4000) - AI provider abstraction
   - Orchestrator (4200) - Request routing & task planning
   - Hands (4300) - File operations & script execution
   - UI (5173) - Desktop interface
3. **Health Validation** - Waits for each service to be ready
4. **Browser Launch** - Opens UI automatically
5. **Voice Listener** - Starts wake-word detection (stub)
6. **Ready** - "Codex OS is online, Amar."

## Service URLs

After boot, access services at:
- **UI**: http://localhost:5173
- **Orchestrator**: http://localhost:4200
- **Brain**: http://localhost:4100
- **Bridge**: http://localhost:4000
- **Hands**: http://localhost:4300

## Features

### Task Planner
```bash
curl -X POST "http://localhost:4200/tasks/plan" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "my-session",
    "domain": "general",
    "input": "Create a notes file with project ideas",
    "execute": true
  }'
```

### Hands Execution
```bash
curl -X POST "http://localhost:4200/hands/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "create_file",
    "sessionId": "test",
    "path": "test-output/notes.txt",
    "content": "Hello from Codex!"
  }'
```

### Chat with AI
```bash
curl -X POST "http://localhost:4200/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "chat-1",
    "provider": "openai",
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello Codex"}]
  }'
```

## Troubleshooting

### Services Won't Start
```bash
# Clean everything and retry
npm run codex:stop
sleep 3
npm run codex:start
```

### Port Already in Use
Boot Manager automatically kills stale processes, but if you need manual cleanup:
```bash
lsof -ti:4000,4100,4200,4300,5173 | xargs kill -9
```

### Check Service Status
```bash
# Check what's listening
lsof -i :4000,4100,4200,4300,5173 | grep LISTEN

# Test health endpoints
curl http://localhost:4100/health
curl http://localhost:4200/health
curl http://localhost:4300/hands/health
```

## Development Mode

If you need to run services individually during development:

```bash
# Brain
cd codex-brain && npm run dev

# Bridge
cd codex-bridge && npm run dev

# Orchestrator
cd codex-orchestrator && npm run dev

# Hands
cd codex-hands && npm run dev

# UI
cd codex-desktop && npm run dev
```

## Voice Mode (Coming Soon)

Enable wake-word detection:
```bash
CODEX_WAKEWORD_ENABLED=true npm run codex:start
```

Full Voice OS integration in v1.1.

## Architecture

```
┌─────────────────────────────────────┐
│     Codex Boot Manager v1.0         │
│  (Unified Startup Orchestration)    │
└─────────────────────────────────────┘
              │
              ├──> Brain (4100)
              │     └─> Memory, Events, Documents
              │
              ├──> Bridge (4000)
              │     └─> OpenAI, Claude, Grok, etc.
              │
              ├──> Orchestrator (4200)
              │     └─> /chat, /tasks/plan, /hands/execute
              │
              ├──> Hands (4300)
              │     └─> File ops, Script execution
              │
              └──> UI (5173)
                    └─> Desktop interface (Vite + React)
```

## What's Running?

After boot, you have:
- ✅ **33 Fusion Kernel rules** loaded into Orchestrator
- ✅ **Task Planner** for natural-language → actions
- ✅ **Hands** for safe file operations
- ✅ **Knowledge Engine** for document ingestion
- ✅ **Multi-provider chat** (OpenAI, Claude, Grok, Gemini, etc.)
- ✅ **Desktop UI** for interaction
- ✅ **Memory persistence** in SQLite

## Next Steps

1. Open UI at http://localhost:5173
2. Start chatting or planning tasks
3. Build your first automation workflow
4. Explore the Memory sidebar for session history

---

**"Codex OS is online, Amar."** 🚀
