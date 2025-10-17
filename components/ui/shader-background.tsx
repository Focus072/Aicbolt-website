"use client"

import { useState, useEffect } from "react"
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  isAnimating?: boolean;
  onLoaded?: () => void;
}

export default function ShaderBackground({ isAnimating = true, onLoaded }: ShaderBackgroundProps) {
  const [intensity, setIntensity] = useState(1.5)
  const [speed, setSpeed] = useState(1.0)
  const [activeEffect, setActiveEffect] = useState("mesh")
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection and optimization
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
      
      // Adjust settings for mobile
      if (mobile) {
        setSpeed(0.3) // Much slower on mobile
        setIntensity(0.8) // Lower intensity
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Loading state management
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      onLoaded?.()
    }, 800) // Show loading state for 800ms

    return () => clearTimeout(timer)
  }, [onLoaded])

  // Performance-optimized static fallback for mobile
  const StaticGradient = () => (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 animate-pulse" 
           style={{ animationDuration: '4s' }} />
    </div>
  )

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Loading state with static gradient */}
      {isLoading && (
        <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 animate-pulse" 
               style={{ animationDuration: '2s' }} />
          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Main shader content */}
      {!isLoading && (
        <>
          {/* Mobile optimization: Use static gradient instead of WebGL */}
          {isMobile ? (
            <StaticGradient />
          ) : (
            <>
              {activeEffect === "mesh" && isAnimating && (
                <MeshGradient
                  className="w-full h-full absolute inset-0"
                  colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
                  speed={speed}
                />
              )}

              {activeEffect === "dots" && isAnimating && (
                <div className="w-full h-full absolute inset-0 bg-black">
                  <DotOrbit
                    className="w-full h-full"
                    speed={speed}
                    intensity={intensity}
                  />
                </div>
              )}

              {activeEffect === "combined" && isAnimating && (
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

              {/* Static fallback when animation is disabled */}
              {!isAnimating && <StaticGradient />}
            </>
          )}

          {/* Ambient Lighting Effects - Only when animating */}
          {isAnimating && !isMobile && (
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
          )}
        </>
      )}
    </div>
  )
}
