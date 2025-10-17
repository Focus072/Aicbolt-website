'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function ActivateAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    setToken(tokenParam);
    
    if (tokenParam) {
      validateToken(tokenParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const validateToken = async (tokenValue: string) => {
    try {
      const response = await fetch('/api/account/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setValidToken(true);
        setUserEmail(data.email);
      } else {
        setValidToken(false);
        toast.error('Invalid or expired invitation link');
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setValidToken(false);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/account/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      if (response.ok) {
        toast.success('Account activated successfully!');
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to activate account');
      }
    } catch (error) {
      console.error('Error activating account:', error);
      toast.error('Error activating account');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20">
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/5 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-400">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || !validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20">
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/5 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h2>
            <p className="text-gray-400 text-center mb-6">
              This invitation link is invalid or has expired.
            </p>
            <Button
              onClick={() => router.push('/sign-in')}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20 p-4">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Activate Your Account</CardTitle>
          <CardDescription className="text-gray-400">
            Create a password for {userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={8}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password *
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={8}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
              />
            </div>

            <Button
              type="submit"
              disabled={processing}
              className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition-all"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Activating...
                </>
              ) : (
                'Activate Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/20">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    }>
      <ActivateAccountForm />
    </Suspense>
  );
}


