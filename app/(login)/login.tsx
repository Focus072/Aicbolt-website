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
import { ShaderBackground } from '@/components/ui/shader-background';

export function Login() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [state, formAction, pending] = useFormState<ActionState, FormData>(
    signIn,
    { error: '' }
  );

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
      <ShaderBackground />
      <div className="relative z-10">
        <Link href="/" className="absolute top-4 left-4 text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Go Back Home
        </Link>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <CircleIcon className="h-12 w-12 text-orange-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600 drop-shadow-lg">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 p-6 sm:p-8">
            <form className="space-y-6" action={formAction}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              <div>
                <Label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-200"
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
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-200"
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
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-700/50 border border-gray-600 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {state?.error && (
                <div className="text-red-400 text-sm">{state.error}</div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
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
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800/50 text-gray-300">
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
