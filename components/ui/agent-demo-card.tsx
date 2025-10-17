'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, Info, Sparkles } from "lucide-react";
import Link from "next/link";

interface AgentDemoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  agentName: string;
  flag: string;
  tagline: string;
  themeColor: string;
  phoneNumber?: string; // Optional for regular agents
  isCustomAgent?: boolean; // True for custom AI agent
  buildLink?: string; // Link for "Start Building" button
  onShowDetails: () => void;
}

const AgentDemoCard = React.forwardRef<HTMLDivElement, AgentDemoCardProps>(
  ({ 
    className, 
    imageUrl, 
    agentName, 
    flag, 
    tagline, 
    themeColor, 
    phoneNumber,
    isCustomAgent = false,
    buildLink,
    onShowDetails,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          // @ts-ignore - CSS custom properties are valid
          "--theme-color": themeColor,
        } as React.CSSProperties}
        className={cn("group w-full h-full", className)}
        {...props}
      >
        <div
          className="relative block w-full h-[800px] rounded-[2.5rem] overflow-hidden 
                     border border-gray-700/30
                     transition-all duration-500 ease-out 
                     hover:scale-[1.02] hover:-translate-y-2
                     backdrop-blur-xl
                     bg-gradient-to-br from-gray-900/20 via-gray-800/10 to-gray-900/20"
          style={{
             boxShadow: `0 20px 60px -12px rgba(0, 0, 0, 0.4), 0 8px 24px -4px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
          }}
        >
          {/* Image Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center 
                       transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ 
              backgroundImage: `url(${imageUrl})`
            }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, 
                rgba(0, 0, 0, 0.7) 0%, 
                rgba(0, 0, 0, 0.4) 30%, 
                rgba(0, 0, 0, 0.2) 60%, 
                transparent 90%)`,
            }}
          />

          
          <div className="relative flex flex-col h-full p-8 text-white">
            {/* Content Section */}
            <div className="flex-1 flex flex-col space-y-5">
              <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/50 to-gray-800/40 rounded-3xl p-6 border border-gray-600/30 
                              shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4)]
                              transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-gray-900/60 group-hover:to-gray-800/50 group-hover:border-orange-400/30">
                <h3 className="text-3xl font-bold tracking-tight text-white mb-2.5" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                  {agentName} <span className="text-2xl ml-1.5">{flag}</span>
                </h3>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(248, 250, 252, 0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{tagline}</p>
              </div>

              {/* Dual Button Section - Fixed Height Container */}
              <div className="space-y-3 mt-auto">
                {/* Primary Action Button - White Background */}
                {isCustomAgent ? (
                  <Link href={buildLink || "#"} className="block">
                    <button 
                      className="w-full h-12 bg-white/95 backdrop-blur-xl 
                                 border border-white/30 rounded-2xl px-6 py-3 
                                 shadow-[0_8px_32px_-8px_rgba(255,255,255,0.2),inset_0_1px_0_0_rgba(255,255,255,0.3)]
                                 transition-all duration-300 
                                 hover:bg-white hover:border-white/50 hover:shadow-[0_12px_48px_-12px_rgba(255,255,255,0.3)]
                                 hover:scale-[1.02] active:scale-[0.98]"
                      type="button"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Sparkles className="h-5 w-5 text-gray-800" />
                        <span className="text-sm font-bold tracking-wide text-gray-800">Start Building</span>
                      </div>
                    </button>
                  </Link>
                ) : phoneNumber ? (
                  <a href={`tel:${phoneNumber}`} className="block">
                    <button 
                      className="w-full h-12 bg-white/95 backdrop-blur-xl 
                                 border border-white/30 rounded-2xl px-6 py-3 
                                 shadow-[0_8px_32px_-8px_rgba(255,255,255,0.2),inset_0_1px_0_0_rgba(255,255,255,0.3)]
                                 transition-all duration-300 
                                 hover:bg-white hover:border-white/50 hover:shadow-[0_12px_48px_-12px_rgba(255,255,255,0.3)]
                                 hover:scale-[1.02] active:scale-[0.98]"
                      type="button"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Phone className="h-5 w-5 text-gray-800" />
                        <span className="text-sm font-bold tracking-wide text-gray-800">Call Agent</span>
                      </div>
                    </button>
                  </a>
                ) : null}

                {/* Show Details Button - Ghost Style */}
                <button 
                  onClick={onShowDetails}
                  className="w-full h-12 bg-transparent backdrop-blur-xl 
                             border border-white/20 rounded-2xl px-6 py-3 
                             shadow-[0_4px_16px_-4px_rgba(255,255,255,0.1)]
                             transition-all duration-300 
                             hover:bg-white/10 hover:border-white/30 hover:shadow-[0_8px_24px_-8px_rgba(255,255,255,0.15)]
                             hover:scale-[1.02] active:scale-[0.98]"
                  type="button"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Info className="h-5 w-5 text-white/70" />
                    <span className="text-sm font-semibold tracking-wide text-white/80">Show Details</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
AgentDemoCard.displayName = "AgentDemoCard";

export { AgentDemoCard };

