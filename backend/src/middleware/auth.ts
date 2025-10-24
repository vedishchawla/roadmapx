import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { COGNITO_CONFIG } from '../config/aws';
import { prisma } from '../index';

// Create JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_CONFIG.userPoolId,
  tokenUse: 'access',
  clientId: COGNITO_CONFIG.clientId,
});

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TEMPORARY: Skip JWT verification for development
    // TODO: Add real AWS credentials to enable proper authentication
    
    // Create or find mock user for development
    const mockUser = await prisma.user.upsert({
      where: { cognitoId: 'dev-cognito-123' },
      update: {},
      create: {
        cognitoId: 'dev-cognito-123',
        email: 'dev@example.com',
        name: 'Development User'
      }
    });

    // Add user to request object
    (req as any).user = mockUser;
    console.log('🔧 Using mock user for development:', mockUser.email);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
