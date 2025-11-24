#!/usr/bin/env bash

echo "===================================================="
echo "  CODEX AUTONOMY DEMO — SMART BOTTLE PRO (SIM)       "
echo "===================================================="
echo

set -e

SESSION_ID="demo-smartbottle-$(date +%s)"

echo "Using session: $SESSION_ID"
echo

echo "STEP 1 — High-level strategy from Orchestrator (SIMULATION)"
echo "------------------------------------------------------------"
curl -s -X POST http://localhost:4200/orchestrator/quickRun \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"${SESSION_ID}\",
    \"mode\": \"SIMULATION\",
    \"command\": \"Plan a 3-day launch of Smart Bottle Pro on TikTok and YouTube Shorts, using 2 posts per day, UGC style, focused on hydration and habit-building.\"
  }" | jq .
echo

echo "STEP 2 — Create a Mesh plan (Autonomy + SRL + Hardening + Workflow)"
echo "--------------------------------------------------------------------"
MESH_PLAN=$(curl -s -X POST http://localhost:5565/mesh/create \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"${SESSION_ID}\",
    \"domain\": \"social\",
    \"goal\": \"Simulate validation and workflow setup for 3-day Smart Bottle Pro launch.\",
    \"mode\": \"DRY_RUN\"
  }")
echo "$MESH_PLAN" | jq .
PLAN_ID=$(echo "$MESH_PLAN" | jq -r '.plan.id')
echo "Mesh plan ID: $PLAN_ID"
echo

echo "STEP 3 — Execute Mesh steps (DRY_RUN)"
echo "--------------------------------------"
for i in 1 2 3 4; do
  echo "Executing mesh step $i..."
  curl -s -X POST http://localhost:5565/mesh/step \
    -H "Content-Type: application/json" \
    -d "{ \"planId\": \"${PLAN_ID}\" }" | jq .
  echo
done

echo "STEP 4 — Run Multi-Domain Optimizer"
echo "-------------------------------------"
curl -s -X POST http://localhost:5490/optimizer/run \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"${SESSION_ID}\"
  }" | jq .
echo

echo "STEP 5 — Performance Refinement (Social domain sample metrics)"
echo "-------------------------------------------------------------"
curl -s -X POST http://localhost:5520/refinement/run \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"${SESSION_ID}\",
    \"domain\": \"social\",
    \"metrics\": {
      \"views\": 8900,
      \"ctr\": 0.28,
      \"engagement\": 420,
      \"trendVelocity\": 0.61
    }
  }" | jq .
echo

echo "===================================================="
echo "  DEMO COMPLETE — Codex just orchestrated strategy,  "
echo "  safety checks, workflow planning, optimization,    "
echo "  and refinement for a 3-day launch simulation.     "
echo "===================================================="
echo
