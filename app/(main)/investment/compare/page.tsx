import { checkUser } from "@/lib/checkUser";
import { InvestmentComparison } from "@/features/investment/components/InvestmentComparison";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function InvestmentComparePage() {
  await checkUser();

  return (
    <div className="container mx-auto px-5 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/investment" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to Investment Dashboard
        </Link>
      </div>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Options Comparison</h1>
          <p className="text-muted-foreground">Compare different asset classes and find what suits your risk profile</p>
        </div>
        
        <InvestmentComparison />
        
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mt-8">
          <h3 className="font-semibold text-lg mb-2">Need help choosing?</h3>
          <p className="text-muted-foreground mb-4">
            Our AI advisor can analyze your financial data and recommend the exact mix of these assets that fits your goals.
          </p>
          <Link href="/investment/chat" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Ask the AI Advisor
          </Link>
        </div>
      </div>
    </div>
  );
}
