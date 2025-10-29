# Using AI Services Without Full S3 Implementation

## Current Status

You have S3 code but didn't complete the AWS setup due to errors. Here's how to proceed with the AI services.

## Service Dependencies

### ✅ Amazon Comprehend - Works WITHOUT S3
**No S3 needed!** Comprehend analyzes text directly.

**You can use:**
- ✅ `POST /api/ai/comprehend/analyze`
- ✅ `POST /api/ai/comprehend/sentiment`
- ✅ `POST /api/ai/comprehend/batch-sentiment`

### ⚠️ Amazon Personalize - Requires S3
**Needs S3** for importing training datasets.

**To use Personalize, you need:**
1. A working S3 bucket
2. IAM role with S3 access

**Or skip Personalize** and use only Comprehend.

### ⚠️ Amazon SageMaker - Requires S3
**Needs S3** for training data and model artifacts.

**To use SageMaker, you need:**
1. A working S3 bucket
2. IAM role with S3 access

**Or skip SageMaker** and use only Comprehend.

## Quick Fix: Minimal S3 Setup (Only for AI Services)

If you want to use Personalize/SageMaker, you only need minimal S3 setup:

### Step 1: Create S3 Bucket in AWS

1. Go to AWS Console → S3
2. Click "Create bucket"
3. **Bucket name**: `roadmapx-ai-data` (or any name)
4. **Region**: Same as your `AWS_REGION`
5. **Block Public Access**: Keep enabled (default)
6. Click "Create bucket"

### Step 2: Update .env

```env
S3_BUCKET_NAME="roadmapx-ai-data"  # Your new bucket name
# OR if you want separate buckets:
AI_ARTIFACTS_BUCKET="roadmapx-ai-data"
```

### Step 3: Fix IAM Permissions

Your AWS credentials (`AWS_ACCESS_KEY_ID`) need S3 access:

**Add to your IAM user:**
- Policy: `AmazonS3FullAccess` (or custom policy for your bucket)

**OR create custom policy (more secure):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::roadmapx-ai-data",
        "arn:aws:s3:::roadmapx-ai-data/*"
      ]
    }
  ]
}
```

### Step 4: Test S3 Connection

Create a test file `test-s3.js`:

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function test() {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || process.env.AI_ARTIFACTS_BUCKET,
      Key: 'test.txt',
      Body: 'Hello S3!',
    });
    
    await s3Client.send(command);
    console.log('✅ S3 works!');
  } catch (error) {
    console.error('❌ S3 error:', error.message);
    console.log('\nCommon fixes:');
    console.log('1. Check bucket name matches .env');
    console.log('2. Check AWS credentials are correct');
    console.log('3. Check IAM permissions for S3');
  }
}

test();
```

Run: `node test-s3.js`

## Recommended Approach: Start with Comprehend Only

Since Comprehend doesn't need S3, you can:

1. **Use Comprehend immediately** ✅
   - No S3 setup needed
   - No additional IAM roles needed
   - Just configure AWS credentials

2. **Skip Personalize/SageMaker for now**
   - Comment out their routes in `backend/src/index.ts`
   - Set up S3 later when ready

3. **Add Personalize/SageMaker later**
   - Once S3 is working
   - Follow `AWS_ACCOUNT_SETUP.md`

## Option 2: Disable Personalize & SageMaker Routes

If you don't want to use Personalize/SageMaker yet:

### Update `backend/src/index.ts`:

```typescript
// Comment out or conditionally load AI routes
// app.use('/api/ai', authMiddleware, aiRoutes);

// Or only use Comprehend routes:
import aiRoutes from './routes/ai';
app.use('/api/ai/comprehend', authMiddleware, aiRoutes); // Only if you split routes
```

Or create separate route files:
- `backend/src/routes/comprehend.ts` (no S3 dependency)
- Keep Personalize/SageMaker routes separate until S3 is ready

## Option 3: Minimal S3 Helper Function

I can create a simple S3 helper that:
- Checks if S3 is available
- Provides clear error messages if S3 fails
- Allows AI services to work without S3 (where possible)

## Next Steps - Your Choice:

1. **Use Comprehend only** (no S3 needed)
   - ✅ Quickest option
   - ✅ Works immediately

2. **Fix S3 setup** (for Personalize/SageMaker)
   - Follow "Quick Fix" above
   - Takes ~10 minutes

3. **Remove Personalize/SageMaker** temporarily
   - Clean up code that requires S3
   - Add back later when ready

Which would you prefer? I can help implement any of these options!

