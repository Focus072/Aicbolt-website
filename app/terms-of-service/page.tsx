'use client';

import ShaderBackground from '@/components/ui/shader-background';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Footer } from '@/components/ui/footer';

export default function TermsOfServicePage() {
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
                Terms of Service
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 sm:p-8 lg:p-10 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing or using AICBOLT's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Permission is granted to temporarily use AICBOLT's services for personal or business purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose without written consent</li>
                  <li>Attempt to reverse engineer any software contained on the platform</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Service Availability</h2>
                <p className="text-gray-300 leading-relaxed">
                  We strive to provide reliable service, but we do not guarantee that our services will be available at all times. We reserve the right to modify, suspend, or discontinue any part of our services at any time with or without notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. User Accounts</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  When you create an account with us, you must provide accurate and complete information. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Maintaining the security of your account and password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Payment Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  If you purchase a subscription or service, you agree to pay the fees specified. Payments are processed securely through third-party payment processors. All fees are non-refundable unless otherwise stated.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-300 leading-relaxed">
                  In no event shall AICBOLT or its suppliers be liable for any damages arising out of the use or inability to use our services, even if we have been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. SMS Communications</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Program Name:</strong> AICBOLT Notifications
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  AICBOLT sends account notifications and security alerts via SMS to users who have opted in through our website or SMS keyword.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You may receive up to 2 messages per month.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Message and Data Rates:</strong> Message and data rates may apply.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Opt-Out:</strong> Reply STOP to unsubscribe. You can also reply END, UNSUBSCRIBE, or QUIT to opt out of future messages.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Help:</strong> Reply HELP, INFO, or SUPPORT for assistance, or email{' '}
                  <a href="mailto:support@aicbolt.com" className="text-orange-400 hover:text-orange-300 transition-colors">
                    support@aicbolt.com
                  </a>
                  {' '}for help.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  For assistance, contact{' '}
                  <a href="mailto:support@aicbolt.com" className="text-orange-400 hover:text-orange-300 transition-colors">
                    support@aicbolt.com
                  </a>
                  .
                </p>
                <p className="text-gray-300 leading-relaxed">
                  For more information about our SMS program, please visit our{' '}
                  <Link href="/sms-signup" className="text-orange-400 hover:text-orange-300 transition-colors underline">
                    SMS Opt-In page
                  </Link>
                  {' '}or review our{' '}
                  <Link href="/privacy-policy" className="text-orange-400 hover:text-orange-300 transition-colors underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us at{' '}
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

