# Codex Supervisor

This small helper starts the Codex services in parallel for local development.

Requirements
- Node.js and npm

Install and run

```bash
cd supervisor
npm install
npm run dev
```

What this does
- Launches the four Codex services simultaneously using `concurrently` and color-coded output:
  - `codex-brain` (BRAIN)
  - `codex-bridge` (BRIDGE)
  - `codex-orchestrator` (ORCH)
  - `codex-desktop` (DESKTOP)

Notes
- Each service is started via `npm --prefix ../<service> run dev`, so `supervisor` must sit at the repository root next to the service folders.
- The logs are color-coded and prefixed with the service names to make it easy to follow parallel output.
