"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  
  const { data: user, error } = useSWR('/api/user', fetcher);

  useEffect(() => {
    if (user || error) {
      setIsLoading(false);
      
      if (user) {
        // Check if user is admin
        const isMainAdmin = user.email === 'galaljobah@gmail.com';
        const isAdmin = user.role === 'admin' || user.role === 'owner' || isMainAdmin;
        
        setIsAuthorized(isAdmin);
      }
    }
  }, [user, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to access this page.
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              This page is restricted to administrators only.
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')} 
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
