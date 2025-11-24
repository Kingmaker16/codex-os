# Copilot / AI Agent Instructions for this Repo

Purpose: give an AI coding agent the minimal, actionable context to be productive — architecture, run/build flows, conventions, integration points, and examples.

**Big Picture**
- `codex-bridge`: API gateway for model providers. Primary endpoints: `GET /health`, `GET /providers`, `POST /respond` (see `codex-bridge/README.md` and `packages/build-agent/templates/bridge/src/index.ts`).
- Services: `hello-service` and `test-service` follow the same Fastify template (see `packages/build-agent/templates/service/src/index.ts`).
- `packages/build-agent`: CLI scaffolder and helper (entry `bin/codex`). Contains templates used by services and the bridge.
- `packages/contracts`: shared event types, JSON schema and a validator script used to assert event/fixture correctness.

**Where to look first (important files)**
- Provider API & types: `codex-bridge/src/providers/types.ts` (Message/ModelRequest/ModelResponse, `IModelProvider`).
- Provider implementations: `codex-bridge/src/providers/mockProvider.ts`, `codex-bridge/src/providers/openaiProvider.ts`.
- Bridge example endpoints: `packages/build-agent/templates/bridge/src/index.ts`.
- Contracts & validation: `packages/contracts/src/events.ts`, `packages/contracts/src/validate.ts`, `packages/contracts/fixtures/sample_turn.json`.

**Project-specific conventions**
- ESM + TypeScript project-wide (`"type": "module"` in package.json). Use `ts-node/esm` for `dev` workflows.
- Fastify is the HTTP server used by services and bridge (see templates).
- Provider pattern: add a provider by implementing `IModelProvider` with `name`, `models`, `health()` and `respond()` methods. Look at `mockProvider` and `openaiProvider` for examples.
- Ports: templates default to `PORT` env var (bridge uses 4000 in template, services use 3000). Respect `process.env.PORT` when adding services.

**Build / Dev / Test flows (quick commands)**
- Run bridge in dev (project root into `codex-bridge`):
  - `cd codex-bridge && npm run dev` — runs via `ts-node` watcher.
  - `npm run build` + `npm start` — compile to `dist` then run.
- Service templates:
  - `cd hello-service && npm run dev`
  - `cd hello-service && npm run build && npm start`
- Build agent CLI: `cd packages/build-agent && npm run dev` / `npm run build` / `npm run link` (build + `npm link`).
- Contracts validation: `npm --prefix packages/contracts run test:contracts` (runs `tsc`, copies schema, and runs the validator).

**Provider integration notes (how to wire a provider)**
- Implement `IModelProvider` (see `codex-bridge/src/providers/types.ts`).
- Place new provider file in `codex-bridge/src/providers/` and export/register it from whatever bootstrap file wires providers (follow existing pattern in `mockProvider`/`openaiProvider`).
- `ModelRequest` uses `messages: Message[]` where `Message.role` ∈ `system|user|assistant|tool`. `tools?: ToolCall[]` supports tool calls — keep tooling consistent with `providers/types.ts`.

**Contracts & fixtures**
- Use `packages/contracts/src/validate.ts` to validate fixtures. Fix fixture or schema if validation fails. Example fixture: `packages/contracts/fixtures/sample_turn.json`.

**Examples / quick checks**
- Check bridge health: `curl http://localhost:4000/health`
- List providers (template): `curl http://localhost:4000/providers`
- Send a respond request (template stub): `curl -X POST 'http://localhost:4000/respond?provider=mock&model=mock' -d '{}'`

**When in doubt**
- Read the provider types and examples first (`codex-bridge/src/providers`).
- Mirror the templates in `packages/build-agent/templates` when scaffolding new services or bridges.
- Use the contracts validator to ensure event/fixture compatibility before changing event shapes.

If anything here is unclear or you want more detail (e.g., how providers are discovered/registered in runtime), say which area to expand and I will update this file.
