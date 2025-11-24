# Codex Hands v3.2 - Dev Hands Service

Safe file operations, script execution, web automation with stealth mode, and CAPTCHA solving for Codex OS.

## Overview

Codex Hands is a security-focused Fastify service that provides controlled file operations and npm script execution within the Codex workspace. All operations are scoped to `/Users/amar/Codex` with strict path validation and whitelisting.

## Port

- Default: **4300**
- Configurable via `PORT` environment variable

## Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "ok": true,
  "service": "codex-hands"
}
```

### POST /hands/createFile
Create a new file within the Codex workspace.

**Request:**
```json
{
  "path": "relative/path/from/Codex/root.txt",
  "content": "file contents"
}
```

**Response:**
```json
{
  "ok": true,
  "fullPath": "/Users/amar/Codex/relative/path/from/Codex/root.txt"
}
```

**Security:** Path traversal attempts (e.g., `../../../etc/passwd`) are blocked.

### POST /hands/editFile
Edit an existing file or create a new one.

**Request:**
```json
{
  "path": "relative/path/from/Codex/root.txt",
  "content": "new content",
  "mode": "overwrite"  // or "append", default: "overwrite"
}
```

**Response:**
```json
{
  "ok": true,
  "fullPath": "/Users/amar/Codex/relative/path/from/Codex/root.txt",
  "mode": "overwrite"
}
```

**Modes:**
- `overwrite`: Replace entire file content
- `append`: Append content + newline to end of file

### POST /hands/runScript
Execute a whitelisted npm script in a whitelisted project.

**Request:**
```json
{
  "project": "codex-orchestrator",
  "script": "build"
}
```

**Response:**
```json
{
  "ok": true,
  "project": "codex-orchestrator",
  "script": "build",
  "exitCode": 0,
  "stdout": "> codex-orchestrator@0.1.0 build\n> tsc",
  "stderr": ""
}
```

**Whitelisted Projects:**
- `codex-orchestrator`
- `codex-desktop`
- `codex-bridge`
- `codex-brain`
- `codex-hands`

**Whitelisted Scripts:**
- `build`
- `dev`
- `start`

**Security:** Only whitelisted projects and scripts can be executed. Output is truncated to 5KB to prevent massive responses.

---

## Hands v2 - App & File Operations

### POST /hands/openApp
Launch whitelisted macOS applications.

**Request:**
```json
{
  "appName": "Google Chrome",
  "args": ["https://example.com"]  // optional
}
```

**Whitelisted Apps:**
- Google Chrome
- Safari
- Photos
- Preview
- Visual Studio Code
- Spotify
- Finder
- Adobe Photoshop 2024
- Final Cut Pro

### POST /hands/openFile
Open files in default applications.

**Request:**
```json
{
  "path": "test-hands/document.pdf"
}
```

### POST /hands/openFolder
Open folders in Finder.

**Request:**
```json
{
  "path": "test-hands"
}
```

### POST /hands/listDir
List directory contents.

**Request:**
```json
{
  "path": "test-hands"
}
```

**Response:**
```json
{
  "ok": true,
  "fullPath": "/Users/amar/Codex/test-hands",
  "entries": [
    { "name": "hello.txt", "type": "file" },
    { "name": "subfolder", "type": "dir" }
  ]
}
```

---

## Hands v3 - Web Automation (Playwright)

Stealth-mode browser automation with persistent profiles, human-like delays, and anti-detection.

### Environment Variables
```bash
# Optional: Configure persistent profile location (default: /Users/amar/Codex/.codex-playwright-profile)
PLAYWRIGHT_PROFILE_DIR=/path/to/profile
```

### POST /hands/web/open
Open URLs in whitelisted domains.

**Request:**
```json
{
  "sessionId": "web-session-1",
  "url": "https://www.tiktok.com"
}
```

**Whitelisted Domains:**
- tiktok.com, www.tiktok.com
- google.com, www.google.com
- minea.com, app.minea.com
- shopify.com, www.shopify.com

**Stealth Features:**
- Persistent browser profile (cookies/localStorage preserved)
- 1s page settle time after load
- Mouse movement simulation
- Human-like delay (~400ms)

### POST /hands/web/click
Click DOM elements with human-like delay.

**Request:**
```json
{
  "sessionId": "web-session-1",
  "selector": "button.submit-btn"
}
```

**Features:**
- ~300ms human delay (with random jitter)

### POST /hands/web/type
Type text into input fields.

**Request:**
```json
{
  "sessionId": "web-session-1",
  "selector": "input[name='search']",
  "text": "product research",
  "clearFirst": true  // optional
}
```

**Features:**
- ~350ms human delay (with random jitter)
- Optional field clearing before typing

### POST /hands/web/scroll
Scroll page by x/y delta.

**Request:**
```json
{
  "sessionId": "web-session-1",
  "x": 0,  // optional, default: 0
  "y": 500  // optional, default: 500
}
```

---

## Hands v3.2 - CAPTCHA Token Solver

Generic CAPTCHA solving integration for legitimate automation workflows (ecommerce tools, research, etc.).

### Environment Variables
```bash
CAPTCHA_ENABLED=true                                    # Enable/disable CAPTCHA solving
CAPTCHA_API_KEY=your_api_key_here                      # Your CAPTCHA provider API key
CAPTCHA_ENDPOINT=https://api.your-provider.com/solve   # Provider endpoint URL
```

**Supported Providers:**
- Generic token-based services (2Captcha, Anti-Captcha, CapSolver, etc.)
- Configure via ENV variables (provider-agnostic implementation)

### POST /hands/web/solveCaptcha
Request a CAPTCHA token from configured provider.

**Request:**
```json
{
  "sessionId": "captcha-session-1",
  "siteKey": "6LfYourSiteKey...",
  "url": "https://www.tiktok.com",
  "type": "recaptcha_v2"  // optional: recaptcha_v2, recaptcha_v3, hcaptcha, turnstile
}
```

**Response (Success):**
```json
{
  "ok": true,
  "token": "03AGdBq27YourCaptchaToken..."
}
```

**Response (Error):**
```json
{
  "ok": false,
  "error": "Captcha solving is disabled."
}
```

**Security:**
- Domain whitelist enforced (same as web automation)
- Only works with CAPTCHA_ENABLED=true
- Requires valid API key configuration

### POST /hands/web/injectCaptchaToken
Inject solved CAPTCHA token into page.

**Request:**
```json
{
  "sessionId": "captcha-session-1",
  "token": "03AGdBq27YourCaptchaToken...",
  "siteKey": "6LfYourSiteKey..."
}
```

**Response:**
```json
{
  "ok": true,
  "sessionId": "captcha-session-1",
  "message": "Token injected successfully"
}
```

**Implementation:**
- Injects into `textarea[name="g-recaptcha-response"]` or `input[name="g-recaptcha-response"]`
- Works with reCAPTCHA v2/v3 (can be extended for hCaptcha/Turnstile)

### Example CAPTCHA Workflow
```bash
# 1. Open the page with CAPTCHA
curl -X POST "http://localhost:4300/hands/web/open" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"captcha-flow","url":"https://www.google.com"}'

# 2. Request CAPTCHA token
curl -X POST "http://localhost:4300/hands/web/solveCaptcha" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId":"captcha-flow",
    "siteKey":"6LfYourSiteKey...",
    "url":"https://www.google.com",
    "type":"recaptcha_v2"
  }'

# 3. Inject token into page
curl -X POST "http://localhost:4300/hands/web/injectCaptchaToken" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId":"captcha-flow",
    "token":"03AGdBq27...",
    "siteKey":"6LfYourSiteKey..."
  }'

# 4. Submit the form
curl -X POST "http://localhost:4300/hands/web/click" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"captcha-flow","selector":"button[type=submit]"}'
```

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Start (production)
npm start

# Development mode
npm run dev
```

## Security Features

1. **Path Validation**: All file paths are resolved and validated to ensure they don't escape `/Users/amar/Codex`
2. **Project Whitelist**: Only approved Codex projects can have scripts executed
3. **Script Whitelist**: Only safe npm scripts (build, dev, start) are allowed
4. **Output Limiting**: Command output is capped at 5KB to prevent DoS
5. **CORS Enabled**: For integration with Codex UI components

## Testing

```bash
# Test file creation
curl -X POST "http://localhost:4300/hands/createFile" \
  -H "Content-Type: application/json" \
  -d '{"path":"test-hands/hello.txt","content":"Hello from Codex Hands v1"}'

# Test file append
curl -X POST "http://localhost:4300/hands/editFile" \
  -H "Content-Type: application/json" \
  -d '{"path":"test-hands/hello.txt","content":"Second line","mode":"append"}'

# Test script execution
curl -X POST "http://localhost:4300/hands/runScript" \
  -H "Content-Type: application/json" \
  -d '{"project":"codex-hands","script":"build"}'

# Test security (should fail)
curl -X POST "http://localhost:4300/hands/createFile" \
  -H "Content-Type: application/json" \
  -d '{"path":"../../../etc/passwd","content":"hacked"}'
```

## Architecture Notes

- Built with Fastify v5
- TypeScript with ES2022 target
- Node.js native modules (fs/promises, child_process, path)
- No database dependencies
- Stateless operation
- Safe for concurrent requests

## Future Enhancements (v2)

- Task queue for long-running operations
- Webhook callbacks for async operations
- File watching capabilities
- Git operations (commit, push, pull)
- Template file generation
- Multi-file operations (batch create/edit)
