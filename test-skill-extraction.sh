#!/bin/bash

echo "🧪 Testing Knowledge Engine v1.1 - Skill Extraction"
echo ""

# Get first ecomm document
echo "📄 Fetching test document..."
DOC_ID=$(curl -s 'http://localhost:4100/documents?domain=ecomm' | jq -r '.documents[0].docId')

if [ "$DOC_ID" == "null" ] || [ -z "$DOC_ID" ]; then
  echo "❌ No documents found in ecomm domain"
  exit 1
fi

echo "✅ Found docId: $DOC_ID"
echo ""

# Extract skills
echo "🔍 Extracting skills from document..."
EXTRACT_RESULT=$(curl -s -X POST 'http://localhost:4200/skills/extract' \
  -H 'Content-Type: application/json' \
  -d "{\"domain\":\"ecomm\",\"docId\":\"$DOC_ID\",\"provider\":\"openai\"}")

echo "$EXTRACT_RESULT" | jq .
echo ""

# Check skills
echo "📊 Fetching extracted skills for ecomm domain..."
curl -s 'http://localhost:4100/skills?domain=ecomm' | jq '{ok, domain, ruleCount: .summary.count, recentRules: .summary.recent}'
