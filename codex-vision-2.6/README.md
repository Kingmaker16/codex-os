# Vision Engine v2.6 ULTRA - Co-Pilot Mode

**AI-Assisted Video Editing with Multi-LLM Fusion**

Vision Engine v2.6 ULTRA analyzes video content frame-by-frame and suggests professional edits using 4 AI models (GPT-4o, Claude, Gemini, Grok). **Co-Pilot Mode** means AI prepares edit actions but requires your approval before applying.

---

## Features

### 🎯 Core Capabilities
- **Multi-LLM Vision Fusion**: Queries 4 AI providers for edit suggestions
- **Frame-by-Frame Analysis**: Scene segmentation, motion detection, face detection
- **Hook Detection**: Analyzes first 3 seconds for retention optimization
- **Pacing Analysis**: Platform-specific cut frequency (TikTok: 2.0/s, YouTube: 1.0/s)
- **Dead Frame Detection**: Identifies low-interest moments to trim
- **Color Grading**: Detects underexposure, overexposure, saturation issues
- **Co-Pilot Mode**: `requiresApproval: true` on all suggestions

### ✂️ Edit Actions (10 Types)
- `trim` - Remove sections from start/end
- `cut` - Remove middle sections
- `jump-zoom` - Dynamic zoom for engagement
- `crop` - Reframe composition
- `contrast` - Adjust contrast levels
- `color-lift` - Fix exposure
- `saturation-bump` - Boost color vibrancy
- `speed-ramp` - Speed up/slow down sections
- `text-overlay` - Add text captions
- `zoom-to-face` - Focus on detected faces

### 🎬 Timeline Mapping
Export edit actions as:
- **Adobe Premiere Pro** (ExtendScript)
- **Final Cut Pro** (FCPXML)
- **CapCut** (JSON instructions)

### 📊 Performance Learning
- Logs edit performance metrics
- Analyzes top-performing action types
- Generates data-driven recommendations

---

## API Reference

### 1. Health Check
```bash
curl http://localhost:4650/health
```

**Response:**
```json
{
  "ok": true,
  "service": "codex-vision-2.6",
  "version": "2.6.0",
  "mode": "co-pilot",
  "engines": {
    "sceneAnalyzer": true,
    "fusionVision": true,
    "editSuggester": true,
    "timelineMapper": true,
    "arFeedback": true,
    "brainLogger": true
  }
}
```

---

### 2. Analyze Frame
Analyze a single video frame.

```bash
curl -X POST http://localhost:4650/vision/analyzeFrame \
  -H "Content-Type: application/json" \
  -d '{
    "frameData": "base64_encoded_frame",
    "frameNumber": 30,
    "timestamp": 1.0
  }'
```

**Response:**
```json
{
  "ok": true,
  "frameAnalysis": {
    "frameNumber": 30,
    "timestamp": 1.0,
    "resolution": { "width": 1080, "height": 1920 },
    "visualComplexity": 0.65,
    "motionIntensity": 0.72,
    "faceDetections": [...],
    "textOverlays": [...],
    "dominantColors": ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    "brightness": 0.68,
    "contrast": 0.75,
    "saturation": 0.62,
    "isHookFrame": true,
    "isDeadFrame": false,
    "recommendations": [...]
  }
}
```

---

### 3. Analyze Timeline
Analyze entire video timeline.

```bash
curl -X POST http://localhost:4650/vision/analyzeTimeline \
  -H "Content-Type: application/json" \
  -d '{
    "videoPath": "/path/to/video.mp4",
    "platform": "tiktok"
  }'
```

**Response:**
```json
{
  "ok": true,
  "timelineAnalysis": {
    "videoPath": "/path/to/video.mp4",
    "duration": 60,
    "frameRate": 30,
    "resolution": { "width": 1080, "height": 1920 },
    "totalFrames": 1800,
    "analyzedFrames": [...],
    "hookWindow": {
      "start": 0,
      "end": 3,
      "quality": "good"
    },
    "pacingAnalysis": {
      "platform": "tiktok",
      "idealCutFrequency": 2.0,
      "actualCutFrequency": 1.5,
      "cutTimestamps": [2.5, 5.0, 7.5, ...],
      "retentionScore": 72,
      "recommendations": [...]
    },
    "deadFrames": [15.5, 22.0, ...],
    "colorGradingIssues": [...]
  }
}
```

---

### 4. Suggest Edits ⭐ **MAIN ENDPOINT**
Generate AI-powered edit suggestions using multi-LLM fusion.

```bash
curl -X POST http://localhost:4650/vision/suggestEdits \
  -H "Content-Type: application/json" \
  -d '{
    "videoPath": "/path/to/video.mp4",
    "platform": "tiktok"
  }'
```

**Response:**
```json
{
  "ok": true,
  "editSuggestion": {
    "videoPath": "/path/to/video.mp4",
    "platform": "tiktok",
    "requiresApproval": true,
    "actions": [
      {
        "id": "action_1",
        "type": "jump_zoom",
        "timestamp": 0.5,
        "duration": 0.3,
        "parameters": { "scale": 1.2, "easing": "ease-out" },
        "reason": "Hook: Add dynamic zoom to grab attention",
        "confidence": 0.85,
        "priority": "critical"
      },
      {
        "id": "action_2",
        "type": "text_overlay",
        "timestamp": 1.0,
        "duration": 2.0,
        "parameters": {
          "text": "WATCH THIS",
          "position": "top",
          "style": "bold"
        },
        "reason": "Hook: Strong text overlay needed",
        "confidence": 0.9,
        "priority": "high"
      },
      {
        "id": "action_3",
        "type": "cut",
        "timestamp": 15.5,
        "parameters": { "cutLength": 0.5 },
        "reason": "Remove low-interest dead frame",
        "confidence": 0.75,
        "priority": "medium"
      }
    ],
    "estimatedImpact": {
      "retentionIncrease": 22,
      "engagementIncrease": 18,
      "viralPotential": 78
    },
    "llmResponses": [
      {
        "provider": "openai",
        "model": "gpt-4o",
        "latency": 2340,
        "timestamp": "2025-01-15T10:30:00Z"
      },
      ...
    ],
    "consensusScore": 82,
    "generatedAt": "2025-01-15T10:30:05Z"
  },
  "message": "Edit suggestions prepared. Review and approve before applying."
}
```

---

### 5. Map Timeline
Convert edit actions to video editor format.

```bash
curl -X POST http://localhost:4650/vision/mapTimeline \
  -H "Content-Type: application/json" \
  -d '{
    "videoPath": "/path/to/video.mp4",
    "actions": [...],
    "editor": "premiere"
  }'
```

**Supported Editors**: `premiere`, `finalcut`, `capcut`

**Response:**
```json
{
  "ok": true,
  "timeline": {
    "editor": "premiere",
    "videoPath": "/path/to/video.mp4",
    "tracks": [...],
    "markers": [...],
    "exportScript": "// Adobe Premiere Pro Script..."
  }
}
```

---

### 6. Live AR Feedback
Real-time feedback during editing (stub).

```bash
# Start session
curl -X POST http://localhost:4650/vision/liveFeedback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123",
    "action": "start",
    "videoPath": "/path/to/video.mp4"
  }'

# Get feedback for frame
curl -X POST http://localhost:4650/vision/liveFeedback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123",
    "action": "feedback",
    "frameNumber": 45,
    "frameAnalysis": {...}
  }'

# Stop session
curl -X POST http://localhost:4650/vision/liveFeedback \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123",
    "action": "stop"
  }'
```

---

### 7. Log Performance
Track edit performance for learning.

```bash
curl -X POST http://localhost:4650/vision/logPerformance \
  -H "Content-Type: application/json" \
  -d '{
    "editId": "edit_123",
    "videoPath": "/path/to/video.mp4",
    "platform": "tiktok",
    "appliedActions": [...],
    "metrics": {
      "views": 125000,
      "engagement": 8.5,
      "ctr": 0.072,
      "completionRate": 0.68,
      "avgWatchTime": 42.5
    }
  }'
```

---

### 8. Get Insights
View performance insights and recommendations.

```bash
curl "http://localhost:4650/vision/insights?platform=tiktok"
```

**Response:**
```json
{
  "ok": true,
  "insights": {
    "totalEdits": 15,
    "avgViews": 95000,
    "avgEngagement": 7.2,
    "avgCTR": 0.065,
    "avgCompletionRate": 0.63,
    "topActions": [
      { "type": "text_overlay", "count": 12, "avgEngagement": 8.5 },
      { "type": "jump_zoom", "count": 10, "avgEngagement": 7.8 },
      { "type": "color_lift", "count": 8, "avgEngagement": 7.1 }
    ],
    "recommendations": [
      "✅ Best performer: 'text_overlay' - use more frequently",
      "🔥 Add text overlays in hook (0-3s) - proven to boost retention"
    ],
    "platform": "tiktok",
    "generatedAt": "2025-01-15T10:35:00Z"
  }
}
```

---

## Architecture

### Multi-LLM Fusion Process
1. **Scene Analysis**: SceneAnalyzer extracts frame-by-frame data
2. **LLM Queries**: FusionVision queries 4 providers in parallel
3. **Consensus**: Fuses responses, deduplicates similar actions
4. **Rule-Based**: Adds deterministic suggestions (hook optimization, dead frame removal)
5. **Prioritization**: Sorts by priority (critical > high > medium > low) and confidence
6. **Impact Estimation**: Calculates expected retention/engagement increase

### Engines
- **SceneAnalyzer**: Frame analysis, hook detection, pacing, color grading
- **FusionVision**: Multi-LLM querying via Bridge (port 4000)
- **EditSuggester**: Edit action generation and prioritization
- **TimelineMapper**: Export to Premiere/FinalCut/CapCut
- **ARFeedbackEngine**: Real-time editing feedback (stub)
- **BrainLogger**: Performance tracking and learning

---

## Integration

### Downstream Services
- **Bridge (4000)**: Multi-LLM provider access
- **Hands v5.0 (4350)**: Video macro execution
- **Creative Suite (5250)**: Creative production pipeline
- **Campaign (5120)**: Campaign orchestration
- **Social (4350)**: Social media posting

### Typical Workflow
```
1. Upload video → Vision v2.6
2. POST /vision/suggestEdits
3. Review actions (requiresApproval: true)
4. Approve edits
5. POST /vision/mapTimeline (generate Premiere script)
6. Apply edits in video editor
7. POST /vision/logPerformance (track results)
8. GET /vision/insights (optimize future edits)
```

---

## Platform Optimization

### TikTok
- Ideal cut frequency: **2.0/s** (fast-paced)
- Hook window: **0-1.5s** (extremely short)
- Focus: High motion, text overlays, speed ramps

### Instagram Reels
- Ideal cut frequency: **1.5/s** (medium-paced)
- Hook window: **0-2s**
- Focus: Visual polish, saturation, face zooms

### YouTube Shorts
- Ideal cut frequency: **2.0/s**
- Hook window: **0-3s**
- Focus: Strong hook, retention, CTA

### YouTube Long-Form
- Ideal cut frequency: **1.0/s** (cinematic)
- Hook window: **0-5s**
- Focus: Story pacing, polish, depth

---

## Configuration

### Environment Variables
```bash
PORT=4650                    # Service port
BRIDGE_URL=http://localhost:4000  # LLM Bridge
```

### Dependencies
- **Fastify**: HTTP server
- **node-fetch**: HTTP client for Bridge integration
- **uuid**: Session ID generation

---

## Development

### Install
```bash
cd codex-vision-2.6
npm install
```

### Build
```bash
npm run build
```

### Run
```bash
npm start
# or dev mode:
npm run dev
```

### Test
```bash
node testVision2.6.mjs
```

---

## Performance

### Latency
- **Frame analysis**: ~100ms
- **Timeline analysis (60s video)**: ~2-3s
- **Multi-LLM fusion**: 2-5s (4 parallel queries)
- **Edit suggestions**: 5-8s total

### Accuracy
- **Consensus score**: 60-90% (higher = more LLM agreement)
- **Face detection**: ~92% confidence
- **Text detection**: ~95% confidence
- **Hook quality**: 3-tier (excellent/good/poor)

---

## Troubleshooting

### "All LLMs unavailable"
- Check Bridge service (port 4000): `curl http://localhost:4000/health`
- Check API keys configured in Bridge

### Low consensus score
- Normal if LLMs have diverse suggestions
- Fallback actions added automatically

### Timeline mapping fails
- Ensure `editor` is one of: `premiere`, `finalcut`, `capcut`
- Verify actions array is valid

---

## Roadmap

### v2.7 (Future)
- [ ] Real AR feedback with OpenCV integration
- [ ] Auto-apply mode (bypass approval)
- [ ] GPU-accelerated frame analysis
- [ ] Audio waveform analysis
- [ ] B-roll suggestion engine

---

## License

MIT

---

**Vision Engine v2.6 ULTRA - Co-Pilot Mode**  
AI-assisted video editing with multi-LLM fusion.  
Service running on port **4650**.
