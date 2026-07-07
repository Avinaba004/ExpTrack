import { checkUser } from "@/lib/checkUser";
import { InvestmentChat } from "@/features/investment/components/InvestmentChat";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function InvestmentChatPage() {
  await checkUser();

  return (
    <div className="container mx-auto px-5 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/investment" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to Investment Dashboard
        </Link>
      </div>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Advisor Chat</h1>
          <p className="text-muted-foreground">Get personalized answers based on your financial data</p>
        </div>
        <InvestmentChat />
      </div>
    </div>
  );
}
