import OnboardingForm from "@/components/ui/multistep-form";
import { ShaderBackground } from "@/components/ui/shader-background";

export default function ProfitPlanPage() {
  return (
    <div className="relative min-h-screen">
      <ShaderBackground />
      <main className="relative z-10 px-4 py-16 md:py-24">
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

