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
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/20 border border-gray-700/50 backdrop-blur-xl hover:bg-orange-600/20 hover:border-orange-400/50 text-white hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back Home
        </Link>
      </div>

      <main className="relative z-10 min-h-screen px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Get your free <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">AI Profit Plan</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
            Answer a few questions and we'll generate a tailored plan in minutes.
          </p>
        </div>

        <OnboardingForm />
      </main>
    </div>
  );
}

