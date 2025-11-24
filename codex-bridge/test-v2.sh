#!/bin/bash
# Codex Bridge v2 - Quick Test Script

BASE_URL="http://localhost:4000"

echo "=== Codex Bridge v2 Quick Tests ==="
echo

# Test 1: Basic health check
echo "1. Testing v2 health endpoint..."
curl -s "$BASE_URL/codex/bridge/v2/health" | jq -C
echo
echo

# Test 2: Participants endpoint
echo "2. Testing v2 participants endpoint..."
curl -s "$BASE_URL/codex/bridge/v2/participants" | jq -C
echo
echo

# Test 3: Roundtable with mock providers
echo "3. Testing roundtable with mock providers..."
curl -s -X POST "$BASE_URL/codex/bridge/v2/roundtable" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-quick-'$(date +%s)'",
    "goal": "Create a simple REST API health check endpoint",
    "mode": "plan",
    "context": {
      "repoSummary": "Node.js + Fastify REST API",
      "notes": "Quick test of roundtable system"
    },
    "participants": {
      "planner": { "provider": "mock", "model": "mock" },
      "researcher": { "provider": "mock", "model": "mock" },
      "coder": { "provider": "mock", "model": "mock" },
      "critic": { "provider": "mock", "model": "mock" },
      "judge": { "provider": "mock", "model": "mock" }
    }
  }' | jq -C '.sessionId, .goal, .mode, .participantResults[] | {role, provider, error: .error // "none"}'
echo
echo

echo "=== Tests Complete ==="
echo
echo "Next steps:"
echo "  - Replace 'mock' with real providers (openai, gemini, claude, grok)"
echo "  - Set API keys: OPENAI_API_KEY, GOOGLE_API_KEY, ANTHROPIC_API_KEY, XAI_API_KEY"
echo "  - Try different modes: plan, code, debug, review"
echo
