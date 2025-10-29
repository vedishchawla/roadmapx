#!/bin/bash

# Test AI Endpoints Script
# Run this in Git Bash: bash test-ai-endpoints.sh

BASE_URL="http://localhost:3001"
TOKEN="dev-token"  # Any token works in development mode

echo "🧪 Testing Amazon Comprehend Sentiment Analysis..."
echo ""

# Test 1: Comprehend Sentiment
echo "📝 Test 1: POST /api/ai/comprehend/sentiment"
curl -X POST "${BASE_URL}/api/ai/comprehend/sentiment" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love learning!"}'

echo ""
echo ""
echo "🧪 Testing AI Roadmap Generation..."
echo ""

# Test 2: Generate Roadmap
echo "📝 Test 2: POST /api/roadmaps/ai/generate"
curl -X POST "${BASE_URL}/api/roadmaps/ai/generate" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "I want to learn Python for data science in 6 months"
  }'

echo ""
echo ""
echo "✅ Tests completed!"
echo ""
echo "If you see JSON responses above, the AI services are working! 🎉"

