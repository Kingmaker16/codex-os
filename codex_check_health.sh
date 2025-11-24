#!/usr/bin/env bash

echo "======================================="
echo "  CODEX OS — HEALTH CHECK SNAPSHOT     "
echo "======================================="
echo

function check() {
  local name=$1
  local url=$2
  echo "[$name] $url"
  curl -s "$url" | jq .
  echo
}

check "Orchestrator"       "http://localhost:4200/health"
check "Brain v2"           "http://localhost:4100/v2/health"
check "Ops Engine"         "http://localhost:5350/ops/health"
check "Telemetry"          "http://localhost:4950/health"
check "Hardening"          "http://localhost:5555/health"
check "SRL"                "http://localhost:5540/health"
check "Self-Audit"         "http://localhost:5530/health"
check "CrossVal"           "http://localhost:5470/health"
check "Optimizer"          "http://localhost:5490/health"
check "RL"                 "http://localhost:5495/health"
check "Performance"        "http://localhost:5520/health"
check "Adaptive"           "http://localhost:5440/health"
check "Adaptive Strategy"  "http://localhost:5445/health"
check "Meta-Cognition"     "http://localhost:5580/health"
check "Mesh"               "http://localhost:5565/health"
check "Autonomy Memory"    "http://localhost:5570/health"
check "Autonomy Engine"    "http://localhost:5420/health"
check "Workflow Layer"     "http://localhost:5430/health"
check "Hands v5"           "http://localhost:4300/health"
check "Vision v3"          "http://localhost:4660/health"
check "Social Engine"      "http://localhost:4800/health"
check "Distribution v2"    "http://localhost:5301/health"
check "Routing v2"         "http://localhost:5560/health"
check "Campaign Engine"    "http://localhost:5120/health"
check "Ecomm Engine"       "http://localhost:5100/health"
check "Creative Suite"     "http://localhost:5250/health"
check "Profiles"           "http://localhost:5180/health"
check "Identity"           "http://localhost:5185/health"
check "Vault"              "http://localhost:5175/health"
check "Domain Engine"      "http://localhost:5160/health"
check "Bridge"             "http://localhost:4000/health"

echo "======================================="
echo "  HEALTH CHECK COMPLETE                "
echo "======================================="
