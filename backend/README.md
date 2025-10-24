# RoadmapX Backend API

A Node.js/Express backend API for the RoadmapX application with AWS RDS (PostgreSQL) and S3 integration.

## Features

- 🔐 JWT Authentication with AWS Cognito
- 📊 PostgreSQL Database with Prisma ORM
- 📁 AWS S3 File Storage
- 🛡️ TypeScript for type safety
- 📝 Comprehensive API documentation
- 🔄 Progress tracking and analytics

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (AWS RDS)
- **ORM**: Prisma
- **File Storage**: AWS S3
- **Authentication**: AWS Cognito
- **Validation**: Zod

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (AWS RDS)
- AWS Account with S3 and Cognito configured
- AWS CLI configured (optional)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your AWS credentials and database URL.

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/roadmapx?schema=public"

# AWS Configuration
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# Cognito Configuration
COGNITO_USER_POOL_ID="ap-south-1_xvrrny"
COGNITO_CLIENT_ID="389njg8uapg5pfrjpm47q5m9pu"

# S3 Configuration
S3_BUCKET_NAME="roadmapx-files"
S3_REGION="ap-south-1"

# Server Configuration
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:8080"
```

## API Endpoints

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Roadmaps
- `GET /api/roadmaps` - Get all roadmaps for user
- `GET /api/roadmaps/:id` - Get specific roadmap
- `POST /api/roadmaps` - Create new roadmap
- `PUT /api/roadmaps/:id` - Update roadmap
- `DELETE /api/roadmaps/:id` - Delete roadmap
- `PATCH /api/roadmaps/:id/status` - Update roadmap status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### Files
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files` - Get user's files
- `GET /api/files/:id` - Get specific file
- `GET /api/files/:id/download` - Get signed download URL
- `DELETE /api/files/:id` - Delete file

### Progress
- `GET /api/progress/:roadmapId` - Get progress for roadmap
- `POST /api/progress/:roadmapId` - Create progress entry
- `PUT /api/progress/:id` - Update progress entry
- `DELETE /api/progress/:id` - Delete progress entry
- `GET /api/progress/stats/:roadmapId` - Get progress statistics

## Database Schema

The application uses the following main entities:

- **User**: User accounts linked to Cognito
- **Roadmap**: Learning roadmaps with phases and milestones
- **Phase**: Roadmap phases with milestones
- **Milestone**: Individual learning milestones
- **Resource**: Learning resources for milestones
- **Progress**: User progress tracking
- **File**: File metadata for S3 storage

## AWS Services Setup

### RDS (PostgreSQL)
1. Create an RDS PostgreSQL instance
2. Configure security groups to allow connections
3. Update `DATABASE_URL` in environment variables

### S3
1. Create an S3 bucket for file storage
2. Configure bucket permissions
3. Update `S3_BUCKET_NAME` in environment variables

### Cognito
1. Create a User Pool (already configured in frontend)
2. Update `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID`

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run migrations
npm run db:studio   # Open Prisma Studio
```

## Production Deployment

1. Set up environment variables for production
2. Configure AWS services for production
3. Set up CI/CD pipeline
4. Deploy to your preferred platform (AWS, Vercel, etc.)

## Security Features

- JWT token verification with AWS Cognito
- Input validation with Zod schemas
- File type and size restrictions
- CORS configuration
- Helmet for security headers
- SQL injection protection via Prisma

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Server errors (500)
- Database constraint errors
