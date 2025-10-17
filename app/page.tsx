'use client';

import ShaderBackground from '@/components/ui/shader-background';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, LayoutDashboard, Play, Pause } from 'lucide-react';
import { signOut } from '@/app/(login)/actions';
import { usePathname } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { AgentDemoCard } from '@/components/ui/agent-demo-card';
import { AgentDetailModal } from '@/components/ui/agent-detail-modal';
import { TestimonialsSectionDemo } from '@/components/ui/testimonials-demo';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Agent data
const agentData = {
  customerSupport: {
    name: "Customer Support Agent",
    icon: "",
    tagline: "24/7 Support • Natural Conversation",
    themeColor: "220 70% 50%",
    phoneNumber: "+1234567890",
    purpose: "Intelligent AI that handles customer inquiries with empathy and efficiency",
    features: [
      "Instant response to customer queries 24/7 without wait times",
      "Natural language understanding for complex questions",
      "Seamless escalation to human agents when needed",
      "Multi-language support for global customer base",
      "Integration with your CRM and knowledge base",
    ],
    personality: ["Helpful", "Patient", "Empathetic", "Professional"],
    useCases: [
      "E-commerce stores handling order inquiries and returns",
      "SaaS companies providing product support",
      "Service businesses managing appointment scheduling",
      "Any business wanting to reduce support costs while improving response times",
    ],
  },
  salesAssistant: {
    name: "Sales Assistant",
    icon: "",
    tagline: "Lead Qualification • Expert Guidance",
    themeColor: "120 60% 45%",
    phoneNumber: "+1234567891",
    purpose: "AI-powered sales agent that qualifies leads and guides prospects",
    features: [
      "Intelligent lead qualification based on your criteria",
      "Product recommendations tailored to customer needs",
      "Real-time objection handling and FAQs",
      "Appointment booking with your sales team",
      "CRM integration for seamless lead tracking",
    ],
    personality: ["Persuasive", "Knowledgeable", "Consultative", "Results-Driven"],
    useCases: [
      "B2B companies qualifying inbound leads",
      "Real estate agencies scheduling property viewings",
      "Service providers booking discovery calls",
      "High-ticket businesses nurturing prospects through the sales funnel",
    ],
  },
  customAgent: {
    name: "Custom AI Agent",
    icon: "",
    tagline: "Fully Tailored • Built to Your Business Needs",
    themeColor: "270 70% 55%",
    purpose: "Bespoke AI agent designed specifically for your unique business requirements",
    features: [
      "Custom personality and tone matching your brand",
      "Integration with your existing systems and workflows",
      "Specialized knowledge base for your industry",
      "Unique conversation flows for your use cases",
      "Continuous optimization based on your metrics",
    ],
    personality: ["Adaptable", "Specialized", "Brand-Aligned", "Scalable"],
    useCases: [
      "Businesses with unique processes requiring tailored automation",
      "Industries with specialized terminology and compliance needs",
      "Companies wanting hybrid agents combining multiple capabilities",
      "Enterprises requiring white-label AI solutions",
    ],
  },
};

function TubelightHeader({ isAnimating, setIsAnimating }: { isAnimating: boolean; setIsAnimating: (value: boolean) => void }) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const pathname = usePathname();
  
  // Don't render header on dashboard-related pages
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
    pathname.startsWith('/clients') || 
    pathname.startsWith('/projects') || 
    pathname.startsWith('/finance') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings');
  
  if (isDashboardRoute) {
    return null;
  }

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <div className="flex flex-row items-center gap-2 sm:gap-3">
          {/* Animation Toggle Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
            className="bg-gray-900/20 border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300 cursor-pointer"
            title={isAnimating ? "Pause animation" : "Play animation"}
          >
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {user ? (
            <>
              {/* Dashboard Button */}
              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="bg-gray-900/20 border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300 cursor-pointer"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              
              {/* Sign Out Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Sign out error:', error);
                    // Still redirect even if sign out fails
                    window.location.href = '/';
                  }
                }}
                className="bg-gray-900/20 border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="bg-gray-900/20 border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300 cursor-pointer"
            >
              <Link href="/sign-in">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [brightness, setBrightness] = useState(0);

  // Dynamic contrast detection
  useEffect(() => {
    if (!isLoaded) return;

    const updateBrightness = () => {
      // Simulate brightness detection based on shader animation
      const time = Date.now() / 1000;
      const simulatedBrightness = (Math.sin(time * 0.5) + 1) / 2; // 0 to 1
      setBrightness(simulatedBrightness);
    };

    const interval = setInterval(updateBrightness, 100);
    return () => clearInterval(interval);
  }, [isLoaded]);

  const handleShaderLoaded = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative min-h-screen">
      {/* Shader Background - Behind everything */}
      <ShaderBackground isAnimating={isAnimating} onLoaded={handleShaderLoaded} />
      
      {/* Original Homepage Content - Above shader */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <TubelightHeader isAnimating={isAnimating} setIsAnimating={setIsAnimating} />
        <main>
          {/* Hero Section with Harmonized Design */}
          <section className="relative w-full min-h-screen flex items-center justify-center">
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
              <div className="text-center">
                {/* Minimal dynamic contrast overlay - only activates when shader is very bright */}
                <div 
                  className="absolute inset-0 pointer-events-none -z-10"
                  style={{
                    background: brightness > 0.7 ? `radial-gradient(ellipse at center, rgba(0,0,0,${(brightness - 0.7) * 0.3}) 0%, transparent 60%)` : 'transparent',
                    transition: 'background 0.3s ease-out'
                  }}
                />
                
                <h1
                  className="font-bold leading-[1.05] tracking-tight mx-auto mb-6 text-center
                    text-[clamp(2.25rem,4.5vw+0.5rem,5rem)] 
                    max-w-[90vw] sm:max-w-[26ch] md:max-w-[24ch] lg:max-w-[26ch]
                    [text-wrap:balance]
                    animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                  style={{ 
                    fontFamily: "Satoshi, sans-serif", 
                    fontWeight: 700,
                    animationDelay: '100ms',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6)) drop-shadow(0 4px 16px rgba(0,0,0,0.4))'
                  }}
                >
                  Turn{' '}
                  <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent font-extrabold whitespace-nowrap drop-shadow-[0_2px_8px_rgba(251,146,60,0.3)]">
                    30{'\u00A0'}Days
                  </span>
                  {' '}of work into{' '}
                  <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent font-extrabold whitespace-nowrap drop-shadow-[0_2px_8px_rgba(251,146,60,0.3)]">
                    30{'\u00A0'}minutes
                  </span>
                  {' '}with{' '}
                  <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent font-extrabold whitespace-nowrap drop-shadow-[0_2px_8px_rgba(251,146,60,0.3)]">
                    AICBOLT
                  </span>
                </h1>
                
                <p 
                  className="text-[clamp(1.125rem,1.5vw,1.25rem)] leading-[1.6] max-w-[44rem] mx-auto mb-10 px-4
                    animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both"
                  style={{ 
                    animationDelay: '250ms',
                    color: 'rgba(248, 250, 252, 0.95)',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5), 0 2px 12px rgba(0,0,0,0.4)'
                  }}
                >
                  Companies using AICBOLT ship faster, reply instantly, and cut busywork by 40–70%. See what you're leaving on the table in under 2 minutes.
                </p>
                
                <div 
                  className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both"
                  style={{ animationDelay: '400ms' }}
                >
                  <button
                    onClick={() => window.location.href = '/profit-plan'}
                    className="group relative px-10 py-5 sm:px-12 sm:py-6 rounded-2xl 
                      bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
                      hover:from-orange-600 hover:via-orange-500 hover:to-amber-500
                      text-white text-base sm:text-lg font-semibold
                      shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_rgba(251,146,60,0.25)]
                      transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]
                      border border-gray-700/50 hover:border-orange-400/50
                      backdrop-blur-sm cursor-pointer
                      focus:outline-none focus:ring-4 focus:ring-orange-500/20"
                  >
                    <span className="relative z-10">Get My Free AI Profit Plan</span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </button>
                  
                  <p className="text-sm font-medium" style={{ color: 'rgba(248, 250, 252, 0.7)' }}>
                    No credit card. Instant report.
                  </p>
                  
                  <a 
                    href="#examples" 
                    className="text-sm font-semibold inline-flex items-center gap-2 mt-2 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-orange-500/20 rounded-lg px-3 py-1.5 cursor-pointer"
                    style={{ 
                      color: 'rgba(248, 250, 252, 0.8)',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    See examples
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 text-orange-400">→</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Voice Agent Cards Section - Elevated Design */}
          <section 
            id="voice-agents" 
            className="relative py-20 sm:py-32 lg:py-40 overflow-hidden"
          >
            <div className="max-w-[110rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              {/* Section Header - Harmonized Typography */}
              <div className="text-center mb-20 sm:mb-24 lg:mb-28">
                <h2 
                  className="text-[2.75rem] sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] 
                             font-bold tracking-[-0.02em] leading-[1.1] 
                             mb-6 sm:mb-7 lg:mb-8
                             [text-wrap:balance] max-w-5xl mx-auto"
                  style={{
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
                  }}
                >
                  See What AI Can Do{' '}
                  <span className="inline-block">
                    <span 
                      className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 
                                 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,146,60,0.3)]"
                    >
                      for Your Business
                    </span>
                  </span>
                </h2>
                <p 
                  className="text-lg sm:text-xl lg:text-[1.375rem] 
                             leading-relaxed 
                             max-w-[46rem] mx-auto font-normal tracking-[-0.01em]"
                  style={{
                    lineHeight: '1.6',
                    color: 'rgba(248, 250, 252, 0.9)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  Experience intelligent voice agents built for real business impact.{' '}
                  <span style={{ color: 'rgba(248, 250, 252, 1)' }}>Each one handles complex conversations, learns your brand, and works 24/7.</span>
                </p>
              </div>

              {/* Cards Grid - Enhanced Dark Glass Style with Optimized Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 relative max-w-[140rem] mx-auto">
                {/* Customer Support Agent */}
                <div className="flex justify-center">
                  <div className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[550px] xl:max-w-[600px] 2xl:max-w-[650px] h-[700px] sm:h-[750px] md:h-[800px] lg:h-[850px] xl:h-[900px]">
                    <AgentDemoCard
                      imageUrl="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      agentName={agentData.customerSupport.name}
                      flag={agentData.customerSupport.icon}
                      tagline={agentData.customerSupport.tagline}
                      themeColor={agentData.customerSupport.themeColor}
                      phoneNumber={agentData.customerSupport.phoneNumber}
                      onShowDetails={() => setActiveModal('customerSupport')}
                    />
                  </div>
                </div>

                {/* Sales Assistant */}
                <div className="flex justify-center">
                  <div className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[550px] xl:max-w-[600px] 2xl:max-w-[650px] h-[700px] sm:h-[750px] md:h-[800px] lg:h-[850px] xl:h-[900px]">
                    <AgentDemoCard
                      imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      agentName={agentData.salesAssistant.name}
                      flag={agentData.salesAssistant.icon}
                      tagline={agentData.salesAssistant.tagline}
                      themeColor={agentData.salesAssistant.themeColor}
                      phoneNumber={agentData.salesAssistant.phoneNumber}
                      onShowDetails={() => setActiveModal('salesAssistant')}
                    />
                  </div>
                </div>

                {/* Custom AI Agent */}
                <div className="flex justify-center md:col-span-2 lg:col-span-1">
                  <div className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[550px] xl:max-w-[600px] 2xl:max-w-[650px] h-[700px] sm:h-[750px] md:h-[800px] lg:h-[850px] xl:h-[900px]">
                    <AgentDemoCard
                      imageUrl="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      agentName={agentData.customAgent.name}
                      flag={agentData.customAgent.icon}
                      tagline={agentData.customAgent.tagline}
                      themeColor={agentData.customAgent.themeColor}
                      isCustomAgent={true}
                      buildLink="/profit-plan"
                      onShowDetails={() => setActiveModal('customAgent')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="relative py-20 sm:py-32 overflow-hidden">
            <div className="max-w-[110rem] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
              <TestimonialsSectionDemo />
            </div>
          </section>

          {/* Modals for Agent Details */}
          <AgentDetailModal
            isOpen={activeModal === 'customerSupport'}
            onClose={() => setActiveModal(null)}
            agentName={agentData.customerSupport.name}
            agentIcon={agentData.customerSupport.icon}
            purpose={agentData.customerSupport.purpose}
            features={agentData.customerSupport.features}
            personality={agentData.customerSupport.personality}
            useCases={agentData.customerSupport.useCases}
            themeColor={agentData.customerSupport.themeColor}
          />

          <AgentDetailModal
            isOpen={activeModal === 'salesAssistant'}
            onClose={() => setActiveModal(null)}
            agentName={agentData.salesAssistant.name}
            agentIcon={agentData.salesAssistant.icon}
            purpose={agentData.salesAssistant.purpose}
            features={agentData.salesAssistant.features}
            personality={agentData.salesAssistant.personality}
            useCases={agentData.salesAssistant.useCases}
            themeColor={agentData.salesAssistant.themeColor}
          />


          <AgentDetailModal
            isOpen={activeModal === 'customAgent'}
            onClose={() => setActiveModal(null)}
            agentName={agentData.customAgent.name}
            agentIcon={agentData.customAgent.icon}
            purpose={agentData.customAgent.purpose}
            features={agentData.customAgent.features}
            personality={agentData.customAgent.personality}
            useCases={agentData.customAgent.useCases}
            themeColor={agentData.customAgent.themeColor}
          />
        </main>
      </div>
    </div>
  );
}
