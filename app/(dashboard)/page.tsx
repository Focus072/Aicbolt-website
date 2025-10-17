'use client';

import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/ui/hero-section-with-smooth-bg-shader';
import { DestinationCard } from '@/components/ui/card-21';

export default function HomePage() {
  return (
    <main>
      <HeroSection 
        title="Turn 30 Minutes into 30 Days of Work—Automatically."
        highlightText=""
        description="Companies using AICBOLT ship faster, reply instantly, and cut busywork by 40–70%. See what you're leaving on the table in under 2 minutes."
        buttonText="Get My Free AI Profit Plan"
        colors={["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#fef3c7", "#fffbeb"]}
        distortion={1.2}
        speed={0.8}
        className="min-h-screen"
      />

      {/* Voice Agent Cards Section */}
      <section id="voice-agents" className="pt-20 pb-32 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-30 justify-items-center">
            {/* Customer Support Agent */}
            <div className="w-full max-w-[360px] h-[520px] relative z-40">
              <DestinationCard
                imageUrl="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                location="Customer Support Agent"
                flag="🎧"
                stats="24/7 Support • Natural Conversation"
                href="#"
                themeColor="220 70% 50%"
              />
            </div>

            {/* Sales Assistant */}
            <div className="w-full max-w-[360px] h-[520px] relative z-40">
              <DestinationCard
                imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                location="Sales Assistant"
                flag="📈"
                stats="Lead Qualification • Expert Guidance"
                href="#"
                themeColor="120 60% 45%"
              />
            </div>

            {/* Technical Support */}
            <div className="w-full max-w-[360px] h-[520px] relative z-40">
              <DestinationCard
                imageUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                location="Technical Support"
                flag="⚙️"
                stats="Advanced Troubleshooting • Step-by-Step Solutions"
                href="#"
                themeColor="280 60% 55%"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}