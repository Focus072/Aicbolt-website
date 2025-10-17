"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface HeroSectionProps {
  title?: string
  highlightText?: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  colors?: string[]
  distortion?: number
  swirl?: number
  speed?: number
  offsetX?: number
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  buttonClassName?: string
  maxWidth?: string
  veilOpacity?: string
  fontFamily?: string
  fontWeight?: number
}

export function HeroSection({
  title = "Intelligent AI Agents for",
  highlightText = "Smart Brands",
  description = "Transform your brand and evolve it through AI-driven brand guidelines and always up-to-date core components.",
  buttonText = "Join Waitlist",
  onButtonClick,
  colors = ["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  buttonClassName = "",
  maxWidth = "max-w-6xl",
  veilOpacity = "bg-white/20 dark:bg-black/25",
  fontFamily = "Satoshi, sans-serif",
  fontWeight = 500,
}: HeroSectionProps) {
  const router = useRouter()
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick()
    } else {
      // 🔁 Navigate to profit plan page
      router.push("/profit-plan")
      // Optional: analytics if available
      // window.gtag?.("event", "profit_plan_clicked");
      // window.posthog?.capture?.("profit_plan_clicked");
    }
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Full-page shader background */}
      <div className="fixed inset-0 w-screen h-screen z-0">
        {mounted && (
          <>
            <MeshGradient
              width={dimensions.width}
              height={dimensions.height}
              colors={colors}
              distortion={distortion}
              swirl={swirl}
              grainMixer={0}
              grainOverlay={0}
              speed={speed}
              offsetX={offsetX}
            />
            <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
          </>
        )}
      </div>
      
      {/* Hero section content */}
      <section className={`relative w-full min-h-screen flex items-center justify-center ${className}`}>
      
      <div className={`relative z-10 ${maxWidth} mx-auto px-6 w-full`}>
        <div className="text-center">
          {/* Super-subtle top vignette for readability - imperceptible enhancement */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[500px] bg-gradient-to-b from-white/15 via-white/5 to-transparent blur-[100px] pointer-events-none -z-10" />
          
          <h1
            className={`font-bold leading-[1.05] tracking-tight mx-auto mb-5 text-center
              text-[clamp(2.25rem,4.5vw+0.5rem,5rem)] 
              max-w-[90vw] sm:max-w-[26ch] md:max-w-[24ch] lg:max-w-[26ch]
              text-gray-950 
              [text-shadow:0_1px_3px_rgba(0,0,0,0.04)]
              [text-wrap:balance]
              animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both
              ${titleClassName}`}
            style={{ 
              fontFamily, 
              fontWeight: 700,
              animationDelay: '100ms'
            }}
          >
            {/* Split title to emphasize outcomes with non-breaking space before em-dash */}
            {title.includes('30 Minutes') && title.includes('30 Days') ? (
              <>
                Turn{' '}
                <span className="bg-gradient-to-r from-orange-700/85 via-orange-600/85 to-amber-600/85 bg-clip-text text-transparent font-extrabold whitespace-nowrap">
                  30{'\u00A0'}Minutes
                </span>
                {' '}into{' '}
                <span className="bg-gradient-to-r from-orange-700/85 via-orange-600/85 to-amber-600/85 bg-clip-text text-transparent font-extrabold whitespace-nowrap">
                  30{'\u00A0'}Days
                </span>
                {' '}of{' '}
                <span className="whitespace-nowrap">
                  Work{'\u00A0'}—{'\u00A0'}Automatically.
                </span>
              </>
            ) : (
              <>
                {title} <span className="text-orange-600">{highlightText}</span>
              </>
            )}
          </h1>
          
          <p 
            className={`text-[clamp(1.125rem,1.5vw,1.25rem)] leading-[1.5] text-gray-800/90 max-w-[44rem] mx-auto mb-8 px-4
              animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both
              ${descriptionClassName}`}
            style={{ animationDelay: '250ms' }}
          >
            {description}
          </p>
          
          <div 
            className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both"
            style={{ animationDelay: '400ms' }}
          >
            <button
              onClick={handleButtonClick}
              className={`px-8 py-4 sm:px-10 sm:py-5 rounded-full 
                bg-gray-900 hover:bg-gray-800 
                text-white text-base sm:text-lg font-semibold
                shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)]
                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                border border-gray-800/50
                focus:outline-none focus:ring-4 focus:ring-gray-900/20 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.1),0_12px_40px_rgb(0,0,0,0.16)]
                ${buttonClassName}`}
            >
              {buttonText}
            </button>
            
            <p className="text-sm text-gray-600/80 font-medium">
              No credit card. Instant report.
            </p>
            
            <a 
              href="#examples" 
              className="text-sm text-gray-700 hover:text-gray-900 font-semibold inline-flex items-center gap-1.5 mt-2 transition-colors group focus:outline-none focus:ring-2 focus:ring-gray-900/20 rounded-sm px-1"
            >
              See examples
              <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>
      </div>
      </section>
      
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
