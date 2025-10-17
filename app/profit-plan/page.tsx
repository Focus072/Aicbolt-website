import OnboardingForm from "@/components/ui/multistep-form";

export default function ProfitPlanPage() {
  return (
    <main className="min-h-[100svh] px-4 py-16 md:py-24">
      {/* Keep your warm shader page background via your global/layout styles */}
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
          Get your free AI Profit Plan
        </h1>
        <p className="mt-3 text-base md:text-lg text-gray-700/90">
          Answer a few questions and we'll generate a tailored plan in minutes.
        </p>
      </div>

      <OnboardingForm />
    </main>
  );
}

