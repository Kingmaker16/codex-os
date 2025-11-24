# Codex Account Safety Engine v1-ULTRA (codex-accounts)

**Port:** 5090  
**Status:** ✅ Operational  
**Mode:** ULTRA_SEGMENTED

## Purpose
Safely manage multi-account posting and automation with segmented risk tiers. Protects high-value accounts while enabling safe experimentation with isolated test accounts.

## Risk Tier Segmentation

### 🟢 SAFE Accounts
- **Purpose:** Primary revenue-generating accounts
- **Initial Risk Score:** 5/100
- **Protection Level:** Maximum
- **Strategy:** Conservative posting, immediate escalation on warnings
- **Example:** @main_brand, @company_official

### 🟡 MEDIUM-RISK Accounts
- **Purpose:** Growth testing and secondary channels
- **Initial Risk Score:** 20/100
- **Protection Level:** Moderate
- **Strategy:** Balanced automation, monitored closely
- **Example:** @test_growth, @backup_channel

### 🔴 EXPERIMENT Accounts
- **Purpose:** High-risk testing and isolated experiments
- **Initial Risk Score:** 40/100
- **Protection Level:** Minimal
- **Strategy:** Aggressive experimentation, disposable
- **Example:** @sandbox_account, @throwaway_test

## Risk Scoring System

**Score Ranges:**
- `0-29`: HEALTHY - Normal operations allowed
- `30-49`: WATCH - Monitor closely, consider throttling
- `50-69`: LIMITED - Reduce activity, use backup accounts
- `70-100`: PAUSED - Stop automation, manual review required

**Risk Events:**
- `WARNING`: +2 points
- `STRIKE`: +5 points
- `BAN`: +10 points
- `VIEW_DROP`: +5 points

## Endpoints

### `GET /health`
Service health check.

**Response:**
```json
{
  "ok": true,
  "service": "codex-accounts",
  "version": "1.0.0",
  "mode": "ULTRA_SEGMENTED"
}
```

### `POST /accounts/register`
Register a new account with risk tier.

**Request:**
```json
{
  "platform": "tiktok" | "youtube" | "instagram",
  "handle": "@account_name",
  "riskTier": "SAFE" | "MEDIUM" | "EXPERIMENT"
}
```

**Response:**
```json
{
  "ok": true,
  "profile": {
    "id": "uuid",
    "platform": "tiktok",
    "handle": "@main_brand",
    "riskTier": "SAFE",
    "createdAt": "2025-11-22T19:13:23.725Z"
  }
}
```

### `GET /accounts/list`
List all registered accounts.

**Response:**
```json
{
  "ok": true,
  "accounts": [
    {
      "id": "uuid",
      "platform": "tiktok",
      "handle": "@main_brand",
      "riskTier": "SAFE",
      "createdAt": "2025-11-22T..."
    }
  ]
}
```

### `POST /accounts/event`
Log an account event (warning, strike, ban, etc.).

**Request:**
```json
{
  "accountId": "uuid",
  "platform": "tiktok",
  "type": "POST" | "LIKE" | "COMMENT" | "FOLLOW" | "BLOCK" | "WARNING" | "STRIKE" | "BAN" | "VIEW_DROP",
  "timestamp": "2025-11-22T19:15:00.000Z",
  "meta": { "reason": "video_removed" }
}
```

### `GET /accounts/summary`
Get summary of all accounts grouped by risk tier.

**Response:**
```json
{
  "ok": true,
  "summary": {
    "safe": [
      {
        "accountId": "uuid",
        "riskTier": "SAFE",
        "riskScore": 7,
        "recentWarnings": 1,
        "recentStrikes": 0,
        "recentBans": 0,
        "status": "HEALTHY"
      }
    ],
    "medium": [...],
    "experiment": [...]
  }
}
```

### `POST /accounts/evaluatePost`
Evaluate whether to allow posting on a specific account.

**Request:**
```json
{
  "accountId": "uuid",
  "platform": "tiktok",
  "contentSummary": "UGC fitness ad with safe hooks",
  "tags": ["fitness", "workout"]
}
```

**Response:**
```json
{
  "ok": true,
  "decision": {
    "ok": true,
    "accountId": "uuid",
    "platform": "tiktok",
    "riskTier": "SAFE",
    "riskScore": 7,
    "recommendedAction": "ALLOW" | "THROTTLE" | "USE_BACKUP_ACCOUNT" | "DENY",
    "notes": "Account healthy."
  }
}
```

## Decision Logic

**HEALTHY Status (0-29):**
- SAFE accounts: ALLOW
- MEDIUM accounts: ALLOW
- EXPERIMENT accounts: ALLOW

**WATCH Status (30-49):**
- SAFE accounts: THROTTLE
- MEDIUM accounts: ALLOW
- EXPERIMENT accounts: ALLOW

**LIMITED Status (50-69):**
- SAFE accounts: USE_BACKUP_ACCOUNT
- MEDIUM accounts: THROTTLE
- EXPERIMENT accounts: THROTTLE

**PAUSED Status (70-100):**
- SAFE accounts: USE_BACKUP_ACCOUNT
- MEDIUM accounts: DENY
- EXPERIMENT accounts: DENY

## Installation

```bash
cd ~/Codex/codex-accounts
npm install
npm run build
npm start &
```

## Example Workflow

```bash
# 1. Register accounts
curl -X POST http://localhost:5090/accounts/register \
  -H "Content-Type: application/json" \
  -d '{"platform":"tiktok","handle":"@main_brand","riskTier":"SAFE"}'

# 2. Check if posting is safe
curl -X POST http://localhost:5090/accounts/evaluatePost \
  -H "Content-Type: application/json" \
  -d '{"accountId":"<uuid>","platform":"tiktok","contentSummary":"Fitness tutorial"}'

# 3. Log a warning event
curl -X POST http://localhost:5090/accounts/event \
  -H "Content-Type: application/json" \
  -d '{"accountId":"<uuid>","platform":"tiktok","type":"WARNING","timestamp":"2025-11-22T..."}'

# 4. Re-evaluate (risk score should be higher)
curl -X POST http://localhost:5090/accounts/evaluatePost \
  -H "Content-Type: application/json" \
  -d '{"accountId":"<uuid>","platform":"tiktok","contentSummary":"Another video"}'

# 5. Get summary of all accounts
curl http://localhost:5090/accounts/summary
```

## Integration with Codex OS

**Social Engine Integration:**
Before posting content via codex-social, call `/accounts/evaluatePost` to check if the target account is safe to use. If `recommendedAction` is `USE_BACKUP_ACCOUNT`, route the content to a MEDIUM or EXPERIMENT account instead.

**Orchestrator Integration:**
The orchestrator can query `/accounts/summary` before executing social posting tasks to ensure no SAFE accounts are in LIMITED or PAUSED status.

**Simulation Engine Integration:**
codex-sim can use `/accounts/evaluatePost` in dry-run mode to test content without risking real accounts.

## Safety Features

✅ **Segmented Isolation:** SAFE accounts protected from risky experiments  
✅ **Risk Scoring:** Automatic calculation based on platform events  
✅ **Smart Throttling:** Gradual slowdown before full pause  
✅ **Backup Routing:** Recommends alternative accounts when primary is risky  
✅ **Event Logging:** Full audit trail of warnings, strikes, bans  
✅ **Unknown Account Protection:** Denies posting to unregistered accounts

## Compliance Notes

This engine focuses on **account safety and risk management**, not platform rule evasion. It:
- ✅ Tracks account health and platform warnings
- ✅ Prevents posting to high-risk accounts
- ✅ Isolates experiments from revenue accounts
- ❌ Does NOT attempt to bypass platform detection
- ❌ Does NOT provide anti-detection tools
- ❌ Does NOT circumvent platform policies

## Version History

- **v1.0.0** (2025-11-22): Initial release
  - 3-tier segmentation (SAFE/MEDIUM/EXPERIMENT)
  - Risk scoring and status tracking
  - Post evaluation decision engine
  - In-memory state (no persistence)
