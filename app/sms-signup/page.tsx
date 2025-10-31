'use client';

import ShaderBackground from '@/components/ui/shader-background';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Footer } from '@/components/ui/footer';

export default function SMSSignupPage() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'SMS Opt-In - AICBOLT';
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) value = value.slice(0, 10);
    // Format as (XXX) XXX-XXXX
    if (value.length > 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhoneNumber(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consentChecked && phoneNumber.replace(/\D/g, '').length === 10) {
      setSubmitted(true);
    }
  };

  const isValid = consentChecked && phoneNumber.replace(/\D/g, '').length === 10;

  return (
    <div className="relative min-h-screen">
      {/* Shader Background */}
      <ShaderBackground isAnimating={isAnimating} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            {/* Back Button */}
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="mb-8 bg-gray-900/20 border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300"
                aria-label="Back to Home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Back to Home
              </Button>
            </Link>

            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="flex items-center justify-center mb-6">
                <MessageSquare className="h-12 w-12 text-orange-400" aria-hidden="true" />
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6
                  bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent
                  drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                AICBOLT
              </h1>
              <p
                className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-4"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                Subscribe to receive account notifications via SMS
              </p>
              <p className="text-sm text-gray-400">
                You may receive up to 2 messages per month
              </p>
            </div>

            {/* Success Message */}
            {submitted ? (
              <div className="bg-gray-900/30 backdrop-blur-xl border border-green-500/50 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-400" aria-hidden="true" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Thank You for Subscribing!</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  You are successfully opted in for messages from AICBOLT for account notifications. 
                  Message and data rates may apply. Reply HELP for additional support. Reply STOP to unsubscribe.
                </p>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="bg-gray-900/20 border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300"
                  >
                    Return to Home
                  </Button>
                </Link>
              </div>
            ) : (
              /* Opt-In Form */
              <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Phone Number Input */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="(555) 123-4567"
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300"
                      aria-required="true"
                      aria-describedby="phone-hint"
                    />
                    <p id="phone-hint" className="mt-2 text-xs text-gray-400">
                      Enter your 10-digit mobile number
                    </p>
                  </div>

                  {/* Rate Disclosure */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-orange-300">
                      Message and data rates may apply.
                    </p>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="space-y-3">
                    <label
                      className="flex items-start gap-3 cursor-pointer group"
                      htmlFor="consent"
                    >
                      <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        required
                        className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800/50 text-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                        aria-required="true"
                      />
                      <span className="text-sm text-gray-300 leading-relaxed">
                        I agree to receive SMS messages from AICBOLT
                      </span>
                    </label>
                    <p className="text-xs text-gray-400 ml-8">
                      Consent is not a condition of purchase.
                    </p>
                  </div>

                  {/* Opt-Out Info */}
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>
                      Reply STOP to cancel. Reply HELP for assistance.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isValid}
                    className="w-full px-8 py-4 rounded-xl
                      bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
                      hover:from-orange-600 hover:via-orange-500 hover:to-amber-500
                      disabled:from-gray-800 disabled:via-gray-800 disabled:to-gray-800
                      disabled:opacity-50 disabled:cursor-not-allowed
                      text-white text-base sm:text-lg font-semibold
                      shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_rgba(251,146,60,0.25)]
                      transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]
                      border border-gray-700/50 hover:border-orange-400/50
                      backdrop-blur-sm
                      focus:outline-none focus:ring-4 focus:ring-orange-500/20"
                    aria-disabled={!isValid}
                  >
                    Subscribe to SMS Notifications
                  </button>
                </form>

                {/* Links to Legal Pages */}
                <div className="mt-8 pt-8 border-t border-gray-700/50">
                  <p className="text-xs text-gray-400 text-center mb-4">
                    By subscribing, you agree to our:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link
                      href="/privacy-policy"
                      className="text-sm text-orange-400 hover:text-orange-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded"
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-gray-600">•</span>
                    <Link
                      href="/terms-of-service"
                      className="text-sm text-orange-400 hover:text-orange-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded"
                    >
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

