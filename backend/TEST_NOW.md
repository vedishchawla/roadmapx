# 🧪 Quick Test Guide

## Server is Running! ✅

Your server is running on `http://localhost:3001`

## Test the AI Endpoints

### Option 1: Use Git Bash (Recommended)

Open a **NEW Git Bash terminal** (keep the server running in PowerShell) and run:

```bash
cd backend
bash test-ai-endpoints.sh
```

### Option 2: Manual Testing in Git Bash

```bash
# Test 1: Comprehend Sentiment
curl -X POST http://localhost:3001/api/ai/comprehend/sentiment \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love learning!"}'

# Test 2: Generate Roadmap
curl -X POST http://localhost:3001/api/roadmaps/ai/generate \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  -d '{"description": "I want to learn Python for data science in 6 months"}'
```

### Option 3: Use Postman or Browser Extension

If you have Postman or REST Client extension:

**POST** `http://localhost:3001/api/ai/comprehend/sentiment`
- Headers:
  - `Authorization: Bearer dev-token`
  - `Content-Type: application/json`
- Body:
```json
{
  "text": "I love learning!"
}
```

## Expected Results

### Comprehend Response:
```json
{
  "Sentiment": "POSITIVE",
  "SentimentScore": {
    "Positive": 0.95,
    "Negative": 0.02,
    "Neutral": 0.02,
    "Mixed": 0.01
  }
}
```

### Roadmap Generation Response:
```json
{
  "message": "Roadmap generated successfully using AI",
  "roadmap": {
    "id": "...",
    "title": "Python Learning Path",
    "skills": ["Python", "Data Science"],
    "timeFrame": 24,
    "phases": [...]
  }
}
```

## If You Get Errors

### "Access Denied" or AWS Error
→ Make sure AWS credentials are in `.env`:
```env
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
```

### "Cannot connect"
→ Make sure server is running on port 3001

### "500 Internal Server Error"
→ Check server logs in the PowerShell window where server is running

