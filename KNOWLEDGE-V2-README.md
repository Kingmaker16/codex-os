# Knowledge Engine v2.5 — Focused C1 Mode

**Status**: ✅ Operational (Port 4500)  
**Mode**: C1-STRICT (Explicit Learning Only)  
**Version**: 2.5.0

---

## Overview

Knowledge Engine v2.5 is a **multi-model research and learning system** built for AGI-level knowledge acquisition with strict C1 rules. It processes content from multiple sources, classifies it into domain-specific kernels, extracts actionable skills, and builds a knowledge graph—all while maintaining isolation between domains and logging every operation to Brain.

**Key Features**:
- **4 AI Provider Fusion**: Runs OpenAI, Claude, Gemini, and Grok in parallel for consensus-based research
- **6 Isolated Domain Kernels**: trading, ecomm, kingmaker, social, creative, generic
- **10-Step Research Pipeline**: Ingest → Classify → Process → Link → Extract → Log
- **5 Content Ingesters**: Web (HTML), PDF (stub), YouTube (stub), Audio (stub), Screenshot (vision-based)
- **C1 Strict Mode**: No auto-learning, explicit requests only, full audit trail

---

## Architecture

### C1 Strict Mode Rules

```typescript
c1Rules: {
  explicitOnly: true,        // Only process explicit /research requests
  noAutoLearn: true,          // Never auto-ingest from conversations
  requireApproval: false,     // Auto-approve trusted sources
  isolatedDomains: true,      // Domain kernels don't cross-pollinate
  auditLogging: true          // Log all operations to Brain
}
```

### AI Provider Fusion

The fusion engine runs **4 models in parallel** with a 30-second timeout per model:

- **OpenAI**: gpt-4o
- **Claude**: haiku-4-5
- **Gemini**: gemini-2.5-pro-latest
- **Grok**: grok-4-latest

Results are weighted by confidence and merged. If >50% word overlap exists across responses, `consensus: true` is set.

### 6 Domain Kernels

Each domain maintains isolated:
- `knowledge[]`: Array of KnowledgeBlock objects
- `skills[]`: Array of ExtractedSkill objects
- `relations[]`: Array of KnowledgeRelation objects (similarity-based links)

**Domains**:
1. **trading** — Market analysis, investment strategies
2. **ecomm** — E-commerce, drop-shipping, product launches
3. **kingmaker** — Influence, power dynamics, network building
4. **social** — Social media, content creation, engagement
5. **creative** — Art, design, storytelling
6. **generic** — General knowledge (default fallback)

### 10-Step Research Pipeline

```
1. Ingest from sources (web/pdf/youtube/audio/screenshot)
2. Fallback to AI research if no sources
3. Classify domain (AI or hint)
4. Chunk content (2000 tokens max)
5. Process each chunk:
   - Extract keywords (frequency analysis)
   - Generate summary (AI-powered)
   - Create KnowledgeBlock
   - Save to domain kernel
6. Link knowledge blocks (30% keyword similarity threshold)
7. Extract skills (SKILL/RULE/EXAMPLES/APPLIES format)
8. Save skills to domain kernel
9. Generate overall summary
10. Log to Brain (3 sessions)
```

### Brain Audit Trail

All operations are logged to 3 Brain sessions:
- `codex-knowledge-log`: All research operations
- `codex-knowledge-[domain]`: Domain-specific updates (e.g., `codex-knowledge-trading`)
- `codex-knowledge-sessions`: Session tracking

---

## API Endpoints

### Health Check
```bash
GET /health
```
**Response**:
```json
{
  "status": "ok",
  "engine": "knowledge-v2.5",
  "version": "2.5.0",
  "mode": "C1-STRICT"
}
```

### Full Research Pipeline
```bash
POST /research/run
Content-Type: application/json
```
**Body**:
```json
{
  "query": "How to build a profitable e-commerce business",
  "domain": "ecomm",           // Optional: trading|ecomm|kingmaker|social|creative|generic
  "sources": [                 // Optional: URLs, file paths, or data URIs
    "https://example.com/guide",
    "/path/to/local/file.pdf",
    "data:image/png;base64,..."
  ]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "query": "How to build a profitable e-commerce business",
    "domain": "ecomm",
    "knowledgeBlocks": [
      {
        "id": "kb_1234567890",
        "domain": "ecomm",
        "content": "E-commerce success requires...",
        "summary": "Focus on product-market fit and customer acquisition...",
        "keywords": ["ecommerce", "dropshipping", "marketing"],
        "confidence": 0.87,
        "timestamp": "2025-11-22T06:00:00.000Z",
        "relations": []
      }
    ],
    "skills": [
      {
        "id": "skill_1234567890",
        "domain": "ecomm",
        "name": "Product Validation Strategy",
        "rule": "Test demand before inventory investment",
        "examples": ["Pre-sell campaigns", "Landing page tests"],
        "applicability": "New product launches",
        "confidence": 0.85,
        "timestamp": "2025-11-22T06:00:00.000Z"
      }
    ],
    "summary": "Comprehensive guide to building profitable e-commerce...",
    "confidence": 0.87,
    "timestamp": "2025-11-22T06:00:00.000Z"
  }
}
```

### Web URL Ingestion
```bash
POST /research/web
Content-Type: application/json
```
**Body**:
```json
{
  "url": "https://example.com/article",
  "domain": "trading"  // Optional
}
```

### YouTube Video Ingestion
```bash
POST /research/youtube
Content-Type: application/json
```
**Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "domain": "social"  // Optional
}
```
**Note**: Requires `youtube-transcript` library (currently stubbed).

### PDF Ingestion
```bash
POST /research/pdf
Content-Type: application/json
```
**Body**:
```json
{
  "path": "/path/to/document.pdf",
  "domain": "generic"  // Optional
}
```
**Note**: Requires `pdf-parse` library (currently stubbed).

### Audio Ingestion
```bash
POST /research/audio
Content-Type: application/json
```
**Body**:
```json
{
  "path": "/path/to/recording.mp3",
  "domain": "creative"  // Optional
}
```
**Note**: Requires Whisper API integration (currently stubbed).

### Screenshot Ingestion
```bash
POST /research/screenshot
Content-Type: application/json
```
**Body**:
```json
{
  "image": "base64_encoded_png_data",
  "context": "Trading chart analysis",  // Optional
  "domain": "trading"                   // Optional
}
```
Uses vision-based OCR via fusion engine to extract text from images.

### Domain Kernel Stats
```bash
GET /kernels
```
**Response**:
```json
{
  "trading": {
    "knowledgeCount": 42,
    "skillsCount": 18,
    "relationsCount": 67
  },
  "ecomm": {
    "knowledgeCount": 31,
    "skillsCount": 12,
    "relationsCount": 45
  },
  ...
}
```

---

## Integration

### Orchestrator Integration

Knowledge Engine v2.5 is proxied through Codex Orchestrator at port 4200:

```bash
# All /research/* endpoints are forwarded to localhost:4500
POST http://localhost:4200/research/run
POST http://localhost:4200/research/web
POST http://localhost:4200/research/youtube
# etc...

# Kernel stats
GET http://localhost:4200/kernels
```

### Boot Manager Integration

Knowledge Engine v2.5 boots at position 8 in the boot sequence (after Vision, before Stability):

```
1. Brain (4100)
2. Bridge (4000)
3. Orchestrator (4200)
4. Hands (4300)
5. UI (5173)
6. Voice (9001)
7. Vision (4600)
8. Knowledge (4500) ← Knowledge Engine v2.5
9. Stability (4700)
```

Service path: `/Users/amar/Codex/codex-knowledge-v2`  
Start command: `node dist/index.js`

---

## Usage Examples

### Research from Web URL
```bash
curl -X POST http://localhost:4500/research/web \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://en.wikipedia.org/wiki/Machine_learning",
    "domain": "generic"
  }'
```

### Research from Query (No Sources)
```bash
curl -X POST http://localhost:4500/research/run \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the best strategies for viral social media content?",
    "domain": "social"
  }'
```

### Get Domain Stats
```bash
curl http://localhost:4500/kernels
```

### Screenshot Analysis
```bash
# Assuming you have base64-encoded image data
curl -X POST http://localhost:4500/research/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "image": "iVBORw0KGgoAAAANSUhEUgAA...",
    "context": "Extract trading signals from chart",
    "domain": "trading"
  }'
```

---

## Knowledge Block Structure

```typescript
{
  id: string;              // Unique ID (kb_timestamp)
  domain: Domain;          // trading|ecomm|kingmaker|social|creative|generic
  content: string;         // Raw content (chunk)
  summary: string;         // AI-generated summary
  keywords: string[];      // Extracted keywords (frequency-based)
  confidence: number;      // 0-1 confidence score
  timestamp: string;       // ISO 8601 timestamp
  relations: {             // Links to related blocks
    targetId: string;
    type: "similar";
    strength: number;      // 0-1 similarity score
  }[];
}
```

## Skill Structure

```typescript
{
  id: string;              // Unique ID (skill_timestamp)
  domain: Domain;
  name: string;            // Skill name (e.g., "Product Validation Strategy")
  rule: string;            // Actionable rule
  examples: string[];      // Real-world examples
  applicability: string;   // When to apply this skill
  confidence: number;      // 0-1 confidence score
  timestamp: string;
}
```

---

## Development

### Local Development
```bash
cd /Users/amar/Codex/codex-knowledge-v2
npm run dev
```
Runs service with ts-node in watch mode.

### Build
```bash
npm run build
```
Compiles TypeScript to `dist/`.

### Start (Production)
```bash
npm start
# or
node dist/index.js
```

### Dependencies
- **fastify** ^4.26.0 — Web framework
- **node-fetch** ^3.3.2 — HTTP client for Bridge/Brain integration
- **typescript** ^5.3.3 — TypeScript compiler
- **ts-node** ^10.9.2 — Development mode

---

## Technical Details

### Fusion Engine

**Parallel Model Execution**:
```typescript
// All 4 models are queried simultaneously with 30s timeout
const sources = await Promise.all([
  queryProvider("openai", "gpt-4o", prompt, context),
  queryProvider("claude", "haiku-4-5", prompt, context),
  queryProvider("gemini", "gemini-2.5-pro-latest", prompt, context),
  queryProvider("grok", "grok-4-latest", prompt, context)
]);
```

**Weighted Merging**:
- Primary response = highest confidence source
- Append unique insights from other sources (not already in primary)
- Consensus = true if >50% word overlap across all responses

### Domain Classification

When no domain hint is provided, the classifier:
1. Runs fusion on content snippet
2. Asks: "Classify this content into one domain: trading, ecomm, kingmaker, social, creative, generic"
3. Parses response and maps to domain enum
4. Defaults to "generic" if unclear

### Keyword Extraction

Frequency-based approach:
1. Split content into words
2. Count occurrences
3. Filter words with length > 4
4. Return top 20 by frequency

### Skill Extraction Format

AI is prompted to extract skills in this format:
```
SKILL: Skill Name
RULE: Actionable rule
EXAMPLES: Example 1, Example 2, Example 3
APPLIES: When to apply this skill
```

Parser uses regex to extract structured fields.

### Knowledge Graph Linking

Similarity threshold: **30%** keyword overlap  
Calculates Jaccard similarity: `intersection / union`

---

## C1 Mode Warnings

⚠️ **No Auto-Learning**: The system will NOT automatically ingest content from conversations. You must explicitly call `/research/*` endpoints.

⚠️ **Isolated Domains**: Knowledge in "trading" domain will not influence "ecomm" domain. Each kernel is completely isolated.

⚠️ **Explicit Approval**: While `requireApproval: false` for trusted sources, all operations are logged to Brain for audit.

⚠️ **Confidence Scores**: All knowledge blocks and skills have confidence scores. Review low-confidence items before trusting them.

---

## Future Enhancements

- [ ] Implement PDF ingestion (requires `pdf-parse`)
- [ ] Implement YouTube ingestion (requires `youtube-transcript`)
- [ ] Implement audio ingestion (requires Whisper API)
- [ ] Add persistent storage (replace in-memory Map with database)
- [ ] Add knowledge expiration (TTL for outdated blocks)
- [ ] Add cross-domain skill transfer (with explicit approval)
- [ ] Add knowledge conflict resolution (when sources contradict)
- [ ] Add skill validation (test extracted skills in real scenarios)

---

## Troubleshooting

### Service won't start
```bash
# Check if port 4500 is in use
lsof -ti:4500

# Kill stale process
kill -9 $(lsof -ti:4500)

# Rebuild
cd /Users/amar/Codex/codex-knowledge-v2
npm run build
node dist/index.js
```

### Fusion taking too long
The 30s timeout per provider ensures fusion never hangs. If all providers timeout, the system will return an error. Check Bridge health:
```bash
curl http://localhost:4000/health
```

### Domain classification incorrect
Provide explicit `domain` hint in requests:
```json
{
  "query": "...",
  "domain": "trading"  // Force classification
}
```

### Low confidence scores
Fusion confidence is length-based (longer responses = higher confidence). If all models return short responses, confidence will be low. This is expected for simple queries.

---

**Knowledge Engine v2.5 Installed Successfully.**  
**C1 Strict Mode Active.**

System ready for explicit research requests with multi-model fusion and isolated domain knowledge management.
