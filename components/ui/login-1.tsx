"use client"

import { FcGoogle } from "react-icons/fc";
import { ArrowLeft } from "lucide-react";
import { signIn } from "@/app/(login)/actions";
import { useFormState } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Login1Props {
  heading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
  mode?: 'signin' | 'signup';
}

const Login1 = ({
  heading,
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://www.shadcnblocks.com/images/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  buttonText = "Login",
  googleText = "Sign up with Google",
  signupText = "Don't have an account?",
  signupUrl = "https://shadcnblocks.com",
  mode = 'signin',
}: Login1Props) => {
  const [state, formAction, pending] = useFormState(
    signIn,
    { error: '' }
  );

  return (
    <section className="bg-muted bg-background h-screen">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 px-6 py-4 sm:px-8 sm:py-6 rounded-full border-2 bg-white/90 border-white/20 text-sm sm:text-base text-gray-900 hover:bg-white hover:scale-105 transition-all duration-200 font-semibold shadow-lg cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {heading && <h1 className="text-3xl font-light tracking-wide text-gray-800">{heading}</h1>}
          </div>
          {state?.error && (
            <div className="w-full p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {state.error}
            </div>
          )}
          <form action={formAction} className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input type="email" name="email" placeholder="Email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Input type="password" name="password" placeholder="Password" required />
              </div>
              <div className="flex flex-col gap-4">
                <Button 
                  type="submit"
                  disabled={pending}
                  className="mt-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pending ? 'Loading...' : buttonText}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full border-gray-300 hover:border-orange-500 hover:bg-orange-50 text-gray-700 hover:text-orange-700 font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
                >
                  <FcGoogle className="mr-2 size-5" />
                  {googleText}
                </Button>
              </div>
            </div>
          </form>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <a
              href={signupUrl}
              className="text-orange-600 font-medium hover:text-orange-700 hover:underline transition-colors duration-200 hover:scale-105 inline-block"
            >
              {signupUrl.includes('sign-in') ? 'Sign in' : 'Sign up'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login1 };
