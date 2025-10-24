import { Amplify } from 'aws-amplify';

// AWS Cognito configuration
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || 'ap-south-1_xvrrny',
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID || '389njg8uapg5pfrjpm47q5m9pu',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      loginWith: {
        email: true,
        username: true,
        phone: false,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
      oauth: {
        domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN || 'us-east-1tozv7dwua.auth.us-east-1.amazoncognito.com',
        scope: ['openid', 'email', 'profile'],
        redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN || 'http://localhost:8080/auth',
        redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT || 'http://localhost:8080/auth',
        responseType: 'code',
        providers: ['Google']
      },
    },
  },
};

// Configure Amplify
Amplify.configure(awsConfig);

export default awsConfig;