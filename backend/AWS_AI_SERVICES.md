# AWS AI Services Integration Guide

This document describes the AWS AI services implemented in the RoadmapX backend: Amazon Comprehend, Amazon Personalize, and Amazon SageMaker Pipelines.

## Overview

The backend now includes three AWS AI services:

1. **Amazon Comprehend** - Natural Language Processing (sentiment analysis, entity detection, key phrase extraction)
2. **Amazon Personalize** - Real-time personalized recommendations
3. **Amazon SageMaker Pipelines** - ML training and model deployment pipelines

## ⚠️ IMPORTANT: AWS Account Setup Required

**Before using these services, you MUST configure your AWS account.** 

See **[AWS_ACCOUNT_SETUP.md](./AWS_ACCOUNT_SETUP.md)** for step-by-step instructions on:
- Creating IAM roles for Personalize and SageMaker
- Setting up proper permissions
- Configuring S3 buckets
- Verifying service availability in your region

## Installation

Install the required AWS SDK packages:

```bash
npm install
```

The following packages are already added to `package.json`:
- `@aws-sdk/client-comprehend`
- `@aws-sdk/client-personalize`
- `@aws-sdk/client-sagemaker`

## Environment Variables

Add these to your `.env` file:

```env
# AWS AI Services Configuration
PERSONALIZE_ROLE_ARN="arn:aws:iam::ACCOUNT_ID:role/PersonalizeS3Role"
SAGEMAKER_ROLE_ARN="arn:aws:iam::ACCOUNT_ID:role/SageMakerExecutionRole"
AI_ARTIFACTS_BUCKET="your-artifacts-bucket-name"  # Optional, defaults to S3_BUCKET_NAME
SAGEMAKER_TRAINING_IMAGE="811284229777.dkr.ecr.us-east-1.amazonaws.com/xgboost:1.7-1"
```

## API Endpoints

All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

Base path: `/api/ai`

### Amazon Comprehend

#### POST `/api/ai/comprehend/analyze`
Comprehensive text analysis (language, sentiment, entities, key phrases)

**Request Body:**
```json
{
  "text": "I loved the new product, but shipping was slow.",
  "includeSentiment": true,
  "includeEntities": true,
  "includeKeyPhrases": true
}
```

**Response:**
```json
{
  "language": [
    {
      "LanguageCode": "en",
      "Score": 0.99
    }
  ],
  "sentiment": {
    "Sentiment": "MIXED",
    "SentimentScore": {
      "Positive": 0.7,
      "Negative": 0.2,
      "Neutral": 0.1,
      "Mixed": 0.8
    }
  },
  "entities": [...],
  "keyPhrases": [...]
}
```

#### POST `/api/ai/comprehend/sentiment`
Quick sentiment detection only

**Request Body:**
```json
{
  "text": "This is amazing!"
}
```

#### POST `/api/ai/comprehend/batch-sentiment`
Batch sentiment analysis (up to 25 texts)

**Request Body:**
```json
{
  "texts": ["Text 1", "Text 2", "Text 3"],
  "languageCode": "en"
}
```

### Amazon Personalize

#### POST `/api/ai/personalize/dataset-group`
Create a new dataset group

**Request Body:**
```json
{
  "name": "my-dataset-group"
}
```

**Response:**
```json
{
  "datasetGroupArn": "arn:aws:personalize:region:account:dataset-group/my-dataset-group",
  "message": "Dataset group created successfully"
}
```

#### GET `/api/ai/personalize/dataset-group/:arn/status`
Get dataset group status

#### POST `/api/ai/personalize/import`
Import dataset to Personalize (uploads to S3 first)

**Request Body:**
```json
{
  "datasetArn": "arn:aws:personalize:...",
  "data": "CSV data as string",
  "s3Key": "personalize/my-dataset/interactions.csv"
}
```

### Amazon SageMaker Pipelines

#### POST `/api/ai/sagemaker/pipeline`
Create a new SageMaker pipeline

**Request Body:**
```json
{
  "pipelineName": "my-training-pipeline",
  "instanceType": "ml.m5.xlarge",
  "inputDataPath": "s3://bucket/training/data",
  "outputModelPath": "s3://bucket/models"
}
```

**Response:**
```json
{
  "pipelineArn": "arn:aws:sagemaker:region:account:pipeline/my-training-pipeline",
  "message": "Pipeline created successfully"
}
```

#### POST `/api/ai/sagemaker/pipeline/start`
Start a pipeline execution

**Request Body:**
```json
{
  "pipelineName": "my-training-pipeline",
  "parameters": {
    "TrainingInstanceType": "ml.m5.large",
    "InputDataPath": "s3://bucket/new-data"
  }
}
```

#### GET `/api/ai/sagemaker/pipeline/:name`
Get pipeline details

#### GET `/api/ai/sagemaker/pipeline/:name/executions`
List pipeline executions

#### GET `/api/ai/sagemaker/execution/:arn`
Get pipeline execution status

## IAM Roles Setup

**Detailed instructions are in [AWS_ACCOUNT_SETUP.md](./AWS_ACCOUNT_SETUP.md)**

Quick summary:
- **Personalize Role**: Must allow Personalize service to assume it, with S3 access
- **SageMaker Role**: Must allow SageMaker service to assume it, with S3 and ECR access
- **Your IAM User**: Must have permissions for all three services + ability to pass roles (`iam:PassRole`)

## Example Usage

### Text Analysis with Comprehend
```javascript
const response = await fetch('/api/ai/comprehend/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "This product is fantastic!",
    includeSentiment: true,
    includeKeyPhrases: true
  })
});
const analysis = await response.json();
```

### Create Personalize Dataset Group
```javascript
const response = await fetch('/api/ai/personalize/dataset-group', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'user-recommendations'
  })
});
```

## Service Classes

All services are available as singleton instances:

- `comprehendService` - Located in `src/services/comprehend.service.ts`
- `personalizeService` - Located in `src/services/personalize.service.ts`
- `sagemakerService` - Located in `src/services/sagemaker.service.ts`

You can import and use them directly in your code:

```typescript
import { comprehendService } from '../services/comprehend.service';

const result = await comprehendService.analyzeText("Some text");
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Validation error or bad request
- `500` - Server error

Error responses include an `error` field with a description and optionally a `message` field with detailed error information.

## Limitations and Notes

1. **Personalize**: Creating schemas requires additional AWS SDK calls not yet implemented. You may need to create schemas via AWS Console or CLI first.

2. **SageMaker Pipelines**: The pipeline definition uses a simplified JSON format. For production use, consider using the SageMaker Pipelines Python SDK for more complex workflows.

3. **Batch Limits**: Comprehend batch operations are limited to 25 items per request.

4. **Async Operations**: Personalize and SageMaker operations are asynchronous. You'll need to poll status endpoints to check completion.

## Next Steps

1. Set up IAM roles with proper permissions
2. Configure environment variables
3. Test endpoints with sample data
4. Integrate with your frontend application
5. Set up monitoring and logging for production use

