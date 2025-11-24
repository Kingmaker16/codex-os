# codex-brain

Lightweight service to store events (turns) and produce simple memory summaries.

Run locally:

```bash
cd codex-brain
npm install
npm run dev
```

Endpoints:
- `GET /health` — basic health check
- `POST /event` — append an event (JSON body matching the TurnAppended shape)
- `GET /memory?sessionId=...` — fetch recent events and a simple summary for a session
# SERVICE_NAME

Scaffolded from template: service

## Scripts
- `npm run dev`   — run with ts-node (watch)
- `npm run build` — compile TypeScript to dist
- `npm start`     — run compiled output
