# AWS Cognito Setup Guide

This guide will help you set up AWS Cognito for user authentication in your RoadmapX application.

## Prerequisites

- AWS Account
- AWS CLI installed and configured (optional but recommended)
- Node.js and npm installed

## Step 1: Create AWS Cognito User Pool

### Using AWS Console:

1. **Navigate to AWS Cognito**
   - Go to the AWS Console
   - Search for "Cognito" and select "Amazon Cognito"

2. **Create User Pool**
   - Click "Create user pool"
   - Choose "Cognito user pool" (not identity pool)
   - Click "Next"

3. **Configure Sign-in Experience**
   - **User pool name**: `roadmapx` (or your preferred name)
   - **Cognito user pool sign-in options**: Select "Email"
   - Click "Next"

4. **Configure Security Requirements**
   - **Password policy**: Use the default or customize as needed
   - **Multi-factor authentication**: Choose "No MFA" for simplicity (or enable if needed)
   - **User account recovery**: Select "Email only"
   - Click "Next"

5. **Configure Sign-up Experience**
   - **Self-service sign-up**: Enable
   - **Cognito-assisted verification**: Select "Send email verification message"
   - **Required attributes**: Select "email" and "name"
   - **Custom attributes**: Leave empty for now
   - Click "Next"

6. **Configure Message Delivery**
   - **Email**: Select "Send email with Cognito"
   - Click "Next"

7. **Integrate Your App**
   - **User pool name**: This will be auto-filled
   - **Hosted authentication pages**: Enable this for better UX
   - **Domain**: Choose a unique domain name (e.g., `roadmapx-auth`)
   - **Return URL**: Enter `http://localhost:8080/auth` (for development)
   - **Initial app client**: Click "Add app client"
     - **App type**: "Public client"
     - **App client name**: `roadmapx-web-client`
     - **Client secret**: Uncheck "Generate client secret" (for web apps)
     - **Authentication flows**: Select "ALLOW_USER_SRP_AUTH" and "ALLOW_REFRESH_TOKEN_AUTH"
   - Click "Next"

8. **Review and Create**
   - Review your settings
   - Click "Create user pool"

## Step 2: Get Your Configuration Values

After creating the user pool, you'll need these values:

1. **User Pool ID**: Found in the "General settings" tab
   - Format: `us-east-1_XXXXXXXXX`

2. **App Client ID**: Found in the "App integration" tab under "App clients"
   - Format: `your-web-client-id`

3. **Region**: The AWS region where you created the user pool
   - Example: `us-east-1`

## Step 3: Configure Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your actual values**:
   ```env
   # AWS Cognito Configuration
   VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
   VITE_AWS_USER_POOL_WEB_CLIENT_ID=your-web-client-id
   VITE_AWS_REGION=us-east-1
   
   # Cognito Domain (for hosted authentication pages)
   VITE_AWS_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
   
   # Redirect URLs (for OAuth flow)
   VITE_REDIRECT_SIGN_IN=http://localhost:8080/auth
   VITE_REDIRECT_SIGN_OUT=http://localhost:8080/auth
   ```

3. **Replace the placeholder values** with your actual Cognito configuration.

## Step 4: Test the Implementation

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the authentication flow**:
   - Navigate to `/auth`
   - Try creating a new account
   - Check your email for the verification code
   - Verify your email
   - Try logging in

## Step 5: Optional - Advanced Configuration

### Custom Email Templates

You can customize the email templates in the AWS Console:
1. Go to your User Pool
2. Navigate to "Message customizations"
3. Customize the verification email template

### Hosted Authentication Pages

If you prefer to use AWS Cognito's hosted authentication pages:
1. Go to your User Pool
2. Navigate to "App integration"
3. Set up a domain for hosted authentication
4. Update your app to redirect to the hosted pages

### Social Identity Providers

To add Google, Facebook, or other social logins:
1. Go to your User Pool
2. Navigate to "Sign-in experience"
3. Add identity providers
4. Configure the social provider settings

## Troubleshooting

### Common Issues:

1. **"User does not exist" error**:
   - Make sure the user is confirmed in the Cognito console
   - Check if the email verification was completed

2. **"Invalid client" error**:
   - Verify your App Client ID is correct
   - Make sure the client is configured for your domain

3. **CORS errors**:
   - Add your domain to the allowed origins in Cognito
   - Check your Vite configuration for CORS settings

4. **Environment variables not loading**:
   - Make sure your `.env` file is in the frontend directory
   - Restart your development server after changing environment variables

### Debug Mode:

To enable debug logging, add this to your `aws-config.ts`:
```typescript
import { Amplify } from 'aws-amplify';

// Enable debug logging
Amplify.configure({
  ...awsConfig,
  Logging: {
    level: 'DEBUG'
  }
});
```

## Security Best Practices

1. **Never commit your `.env` file** to version control
2. **Use environment-specific user pools** for development and production
3. **Enable MFA** for production environments
4. **Set up proper password policies**
5. **Use HTTPS** in production
6. **Regularly rotate your app client secrets** (if using them)

## Next Steps

Once authentication is working:

1. **Add user profile management**
2. **Implement password reset functionality**
3. **Add role-based access control**
4. **Set up monitoring and logging**
5. **Configure production environment**

## Support

If you encounter issues:

1. Check the AWS Cognito documentation
2. Review the AWS Amplify documentation
3. Check the browser console for error messages
4. Verify your configuration values

For more advanced features, consider:
- AWS Cognito Identity Pools for AWS service access
- Custom authentication flows
- Lambda triggers for custom logic
- Integration with other AWS services
