# Knowledge Engine v2 — AGI Research Mode (C1 Focused)

## Overview

The Knowledge Engine v2 is Codex's AGI-level research system implementing **C1 Focused Mode**: explicit-only learning with NO automatic background processing.

**Version**: 2.0.0  
**Port**: 4500  
**Mode**: C1 (Explicit-Only Research)

## C1 Mode — Critical Rules

```typescript
RESEARCH_MODE = "C1"
autoRefine: false            // NO automatic refinement
backgroundLearning: false    // NO background tasks
explicitOnly: true           // ONLY respond to explicit requests
```

### What C1 Means:
- ✅ Research ONLY when user explicitly requests
- ✅ Full logging to Brain for audit trail
- ❌ NO automatic background learning
- ❌ NO auto-refinement of stored knowledge
- ❌ NO unsolicited research tasks

## Architecture

### Multi-Model AGI Fusion

Knowledge Engine uses 4 AI models in parallel for consensus-driven research:

1. **OpenAI**: gpt-4o
2. **Claude**: claude-3-5-sonnet-20241022
3. **Gemini**: gemini-1.5-pro
4. **Grok**: grok-beta

**Fusion Strategy**: Parallel queries → Confidence scoring → Consensus computation → Result merging

### Domain Kernels (Brain Sessions)

Research is automatically classified and stored in domain-specific Brain sessions:

- `codex-skill-trading` — Trading, markets, finance
- `codex-skill-ecomm` — E-commerce, products, stores
- `codex-skill-kingmaker` — Influence, power, strategy
- `codex-skill-social` — Social dynamics, relationships
- `codex-skill-creative` — Art, design, content creation

**Main Log**: `codex-research-log` (all research queries)

## Research Pipeline

1. **Classify Domain** — AI determines which kernel to store in
2. **Ingest Content** — From web, YouTube, PDF, audio, or screenshot
3. **Extract Chunks** — Break content into conceptual units (200-2000 chars)
4. **Score Relevance** — Rank chunks by relevance to query
5. **AGI Fusion** — Multi-model analysis for skill extraction
6. **Generate Summary** — Synthesized 3-5 paragraph overview
7. **Store in Brain** — Write to appropriate domain kernel

## API Endpoints

### Base URL
`http://localhost:4500` (via orchestrator: `http://localhost:4200`)

### Main Research
**POST /research/run**

```json
{
  "query": "How to analyze stock charts",
  "depth": "medium",
  "source": "https://example.com/article",
  "content": "Optional pre-fetched text..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "How to analyze stock charts",
    "domain": "codex-skill-trading",
    "summary": "3-5 paragraph synthesis...",
    "skills": [
      {
        "name": "Candlestick Pattern Recognition",
        "type": "heuristic",
        "domain": "codex-skill-trading",
        "description": "Identify bullish/bearish patterns..."
      }
    ],
    "chunks": [...],
    "confidence": 0.92,
    "metadata": {
      "depth": "medium",
      "duration": 4523,
      "chunkCount": 8,
      "skillCount": 3,
      "source": "https://example.com/article",
      "mode": "C1"
    }
  }
}
```

### Convenience Endpoints

**POST /research/web**
```json
{
  "url": "https://example.com",
  "query": "What is this page about?",
  "depth": "shallow"
}
```

**POST /research/youtube**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "query": "Summarize this video",
  "depth": "deep"
}
```

**POST /research/pdf**
```json
{
  "filePath": "/path/to/document.pdf",
  "query": "Extract key insights",
  "depth": "medium"
}
```

**POST /research/screenshot**
```json
{
  "filePath": "/path/to/screenshot.png",
  "query": "What does this UI show?",
  "depth": "shallow"
}
```

**POST /research/audio**
```json
{
  "filePath": "/path/to/audio.mp3",
  "query": "Transcribe and summarize",
  "depth": "deep"
}
```

**GET /health**
```json
{
  "status": "healthy",
  "service": "codex-knowledge",
  "version": "2.0.0"
}
```

## Research Depth Levels

### Shallow (3 chunks max)
- Quick overview
- High-level concepts only
- Fast turnaround (~2-3 seconds)

### Medium (6 chunks max) — Default
- Balanced detail
- Actionable insights
- Moderate depth (~5-8 seconds)

### Deep (10 chunks max)
- Comprehensive analysis
- All available skills
- Full research (~10-15 seconds)

## Content Ingestion

### Supported Sources

| Type | Detection | Status |
|------|-----------|--------|
| **Web URL** | `http://`, `https://` | ✅ Implemented (via Hands) |
| **YouTube** | `youtube.com`, `youtu.be` | ⚠️ Placeholder (needs transcript API) |
| **PDF** | `.pdf` extension | ⚠️ Placeholder (needs pdf-parse) |
| **Audio** | `.mp3`, `.wav`, `.m4a` | ⚠️ Placeholder (needs Whisper API) |
| **Screenshot** | `.png`, `.jpg`, `.jpeg` | ⚠️ Placeholder (needs Vision API) |

### Web Ingestion (Active)
Uses Hands service to scrape web pages:
```
POST http://localhost:4300/hands/web/open
```

### Future Ingest Implementation
Placeholders return error messages until packages/APIs are integrated.

## Extracted Skills Format

```typescript
{
  name: "Skill Name",
  type: "rule" | "workflow" | "heuristic" | "pattern",
  domain: "codex-skill-trading",
  description: "What the skill does",
  example?: "Optional usage example",
  confidence: 0.85
}
```

## Brain Storage

### Domain Kernel Events
```json
{
  "kind": "TurnAppended",
  "event": {
    "sessionId": "codex-skill-trading",
    "role": "system",
    "text": "{\"type\":\"research_result\",\"query\":\"...\",\"summary\":\"...\",\"skills\":3}",
    "ts": "2024-01-15T12:34:56.789Z"
  }
}
```

### Skill Events
```json
{
  "kind": "TurnAppended",
  "event": {
    "sessionId": "codex-skill-trading",
    "role": "system",
    "text": "{\"name\":\"Candlestick Recognition\",\"type\":\"heuristic\",...}",
    "ts": "2024-01-15T12:34:56.789Z"
  }
}
```

## Development

### Local Dev
```bash
cd codex-knowledge
npm install
npm run dev  # Watch mode with ts-node
```

### Build
```bash
npm run build  # Compile to dist/
```

### Production
```bash
npm start  # Run compiled JS
```

### Testing
```bash
# Health check
curl http://localhost:4500/health

# Simple research
curl -X POST http://localhost:4500/research/run \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to optimize React performance",
    "depth": "medium"
  }'

# Via orchestrator (preferred)
curl -X POST http://localhost:4200/research/run \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain blockchain consensus",
    "depth": "deep"
  }'
```

## Boot Integration

Knowledge Engine starts automatically as the 7th service in Codex OS boot sequence:

1. Brain (4100)
2. Bridge (4000)
3. Orchestrator (4200)
4. Hands (4300)
5. Voice (9001)
6. UI (5173)
7. **Knowledge (4500)** ← C1 Mode

Check boot manager output for confirmation:
```
✅ Starting service: Knowledge
   Port: 4500
   Path: /Users/amar/Codex/codex-knowledge
✅ Knowledge started successfully
```

## Configuration

See `src/config.ts` for all settings:

```typescript
export const CONFIG = {
  mode: "C1",
  brainUrl: "http://localhost:4100",
  researchSessionId: "codex-research-log",
  bridgeUrl: "http://localhost:4000",
  domains: [...],
  fusionProviders: [...],
  autoRefine: false,
  backgroundLearning: false,
  explicitOnly: true,
  maxChunkSize: 2000,
  minChunkSize: 200,
  fusionConfidenceThreshold: 0.7,
  logAllResearch: true,
  verbose: true
};
```

## Troubleshooting

### Service Won't Start
```bash
# Check if port 4500 is free
lsof -i :4500

# Check build output
cd codex-knowledge
npm run build

# Check logs
npm start
```

### Research Failing
- Ensure Brain (4100) is running
- Ensure Bridge (4000) is running
- Check provider API keys in Bridge
- Verify domain classification is working

### No Skills Extracted
- Increase research depth to "medium" or "deep"
- Provide more detailed content/source
- Check fusion engine is receiving valid responses
- Verify AI providers are accessible via Bridge

## Future Enhancements

### Phase 1 (Current)
- ✅ C1 focused mode
- ✅ Multi-model fusion
- ✅ Domain kernels
- ✅ Web ingestion
- ✅ Brain storage

### Phase 2 (Planned)
- YouTube transcript ingestion
- PDF text extraction
- Audio transcription (Whisper)
- Screenshot OCR/vision analysis
- Skill deduplication
- Cross-domain skill linking

### Phase 3 (Future)
- C2 mode (semi-automatic refinement)
- C3 mode (full auto-learning)
- Knowledge graph visualization
- Skill confidence evolution
- Multi-source synthesis

## C1 Mode Audit Trail

All research is logged to Brain with full metadata:
- Query text
- Domain classification
- Timestamp
- Skill count
- Chunk count
- Confidence score
- Research depth
- Source URL (if any)
- Duration

Query Brain directly:
```bash
curl "http://localhost:4100/memory?sessionId=codex-research-log"
```

## Success Criteria

✅ KE2-C (C1 Mode) is successfully installed when:
1. Service builds without errors
2. Service starts on port 4500
3. Health endpoint returns 200 OK
4. Research endpoint accepts queries
5. Domain classification works
6. Skills are extracted and stored in Brain
7. Boot manager includes Knowledge in startup
8. Orchestrator forwards research requests
9. C1 mode prevents auto-learning

---

**Status**: ✅ Installed and Ready  
**Mode**: C1 Focused (Explicit-Only Research)  
**Next**: Test with `curl` or boot full Codex OS
