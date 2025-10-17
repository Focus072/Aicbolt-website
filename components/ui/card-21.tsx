import * as React from "react";
import { cn } from "@/lib/utils"; // Your utility for merging class names
import { ArrowRight } from "lucide-react";

interface DestinationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  location: string;
  flag: string;
  stats: string;
  href: string;
  themeColor: string; // e.g., "150 50% 25%" for a deep green
  buttonText?: string; // Optional custom button text
}

const DestinationCard = React.forwardRef<HTMLDivElement, DestinationCardProps>(
  ({ className, imageUrl, location, flag, stats, href, themeColor, buttonText = "Explore Now", ...props }, ref) => {
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
        <a
          href={href}
          className="relative block w-full h-full rounded-[2rem] overflow-hidden border border-white/20
                     transition-all duration-700 ease-out 
                     hover:scale-[1.02] hover:-translate-y-2
                     backdrop-blur-md"
          aria-label={`Explore details for ${location}`}
          style={{
             boxShadow: `0 10px 40px -8px rgba(251, 146, 60, 0.15), 0 4px 16px -4px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)`,
          }}
        >
          {/* Image Layer with vibrant colors */}
          <div
            className="absolute inset-0 bg-cover bg-center 
                       transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ 
              backgroundImage: `url(${imageUrl})`
            }}
          />

          {/* Subtle gradient overlay for better text readability */}
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

          
          <div className="relative flex flex-col justify-between h-full p-8 text-white">
            {/* Spacer to push content to bottom */}
            <div className="flex-1"></div>
            
            {/* Content Section */}
            <div className="space-y-5">
              <div className="backdrop-blur-xl bg-gradient-to-br from-black/40 to-black/30 rounded-2xl p-6 border border-white/15 
                              shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]
                              transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-black/50 group-hover:to-black/40">
                <h3 className="text-3xl font-bold tracking-tight drop-shadow-lg text-white mb-2.5">
                  {location} <span className="text-2xl ml-1.5">{flag}</span>
                </h3>
                <p className="text-sm text-white/90 font-medium drop-shadow-md leading-relaxed">{stats}</p>
              </div>

              {/* Button Section - Perfectly centered and consistent */}
              <div className="flex items-center justify-center pt-1">
                <button 
                  className="w-full max-w-[210px] bg-gradient-to-r from-black/35 to-black/25 backdrop-blur-xl 
                             border border-white/25 rounded-2xl px-7 py-4 
                             shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.15)]
                             transition-all duration-500 
                             hover:bg-gradient-to-r hover:from-black/45 hover:to-black/35 
                             hover:border-white/35 hover:shadow-[0_8px_24px_-6px_rgba(251,146,60,0.25)]
                             hover:scale-105 active:scale-100"
                  type="button"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm font-semibold tracking-wide text-white">{buttonText}</span>
                    <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }
);
DestinationCard.displayName = "DestinationCard";

export { DestinationCard };
