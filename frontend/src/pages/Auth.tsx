import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, confirmRegistration, resendConfirmationCode, isLoading } = useAuth();
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password validation criteria
  const passwordCriteria = [
    {
      id: 'length',
      text: 'At least 8 characters',
      test: (pwd: string) => pwd.length >= 8
    },
    {
      id: 'lowercase',
      text: 'At least 1 lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd)
    },
    {
      id: 'uppercase',
      text: 'At least 1 uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd)
    },
    {
      id: 'number',
      text: 'At least 1 number',
      test: (pwd: string) => /\d/.test(pwd)
    },
    {
      id: 'special',
      text: 'At least 1 special character',
      test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    }
  ];

  const PasswordCriteria = ({ password }: { password: string }) => {
    const allCriteriaMet = passwordCriteria.every(criterion => criterion.test(password));
    
    return (
      <div className="mt-2 space-y-1">
        {passwordCriteria.map((criterion) => {
          const isValid = criterion.test(password);
          return (
            <div key={criterion.id} className="flex items-center space-x-2 text-sm">
              {isValid ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-gray-400" />
              )}
              <span className={isValid ? "text-green-600" : "text-gray-500"}>
                {criterion.text}
              </span>
            </div>
          );
        })}
        {password && (
          <div className={`mt-2 text-xs font-medium ${
            allCriteriaMet ? "text-green-600" : "text-gray-500"
          }`}>
            {allCriteriaMet ? "✅ Password meets all requirements!" : "Complete all requirements above"}
          </div>
        )}
      </div>
    );
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("login-email") as string;
    const password = formData.get("login-password") as string;

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      // Error handling is done in the AuthContext
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("signup-name") as string;
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;

    try {
      await register(email, password, name);
      setVerificationEmail(email);
      setShowVerification(true);
    } catch (error) {
      // Error handling is done in the AuthContext
    }
  };

  const handleVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get("verification-code") as string;

    try {
      await confirmRegistration(verificationEmail, code, password);
      setShowVerification(false);
      // User is now automatically logged in, redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      // Error handling is done in the AuthContext
    }
  };

  return (
    <div className="min-h-screen gradient-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-strong">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RoadmapX
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Your Personalized Learning Journey Starts Here
            </h2>
            <p className="text-lg text-muted-foreground">
              AI-powered roadmaps tailored to your skills, goals, and learning style. 
              Track your progress and achieve your dreams faster.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="gradient-card p-6 rounded-2xl shadow-soft">
              <Sparkles className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Smart recommendations</p>
            </div>
            <div className="gradient-card p-6 rounded-2xl shadow-soft">
              <Brain className="w-8 h-8 text-secondary mb-2" />
              <h3 className="font-semibold mb-1">Personalized</h3>
              <p className="text-sm text-muted-foreground">Just for you</p>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <Card className="shadow-strong gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      name="login-email"
                      type="email" 
                      placeholder="you@example.com"
                      required
                      className="transition-smooth"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input 
                      id="login-password" 
                      name="login-password"
                      type="password"
                      required
                      className="transition-smooth"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary shadow-medium transition-smooth hover:shadow-strong"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  
                  <p className="text-sm text-center text-muted-foreground">
                    Secure authentication with AWS Cognito
                  </p>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name" 
                      name="signup-name"
                      type="text" 
                      placeholder="John Doe"
                      required
                      className="transition-smooth"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      name="signup-email"
                      type="email" 
                      placeholder="you@example.com"
                      required
                      className="transition-smooth"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      name="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-smooth"
                    />
                    <PasswordCriteria password={password} />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary shadow-medium transition-smooth hover:shadow-strong"
                    disabled={isLoading || (password && !passwordCriteria.every(criterion => criterion.test(password)))}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  
                  
                  <p className="text-sm text-center text-muted-foreground">
                    Secure authentication with AWS Cognito
                  </p>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Email Verification Form */}
            {showVerification && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="text-lg font-semibold mb-2">Verify Your Email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We've sent a verification code to {verificationEmail}. Please enter it below.
                </p>
                <form onSubmit={handleVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input 
                      id="verification-code" 
                      name="verification-code"
                      type="text" 
                      placeholder="Enter 6-digit code"
                      required
                      className="transition-smooth"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      className="flex-1 gradient-primary shadow-medium transition-smooth hover:shadow-strong"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify Email"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => resendConfirmationCode(verificationEmail)}
                      disabled={isLoading}
                    >
                      Resend
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
