# AWS Services Setup Guide for RoadmapX

This guide will help you set up AWS RDS (PostgreSQL) and S3 services for your RoadmapX application.

## Prerequisites

- AWS Account
- AWS CLI installed and configured (optional but recommended)
- Node.js 18+ and npm installed

## Step 1: Set up AWS RDS (PostgreSQL)

### Using AWS Console:

1. **Navigate to AWS RDS**
   - Go to the AWS Console
   - Search for "RDS" and select "Amazon RDS"

2. **Create Database**
   - Click "Create database"
   - Choose "PostgreSQL" as engine type
   - Select "Free tier" template (for development)
   - **DB instance identifier**: `roadmapx-db`
   - **Master username**: `roadmapx_admin`
   - **Master password**: Create a strong password (save this!)
   - **DB instance class**: db.t3.micro (free tier)
   - **Storage**: 20 GB (free tier)
   - **VPC security groups**: Create new security group
   - **Database name**: `roadmapx`

3. **Configure Security Group**
   - Go to EC2 → Security Groups
   - Find the security group created for your RDS instance
   - Add inbound rule:
     - Type: PostgreSQL
     - Port: 5432
     - Source: Your IP address (for development) or 0.0.0.0/0 (for production)

4. **Get Connection Details**
   - Note down the endpoint URL from RDS console
   - Format: `your-endpoint.region.rds.amazonaws.com:5432`

### Update Backend Configuration:

Update your `backend/.env` file:
```env
DATABASE_URL="postgresql://roadmapx_admin:your-password@your-endpoint.region.rds.amazonaws.com:5432/roadmapx?schema=public"
```

## Step 2: Set up AWS S3

### Using AWS Console:

1. **Navigate to AWS S3**
   - Go to the AWS Console
   - Search for "S3" and select "Amazon S3"

2. **Create Bucket**
   - Click "Create bucket"
   - **Bucket name**: `roadmapx-files` (must be globally unique)
   - **Region**: Choose your preferred region (e.g., ap-south-1)
   - **Block Public Access**: Keep default settings
   - **Bucket Versioning**: Disable (for cost savings)
   - **Default encryption**: Enable (recommended)

3. **Configure Bucket Policy**
   - Go to your bucket → Permissions → Bucket Policy
   - Add the following policy (replace `your-bucket-name`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowAppAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-IAM-USER"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### Update Backend Configuration:

Update your `backend/.env` file:
```env
S3_BUCKET_NAME="roadmapx-files"
S3_REGION="ap-south-1"
```

## Step 3: Set up AWS IAM User

### Create IAM User for Application:

1. **Navigate to AWS IAM**
   - Go to the AWS Console
   - Search for "IAM" and select "Identity and Access Management"

2. **Create User**
   - Click "Users" → "Create user"
   - **User name**: `roadmapx-app-user`
   - **Access type**: Programmatic access

3. **Attach Policies**
   - Attach the following policies:
     - `AmazonS3FullAccess` (or create custom policy for your bucket)
     - `AmazonCognitoPowerUser` (for Cognito access)
     - `AmazonRDSFullAccess` (for RDS access)

4. **Get Credentials**
   - Download the CSV file with Access Key ID and Secret Access Key
   - **Important**: Save these credentials securely!

### Update Backend Configuration:

Update your `backend/.env` file:
```env
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="ap-south-1"
```

## Step 4: Configure Cognito (Already Done)

Your Cognito configuration is already set up in the frontend. The backend will use the same configuration:

```env
COGNITO_USER_POOL_ID="ap-south-1_xvrrny"
COGNITO_CLIENT_ID="389njg8uapg5pfrjpm47q5m9pu"
```

## Step 5: Deploy and Test

### Backend Setup:

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp env.example .env
   # Update .env with your AWS credentials
   ```

4. **Set up database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Frontend Setup:

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Update .env with your API URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Step 6: Test the Integration

1. **Test Backend Health**
   - Visit: `http://localhost:3001/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

2. **Test Frontend**
   - Visit: `http://localhost:8080`
   - Sign up/Sign in with Cognito
   - Create a roadmap
   - Upload files
   - Check progress tracking

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check if RDS instance is running
   - Verify security group allows connections
   - Check database URL format

2. **S3 Upload Error**
   - Verify bucket name and region
   - Check IAM user permissions
   - Ensure bucket policy is correct

3. **Cognito Authentication Error**
   - Verify user pool ID and client ID
   - Check if user pool is active
   - Verify JWT token format

### Security Best Practices:

1. **Never commit credentials to version control**
2. **Use environment variables for all secrets**
3. **Enable encryption for S3 buckets**
4. **Use least privilege principle for IAM users**
5. **Regularly rotate access keys**

## Cost Optimization

### For Development:
- Use RDS free tier (db.t3.micro)
- Use S3 standard storage
- Set up CloudWatch billing alerts

### For Production:
- Consider RDS Reserved Instances
- Use S3 Intelligent Tiering
- Implement proper backup strategies
- Monitor costs with AWS Cost Explorer

## Next Steps

1. Set up monitoring with CloudWatch
2. Implement backup strategies
3. Set up CI/CD pipeline
4. Configure custom domain
5. Implement proper logging and error tracking

## Support

If you encounter issues:
1. Check AWS CloudWatch logs
2. Verify all environment variables
3. Test each service individually
4. Check AWS service status page
5. Review AWS documentation for your specific region
