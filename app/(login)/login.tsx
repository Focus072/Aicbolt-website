'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2, ArrowLeft } from 'lucide-react';
import { signIn } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import ShaderBackground from '@/components/ui/shader-background';

export function Login() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [state, formAction, pending] = useFormState<ActionState, FormData>(
    signIn,
    { error: '' }
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Shader Background */}
      <ShaderBackground isAnimating={true} />
      
      {/* Go Back Home Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/20 border border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back Home
        </Link>
      </div>

      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <CircleIcon className="h-12 w-12 text-orange-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Glassmorphism Form Container */}
          <div className="bg-gray-900/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <form className="space-y-6" action={formAction}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              <div>
                <Label
                  htmlFor="username"
                  className="block text-sm font-medium text-white/90"
                >
                  Username
                </Label>
                <div className="mt-1">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    defaultValue={state.username}
                    required
                    maxLength={50}
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-600/50 placeholder-gray-400 text-white bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-white/90"
                >
                  Password
                </Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    defaultValue={state.password}
                    required
                    minLength={8}
                    maxLength={100}
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-600/50 placeholder-gray-400 text-white bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {state?.error && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">{state.error}</div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Loading...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900/20 text-gray-300">
                    Need an account? Contact your administrator.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
