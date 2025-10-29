import { ComprehendClient } from '@aws-sdk/client-comprehend';
import { PersonalizeClient } from '@aws-sdk/client-personalize';
import { SageMakerClient } from '@aws-sdk/client-sagemaker';

// AWS Region configuration
const region = process.env.AWS_REGION || 'us-east-1';

// Common AWS credentials configuration (includes session token for AWS Academy)
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  sessionToken: process.env.AWS_SESSION_TOKEN,
};

// AWS Comprehend Client
export const comprehendClient = new ComprehendClient({
  region,
  credentials,
});

// AWS Personalize Client
export const personalizeClient = new PersonalizeClient({
  region,
  credentials,
});

// AWS SageMaker Client
export const sagemakerClient = new SageMakerClient({
  region,
  credentials,
});

// AWS AI Configuration
export const AWS_AI_CONFIG = {
  region,
  personalizeRoleArn: process.env.PERSONALIZE_ROLE_ARN || '',
  sagemakerRoleArn: process.env.SAGEMAKER_ROLE_ARN || '',
  s3Bucket: process.env.S3_BUCKET_NAME || process.env.AI_ARTIFACTS_BUCKET || 'roadmapx-files',
};

