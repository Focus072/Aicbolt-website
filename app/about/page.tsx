'use client';

import ShaderBackground from '@/components/ui/shader-background';
import Link from 'next/link';
import { ArrowLeft, Zap, Target, Users, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Footer } from '@/components/ui/footer';

export default function AboutPage() {
  const [isAnimating, setIsAnimating] = useState(true);

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Leveraging cutting-edge AI to automate your business processes and save time.',
    },
    {
      icon: Target,
      title: 'Results-Driven',
      description: 'Focused on delivering measurable results that drive your business forward.',
    },
    {
      icon: Users,
      title: 'Customer-Focused',
      description: 'Built with your customers in mind, ensuring exceptional experiences.',
    },
    {
      icon: Rocket,
      title: 'Innovation',
      description: 'Constantly evolving to meet the changing needs of modern businesses.',
    },
  ];

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
                About AICBOLT
              </h1>
              <p
                className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                Transforming businesses through intelligent automation and AI-powered solutions.
              </p>
            </div>

            {/* Mission Section */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 sm:p-8 lg:p-10 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                At AICBOLT, we believe that businesses shouldn't waste time on repetitive tasks. Our mission is to turn 30 days of work into 30 minutes of automation, empowering companies to focus on what truly matters—growth, innovation, and customer satisfaction.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We're building the future of business automation, one intelligent solution at a time.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-orange-400/50 transition-all duration-300"
                  >
                    <Icon className="h-8 w-8 text-orange-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Values Section */}
            <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 sm:p-8 lg:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Our Values</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Excellence</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We strive for excellence in everything we do, from our product design to customer support.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Innovation</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We continuously push the boundaries of what's possible with AI and automation.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Transparency</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We believe in honest communication and transparent business practices.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Customer Success</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Your success is our success. We're committed to helping you achieve your business goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

