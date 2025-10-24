import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, resendSignUpCode, fetchUserAttributes, signInWithRedirect } from 'aws-amplify/auth';
import { toast } from 'sonner';

interface User {
  userId: string;
  username: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  confirmRegistration: (email: string, code: string, password: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // Get user attributes to get the full name
        const userAttributes = await fetchUserAttributes();
        setUser({
          userId: currentUser.userId,
          username: currentUser.username,
          email: userAttributes.email || currentUser.signInDetails?.loginId || '',
          emailVerified: userAttributes.email_verified || true,
          name: userAttributes.name || userAttributes.given_name || '',
        });
      }
    } catch (error) {
      // User is not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Force logout any existing session before attempting login
      try {
        await signOut();
        // Add a small delay to ensure session is fully cleared
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Ignore logout errors - user might not be logged in
        console.log('No existing session to clear');
      }
      
      // Double check - if still authenticated, force logout again
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log('Still authenticated, forcing logout...');
          await signOut();
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        // Good - user is not authenticated
      }
      
      // Proceed with login
      await signIn({
        username: email,
        password,
      });
      
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
        email: userAttributes.email || currentUser.signInDetails?.loginId || email,
        emailVerified: userAttributes.email_verified || true,
        name: userAttributes.name || userAttributes.given_name || '',
      });
      
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
      
      toast.success('Account created! Please check your email for verification code.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRegistration = async (email: string, code: string, password: string) => {
    try {
      setIsLoading(true);
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      
      // Auto-login after successful verification
      await signIn({
        username: email,
        password: password,
      });
      
      // Get user details after successful login
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const userAttributes = await fetchUserAttributes();
        setUser({
          userId: currentUser.userId,
          username: currentUser.username,
          email: userAttributes.email || currentUser.signInDetails?.loginId || email,
          emailVerified: true,
          name: userAttributes.name || userAttributes.given_name || '',
        });
        toast.success('Email verified and logged in successfully!');
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast.error(error.message || 'Verification failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationCode = async (email: string) => {
    try {
      await resendSignUpCode({ username: email });
      toast.success('Verification code sent to your email.');
    } catch (error: any) {
      console.error('Resend code error:', error);
      toast.error(error.message || 'Failed to resend code. Please try again.');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect({
        provider: 'Google'
      });
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Google sign-in failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    confirmRegistration,
    resendConfirmationCode,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
