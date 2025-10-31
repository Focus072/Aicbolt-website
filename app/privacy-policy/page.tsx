'use client';

// IMPORTANT: This page must be publicly accessible without login or cookie banners
// for Twilio A2P 10DLC compliance. Verify that no authentication middleware
// blocks access to /privacy-policy route.

import ShaderBackground from '@/components/ui/shader-background';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Footer } from '@/components/ui/footer';

export default function PrivacyPolicyPage() {
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <div className="relative min-h-screen">
      {/* Shader Background */}
      <ShaderBackground isAnimating={isAnimating} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            {/* Back Button */}
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="mb-8 bg-gray-900/20 border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            {/* Header */}
            <div className="mb-12 sm:mb-16">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6
                  bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent
                  drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                Privacy Policy
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 sm:p-8 lg:p-10 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p className="text-gray-300 leading-relaxed">
                  At AICBOLT, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Name and contact information</li>
                  <li>Email address</li>
                  <li>Business information</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Usage data and analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends and usage</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                <p className="text-gray-300 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. SMS Communications</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  No mobile information will be shared, sold, rented, or transferred to third parties for marketing or promotional purposes. Information sharing to subcontractors in support services, such as customer service, is permitted.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you choose to opt in to receive SMS messages from AICBOLT, you will receive account notifications and security alerts. Message and data rates may apply. You may receive up to 2 messages per month.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  You can opt out at any time by replying STOP to any message, or by contacting us at{' '}
                  <a href="mailto:info@aicbolt.com" className="text-orange-400 hover:text-orange-300 transition-colors">
                    info@aicbolt.com
                  </a>
                  . For more information about our SMS program, please visit our{' '}
                  <Link href="/sms-signup" className="text-orange-400 hover:text-orange-300 transition-colors underline">
                    SMS Opt-In page
                  </Link>
                  {' '}or review our{' '}
                  <Link href="/terms-of-service" className="text-orange-400 hover:text-orange-300 transition-colors underline">
                    Terms of Service
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:info@aicbolt.com" className="text-orange-400 hover:text-orange-300 transition-colors">
                    info@aicbolt.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

