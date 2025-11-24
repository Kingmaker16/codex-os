#!/usr/bin/env bash
echo "=== CODEX VISUAL AUTONOMY DEMO (SAFE VERSION) ==="
SESSION="visdemo-$RANDOM"

echo
echo "SETUP REQUIRED:"
echo " 1. Open Google Chrome manually"
echo " 2. Click into the address/search bar"
echo " 3. Grant Terminal Accessibility access:"
echo "    System Settings > Privacy & Security > Accessibility > Enable Terminal"
echo " 4. Run this script again"
echo
echo "Press ENTER when ready..."
read

echo "[1] Typing search query into Chrome"
curl -s -X POST http://localhost:4300/hands/ui/type \
 -H "Content-Type: application/json" \
 -d '{"text": "codex autonomous demo", "app": "Google Chrome"}' | jq .
echo

sleep 1

echo "[2] Press RETURN to search"
curl -s -X POST http://localhost:4300/hands/ui/key \
 -H "Content-Type: application/json" \
 -d '{"key": "return"}' | jq .
echo

sleep 2

echo "=== DEMO COMPLETE ==="
echo
echo "What just happened:"
echo " ✓ Codex typed into Chrome via Hands v5"
echo " ✓ Codex pressed RETURN to execute search"
echo " ✓ All actions performed autonomously through API"
