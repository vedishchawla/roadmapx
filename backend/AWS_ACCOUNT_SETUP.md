# AWS Account Setup Guide

Before using the AWS AI services, you need to configure several things in your AWS account. Follow this guide step by step.

## Prerequisites

- AWS Account
- AWS CLI installed (optional, but helpful)
- Administrator access or permissions to create IAM roles and policies

## Step 1: Create IAM Roles

### A. Personalize Service Role

1. **Go to IAM Console** → Roles → Create Role

2. **Select Trust Entity Type:**
   - Choose "AWS Service"
   - Select "Personalize" from the service list

3. **Create Policy** (or attach existing):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:ListBucket",
           "s3:PutObject"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR_BUCKET_NAME",
           "arn:aws:s3:::YOUR_BUCKET_NAME/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "personalize:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
   Replace `YOUR_BUCKET_NAME` with your S3 bucket name.

4. **Name the role:** `PersonalizeS3Role` (or your preferred name)

5. **Copy the Role ARN** - You'll need this for `PERSONALIZE_ROLE_ARN` in your `.env`

### B. SageMaker Execution Role

1. **Go to IAM Console** → Roles → Create Role

2. **Select Trust Entity Type:**
   - Choose "AWS Service"
   - Select "SageMaker" from the service list

3. **Attach Policies:**
   - `AmazonSageMakerFullAccess` (or create custom policy with minimal permissions)
   - For S3 access, attach a policy like:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:ListBucket",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR_BUCKET_NAME",
           "arn:aws:s3:::YOUR_BUCKET_NAME/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "ecr:GetAuthorizationToken",
           "ecr:BatchCheckLayerAvailability",
           "ecr:GetDownloadUrlForLayer",
           "ecr:BatchGetImage"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "logs:CreateLogGroup",
           "logs:CreateLogStream",
           "logs:PutLogEvents",
           "logs:DescribeLogStreams"
         ],
         "Resource": "arn:aws:logs:*:*:*"
       }
     ]
   }
   ```

4. **Name the role:** `SageMakerExecutionRole` (or your preferred name)

5. **Copy the Role ARN** - You'll need this for `SAGEMAKER_ROLE_ARN` in your `.env`

## Step 2: Verify Your AWS Credentials

Your application uses AWS credentials from environment variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Make sure the IAM user/role associated with these credentials has permissions for:**

### For Amazon Comprehend:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "comprehend:DetectSentiment",
        "comprehend:DetectLanguage",
        "comprehend:DetectEntities",
        "comprehend:DetectKeyPhrases",
        "comprehend:BatchDetectSentiment"
      ],
      "Resource": "*"
    }
  ]
}
```

### For Amazon Personalize:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "personalize:*",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```
**Note:** The `iam:PassRole` permission is needed to pass the Personalize role to the service.

### For Amazon SageMaker:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sagemaker:*",
        "iam:PassRole",
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

**Or simply attach these managed policies to your IAM user:**
- `AmazonComprehendFullAccess`
- `AmazonPersonalizeFullAccess`
- `AmazonSageMakerFullAccess`
- `IAMFullAccess` (or custom policy allowing `PassRole` only)

## Step 3: Verify S3 Bucket Access

**Note:** You already have S3 configured in your project! Just verify access:

1. **Go to S3 Console** → Verify your existing bucket exists
   - Your bucket name should be: `S3_BUCKET_NAME` from your `.env` (likely `roadmapx-files`)
   - If you set `AI_ARTIFACTS_BUCKET`, verify that bucket too

2. **Bucket Permissions:**
   - Your existing S3 setup is fine ✅
   - The Personalize and SageMaker roles (created in Step 1) need access to this bucket
   - Use the same bucket name from your `S3_BUCKET_NAME` environment variable

3. **Bucket Configuration:**
   - Region should match your `AWS_REGION`
   - The AI services will use the same bucket - no new bucket needed!

**See [S3_INTEGRATION.md](./S3_INTEGRATION.md) for details about how your existing S3 is used.**

## Step 4: Enable AWS Services in Your Region

**Verify services are available in your region:**

1. **Amazon Comprehend:**
   - Check: https://docs.aws.amazon.com/general/latest/gr/comprehend.html
   - Most regions support Comprehend

2. **Amazon Personalize:**
   - Check: https://docs.aws.amazon.com/general/latest/gr/personalize.html
   - Limited regions (us-east-1, us-west-2, eu-west-1, ap-southeast-1, etc.)

3. **Amazon SageMaker:**
   - Available in most AWS regions
   - Check: https://docs.aws.amazon.com/general/latest/gr/sagemaker.html

## Step 5: Update Environment Variables

Update your `.env` file with the role ARNs you created:

```env
# Your existing AWS config
AWS_REGION="us-east-1"  # Or your preferred region
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# AI Services - ADD THESE
PERSONALIZE_ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/PersonalizeS3Role"
SAGEMAKER_ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/SageMakerExecutionRole"
AI_ARTIFACTS_BUCKET="your-bucket-name"  # Optional, defaults to S3_BUCKET_NAME
SAGEMAKER_TRAINING_IMAGE="811284229777.dkr.ecr.us-east-1.amazonaws.com/xgboost:1.7-1"
```

**To find your Account ID:**
- AWS Console → Top right corner (shows your account ID)
- Or: `aws sts get-caller-identity` (if AWS CLI is configured)

## Step 6: Test Your Setup

### Quick Test Script

Create a file `test-aws-setup.js` (you can delete it after):

```javascript
const { ComprehendClient, DetectSentimentCommand } = require('@aws-sdk/client-comprehend');
require('dotenv').config();

async function test() {
  // Test Comprehend
  const comprehend = new ComprehendClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const result = await comprehend.send(
      new DetectSentimentCommand({
        Text: "Hello world",
        LanguageCode: "en",
      })
    );
    console.log("✅ Comprehend works!", result.Sentiment);
  } catch (error) {
    console.error("❌ Comprehend failed:", error.message);
  }
}

test();
```

Run: `node test-aws-setup.js`

## Step 7: Additional Setup (Optional)

### Personalize - Create Schema (If Needed)

If you need to create custom schemas, you can do it via:
- AWS Console → Amazon Personalize → Schemas
- Or use AWS CLI

**Example Interaction Schema:**
- Field: `USER_ID` (String)
- Field: `ITEM_ID` (String)
- Field: `TIMESTAMP` (Long)
- Field: `EVENT_TYPE` (String)

### SageMaker - ECR Access

If using custom training images, ensure:
- ECR repositories exist (if using custom containers)
- ECR pull permissions are configured

## Common Issues and Solutions

### Issue: "Access Denied" when calling services
**Solution:** Check IAM permissions for your AWS credentials

### Issue: "Cannot assume role"
**Solution:** Verify the trust relationship in the IAM role allows the service to assume it

### Issue: "Service not available in region"
**Solution:** Check if Personalize is available in your chosen region, switch to supported region

### Issue: S3 Access Denied
**Solution:** Ensure both your IAM user and the service roles have S3 permissions

### Issue: Pipeline creation fails
**Solution:** Ensure SageMaker role has ECR permissions to pull training images

## Quick Checklist

- [ ] Personalize IAM role created with S3 access
- [ ] SageMaker execution role created with S3 and ECR access
- [ ] IAM user has permissions for Comprehend, Personalize, SageMaker
- [ ] IAM user can pass roles to services (`iam:PassRole`)
- [ ] S3 bucket exists and is accessible
- [ ] Region supports all three services
- [ ] Environment variables configured in `.env`
- [ ] Test connection succeeds

## Security Best Practices

1. **Use least privilege:** Don't give `*` permissions if not needed
2. **Use resource-based policies:** Restrict roles to specific S3 buckets
3. **Enable CloudTrail:** Monitor API calls for security audits
4. **Rotate credentials:** Regularly update access keys
5. **Use IAM roles for EC2/ECS:** Instead of hardcoding credentials, use instance roles

## Need Help?

- AWS Support: https://console.aws.amazon.com/support/
- Service Documentation:
  - [Comprehend](https://docs.aws.amazon.com/comprehend/)
  - [Personalize](https://docs.aws.amazon.com/personalize/)
  - [SageMaker](https://docs.aws.amazon.com/sagemaker/)

