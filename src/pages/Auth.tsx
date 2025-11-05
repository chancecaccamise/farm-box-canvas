import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isPasswordUpdate, setIsPasswordUpdate] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [emailNewsletter, setEmailNewsletter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const { user, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle password reset token from email
  useEffect(() => {
    const qp = new URLSearchParams(window.location.search);
    const code = qp.get('code');
    const errorDescription = qp.get('error_description');

    // Handle error from URL
    if (errorDescription) {
      toast({
        title: "Error",
        description: errorDescription,
        variant: "destructive",
      });
      return;
    }

    // Check for recovery flow in hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    // Handle code exchange if present
    const handleCodeExchange = async () => {
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } catch (err: any) {
          toast({
            title: "Error",
            description: err?.message || "Invalid or expired reset link",
            variant: "destructive",
          });
          setIsPasswordUpdate(false);
          setValidatingToken(false);
        }
      }
    };

    // If recovery flow is detected OR we have a code, start validation
    if (type === 'recovery' || code || accessToken) {
      setValidatingToken(true);
      setIsPasswordUpdate(true);

      // Exchange code first if present, then poll for session
      handleCodeExchange().finally(() => {
        let attempts = 0;
        const maxAttempts = 40; // 40 * 250ms = 10 seconds
        
        const interval = setInterval(async () => {
          attempts++;
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            clearInterval(interval);
            setValidatingToken(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            toast({
              title: "Error",
              description: "Password reset link is invalid or has expired",
              variant: "destructive",
            });
            setIsPasswordUpdate(false);
            setValidatingToken(false);
            navigate('/auth');
          }
        }, 250);
      });
    }
  }, [toast, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!firstName.trim() || !lastName.trim()) {
          toast({
            title: "Error",
            description: "First name and last name are required",
            variant: "destructive",
          });
          return;
        }

        if (!phone.trim()) {
          toast({
            title: "Error",
            description: "Phone number is required",
            variant: "destructive",
          });
          return;
        }

        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords don't match",
            variant: "destructive",
          });
          return;
        }
        
        const { error } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          sms_notifications: smsNotifications,
          email_newsletter: emailNewsletter
        });
        
        if (error) {
          toast({
            title: "Sign Up Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Account created successfully! Please check your email for verification.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign In Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: "Success",
          description: "Check your email for a password reset link",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (newPassword !== confirmNewPassword) {
        toast({
          title: "Error",
          description: "Passwords don't match",
          variant: "destructive",
        });
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully! You can now sign in.",
        });
        navigate('/auth');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to Billy's Botanicals</h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'Create your account to start ordering fresh produce' : 'Sign in to continue your farm box journey'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isPasswordUpdate 
                ? 'Update Password' 
                : isPasswordReset 
                ? 'Reset Password' 
                : isSignUp 
                ? 'Create Account' 
                : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {isPasswordUpdate
                ? 'Enter your new password below'
                : isPasswordReset
                ? resetEmailSent 
                  ? 'Check your email for a reset link' 
                  : 'Enter your email to receive a password reset link'
                : isSignUp 
                ? 'Join thousands of families enjoying fresh farm produce' 
                : 'Welcome back! Please sign in to your account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isPasswordUpdate ? (
              validatingToken ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Validating reset link...</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
              )
            ) : isPasswordReset ? (
              <>
                {resetEmailSent ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-sm">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Please check your email and click the link to reset your password.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsPasswordReset(false);
                        setResetEmailSent(false);
                        setEmail('');
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsPasswordReset(false)}
                        className="text-sm text-primary hover:underline"
                      >
                        Back to sign in
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
              <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Marketing Preferences (Optional)</h3>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="smsNotifications"
                          checked={smsNotifications}
                          onCheckedChange={(checked) => setSmsNotifications(checked === true)}
                        />
                        <Label htmlFor="smsNotifications" className="text-sm">
                          I'd like to receive text notifications about weekly farm boxes and fresh fish
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="emailNewsletter"
                          checked={emailNewsletter}
                          onCheckedChange={(checked) => setEmailNewsletter(checked === true)}
                        />
                        <Label htmlFor="emailNewsletter" className="text-sm">
                          Sign me up for Billy's Botanicals email newsletter
                        </Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>
            
            {!isSignUp && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsPasswordReset(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}