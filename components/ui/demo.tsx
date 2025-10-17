"use client"

import { useState } from "react"
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, LogIn, LayoutDashboard } from 'lucide-react'
import { signOut } from '@/app/(login)/actions'
import { usePathname } from 'next/navigation'
import { User } from '@/lib/db/schema'
import useSWR from 'swr'
import { HeroSection } from '@/components/ui/hero-section-with-smooth-bg-shader'
import { AgentDemoCard } from '@/components/ui/agent-demo-card'
import { AgentDetailModal } from '@/components/ui/agent-detail-modal'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Agent data
const agentData = {
  customerSupport: {
    name: "Customer Support Agent",
    icon: "🎧",
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
    icon: "📈",
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
  technicalSupport: {
    name: "Technical Support",
    icon: "⚙️",
    tagline: "Advanced Troubleshooting • Step-by-Step Solutions",
    themeColor: "280 60% 55%",
    phoneNumber: "+1234567892",
    purpose: "Expert AI technician providing detailed troubleshooting guidance",
    features: [
      "Step-by-step troubleshooting for technical issues",
      "Access to comprehensive technical documentation",
      "Remote diagnostic capabilities",
      "Ticket creation and tracking",
      "Knowledge base that learns from each interaction",
    ],
    personality: ["Technical", "Methodical", "Clear", "Patient"],
    useCases: [
      "Software companies providing product support",
      "IT service providers handling client issues",
      "Hardware manufacturers assisting with device setup",
      "Tech platforms reducing Tier 1 support burden",
    ],
  },
  customAgent: {
    name: "Custom AI Agent",
    icon: "🚀",
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
}

function TubelightHeader() {
  const { data: user } = useSWR<User>('/api/user', fetcher)
  const pathname = usePathname()
  
  // Don't render header on dashboard-related pages
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
    pathname.startsWith('/clients') || 
    pathname.startsWith('/projects') || 
    pathname.startsWith('/finance') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/pricing')
  
  if (isDashboardRoute) {
    return null
  }

  return (
    <div className="relative">
      <div className="fixed top-6 right-6 z-50">
        {user ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            {/* Dashboard Button */}
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="bg-background/5 border-border backdrop-blur-lg w-full sm:w-auto"
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
                  await signOut()
                  window.location.href = '/'
                } catch (error) {
                  console.error('Sign out error:', error)
                  window.location.href = '/'
                }
              }}
              className="bg-background/5 border-border backdrop-blur-lg w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="bg-background/5 border-border backdrop-blur-lg"
          >
            <Link href="/sign-in">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default function DemoOne() {
  const [intensity, setIntensity] = useState(1.5)
  const [speed, setSpeed] = useState(1.0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [activeEffect, setActiveEffect] = useState("mesh")
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className="relative w-full min-h-screen">
      {/* Shader Background - Fixed behind everything */}
      <div className="fixed inset-0 z-0">
        {activeEffect === "mesh" && (
          <MeshGradient
            className="w-full h-full absolute inset-0"
            colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
            speed={speed}
          />
        )}

        {activeEffect === "dots" && (
          <div className="w-full h-full absolute inset-0 bg-black">
            <DotOrbit
              className="w-full h-full"
              speed={speed}
              intensity={intensity}
            />
          </div>
        )}

        {activeEffect === "combined" && (
          <>
            <MeshGradient
              className="w-full h-full absolute inset-0"
              colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
              speed={speed * 0.5}
            />
            <div className="w-full h-full absolute inset-0 opacity-60">
              <DotOrbit
                className="w-full h-full"
                speed={speed * 1.5}
                intensity={intensity * 0.8}
              />
            </div>
          </>
        )}

        {/* Ambient Lighting Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: `${3 / speed}s` }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/2 rounded-full blur-2xl animate-pulse"
            style={{ animationDuration: `${2 / speed}s`, animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-20 h-20 bg-gray-900/3 rounded-full blur-xl animate-pulse"
            style={{ animationDuration: `${4 / speed}s`, animationDelay: "0.5s" }}
          />
        </div>
      </div>

      {/* Homepage Content - Above shader background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <TubelightHeader />
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

          {/* Voice Agent Cards Section - Elevated Design */}
          <section 
            id="voice-agents" 
            className="relative py-32 sm:py-40 lg:py-48 overflow-hidden"
          >
            <div className="max-w-[110rem] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
              {/* Section Header - Premium Typography */}
              <div className="text-center mb-20 sm:mb-24 lg:mb-28">
                <h2 
                  className="text-[2.75rem] sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] 
                             font-bold tracking-[-0.02em] leading-[1.1] 
                             text-gray-900 mb-6 sm:mb-7 lg:mb-8
                             [text-wrap:balance] max-w-5xl mx-auto"
                  style={{
                    letterSpacing: '-0.02em',
                  }}
                >
                  See What AI Can Do{' '}
                  <span className="inline-block">
                    <span 
                      className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 
                                 bg-clip-text text-transparent"
                    >
                      for Your Business
                    </span>
                  </span>
                </h2>
                <p 
                  className="text-lg sm:text-xl lg:text-[1.375rem] 
                             text-gray-600 leading-relaxed 
                             max-w-[46rem] mx-auto font-normal tracking-[-0.01em]"
                  style={{
                    lineHeight: '1.6',
                    color: 'rgb(75, 85, 99)',
                  }}
                >
                  Experience intelligent voice agents built for real business impact.{' '}
                  <span className="text-gray-700">Each one handles complex conversations, learns your brand, and works 24/7.</span>
                </p>
              </div>

              {/* Cards Grid - Interactive Demo Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 lg:gap-12 xl:gap-10 2xl:gap-12 relative">
                {/* Customer Support Agent */}
                <div className="flex justify-center">
                  <div className="w-full max-w-[480px] md:max-w-none h-[750px] lg:h-[780px] xl:h-[750px]">
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
                  <div className="w-full max-w-[480px] md:max-w-none h-[750px] lg:h-[780px] xl:h-[750px]">
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

                {/* Technical Support */}
                <div className="flex justify-center">
                  <div className="w-full max-w-[480px] md:max-w-none h-[750px] lg:h-[780px] xl:h-[750px]">
                    <AgentDemoCard
                      imageUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      agentName={agentData.technicalSupport.name}
                      flag={agentData.technicalSupport.icon}
                      tagline={agentData.technicalSupport.tagline}
                      themeColor={agentData.technicalSupport.themeColor}
                      phoneNumber={agentData.technicalSupport.phoneNumber}
                      onShowDetails={() => setActiveModal('technicalSupport')}
                    />
                  </div>
                </div>

                {/* Custom AI Agent */}
                <div className="flex justify-center">
                  <div className="w-full max-w-[480px] md:max-w-none h-[750px] lg:h-[780px] xl:h-[750px]">
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
            phoneNumber={agentData.customerSupport.phoneNumber}
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
            phoneNumber={agentData.salesAssistant.phoneNumber}
          />

          <AgentDetailModal
            isOpen={activeModal === 'technicalSupport'}
            onClose={() => setActiveModal(null)}
            agentName={agentData.technicalSupport.name}
            agentIcon={agentData.technicalSupport.icon}
            purpose={agentData.technicalSupport.purpose}
            features={agentData.technicalSupport.features}
            personality={agentData.technicalSupport.personality}
            useCases={agentData.technicalSupport.useCases}
            themeColor={agentData.technicalSupport.themeColor}
            phoneNumber={agentData.technicalSupport.phoneNumber}
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
            buildLink="/profit-plan"
          />
        </main>
      </div>
    </div>
  )
}