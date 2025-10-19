import OnboardingForm from "@/components/ui/multistep-form";
import ShaderBackground from "@/components/ui/shader-background";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProfitPlanPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Shader Background */}
      <ShaderBackground isAnimating={true} />
      
      {/* Go Back Home Button */}
      <div className="absolute top-6 left-4 sm:top-8 sm:left-6 z-50">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-900/20 border border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300 text-sm sm:text-base"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Go Back Home</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      <main className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 sm:mb-8 px-4 sm:px-0">
            Get your free <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">AI Profit Plan</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-light leading-relaxed px-4 sm:px-0">
            Answer a few questions and we'll generate a tailored plan in minutes.
          </p>
        </div>

        <OnboardingForm />
      </main>
    </div>
  );
}

