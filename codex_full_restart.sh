#!/usr/bin/env bash

echo "======================================="
echo "  CODEX OS — FULL RESTART SEQUENCE     "
echo "======================================="
echo

LOG_DIR="codex_restart_logs"
TS=$(date +"%Y%m%d-%H%M%S")
RESTART_LOG="${LOG_DIR}/restart_${TS}.log"
HEALTH_LOG="${LOG_DIR}/health_${TS}.log"

echo "[1] Killing existing Node processes..."
pkill -f "node" || true
sleep 3

echo "[2] Starting Codex OS via npm run codex:start ..."
echo "------------------------------------------------"
npm run codex:start >> "$RESTART_LOG" 2>&1 &

echo "Waiting 20 seconds for services to boot..."
sleep 20

echo "[3] Running health check snapshot..."
echo "-------------------------------------"
./codex_check_health.sh >> "$HEALTH_LOG" 2>&1

echo
echo "======================================="
echo "  RESTART + HEALTH CHECK COMPLETE      "
echo "======================================="
echo "Restart log:  $RESTART_LOG"
echo "Health log:   $HEALTH_LOG"
echo
