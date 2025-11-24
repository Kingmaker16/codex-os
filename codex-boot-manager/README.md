# Codex Boot Manager v1.0

Unified startup orchestration for Codex OS.

## Overview

Codex Boot Manager provides one-click startup and shutdown for all Codex OS services:
- **Brain** (4100) - Memory & persistence
- **Bridge** (4000) - Provider abstraction
- **Orchestrator** (4200) - Routing & planning
- **Hands** (4300) - Task execution
- **UI** (5173) - Desktop interface
- **Voice** (9001) - Voice mode (stub)

## Quick Start

From the Codex root directory:

```bash
# Start Codex OS
npm run codex:start

# Stop Codex OS
npm run codex:stop
```

## Boot Sequence

1. **Port Cleanup** - Kills stale processes on all Codex ports
2. **Registry Load** - Loads port configuration from `ports.json`
3. **Service Startup** (sequential):
   - Brain → Bridge → Orchestrator → Hands → UI
4. **Health Checks** - Validates each service before proceeding
5. **UI Launch** - Opens desktop UI in browser automatically
6. **Wake-Word** - Initializes voice listener (stub)
7. **Ready** - "Codex OS is online, Amar."

## Port Registry

Edit `codex-boot-manager/ports.json` to customize ports:

```json
{
  "bridge": 4000,
  "brain": 4100,
  "orchestrator": 4200,
  "hands": 4300,
  "ui": 5173,
  "voice": 9001
}
```

## Architecture

### Process Manager
- `src/processManager.ts` - Spawns and monitors services
- Sequential startup with health checks
- Graceful shutdown with process cleanup

### Port Management
- `src/ports.ts` - Port registry and cleanup utilities
- Kills stale processes before boot
- Validates port availability

### Wake-Word Listener (Stub)
- `src/wakeWord.ts` - Voice activation stub
- TODO: Full implementation in Voice OS v1.1
- Enable with: `CODEX_WAKEWORD_ENABLED=true npm run codex:start`

## Health Checks

Each service must respond to health endpoints:
- Brain: `GET /health`
- Bridge: `GET /providers`
- Orchestrator: `GET /health`
- Hands: `GET /hands/health`
- UI: `GET http://localhost:5173` (Vite)

Timeout: 30 seconds (15 retries × 2 seconds)

## Shutdown

```bash
npm run codex:stop
```

Gracefully:
1. Stops wake-word listener
2. Kills all Codex processes
3. Cleans up ports
4. "Codex OS shut down."

## Development

```bash
cd codex-boot-manager
npm install
npm run build
npm run dev        # Run with ts-node
```

## TODO

- [ ] Voice OS v1.1 integration
- [ ] Wake-word detection with Web Speech API
- [ ] Service restart on failure
- [ ] Boot logs to Brain memory
- [ ] Desktop app integration (Electron boot)

## License

MIT
