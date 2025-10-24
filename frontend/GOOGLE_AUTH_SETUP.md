# Google Authentication Setup Guide

This guide will help you set up Google authentication for your RoadmapX application using AWS Cognito.

## Prerequisites

- AWS Cognito User Pool already configured
- Google Cloud Console account
- Your React application running

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. **Name**: `RoadmapX Web Client`
5. **Authorized JavaScript origins**: 
   - `http://localhost:8080` (for development)
   - `https://yourdomain.com` (for production)
6. **Authorized redirect URIs**:
   - `https://your-domain.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
7. Click **Create**
8. **Copy the Client ID and Client Secret**

## Step 2: Configure AWS Cognito

### 2.1 Add Google as Identity Provider
1. Go to your **AWS Cognito User Pool**
2. Navigate to **Sign-in experience** tab
3. Click **Add identity provider**
4. Choose **Google**
5. **Google client ID**: Paste your Google Client ID
6. **Google client secret**: Paste your Google Client Secret
7. **Scopes**: `email`, `openid`, `profile`
8. **Attribute mapping**:
   - **Email**: `email`
   - **Name**: `name`
   - **Given name**: `given_name`
   - **Family name**: `family_name`
9. Click **Add identity provider**

### 2.2 Update App Client Settings
1. Go to **App integration** tab
2. Click on your app client
3. **Edit** the app client
4. **Identity providers**: Select **Google** (in addition to Cognito)
5. **OAuth 2.0 grant types**: Select **Authorization code grant**
6. **OAuth scopes**: Select `email`, `openid`, `profile`
7. **Callback URLs**: Add your callback URLs:
   - `http://localhost:8080/auth` (development)
   - `https://yourdomain.com/auth` (production)
8. **Sign out URLs**: Add your sign out URLs:
   - `http://localhost:8080/auth` (development)
   - `https://yourdomain.com/auth` (production)
9. **Save changes**

## Step 3: Update Your React Application

### 3.1 Update AWS Configuration
Add Google OAuth configuration to your `aws-config.ts`:

```typescript
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION,
      loginWith: {
        email: true,
        username: true,
        phone: false,
      },
      oauth: {
        domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN,
        scope: ['email', 'openid', 'profile'],
        redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN,
        redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT,
        responseType: 'code',
        providers: ['Google']
      },
    },
  },
};
```

### 3.2 Add Environment Variables
Update your `.env` file:

```env
# AWS Cognito Configuration
VITE_AWS_USER_POOL_ID=us-east-1_toZv7dwUa
VITE_AWS_USER_POOL_WEB_CLIENT_ID=your-app-client-id
VITE_AWS_REGION=us-east-1

# Cognito Domain (get this from your User Pool)
VITE_AWS_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com

# Redirect URLs
VITE_REDIRECT_SIGN_IN=http://localhost:8080/auth
VITE_REDIRECT_SIGN_OUT=http://localhost:8080/auth
```

### 3.3 Implement Google Sign-In
Update your AuthContext to handle Google authentication:

```typescript
import { signInWithRedirect } from 'aws-amplify/auth';

const signInWithGoogle = async () => {
  try {
    await signInWithRedirect({
      provider: 'Google'
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    toast.error('Google sign-in failed. Please try again.');
  }
};
```

## Step 4: Test Google Authentication

1. **Start your development server**: `npm run dev`
2. **Navigate to** `http://localhost:8080/auth`
3. **Click "Continue with Google"**
4. **You should be redirected to Google's OAuth page**
5. **After authentication, you'll be redirected back to your app**

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**:
   - Check that your redirect URIs in Google Console match your Cognito domain
   - Ensure the callback URLs in Cognito are correct

2. **"Client ID not found" error**:
   - Verify your Google Client ID is correct
   - Check that the Google identity provider is enabled in Cognito

3. **CORS errors**:
   - Add your domain to allowed origins in Google Console
   - Check your Vite configuration for CORS settings

4. **"Invalid client" error**:
   - Verify your Cognito app client configuration
   - Check that OAuth 2.0 grant types are enabled

### Debug Steps:

1. **Check browser console** for error messages
2. **Verify environment variables** are loaded correctly
3. **Test with different browsers** to rule out browser-specific issues
4. **Check AWS CloudWatch logs** for server-side errors

## Production Deployment

When deploying to production:

1. **Update redirect URIs** in Google Console to your production domain
2. **Update callback URLs** in Cognito to your production domain
3. **Use HTTPS** for all URLs (required by Google OAuth)
4. **Update environment variables** with production values

## Security Best Practices

1. **Never expose client secrets** in frontend code
2. **Use environment variables** for all configuration
3. **Enable HTTPS** in production
4. **Regularly rotate** OAuth credentials
5. **Monitor authentication logs** for suspicious activity

## Next Steps

Once Google authentication is working:

1. **Add more social providers** (Facebook, Apple, etc.)
2. **Implement account linking** for users with multiple providers
3. **Add user profile management**
4. **Set up monitoring and analytics**

## Support

If you encounter issues:

1. Check the [AWS Cognito documentation](https://docs.aws.amazon.com/cognito/)
2. Review the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the [AWS Amplify documentation](https://docs.amplify.aws/)
4. Verify your configuration matches the examples above
