'use client';

import ShaderBackground from '@/components/ui/shader-background';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Footer } from '@/components/ui/footer';

export default function ContactPage() {
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
            <div className="text-center mb-12 sm:mb-16">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6
                  bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent
                  drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                Get in Touch
              </h1>
              <p
                className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            {/* Contact Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center hover:border-orange-400/50 transition-all duration-300">
                <Mail className="h-8 w-8 text-orange-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Email</h3>
                <a
                  href="mailto:info@aicbolt.com"
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-300"
                >
                  info@aicbolt.com
                </a>
              </div>

              <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center hover:border-orange-400/50 transition-all duration-300">
                <MessageSquare className="h-8 w-8 text-orange-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Support</h3>
                <a
                  href="mailto:info@aicbolt.com"
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-300"
                >
                  info@aicbolt.com
                </a>
              </div>

              <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center hover:border-orange-400/50 transition-all duration-300">
                <MapPin className="h-8 w-8 text-orange-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Location</h3>
                <p className="text-gray-300">Remote First</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 sm:p-8 lg:p-10">
              <h2
                className="text-2xl sm:text-3xl font-bold mb-6 text-white"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                Send us a Message
              </h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300 resize-none"
                    placeholder="Your message here..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 rounded-xl
                    bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
                    hover:from-orange-600 hover:via-orange-500 hover:to-amber-500
                    text-white text-base sm:text-lg font-semibold
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_rgba(251,146,60,0.25)]
                    transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]
                    border border-gray-700/50 hover:border-orange-400/50
                    backdrop-blur-sm
                    focus:outline-none focus:ring-4 focus:ring-orange-500/20"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

