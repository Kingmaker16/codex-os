# Social Engine v1.5 — Video Upload Pipeline & Content Intelligence

**Status**: ✅ Operational (Port 4800)  
**Mode**: Multi-Account  
**Version**: 1.5.0

---

## Overview

Social Engine v1.5 is a **production-ready video upload pipeline** with AI-powered content intelligence for TikTok, YouTube Shorts, and Instagram Reels. Combines multi-account management, automated posting, AI caption generation, trend analysis, and revenue tracking.

**Supported Platforms**:
- 🎵 **TikTok** — Video posting, creator fund analytics
- 📺 **YouTube** — Shorts uploads, monetization tracking
- 📸 **Instagram** — Reels posting, engagement metrics
- 📧 **Gmail** — Email automation

**Key Features**:
- **🎬 Video Upload Pipeline** — Multi-platform upload orchestration
- **🤖 AI Caption Generation** — GPT-4 powered titles, captions, and hashtags
- **📅 Content Planning** — Optimal scheduling based on platform best times
- **📈 Trend Scanner** — Real-time trending topics and hashtags
- **💰 Revenue Tracking** — Automatic sync to Monetization Engine
- Multi-account profile management
- Automated login with CAPTCHA solving (Hands v4 + Vision v2.5)
- Post scheduling with retry logic
- Dashboard scraping for analytics
- Growth insights from Knowledge Engine v2
- Full audit trail in Brain

---

## Architecture

### Integration Points

**Hands v4** (Port 4300):
- Browser automation (open URLs, click, type, upload)
- Multi-platform video uploads (TikTok, YouTube, Instagram)
- UI element interaction and CAPTCHA solving
- Trending page navigation

**Vision Engine v2.5** (Port 4600):
- Dashboard detection and analysis
- Login state verification
- Upload confirmation screenshots
- Trending topic extraction

**Knowledge Engine v2** (Port 4500):
- Content strategy generation
- Platform-specific best practices
- Trend pattern analysis
- Niche-specific growth strategies

**Orchestrator/Bridge** (Port 4200):
- AI caption generation (GPT-4)
- Title optimization
- Hashtag suggestions

**Monetization Engine** (Port 4850):
- Revenue tracking (creator fund, Shorts RPM)
- Cost logging (automation expenses)
- Platform-specific RPM: TikTok $0.02/1k, YouTube $3/1k, Instagram $0.01/1k

**Brain** (Port 4100):
- Session logging (codex-social-*)
- Upload audit trail
- Content plan history
- Metrics sync logs

### Account Storage

Accounts are stored in `.codex-social-accounts.json` with:
```json
{
  "id": "acc_1234567890_xyz",
  "platform": "tiktok",
  "username": "myhandle",
  "email": "user@example.com",
  "loginState": "logged_in",
  "niche": "trading",
  "postingStyle": "educational",
  "proxy": "http://proxy:8080",
  "retentionToken": "encrypted_session",
  "createdAt": "2025-11-22T06:00:00.000Z",
  "lastLogin": "2025-11-22T08:00:00.000Z"
}
```

### Scheduler

Background scheduler runs every 60 seconds checking for due posts:
- Executes **scheduled posts** automatically (legacy single posts)
- Executes **planned posts** via upload pipeline (v1.5)
- Retries up to 3 times on failure
- Reschedules 5 minutes later on retry
- Logs all operations to Brain

**Planned Posts** (`.codex-social-planned.json`):
```json
{
  "id": "plan_abc123",
  "accountId": "acc_xyz",
  "platform": "tiktok",
  "scheduledFor": "2025-12-01T14:00:00.000Z",
  "status": "planned",
  "videoPath": "/path/to/video.mp4",
  "caption": "AI-generated caption",
  "title": "AI-generated title",
  "tags": ["#fyp", "#trading", "#viral"]
}
```

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
  "service": "codex-social",
  "version": "1.5.0",
  "mode": "multi-account",
  "features": ["upload", "captions", "planning", "trends", "metrics"]
}
```

---

## 🎬 v1.5 New Endpoints

### Upload Video to Platforms
```bash
POST /social/upload
Content-Type: application/json
```
**Body**:
```json
{
  "accountId": "acc_xyz",
  "videoPath": "/path/to/video.mp4",
  "platforms": ["tiktok", "youtube", "instagram"],
  "script": "Video transcript or description",
  "niche": "fitness",
  "brandTone": "motivational",
  "title": "Optional pre-generated title",
  "caption": "Optional pre-generated caption",
  "tags": ["#optional", "#predefined"]
}
```
**Response**:
```json
{
  "success": true,
  "results": [
    {
      "platform": "tiktok",
      "ok": true,
      "message": "Upload confirmed via dashboard check",
      "url": "https://tiktok.com/@user/video/123"
    }
  ]
}
```

### Generate AI Caption
```bash
POST /social/generateCaption
Content-Type: application/json
```
**Body**:
```json
{
  "platform": "tiktok",
  "niche": "fitness",
  "script": "Optional video transcript",
  "brandTone": "motivational"
}
```
**Response**:
```json
{
  "success": true,
  "title": "Transform Your Life in 30 Days 💪",
  "caption": "Ready to level up? Follow these 3 steps...",
  "tags": ["#fitness", "#motivation", "#fyp", "#viral", "#transformation"]
}
```

### Create Content Plan
```bash
POST /social/plan
Content-Type: application/json
```
**Body**:
```json
{
  "accountId": "acc_xyz",
  "days": 7,
  "perDay": 3
}
```
**Response**:
```json
{
  "success": true,
  "accountId": "acc_xyz",
  "plan": [
    {
      "id": "plan_abc123",
      "platform": "tiktok",
      "scheduledFor": "2025-12-01T09:00:00.000Z",
      "caption": "Morning motivation post...",
      "tags": ["#fitness", "#morningvibes"]
    }
  ],
  "message": "Created 21 planned posts over 7 days"
}
```

### Get Trending Topics
```bash
GET /social/trends?platform=tiktok&niche=fitness
```
**Response**:
```json
{
  "success": true,
  "platform": "tiktok",
  "niche": "fitness",
  "insights": [
    {
      "topic": "75 Hard Challenge",
      "examples": ["@user1 Day 45", "@user2 Transformation"],
      "performanceHint": "High engagement on progress updates"
    }
  ]
}
```

### Sync Metrics to Monetization Engine
```bash
POST /social/metrics/sync
```
**Response**:
```json
{
  "success": true,
  "message": "Metrics synced to Monetization Engine"
}
```

---

## v1.0 Endpoints

### Create Account
```bash
POST /social/createAccount
Content-Type: application/json
```
**Body**:
```json
{
  "platform": "tiktok",
  "email": "user@example.com",
  "username": "myhandle",
  "niche": "trading",
  "postingStyle": "educational",
  "proxy": "http://proxy:8080"
}
```
**Response**:
```json
{
  "success": true,
  "account": {
    "id": "acc_1234567890_xyz",
    "platform": "tiktok",
    "loginState": "pending",
    ...
  }
}
```

### Login to Account
```bash
POST /social/login
Content-Type: application/json
```
**Body**:
```json
{
  "accountId": "acc_1234567890_xyz",
  "useCaptchaSolver": true
}
```
**Response**:
```json
{
  "success": true,
  "message": "Logged in to tiktok",
  "account": { ... }
}
```

**Process**:
1. Opens login page with Hands v4
2. Detects form elements with Vision v2.5
3. Enters credentials
4. Solves CAPTCHA if present
5. Verifies login success
6. Stores retention token

### Post Content Immediately
```bash
POST /social/post
Content-Type: application/json
```
**Body**:
```json
{
  "accountId": "acc_1234567890_xyz",
  "platform": "tiktok",
  "content": {
    "text": "Check out this trading strategy! #trading #stocks",
    "media": ["/path/to/video.mp4"],
    "tags": ["trading", "stocks"]
  }
}
```
**Response**:
```json
{
  "success": true,
  "message": "Posted to tiktok",
  "accountId": "acc_1234567890_xyz"
}
```

### Schedule Post
```bash
POST /social/schedule
Content-Type: application/json
```
**Body**:
```json
{
  "accountId": "acc_1234567890_xyz",
  "platform": "youtube",
  "content": {
    "title": "How to Trade Options",
    "description": "Complete guide to options trading...",
    "media": ["/path/to/video.mp4"],
    "tags": ["trading", "options"]
  },
  "scheduledFor": "2025-11-23T10:00:00.000Z"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Post scheduled",
  "post": {
    "id": "post_1234567890_xyz",
    "status": "pending",
    ...
  }
}
```

### Get Analytics
```bash
GET /social/analytics?accountId=acc_1234567890_xyz
```
**Response**:
```json
{
  "success": true,
  "analytics": {
    "accountId": "acc_1234567890_xyz",
    "platform": "tiktok",
    "metrics": {
      "followers": 12500,
      "views": 450000,
      "likes": 35000,
      "engagement": 7.8
    },
    "timestamp": "2025-11-22T08:00:00.000Z"
  },
  "insights": {
    "niche": "trading",
    "insights": "Focus on short-form educational content...",
    "skills": [...]
  }
}
```

**Process**:
1. Opens dashboard with Hands v4
2. Takes screenshot
3. Analyzes with Vision v2.5 OCR
4. Extracts metrics (followers, views, likes, etc.)
5. Queries Knowledge Engine for growth insights
6. Returns combined data

### Open Dashboard
```bash
POST /social/openDashboard
Content-Type: application/json
```
**Body**:
```json
{
  "accountId": "acc_1234567890_xyz"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Dashboard opened",
  "data": {
    "isLoggedIn": true,
    "username": "myhandle",
    "analytics": { ... }
  }
}
```

### Get All Accounts
```bash
GET /social/accounts
GET /social/accounts?platform=tiktok
```
**Response**:
```json
{
  "success": true,
  "count": 5,
  "accounts": [...]
}
```

### Get Scheduled Posts
```bash
GET /social/scheduled
GET /social/scheduled?status=pending
```
**Response**:
```json
{
  "success": true,
  "count": 3,
  "posts": [
    {
      "id": "post_1234567890_xyz",
      "accountId": "acc_...",
      "platform": "youtube",
      "scheduledFor": "2025-11-23T10:00:00.000Z",
      "status": "pending",
      "retries": 0
    }
  ]
}
```

---

## Platform-Specific Details

### TikTok
- **Login**: Email/phone + password
- **CAPTCHA**: Slide puzzle (Vision-based solving)
- **Upload**: Drag-and-drop video
- **Caption**: Text field with hashtags
- **Max Video**: 10 minutes

### YouTube
- **Login**: Google OAuth
- **Upload**: YouTube Studio interface
- **Metadata**: Title, description, tags, thumbnail
- **Visibility**: Public, unlisted, private
- **Max Video**: 15 minutes (unverified), 12 hours (verified)

### Instagram
- **Login**: Username/email + password
- **CAPTCHA**: Image selection
- **Upload**: Photo or video (Reels)
- **Caption**: Text with mentions and hashtags
- **Max Video**: 60 seconds (Reels)

### Gmail
- **Login**: Google OAuth
- **Compose**: Subject + body
- **Attachments**: Supported
- **Scheduling**: Native Gmail feature

---

## Usage Examples

### Create and Login to TikTok Account
```bash
# Create account
curl -X POST http://localhost:4800/social/createAccount \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "email": "trader@example.com",
    "username": "traderpro",
    "niche": "trading"
  }'

# Response: { "account": { "id": "acc_123..." } }

# Login
curl -X POST http://localhost:4800/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acc_123...",
    "useCaptchaSolver": true
  }'
```

### Post to YouTube Immediately
```bash
curl -X POST http://localhost:4800/social/post \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acc_456...",
    "platform": "youtube",
    "content": {
      "title": "Day Trading Strategy for Beginners",
      "description": "Learn my favorite scalping strategy...",
      "media": ["/Users/amar/Videos/trading-guide.mp4"],
      "tags": ["trading", "stocks", "daytrading"]
    }
  }'
```

### Schedule Instagram Post
```bash
curl -X POST http://localhost:4800/social/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acc_789...",
    "platform": "instagram",
    "content": {
      "text": "New trading setup 📈 #trading #forex",
      "media": ["/Users/amar/Photos/chart-analysis.jpg"]
    },
    "scheduledFor": "2025-11-22T18:00:00.000Z"
  }'
```

### Get Analytics
```bash
curl "http://localhost:4800/social/analytics?accountId=acc_123..."
```

---

## Configuration

### Whitelisted Domains
Only these domains are allowed for automation (safety):
- tiktok.com
- youtube.com
- instagram.com
- gmail.com
- google.com
- accounts.google.com
- studio.youtube.com
- business.tiktok.com

### Scheduler Settings
```typescript
scheduler: {
  enabled: true,
  checkInterval: 60000,  // Check every 60 seconds
  maxRetries: 3           // Retry failed posts 3 times
}
```

---

## Development

### Local Development
```bash
cd /Users/amar/Codex/codex-social
npm run dev
```

### Build
```bash
npm run build
```

### Start (Production)
```bash
npm start
# or
node dist/index.js
```

---

## Troubleshooting

### Login fails with CAPTCHA
Enable CAPTCHA solver:
```json
{
  "accountId": "acc_123...",
  "useCaptchaSolver": true
}
```

Ensure Vision Engine v2.5 is running on port 4600.

### Post upload fails
Check if logged in:
```bash
curl "http://localhost:4800/social/analytics?accountId=acc_123..."
```

If `isLoggedIn: false`, call `/social/login` first.

### Scheduler not running
Check config:
```typescript
CONFIG.scheduler.enabled = true
```

View pending posts:
```bash
curl "http://localhost:4800/social/scheduled?status=pending"
```

### Account not found
List all accounts:
```bash
curl http://localhost:4800/social/accounts
```

Verify account ID in `.codex-social-accounts.json`.

---

## Security Notes

⚠️ **Credentials**: This version uses placeholder logic. In production:
- Store passwords in encrypted vault
- Use OAuth tokens where possible
- Rotate retention tokens regularly

⚠️ **Rate Limits**: Respect platform rate limits:
- TikTok: ~5 posts/day per account
- YouTube: 6 uploads/day (new accounts)
- Instagram: ~10-15 posts/day

⚠️ **Proxies**: Use residential proxies for multi-account management to avoid detection.

---

## Future Enhancements

- [ ] Add Twitter/X platform
- [ ] Add LinkedIn platform
- [ ] Implement credential encryption
- [ ] Add post analytics tracking
- [ ] Add engagement automation (likes, comments)
- [ ] Add story/reels scheduling
- [ ] Add A/B testing for content
- [ ] Add hashtag research integration
- [ ] Add content calendar visualization
- [ ] Add performance notifications

---

**Social Engine v1 Installed Successfully.**  
**Ready for multi-account social media automation.**

Manage unlimited accounts across TikTok, YouTube, Instagram, and Gmail with AI-powered automation, scheduling, and analytics.
