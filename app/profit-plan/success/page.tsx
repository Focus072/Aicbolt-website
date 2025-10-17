import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfitPlanSuccessPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="rounded-3xl border bg-card/60 p-8 text-center shadow-sm backdrop-blur">
        <h1 className="text-2xl font-semibold">Thanks! 🎉</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your answers were submitted. We'll review and email your AI Profit Plan shortly.
        </p>

        <div className="mt-6 flex items-center justify-center">
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

