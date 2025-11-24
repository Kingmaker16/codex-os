# Codex Bridge v2 - Multi-LLM Roundtable API

Codex Bridge v2 introduces a collaborative multi-LLM "roundtable" system that coordinates specialized AI agents to solve complex problems through structured deliberation.

## Architecture

The roundtable orchestrates 5 specialized participants in a sequential workflow:

1. **Planner** (GPT-4): Strategic planning and goal decomposition
2. **Researcher** (Gemini): Context analysis and knowledge synthesis  
3. **Coder** (Claude Sonnet): Implementation strategy and technical design
4. **Critic** (Grok): Risk assessment and improvement suggestions
5. **Judge** (Claude Opus): Final synthesis into executable plan with tasks

Each participant receives the outputs of prior participants, enabling collaborative refinement.

## API Endpoints

### POST /codex/bridge/v2/roundtable

Run a multi-LLM roundtable session.

**Request Body:**
```json
{
  "sessionId": "string (required)",
  "goal": "string (required)",
  "mode": "plan | code | debug | review (required)",
  "context": {
    "repoSummary": "string (optional)",
    "filesChanged": ["string"] (optional),
    "logs": "string (optional)",
    "notes": "string (optional)"
  },
  "participants": {
    "planner": { "provider": "string", "model": "string" } (optional),
    "researcher": { "provider": "string", "model": "string" } (optional),
    "coder": { "provider": "string", "model": "string" } (optional),
    "critic": { "provider": "string", "model": "string" } (optional),
    "judge": { "provider": "string", "model": "string" } (optional)
  }
}
```

**Response:**
```json
{
  "sessionId": "string",
  "goal": "string",
  "mode": "string",
  "finalPlan": "string",
  "tasksForCoder": [
    {
      "id": "string",
      "file": "string",
      "instructions": "string",
      "patch": "string (optional)",
      "priority": "low | medium | high"
    }
  ],
  "notesForDirector": "string[]",
  "riskFlags": "string[]",
  "participantResults": [
    {
      "role": "string",
      "provider": "string",
      "model": "string",
      "content": "string",
      "raw": { "output": "string", "usage": {} },
      "error": "string (if failed)",
      "timestamp": "ISO8601"
    }
  ],
  "judgeReasoning": "string",
  "timestamp": "ISO8601"
}
```

### GET /codex/bridge/v2/health

Health check for v2 endpoints.

**Response:**
```json
{
  "ok": true,
  "version": "2.0.0",
  "service": "codex-bridge-v2",
  "features": [
    "multi-llm-roundtable",
    "collaborative-planning",
    "parallel-analysis"
  ],
  "availableProviders": ["claude", "openai", "grok", "gemini", ...]
}
```

### GET /codex/bridge/v2/participants

Get default participant configurations and availability.

**Response:**
```json
{
  "defaultParticipants": {
    "planner": { "provider": "openai", "model": "gpt-4", "available": true },
    "researcher": { "provider": "gemini", "model": "gemini-pro", "available": true },
    "coder": { "provider": "anthropic", "model": "claude-3-sonnet-20240229", "available": false },
    "critic": { "provider": "grok", "model": "grok-beta", "available": true },
    "judge": { "provider": "anthropic", "model": "claude-3-opus-20240229", "available": false }
  },
  "availableProviders": ["claude", "openai", "grok", "gemini", ...],
  "notes": "You can override participants in the request body"
}
```

## Usage Examples

### Example 1: Planning Mode with Default Participants

```bash
curl -X POST http://localhost:4000/codex/bridge/v2/roundtable \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "plan-001",
    "goal": "Implement user authentication with JWT tokens",
    "mode": "plan",
    "context": {
      "repoSummary": "Express.js REST API with PostgreSQL database",
      "notes": "Need to support both email/password and OAuth2"
    }
  }'
```

### Example 2: Code Mode with Custom Participants

```bash
curl -X POST http://localhost:4000/codex/bridge/v2/roundtable \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "code-002",
    "goal": "Add rate limiting middleware to API endpoints",
    "mode": "code",
    "context": {
      "filesChanged": ["src/middleware/rateLimiter.ts", "src/index.ts"],
      "notes": "Use redis for distributed rate limiting"
    },
    "participants": {
      "planner": { "provider": "openai", "model": "gpt-4" },
      "researcher": { "provider": "gemini", "model": "gemini-pro" },
      "coder": { "provider": "claude", "model": "claude-3-sonnet-20240229" },
      "critic": { "provider": "grok", "model": "grok-beta" },
      "judge": { "provider": "claude", "model": "claude-3-opus-20240229" }
    }
  }'
```

### Example 3: Debug Mode

```bash
curl -X POST http://localhost:4000/codex/bridge/v2/roundtable \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "debug-003",
    "goal": "Fix memory leak in WebSocket connection handler",
    "mode": "debug",
    "context": {
      "filesChanged": ["src/websocket/connectionHandler.ts"],
      "logs": "Memory usage increasing 50MB per hour under load",
      "notes": "Issue appears after 1000+ concurrent connections"
    }
  }'
```

### Example 4: Review Mode

```bash
curl -X POST http://localhost:4000/codex/bridge/v2/roundtable \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "review-004",
    "goal": "Review security of payment processing module",
    "mode": "review",
    "context": {
      "filesChanged": ["src/payments/*.ts"],
      "notes": "Focus on PCI compliance and input validation"
    }
  }'
```

## Modes

- **plan**: Strategic planning and high-level design
- **code**: Implementation planning with specific code tasks
- **debug**: Problem diagnosis and debugging strategy
- **review**: Code review and security analysis

## Environment Variables

The roundtable requires API keys for the providers you want to use:

```bash
OPENAI_API_KEY=sk-...          # For GPT-4 (planner)
GOOGLE_API_KEY=...             # For Gemini (researcher)
ANTHROPIC_API_KEY=sk-ant-...   # For Claude (coder/judge)
XAI_API_KEY=xai-...            # For Grok (critic)
```

If a provider is unavailable, its result will contain an error field and the roundtable will continue.

## Default Participant Roles

| Role | Provider | Model | Purpose |
|------|----------|-------|---------|
| Planner | OpenAI | gpt-4 | Strategic planning, goal decomposition, dependency analysis |
| Researcher | Gemini | gemini-pro | Context research, domain knowledge, best practices |
| Coder | Anthropic | claude-3-sonnet-20240229 | Implementation strategy, code patterns, technical design |
| Critic | Grok | grok-beta | Risk assessment, issue identification, improvement suggestions |
| Judge | Anthropic | claude-3-opus-20240229 | Synthesis, task extraction, final decision making |

## Response Fields

### tasksForCoder

Structured tasks extracted by the judge for code implementation:

```json
{
  "id": "task-001",
  "file": "src/auth/jwt.ts",
  "instructions": "Implement JWT token generation with 15min expiry",
  "patch": "Optional unified diff format patch",
  "priority": "high"
}
```

### riskFlags

Critical issues identified by the critic:
- Security concerns
- Performance bottlenecks
- Architectural problems
- Breaking changes

### notesForDirector

High-level guidance for project direction:
- Strategic recommendations
- Architectural decisions needed
- Dependencies to consider
- Testing requirements

## Error Handling

The API uses standard HTTP status codes:

- **200**: Success
- **400**: Invalid request (missing required fields, invalid mode)
- **500**: Server error (provider failure, timeout, etc.)

Error responses include descriptive messages:

```json
{
  "error": "Missing required fields: sessionId, goal, mode"
}
```

If individual participants fail, the roundtable continues and includes error details in `participantResults`:

```json
{
  "role": "planner",
  "provider": "openai",
  "model": "gpt-4",
  "error": "provider not found: openai",
  "timestamp": "2025-11-24T13:26:38.993Z"
}
```

## Development

### Build

```bash
cd codex-bridge
npm run build
```

### Run

```bash
# Production
npm start

# Development with hot reload
npm run dev
```

### Test

```bash
# Test with mock providers
curl -X POST http://localhost:4000/codex/bridge/v2/roundtable \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-001",
    "goal": "Test roundtable system",
    "mode": "plan",
    "participants": {
      "planner": { "provider": "mock", "model": "mock" },
      "researcher": { "provider": "mock", "model": "mock" },
      "coder": { "provider": "mock", "model": "mock" },
      "critic": { "provider": "mock", "model": "mock" },
      "judge": { "provider": "mock", "model": "mock" }
    }
  }'
```

## Architecture Notes

### Sequential Execution

Participants execute in sequence, not parallel, because each builds on prior outputs:

1. Planner creates initial strategy
2. Researcher analyzes strategy and adds context
3. Coder designs implementation based on strategy + research
4. Critic reviews all prior work
5. Judge synthesizes everything into final plan

### Provider Abstraction

The roundtable uses the `IModelProvider` interface, supporting any provider that implements:
- `respond(ModelRequest): Promise<ModelResponse>`

This makes it easy to add new providers or swap models.

### Prompt Engineering

Each participant has a specialized system prompt that defines its role, responsibilities, and output format. See `src/v2/roundtableOrchestrator.ts` for details.

## Future Enhancements

- [ ] Parallel participant execution for independent analysis
- [ ] Iterative refinement (multi-round deliberation)
- [ ] Participant voting/consensus mechanisms
- [ ] Custom participant roles beyond the default 5
- [ ] Streaming responses for long-running sessions
- [ ] Session persistence and resumption
- [ ] Participant performance analytics

## License

MIT
