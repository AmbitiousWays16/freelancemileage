import { useState, useEffect, useRef } from 'react';
import miletrackLogo from '@/assets/miletrack-logo.svg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Car } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { FeaturesOverview } from '@/components/FeaturesOverview';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Strong password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255, 'Email is too long'),
  password: passwordSchema,
});

// Less strict validation for sign-in (we don't know what password rules existed when they signed up)
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255, 'Email is too long'),
  password: z.string().min(1, 'Password is required'),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, session, loading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const hasCheckedHash = useRef(false);

  // Check URL hash for invite/recovery tokens on initial load only
  useEffect(() => {
    if (hasCheckedHash.current) return;
    hasCheckedHash.current = true;

    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'invite' || type === 'recovery') {
        setIsSettingPassword(true);
      }
    }
  }, []);

  // When session becomes available and we're in password setting mode, populate email
  useEffect(() => {
    if (session?.user?.email && isSettingPassword) {
      setEmail(session.user.email);
    }
  }, [session, isSettingPassword]);

  // Handle redirect for authenticated users (not in password setting mode)
  useEffect(() => {
    if (user && !loading && !isSettingPassword) {
      // Use requestAnimationFrame to ensure React has finished its current render cycle
      const frameId = requestAnimationFrame(() => {
        navigate('/', { replace: true });
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [user, loading, navigate, isSettingPassword]);

  const handleSetPassword = async () => {
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password set successfully! You are now signed in.');
        setIsSettingPassword(false);
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        // Navigate after a brief delay to let state settle
        requestAnimationFrame(() => {
          navigate('/', { replace: true });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuth = async (action: 'signin' | 'signup') => {
    // Use strict validation for signup, relaxed for signin
    const schema = action === 'signup' ? authSchema : signInSchema;
    const validation = schema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = action === 'signin' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message);
        }
      } else if (action === 'signup') {
        toast.success('Account created! You are now signed in.');
      }
    } finally {
    setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Failed to sign in with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address first');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setIsForgotPassword(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show password setting form for invited users
  if (isSettingPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mx-auto">
                <Car className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle as="h1" className="text-2xl">Set Your Password</CardTitle>
            <CardDescription>
              Welcome! Please create a password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="set-email">Email</Label>
              <Input
                id="set-email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-password">New Password</Label>
              <Input
                id="set-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSetPassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Set Password & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={miletrackLogo} alt="MileTrack - Business mileage tracking and invoicing application logo" className="h-16 w-16 rounded-2xl mx-auto" />
            </div>
            <CardTitle className="text-2xl">MileTrack</CardTitle>
            <CardDescription>Track your business mileage & generate invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {isForgotPassword ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Enter your email above and we'll send you a password reset link.
                    </p>
                    <Button
                      className="w-full"
                      onClick={handleForgotPassword}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Send Reset Link
                    </Button>
                    <Button
                      variant="link"
                      className="w-full text-sm"
                      onClick={() => setIsForgotPassword(false)}
                    >
                      Back to sign in
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="link"
                      className="w-full text-sm p-0 h-auto"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Forgot your password?
                    </Button>
                <Button
                  className="w-full"
                  onClick={() => handleAuth('signin')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign In
                </Button>
                
                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
                  </>
                )}
              </TabsContent>
              <TabsContent value="signup" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleAuth('signup')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
                
                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <FeaturesOverview />
    </>
  );
};

export default Auth;