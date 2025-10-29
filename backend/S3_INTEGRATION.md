# S3 Integration with AI Services

## ✅ Good News: S3 is Already Implemented!

You **already have S3 set up** in your project, and the AI services use your **existing S3 configuration**. No additional S3 setup is needed!

## What You Already Have

Your project includes:
- ✅ S3 Client configured in `backend/src/config/aws.ts`
- ✅ S3 Bucket name: `S3_BUCKET_NAME` (from your `.env`)
- ✅ File upload routes working with S3 (`backend/src/routes/file.ts`)

## How AI Services Use Your Existing S3

### 1. **Amazon Personalize** 
- Uses your existing `s3Client` from `backend/src/config/aws.ts`
- Uses your existing bucket from `S3_BUCKET_NAME` (or `AI_ARTIFACTS_BUCKET` if you set it)
- Uploads training datasets to: `s3://YOUR_BUCKET_NAME/personalize/...`

```typescript
// From personalize.service.ts
import { s3Client } from '../config/aws';  // ← Uses YOUR existing S3 client!
```

### 2. **Amazon SageMaker**
- Uses the same bucket for training data and model artifacts
- Training data: `s3://YOUR_BUCKET_NAME/...`
- Model outputs: `s3://YOUR_BUCKET_NAME/models/...`

### 3. **Amazon Comprehend**
- Doesn't need S3 (analyzes text directly)

## Your Current S3 Configuration

From your `backend/src/config/aws.ts`:

```typescript
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_CONFIG = {
  bucketName: process.env.S3_BUCKET_NAME || 'roadmapx-files',  // ← Your bucket
  region: process.env.S3_REGION || 'us-east-1',
  // ...
};
```

## What You Need to Do

**Nothing new for S3!** But you DO need to ensure:

### 1. Verify Your S3 Bucket Exists ✅
- Check AWS Console → S3
- Ensure `S3_BUCKET_NAME` from your `.env` exists
- That's the bucket the AI services will use

### 2. Grant IAM Roles Access to S3 (Part of AWS Setup)

When creating the IAM roles (in `AWS_ACCOUNT_SETUP.md`), make sure they can access your bucket:

**Personalize Role** needs:
```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:ListBucket", "s3:PutObject"],
  "Resource": [
    "arn:aws:s3:::YOUR_BUCKET_NAME",
    "arn:aws:s3:::YOUR_BUCKET_NAME/*"
  ]
}
```

**SageMaker Role** needs:
```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:ListBucket", "s3:PutObject", "s3:DeleteObject"],
  "Resource": [
    "arn:aws:s3:::YOUR_BUCKET_NAME",
    "arn:aws:s3:::YOUR_BUCKET_NAME/*"
  ]
}
```

Replace `YOUR_BUCKET_NAME` with the value from your `S3_BUCKET_NAME` environment variable.

## Optional: Separate Bucket for AI Artifacts

If you want to use a **different bucket** for AI training data/models (to keep them separate from user files):

1. Create a new S3 bucket in AWS
2. Add to `.env`:
   ```env
   AI_ARTIFACTS_BUCKET="your-ai-bucket-name"
   ```

3. The AI services will use `AI_ARTIFACTS_BUCKET` if set, otherwise fall back to `S3_BUCKET_NAME`

**But this is optional!** Using the same bucket works fine.

## Summary

| Component | Status | Action Needed |
|-----------|--------|---------------|
| S3 Client | ✅ Already configured | None |
| S3 Bucket | ✅ You have one | Verify it exists in AWS |
| AI Services S3 Integration | ✅ Already done | None |
| IAM Roles | ❌ Need to create | Follow `AWS_ACCOUNT_SETUP.md` |
| IAM Role S3 Permissions | ❌ Need to add | Include when creating roles |

## Example: How Personalize Uses Your S3

When you import a dataset to Personalize:

```typescript
// Your code calls:
await personalizeService.importDataset(datasetArn, csvData, "personalize/data.csv");

// Behind the scenes, it:
// 1. Uses YOUR existing s3Client from config/aws.ts
// 2. Uploads to YOUR bucket: s3://YOUR_BUCKET_NAME/personalize/data.csv
// 3. Tells Personalize where to find the data
```

The same bucket that stores your user files (`user-uploads/...`) can also store AI training data (`personalize/...`). They'll be in different folders, so no conflicts!

## Need Help?

- Your S3 is ready ✅
- Just follow `AWS_ACCOUNT_SETUP.md` to create the IAM roles
- The roles need permission to access your existing S3 bucket
- That's it!

