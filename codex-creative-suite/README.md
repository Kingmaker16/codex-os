# Creative Suite Enhancement v1.5 ULTRA

**Multi-LLM Fusion Creative Production Engine** for high-quality social media content generation.

## Overview

The Creative Suite Enhancement combines 10 specialized engines to generate, analyze, and optimize viral content for TikTok, Reels, YouTube Shorts, and other platforms. It uses multi-LLM fusion (GPT-4o, Claude, Gemini, Grok) to create comprehensive creative plans with scene detection, viral pacing, brand voice enforcement, and trend alignment.

## Architecture

**Port**: 5250  
**Version**: 1.5.0  
**Type**: Fastify REST API

### Engines

1. **Fusion Creative** - Multi-LLM fusion for creative planning
2. **Creative Kernel** - Performance learning and optimization
3. **Scene Detect** - Video scene segmentation
4. **Shot Planner** - Viral pacing optimization
5. **Caption Engine** - Subtitle timing and caption generation
6. **Thumbnail Engine** - Photoshop automation for thumbnails
7. **Audio Enhancer** - Loudness normalization and audio processing
8. **Brand Voice** - Amar's brand voice enforcement
9. **Trend Alignment** - Integration with Trends Engine (5060)
10. **Integration Pipelines** - Downstream service connections

### Integrations

- **Bridge (4000)** - Multi-provider LLM access
- **Trends (5060)** - Current trend analysis
- **Campaign (5120)** - Campaign creative integration
- **Video (4700)** - Video generation enhancement
- **Engagement (5110)** - Engagement scoring
- **Social (4350)** - Direct social posting
- **E-Commerce (5100)** - Product creative linking

## Installation

```bash
cd /Users/amar/Codex/codex-creative-suite
npm install
npm run build
npm start
```

## API Endpoints

### Health Check

**GET** `/health`

Check service status and engine availability.

```bash
curl http://localhost:5250/health
```

Response:
```json
{
  "ok": true,
  "service": "codex-creative-suite",
  "version": "1.5.0",
  "engines": { ... }
}
```

---

### Scene Analysis + Shot Planning

**POST** `/creative/analyze`

Analyze video scenes and generate optimal shot plan.

```bash
curl -X POST http://localhost:5250/creative/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "videoPath": "/path/to/video.mp4",
    "platform": "tiktok"
  }'
```

Response:
```json
{
  "ok": true,
  "sceneAnalysis": {
    "videoPath": "...",
    "duration": 60,
    "scenes": [ ... ],
    "visualComplexity": 0.65,
    "motionIntensity": 0.75,
    "faceDetections": [ ... ]
  },
  "shotPlan": {
    "totalDuration": 60,
    "segments": [ ... ],
    "hookWindow": { "start": 0, "end": 3 },
    "peakMoment": 24.0
  },
  "keyFrames": [0.5, 12.3, 24.0, 36.7, 48.2],
  "cutSuggestions": [3.0, 5.5, 8.2, ...],
  "retentionScore": 85
}
```

---

### Full Creative Plan (Multi-LLM Fusion)

**POST** `/creative/plan`

Generate comprehensive creative plan using multi-LLM fusion.

```bash
curl -X POST http://localhost:5250/creative/plan \
  -H "Content-Type: application/json" \
  -d '{
    "videoPath": "/path/to/video.mp4",
    "platform": "tiktok",
    "objective": "viral",
    "brandVoice": "amar",
    "trendAlign": true
  }'
```

Response:
```json
{
  "ok": true,
  "creativePlan": {
    "videoPath": "...",
    "platform": "tiktok",
    "hookSuggestions": ["Stop scrolling!", "You won't believe this", ...],
    "pacingPlan": { ... },
    "scriptSuggestions": [ ... ],
    "ctaSuggestions": [ ... ],
    "emotionalBeats": [ ... ],
    "thumbnailConcepts": [ ... ],
    "captionPlan": { ... },
    "audioPlan": { ... },
    "trendAlignment": {
      "matchedTrends": ["viral growth hacks", ...],
      "trendScore": 85,
      "hashtags": ["#viral", "#fyp", ...]
    },
    "brandVoiceScore": 92,
    "consensusScore": 78,
    "llmResponses": [ ... ]
  }
}
```

---

### Video Enhancement

**POST** `/creative/enhanceVideo`

Enhance video with audio normalization, color correction, pacing optimization.

```bash
curl -X POST http://localhost:5250/creative/enhanceVideo \
  -H "Content-Type: application/json" \
  -d '{
    "videoPath": "/path/to/video.mp4",
    "platform": "tiktok",
    "enhancements": ["audio", "color", "pacing"]
  }'
```

---

### Thumbnail Generation

**POST** `/creative/generateThumbnail`

Generate thumbnail concepts with Photoshop automation scripts.

```bash
curl -X POST http://localhost:5250/creative/generateThumbnail \
  -H "Content-Type: application/json" \
  -d '{
    "videoPath": "/path/to/video.mp4",
    "platform": "youtube",
    "count": 3
  }'
```

Response:
```json
{
  "ok": true,
  "concepts": [
    {
      "concept": "Close-up face with emotional expression + bold contrasting text",
      "elements": ["face", "text_overlay", "high_contrast"],
      "colorScheme": ["#FF0000", "#FFFF00", "#000000"],
      "textOverlay": "OMG 😱",
      "visualHook": "Shocked facial expression with eye-catching text",
      "estimatedCTR": 0.08
    },
    ...
  ],
  "keyFrames": [1.0, 12.3, 24.0],
  "photoshopScript": "..."
}
```

---

### Caption Generation

**POST** `/creative/generateCaptions`

Generate captions, subtitle timing, and overlay text.

```bash
curl -X POST http://localhost:5250/creative/generateCaptions \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "videoScript": "Check out this amazing transformation...",
    "hooks": ["Stop scrolling!", "Watch this"]
  }'
```

Response:
```json
{
  "ok": true,
  "captionPlan": {
    "mainCaption": "🔥 Stop scrolling! 🎵\n\nFollow for more tips! 🚀",
    "alternates": [ ... ],
    "hashtags": ["#viral", "#fyp", "#trending", ...],
    "timing": [
      { "text": "WATCH THIS", "start": 0.5, "end": 2.0, "position": "top", "style": "bold" },
      ...
    ],
    "hooks": ["Stop scrolling!", "Watch this"]
  },
  "srtContent": "1\n00:00:00,500 --> 00:00:02,000\nWATCH THIS\n\n...",
  "keyPhrases": ["amazing transformation", "follow for more", ...]
}
```

---

### Brand Voice Check

**POST** `/creative/brandVoiceCheck`

Check if text aligns with Amar's brand voice.

```bash
curl -X POST http://localhost:5250/creative/brandVoiceCheck \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Leveraging synergies to move the needle on your social media paradigm."
  }'
```

Response:
```json
{
  "ok": true,
  "brandCheck": {
    "originalText": "...",
    "score": 35,
    "violations": [
      {
        "type": "language",
        "severity": "high",
        "description": "Corporate jargon detected: leveraging, synergies, move the needle, paradigm",
        "suggestion": "Use simple, direct language instead"
      }
    ],
    "suggestions": [ ... ],
    "alignedVersion": "Use these strategies to boost your social media growth."
  },
  "examples": [ ... ],
  "guidelines": { ... }
}
```

---

### Trend Alignment

**POST** `/creative/trendAlign`

Align content with current platform trends.

```bash
curl -X POST http://localhost:5250/creative/trendAlign \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "content": "Here's how to grow your TikTok account fast!",
    "niche": "social_media_growth"
  }'
```

Response:
```json
{
  "ok": true,
  "trendAlignment": {
    "matchedTrends": ["viral growth hacks", "content strategy"],
    "trendScore": 87,
    "suggestions": [ ... ],
    "hashtags": ["#viral", "#growth", "#hacks", ...]
  },
  "trendingAudio": ["Original sound - Trending Creator", ...]
}
```

---

### Integration Pipeline

**POST** `/creative/integrate`

Send creative plan to downstream services.

```bash
curl -X POST http://localhost:5250/creative/integrate \
  -H "Content-Type: application/json" \
  -d '{
    "creativePlan": { ... },
    "destinations": {
      "postToSocial": true,
      "addToCampaign": "campaign_123",
      "analyzeEngagement": true
    }
  }'
```

Response:
```json
{
  "ok": true,
  "integration": {
    "success": true,
    "steps": [
      { "step": "Campaign Integration", "success": true, "message": "..." },
      { "step": "Engagement Analysis", "success": true, "message": "..." },
      { "step": "Social Posting", "success": true, "message": "..." }
    ]
  }
}
```

---

### Integration Health Check

**GET** `/creative/integrationHealth`

Check health of downstream service integrations.

```bash
curl http://localhost:5250/creative/integrationHealth
```

---

### Record Performance

**POST** `/creative/recordPerformance`

Record creative performance metrics for learning.

```bash
curl -X POST http://localhost:5250/creative/recordPerformance \
  -H "Content-Type: application/json" \
  -d '{
    "creativeId": "creative_123",
    "platform": "tiktok",
    "views": 125000,
    "engagement": 8500,
    "ctr": 0.068,
    "completionRate": 0.72,
    "conversions": 340
  }'
```

---

### Get Insights

**GET** `/creative/insights?platform=tiktok`

Get global performance insights and recommendations.

```bash
curl "http://localhost:5250/creative/insights?platform=tiktok"
```

Response:
```json
{
  "ok": true,
  "insights": [
    "Average CTR: 6.80%",
    "Average Completion Rate: 72.0%",
    "Top CTR: 8.50% (creative_123)"
  ],
  "topHooks": [
    "Stop scrolling right now",
    "I can't believe this works",
    "POV: You just discovered",
    ...
  ],
  "recommendedHashtags": ["#viral", "#fyp", "#trending", ...]
}
```

## Usage Examples

### Complete Workflow

1. **Analyze video**:
```bash
curl -X POST http://localhost:5250/creative/analyze \
  -d '{"videoPath":"/video.mp4","platform":"tiktok"}'
```

2. **Generate creative plan**:
```bash
curl -X POST http://localhost:5250/creative/plan \
  -d '{"videoPath":"/video.mp4","platform":"tiktok","brandVoice":"amar"}'
```

3. **Check brand voice**:
```bash
curl -X POST http://localhost:5250/creative/brandVoiceCheck \
  -d '{"text":"Your caption here"}'
```

4. **Generate thumbnails**:
```bash
curl -X POST http://localhost:5250/creative/generateThumbnail \
  -d '{"videoPath":"/video.mp4","platform":"youtube"}'
```

5. **Integrate and post**:
```bash
curl -X POST http://localhost:5250/creative/integrate \
  -d '{"creativePlan":{...},"destinations":{"postToSocial":true}}'
```

6. **Record performance**:
```bash
curl -X POST http://localhost:5250/creative/recordPerformance \
  -d '{"creativeId":"123","platform":"tiktok","views":10000,...}'
```

## Features

### Multi-LLM Fusion
- Queries GPT-4o, Claude, Gemini, Grok in parallel
- Fuses responses into consensus creative plan
- Fallback support if LLMs unavailable

### Brand Voice Enforcement
- Amar's tone: direct, confident, no-BS, energetic
- Detects corporate jargon, passive voice, vague language
- Generates aligned alternatives automatically

### Trend Alignment
- Integrates with Trends Engine (5060)
- Matches content with current trends
- Suggests trending hashtags and audio

### Performance Learning
- Records creative performance metrics
- Generates insights and recommendations
- Optimizes future creative plans based on data

### Scene Detection
- Analyzes visual complexity and motion
- Detects faces and text overlays
- Identifies key frames for thumbnails

### Shot Planning
- Viral pacing optimization
- Hook window (0-3s), peak moment, CTA window
- Platform-specific cut frequency

### Thumbnail Generation
- Multiple concept variations
- Photoshop automation scripts
- A/B testing support

### Caption Engine
- Subtitle timing and SRT generation
- Platform-specific hashtags
- Emoji enhancement

### Audio Enhancement
- Loudness normalization (LUFS standard)
- Sound effect placement
- Background music mixing

### Integration Pipelines
- Campaign Engine integration
- Social posting automation
- E-commerce product linking
- Engagement analysis

## Configuration

### Environment Variables

```bash
PORT=5250  # Server port (default: 5250)
```

### Service Dependencies

- **Bridge (4000)**: Required for multi-LLM fusion
- **Trends (5060)**: Optional, graceful degradation
- **Campaign (5120)**: Optional, for campaign integration
- **Video (4700)**: Optional, for video generation
- **Engagement (5110)**: Optional, for engagement analysis
- **Social (4350)**: Optional, for social posting
- **E-Commerce (5100)**: Optional, for product linking

## Performance

- Multi-LLM query latency: ~2-5s (parallel)
- Scene analysis: ~2s per video
- Creative plan generation: ~3-7s
- Trend alignment: ~1-2s
- Brand voice check: <100ms

## Limitations

1. **LLM Availability**: Requires Bridge service (4000) for multi-LLM fusion
2. **Scene Detection**: Simulated (production would use FFmpeg/OpenCV)
3. **Photoshop Automation**: Scripts generated, manual execution required
4. **Audio Processing**: Commands generated, actual processing requires FFmpeg

## Troubleshooting

**Bridge unavailable**: Creative plans fall back to template-based generation

**Trends Engine down**: Uses default trend data by platform

**Social posting fails**: Check Hands v5.0 (4350) and account registration

**Brand voice score low**: Use `alignedVersion` from brand check response

## Development

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run in background
npm start &
```

## Architecture Notes

- **Stateless**: Each request is independent
- **Graceful Degradation**: Continues working if integrations unavailable
- **Performance Learning**: Improves over time with recorded metrics
- **Multi-LLM Consensus**: Higher quality than single LLM

## License

MIT

## Author

Amar - Codex OS

---

**Status**: ✅ OPERATIONAL  
**Version**: 1.5.0 ULTRA  
**Port**: 5250  
**Endpoints**: 11
