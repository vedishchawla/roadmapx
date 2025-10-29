# Quick Start: AWS AI Services

## 🎯 What Works Right Now (No S3 Needed)

### ✅ Amazon Comprehend - Ready to Use!

**No S3 configuration needed!** These endpoints work immediately:

```bash
# Test sentiment analysis
curl -X POST http://localhost:3001/api/ai/comprehend/sentiment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!"}'

# Full text analysis
curl -X POST http://localhost:3001/api/ai/comprehend/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Amazon Web Services is a great cloud platform.",
    "includeSentiment": true,
    "includeEntities": true,
    "includeKeyPhrases": true
  }'
```

**Just need:**
- ✅ AWS credentials in `.env`:
  ```env
  AWS_REGION="us-east-1"
  AWS_ACCESS_KEY_ID="your-key"
  AWS_SECRET_ACCESS_KEY="your-secret"
  ```
- ✅ Your IAM user needs `AmazonComprehendFullAccess` policy

## ⚠️ What Requires S3 Setup

### Personalize & SageMaker
These need S3 working. Options:

1. **Skip them for now** - Use Comprehend only ✅
2. **Fix S3** - See `AI_SERVICES_WITHOUT_S3.md` for minimal setup
3. **Contact support** - Get help with AWS Academy S3 errors

## Step-by-Step: Get Comprehend Working

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure AWS Credentials

Update `.env`:
```env
# Existing config
AWS_REGION="us-east-1"  # Or your region
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# No S3 needed for Comprehend!
```

### 3. Grant IAM Permissions

In AWS IAM Console:
- Go to your IAM user
- Attach policy: `AmazonComprehendFullAccess`
- Save

### 4. Start Server
```bash
npm run dev
```

### 5. Test Comprehend

Use Postman, curl, or your frontend:

```javascript
// Example JavaScript
const response = await fetch('/api/ai/comprehend/sentiment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "This is amazing!"
  })
});

const result = await response.json();
console.log(result.Sentiment); // "POSITIVE"
```

## Testing

Create `test-comprehend.js`:

```javascript
const { ComprehendClient, DetectSentimentCommand } = require('@aws-sdk/client-comprehend');
require('dotenv').config();

const client = new ComprehendClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function test() {
  try {
    const result = await client.send(
      new DetectSentimentCommand({
        Text: "Hello world",
        LanguageCode: "en",
      })
    );
    console.log('✅ Comprehend works!');
    console.log('Sentiment:', result.Sentiment);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nCheck:');
    console.log('1. AWS credentials in .env');
    console.log('2. IAM permissions (AmazonComprehendFullAccess)');
    console.log('3. Region supports Comprehend');
  }
}

test();
```

Run: `node test-comprehend.js`

## What About Personalize & SageMaker?

These services require:
- ✅ S3 bucket configured
- ✅ IAM roles with S3 access
- ✅ Data uploaded to S3

**If you haven't set up S3:**
- See `AI_SERVICES_WITHOUT_S3.md` for options
- Or use Comprehend only for now

The routes for Personalize/SageMaker will return helpful error messages if S3 isn't configured.

## Next Steps

1. ✅ **Get Comprehend working** (5 minutes)
   - Follow steps above
   - Test with sample text

2. ⏳ **Set up S3 later** (when ready)
   - Follow `AI_SERVICES_WITHOUT_S3.md`
   - Or get help with AWS Academy S3 issues

3. 📚 **Read documentation**
   - `AWS_AI_SERVICES.md` - Full API reference
   - `AWS_ACCOUNT_SETUP.md` - Complete AWS setup
   - `AI_SERVICES_WITHOUT_S3.md` - S3 alternatives

## Troubleshooting

### "Access Denied" error?
→ Check IAM permissions for Comprehend

### "Service not available in region"?
→ Comprehend is available in most regions, check AWS docs

### Routes not working?
→ Make sure you're authenticated (JWT token in header)

### Want help with S3?
→ See `AI_SERVICES_WITHOUT_S3.md` or contact support

