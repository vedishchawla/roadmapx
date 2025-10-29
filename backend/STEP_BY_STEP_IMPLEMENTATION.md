# Step-by-Step Implementation Guide

## 🎯 Complete Roadmap: Implementing AI Services for Roadmap Generation

This guide walks you through implementing Amazon Comprehend, Personalize, and SageMaker for intelligent roadmap generation.

---

## Phase 1: Setup & Configuration (Day 1)

### Step 1.1: Install Dependencies
```bash
cd backend
npm install
```

This installs all required AWS SDK packages.

### Step 1.2: Configure Environment Variables

Create or update `backend/.env`:

```env
# Existing Configuration
DATABASE_URL="your-database-url"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# For Comprehend (Works immediately - no S3 needed)
# Just need IAM permission: AmazonComprehendFullAccess

# For Personalize (Requires S3 setup - do later)
PERSONALIZE_ROLE_ARN="arn:aws:iam::ACCOUNT_ID:role/PersonalizeS3Role"
S3_BUCKET_NAME="your-bucket-name"  # Only if S3 is set up

# For SageMaker (Requires S3 setup - do later)
SAGEMAKER_ROLE_ARN="arn:aws:iam::ACCOUNT_ID:role/SageMakerExecutionRole"
AI_ARTIFACTS_BUCKET="your-bucket-name"  # Only if S3 is set up
```

### Step 1.3: Set Up AWS IAM (Minimum for Comprehend)

1. Go to AWS Console → IAM
2. Find your IAM user (the one with your access keys)
3. Click "Add permissions" → "Attach policies directly"
4. Search for and attach: `AmazonComprehendFullAccess`
5. Save

**✅ Comprehend is now ready to use!**

---

## Phase 2: Test Comprehend (Day 1)

### Step 2.1: Start Your Server
```bash
npm run dev
```

### Step 2.2: Test Comprehend API

Use Postman, curl, or your frontend:

```bash
# Test sentiment analysis
curl -X POST http://localhost:3001/api/ai/comprehend/sentiment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "I want to learn machine learning!"}'
```

You should get:
```json
{
  "Sentiment": "POSITIVE",
  "SentimentScore": {
    "Positive": 0.95,
    "Negative": 0.02,
    ...
  }
}
```

**✅ Comprehend is working!**

---

## Phase 3: Implement Roadmap Generation (Day 1-2)

### Step 3.1: Files Already Created

The following files are already implemented:
- ✅ `backend/src/services/roadmap-generator.service.ts` - AI roadmap generator
- ✅ `backend/src/routes/roadmap-ai.ts` - API endpoints
- ✅ Routes added to `backend/src/index.ts`

### Step 3.2: Test AI Roadmap Generation

**Generate a roadmap from text:**

```bash
curl -X POST http://localhost:3001/api/roadmaps/ai/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "I want to become a full-stack JavaScript developer. I am a beginner with some HTML/CSS experience. I have 6 months to learn."
  }'
```

**Expected Response:**
```json
{
  "message": "Roadmap generated successfully using AI",
  "roadmap": {
    "id": "...",
    "title": "JavaScript Learning Path",
    "skills": ["JavaScript", "Full Stack"],
    "timeFrame": 24,
    "skillLevel": "beginner",
    "phases": [
      {
        "title": "Foundations & Basics",
        "milestones": [...]
      },
      ...
    ]
  }
}
```

### Step 3.3: Test Analysis Endpoint

Preview what AI will extract before generating:

```bash
curl -X POST http://localhost:3001/api/roadmaps/ai/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "I want to learn AWS cloud computing"
  }'
```

**✅ AI Roadmap Generation is working!**

---

## Phase 4: Understanding the Flow

### How Roadmap Generation Works:

1. **User Input** → "I want to learn React and Node.js"

2. **Amazon Comprehend Analysis**:
   - Extracts skills: `["React", "Node.js"]`
   - Detects topics: `["react", "nodejs", "javascript"]`
   - Analyzes sentiment: `POSITIVE` (motivated)
   - Identifies timeframe: `12 weeks` (default)

3. **Roadmap Generator**:
   - Creates 4 phases (Foundations, Core, Practice, Advanced)
   - Generates milestones for each phase
   - Calculates durations based on timeframe

4. **Database**:
   - Saves complete roadmap with phases and milestones
   - Ready for user to start learning

### Example Flow Diagram:

```
"I want to learn Python for data science in 3 months"
    ↓
Comprehend extracts: Python, Data Science, 12 weeks
    ↓
Generator creates: 4 phases × 12 weeks
    ↓
Phase 1: Python Basics (3 weeks)
Phase 2: Data Science Libraries (3 weeks)
Phase 3: Projects (3 weeks)
Phase 4: Advanced Topics (3 weeks)
    ↓
Saved to database → User sees roadmap
```

---

## Phase 5: Frontend Integration Example

### React Example:

```javascript
// In your frontend component
async function generateRoadmap(userDescription) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3001/api/roadmaps/ai/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: userDescription,
      // Optional
      skillLevel: 'beginner',
      timeFrame: 12
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate roadmap');
  }
  
  const data = await response.json();
  return data.roadmap;
}

// Usage
const handleSubmit = async (e) => {
  e.preventDefault();
  const description = e.target.description.value;
  
  try {
    const roadmap = await generateRoadmap(description);
    // Display roadmap to user
    setRoadmap(roadmap);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Form Example:

```jsx
<form onSubmit={handleSubmit}>
  <textarea 
    name="description"
    placeholder="Describe your learning goals..."
    required
  />
  <button type="submit">Generate AI Roadmap</button>
</form>
```

---

## Phase 6: Optional - Set Up Personalize (Week 2+)

### Prerequisites:
- S3 bucket created and accessible
- Historical user interaction data

### Step 6.1: Create S3 Bucket (if not done)
1. AWS Console → S3
2. Create bucket: `roadmapx-ai-data`
3. Update `.env`: `S3_BUCKET_NAME="roadmapx-ai-data"`

### Step 6.2: Create Personalize IAM Role
Follow `AWS_ACCOUNT_SETUP.md` Step 1A

### Step 6.3: Prepare Interaction Data
Format: CSV with columns:
- USER_ID
- ITEM_ID (milestone/resource ID)
- TIMESTAMP
- EVENT_TYPE (click, complete, rate, etc.)

### Step 6.4: Import Data
```bash
# Upload CSV to S3 first, then:
curl -X POST http://localhost:3001/api/ai/personalize/import \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "datasetArn": "...",
    "data": "CSV_CONTENT",
    "s3Key": "interactions.csv"
  }'
```

### Step 6.5: Get Recommendations
Once trained, Personalize can recommend:
- Which milestones to prioritize
- What resources to use
- Optimal learning order

**Future enhancement** - Add to roadmap generator service.

---

## Phase 7: Optional - Set Up SageMaker (Month 2+)

### Use Case:
Train custom ML models to optimize roadmap structure based on successful roadmaps.

### Step 7.1: Prepare Training Data
Historical data of successful roadmaps with:
- User profiles
- Roadmap structures
- Completion rates
- Time to completion

### Step 7.2: Create SageMaker Pipeline
```bash
curl -X POST http://localhost:3001/api/ai/sagemaker/pipeline \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pipelineName": "roadmap-optimizer",
    "inputDataPath": "s3://bucket/training-data",
    "outputModelPath": "s3://bucket/models"
  }'
```

### Step 7.3: Train and Deploy
Once trained, use model predictions to:
- Optimize phase durations
- Predict completion likelihood
- Suggest milestone ordering

**Advanced feature** - Integrate later.

---

## Phase 8: Testing & Validation

### Test Cases:

1. **Basic Roadmap Generation**
   ```
   Input: "I want to learn web development"
   Expected: Roadmap with phases and milestones for web dev
   ```

2. **Timeframe Detection**
   ```
   Input: "I have 3 months to learn React"
   Expected: 12-week roadmap (3 months = 12 weeks)
   ```

3. **Skill Extraction**
   ```
   Input: "Learn Python, machine learning, and data science"
   Expected: Skills array includes all three
   ```

4. **Skill Level Detection**
   ```
   Input: "I'm advanced in JavaScript, want to learn React"
   Expected: Skill level = "advanced"
   ```

### Test Script:

Create `test-roadmap-generation.js`:

```javascript
const { ComprehendClient, DetectSentimentCommand } = require('@aws-sdk/client-comprehend');
require('dotenv').config();

async function test() {
  // Test Comprehend
  const client = new ComprehendClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  const result = await client.send(
    new DetectSentimentCommand({
      Text: "I want to learn React",
      LanguageCode: "en",
    })
  );
  
  console.log('✅ Comprehend works:', result.Sentiment);
  console.log('📊 Now test API endpoint: POST /api/roadmaps/ai/generate');
}

test();
```

---

## Quick Reference

### API Endpoints:

| Endpoint | Method | Purpose | S3 Needed? |
|----------|--------|---------|------------|
| `/api/roadmaps/ai/generate` | POST | Generate roadmap | ❌ No |
| `/api/roadmaps/ai/analyze` | POST | Analyze input | ❌ No |
| `/api/roadmaps/:id/ai/enhance` | POST | Enhance roadmap | ❌ No |
| `/api/ai/comprehend/*` | POST | Direct Comprehend | ❌ No |
| `/api/ai/personalize/*` | POST | Personalize (future) | ✅ Yes |
| `/api/ai/sagemaker/*` | POST | SageMaker (future) | ✅ Yes |

### What Works Now:
- ✅ Amazon Comprehend integration
- ✅ AI-powered roadmap generation
- ✅ Text analysis and skill extraction
- ✅ Automatic phase and milestone creation

### What Requires Setup:
- ⏳ Personalize (needs S3 + training data)
- ⏳ SageMaker (needs S3 + training pipeline)

---

## Troubleshooting

### Error: "Access Denied"
→ Check IAM permissions for Comprehend

### Error: "Service not available in region"
→ Check if Comprehend is available in your AWS region

### Roadmap generation fails
→ Check AWS credentials in `.env`

### No skills extracted
→ Verify description includes skill keywords

---

## Next Steps

1. ✅ **Done**: Comprehend integration
2. ✅ **Done**: Roadmap generation service
3. ⏳ **Next**: Test with real user input
4. ⏳ **Future**: Add Personalize recommendations
5. ⏳ **Future**: Add SageMaker optimization

---

## Documentation Files

- `IMPLEMENTATION_GUIDE.md` - Overview
- `ROADMAP_GENERATION.md` - Detailed roadmap generation docs
- `AWS_ACCOUNT_SETUP.md` - AWS configuration
- `QUICK_START.md` - Quick start guide
- `AWS_AI_SERVICES.md` - API reference

