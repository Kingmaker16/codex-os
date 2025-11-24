#!/usr/bin/env bash

echo "======================================="
echo "  CODEX FULL SYSTEM SIMULATION TEST v1 "
echo "======================================="
echo

set -e

echo "STEP 0: CORE HEALTH CHECKS"
echo "---------------------------"
echo "Orchestrator:"
curl -s http://localhost:4200/orchestrator/status | jq .
echo
echo "Mesh:"
curl -s http://localhost:5565/health | jq .
echo
echo "Self-Regulation (SRL):"
curl -s http://localhost:5540/health | jq .
echo
echo "Hardening:"
curl -s http://localhost:5555/health | jq .
echo

echo "STEP 1: STRATEGY SIMULATION"
echo "---------------------------"
curl -s -X POST http://localhost:4200/orchestrator/quickRun \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sim-smartbottle-strategy-1",
    "mode": "SIMULATION",
    "command": "Plan a 7-day TikTok + YouTube Shorts strategy for Smart Bottle Pro in the home fitness niche."
  }' | jq .
echo

echo "STEP 2: MESH PLAN (DRY_RUN)"
echo "---------------------------"
MESH_PLAN=$(curl -s -X POST http://localhost:5565/mesh/create \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sim-smartbottle-mesh-1",
    "domain": "social",
    "goal": "Plan, validate, and dry-run workflows for 7 days of Smart Bottle Pro content.",
    "mode": "DRY_RUN"
  }')
echo "$MESH_PLAN" | jq .
PLAN_ID=$(echo "$MESH_PLAN" | jq -r '.plan.id')
echo "Mesh plan ID: $PLAN_ID"
echo

echo "STEP 3: EXECUTE MESH STEPS (DRY_RUN)"
echo "-------------------------------------"
for i in 1 2 3 4; do
  echo "Executing mesh step $i..."
  curl -s -X POST http://localhost:5565/mesh/step \
    -H "Content-Type: application/json" \
    -d "{ \"planId\": \"${PLAN_ID}\" }" | jq .
  echo
done

echo "STEP 4: WORKFLOW SIMULATION"
echo "---------------------------"
WF_CREATE=$(curl -s -X POST http://localhost:5430/workflow/create \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "smart-bottle-pro",
    "goal": "Plan, create, and schedule 7 days of Smart Bottle Pro content for TikTok + Shorts.",
    "sessionId": "sim-smartbottle-wf-1"
  }')
echo "$WF_CREATE" | jq .
WF_ID=$(echo "$WF_CREATE" | jq -r '.workflow.id')
echo "Workflow ID: $WF_ID"
echo

echo "Starting workflow..."
curl -s -X POST http://localhost:5430/workflow/start \
  -H "Content-Type: application/json" \
  -d "{ \"workflowId\": \"${WF_ID}\" }" | jq .
echo

echo "Continuing workflow (3 steps)..."
for i in 1 2 3; do
  curl -s -X POST http://localhost:5430/workflow/continue \
    -H "Content-Type: application/json" \
    -d "{ \"workflowId\": \"${WF_ID}\" }" | jq .
  echo
done

echo "STEP 5: ROUTING + DISTRIBUTION SIMULATION"
echo "------------------------------------------"
echo "Routing decision:"
curl -s -X POST http://localhost:5560/routing/decide \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sim-smartbottle-route-1",
    "contentId": "sim-content-001",
    "contentType": "UGC_AD",
    "niche": "home fitness",
    "language": "en",
    "priority": "HIGH",
    "allowedPlatforms": ["tiktok","youtube","instagram"]
  }' | jq .
echo

echo "Distribution calendar:"
curl -s -X POST http://localhost:5301/distribution/planCalendar \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smart Bottle Pro Sim Week",
    "productName": "Smart Bottle Pro",
    "target": {
      "platforms": ["tiktok","youtube","instagram"],
      "niche": "home fitness",
      "language": "en"
    }
  }' | jq .
echo

echo "STEP 6: PERFORMANCE + OPTIMIZATION"
echo "-----------------------------------"
echo "Performance refinement (social):"
curl -s -X POST http://localhost:5520/refinement/run \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sim-smartbottle-perf-1",
    "domain": "social",
    "metrics": {
      "views": 12000,
      "ctr": 0.27,
      "engagement": 350,
      "trendVelocity": 0.62
    }
  }' | jq .
echo

echo "Multi-domain optimization:"
curl -s -X POST http://localhost:5490/optimizer/run \
  -H "Content-Type: application/json" \
  -d '{ "sessionId":"sim-smartbottle-opt-1" }' | jq .
echo

echo "STEP 7: RL + SELF-AUDIT + METACOG CHECK"
echo "----------------------------------------"
echo "RL cycle:"
curl -s -X POST http://localhost:5495/rl/run \
  -H "Content-Type: application/json" \
  -d '{ "sessionId":"sim-smartbottle-rl-1" }' | jq .
echo

echo "Self-Audit (risky reasoning sample):"
curl -s -X POST http://localhost:5530/audit/run \
  -H "Content-Type: application/json" \
  -d '{ "content":"We should post 30 times a day across all platforms with no testing." }' | jq .
echo

echo "Meta-Cognition (overconfident claim sample):"
curl -s -X POST http://localhost:5580/metacog/analyze \
  -H "Content-Type: application/json" \
  -d '{ "text":"This always works 100% of the time, no matter what." }' | jq .
echo

echo "======================================="
echo "  FULL SYSTEM SIMULATION TEST COMPLETE "
echo "======================================="
echo "Review outputs above for errors or red flags."
echo
