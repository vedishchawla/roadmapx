# Step-by-Step AI Implementation Guide

## Overview: How AI Powers Roadmap Generation

This guide shows you how to use AWS AI services to create intelligent, personalized learning roadmaps:

1. **Amazon Comprehend** - Analyzes user input to understand goals, skills, and preferences
2. **Amazon Personalize** - Recommends resources based on similar users' success patterns
3. **Amazon SageMaker** - Trains custom models to generate optimal learning paths

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `@aws-sdk/client-comprehend`
- `@aws-sdk/client-personalize`
- `@aws-sdk/client-sagemaker`

## Step 2: Configure AWS Credentials

Update `backend/.env`:

```env
# AWS Basics
AWS_REGION="us-east-1"  # Or your region
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# For Comprehend (works immediately - no S3 needed)
# Just need: AmazonComprehendFullAccess policy on your IAM user

# For Personalize (needs S3)
PERSONALIZE_ROLE_ARN="arn:aws:iam::ACCOUNT_ID:role/PersonalizeS3Role"
S3_BUCKET_NAME="your-bucket-name"  # If S3 is set up

# For SageMaker (needs S3)
SAGEMAKER_ROLE_ARN="arn:aws:iam::ACCOUNT_ID:role/SageMakerExecutionRole"
AI_ARTIFACTS_BUCKET="your-bucket-name"  # If S3 is set up
```

## Step 3: Set Up AWS IAM Permissions

### Minimum for Comprehend (Works Now)
1. Go to AWS IAM Console
2. Find your IAM user
3. Attach policy: `AmazonComprehendFullAccess`
4. Save

### For Personalize & SageMaker (When Ready)
Follow `AWS_ACCOUNT_SETUP.md` to create IAM roles.

## Step 4: Test Comprehend (Quick Start)

Test that Comprehend works:

```bash
# Create test file: test-comprehend.js
node test-comprehend.js
```

Or use the API:
```bash
curl -X POST http://localhost:3001/api/ai/comprehend/sentiment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "I want to learn machine learning"}'
```

## Step 5: Understanding How Roadmap Generation Works

### Architecture Flow:

```
User Input (text description)
    ↓
Amazon Comprehend
    ├─ Extracts skills & goals
    ├─ Analyzes sentiment/motivation
    └─ Identifies learning preferences
    ↓
AI Roadmap Generator Service
    ├─ Uses Comprehend insights
    ├─ Applies Personalize recommendations (if available)
    └─ Generates structured roadmap
    ↓
Database (Prisma)
    └─ Saves roadmap with phases & milestones
```

## Step 6: How Each Service Contributes

### Amazon Comprehend Role:
- **Input Analysis**: "I want to become a full-stack developer in 6 months"
- **Extracts**: Skills (full-stack), Timeframe (6 months), Goal (developer)
- **Identifies**: Key topics, prerequisites, difficulty level

### Amazon Personalize Role:
- **Recommends**: Resources based on what worked for similar learners
- **Suggests**: Optimal learning order based on user behavior data
- **Personalizes**: Content difficulty and style based on user profile

### Amazon SageMaker Role (Advanced):
- **Trains Models**: On historical roadmap success data
- **Predicts**: Optimal learning path structure
- **Optimizes**: Phase duration and milestone sequencing

## Step 7: Implementation Steps

### Phase A: Start with Comprehend (Day 1)
✅ Can implement immediately
✅ No S3 needed
✅ Works with your existing roadmap creation

### Phase B: Add Personalize (Week 2)
⚠️ Requires S3 setup
⚠️ Needs historical user interaction data
⚠️ Takes time to train models

### Phase C: Integrate SageMaker (Month 2+)
⚠️ Requires S3 setup
⚠️ Needs training data
⚠️ Advanced use case

## Next: Implement Roadmap Generation Service

See `ROADMAP_GENERATION.md` for the actual implementation code.

